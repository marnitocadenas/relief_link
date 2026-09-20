<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreAidRequest;
use App\Http\Resources\AidRequestResource;
use App\Models\AidRequest;
use App\Services\ActivityService;
use App\Services\AlertService;
use App\Services\MatchingService;
use App\Services\SystemSettings;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class AidRequestController extends Controller
{
    public function index(Request $request)
    {
        $query = AidRequest::with(['beneficiary', 'verifiedBy', 'matches.donation.donor'])->filter($request->all());

        if (in_array($request->user()->role, ['admin', 'staff'], true)) {
            // Operations users can review the complete queue.
        } elseif ($request->user()->role === 'beneficiary') {
            $query->where('beneficiary_id', $request->user()->id);
        } else {
            // Donors only see eligible verified/active requests
            $query->whereIn('status', ['pending_review', 'approved', 'proposed', 'matched', 'partially_fulfilled']);
        }

        return AidRequestResource::collection($query->latest()->paginate(20));
    }

    public function store(StoreAidRequest $request)
    {
        $this->authorize('create', AidRequest::class);
        $data = $request->validated();
        $data['justification'] = $data['justification'] ?? '';

        $activeRequests = $request->user()->aidRequests()
            ->whereIn('status', ['pending_review', 'under_review', 'approved', 'proposed', 'matched', 'partially_fulfilled']);

        if ((clone $activeRequests)->where('category', $data['category'])->exists()) {
            throw ValidationException::withMessages([
                'category' => 'You already have an active request in this category. Update or cancel it instead of creating a duplicate.'
            ]);
        }

        if ($activeRequests->count() >= SystemSettings::get('max_pending_per_user')) {
            throw ValidationException::withMessages([
                'category' => 'You have reached the maximum number of active support requests.'
            ]);
        }

        $aidRequest = DB::transaction(function () use ($request, $data) {
            if ($request->hasFile('image')) {
                $data['supporting_document_path'] = $request->file('image')->store('request-supporting-documents');
            }
            unset($data['image']);

            if (($data['request_type'] ?? 'physical') === 'financial') {
                $data['quantity_needed'] = $data['quantity_needed'] ?? 1;
                $data['currency'] = $data['currency'] ?? 'PHP';
            } else {
                $data['request_type'] = 'physical';
            }

            $data['status'] = 'pending_review';
            $created = $request->user()->aidRequests()->create($data);

            ActivityService::log($request->user(), 'created support request', $created);
            AlertService::send($request->user(), 'Your support request was submitted and is awaiting verification.', 'request', 'normal', $created, '/requests');
            AlertService::sendToRoles(
                ['staff', 'admin'],
                'A new support request requires verification.',
                'request',
                $created->urgency === 'high' ? 'high' : 'normal',
                $created,
                '/staff/verifications'
            );

            return $created;
        });

        return new AidRequestResource($aidRequest->load(['beneficiary', 'verifiedBy', 'matches']));
    }

    public function update(StoreAidRequest $request, AidRequest $aidRequest)
    {
        abort_unless(
            $aidRequest->beneficiary_id === $request->user()->id &&
            in_array($aidRequest->status, ['pending_review', 'under_review'], true),
            403
        );

        $data = $request->validated();

        $aidRequest = DB::transaction(function () use ($request, $aidRequest, $data) {
            if ($request->hasFile('image')) {
                if ($aidRequest->supporting_document_path) {
                    Storage::delete($aidRequest->supporting_document_path);
                }
                $data['supporting_document_path'] = $request->file('image')->store('request-supporting-documents');
            }
            unset($data['image']);

            if (($data['request_type'] ?? $aidRequest->request_type) === 'financial') {
                $data['quantity_needed'] = $data['quantity_needed'] ?? 1;
            }

            $aidRequest->update($data);
            ActivityService::log($request->user(), 'updated support request', $aidRequest);

            return $aidRequest;
        });

        return new AidRequestResource($aidRequest->load(['beneficiary', 'verifiedBy', 'matches']));
    }

    public function destroy(Request $request, AidRequest $aidRequest)
    {
        if (in_array($request->user()->role, ['admin', 'staff'], true)) {
            if ($aidRequest->supporting_document_path) {
                Storage::delete($aidRequest->supporting_document_path);
            }
            ActivityService::log($request->user(), 'deleted support request', $aidRequest);
            $aidRequest->delete();
            return response()->noContent();
        }

        abort_unless(
            $aidRequest->beneficiary_id === $request->user()->id &&
            in_array($aidRequest->status, ['pending_review', 'under_review'], true),
            403
        );

        if ($aidRequest->supporting_document_path) {
            Storage::delete($aidRequest->supporting_document_path);
        }
        ActivityService::log($request->user(), 'deleted support request', $aidRequest);
        $aidRequest->delete();
        return response()->noContent();
    }

    public function cancel(Request $request, AidRequest $aidRequest, MatchingService $matchingService)
    {
        abort_unless(
            $aidRequest->beneficiary_id === $request->user()->id &&
            in_array($aidRequest->status, ['pending_review', 'under_review', 'approved', 'proposed'], true),
            403
        );

        $reason = $request->validate(['reason' => 'required|string|max:1000'])['reason'];

        DB::transaction(function () use ($aidRequest, $reason, $request, $matchingService) {
            $aidRequest->update([
                'status' => 'cancelled',
                'cancellation_reason' => $reason,
                'cancelled_at' => now(),
            ]);

            // Cancel any proposed matches
            foreach ($aidRequest->matches()->where('status', 'proposed')->get() as $match) {
                $match->update(['status' => 'rejected', 'handoff_notes' => 'Request cancelled by beneficiary: ' . $reason]);
                $matchingService->refreshStatuses($match);
            }

            ActivityService::log($request->user(), 'cancelled support request', $aidRequest, ['reason' => $reason]);
            AlertService::send($request->user(), 'Your support request was cancelled.', 'request', 'normal', $aidRequest, '/requests');
        });

        return new AidRequestResource($aidRequest->load(['beneficiary', 'verifiedBy', 'matches']));
    }

    public function document(Request $request, AidRequest $aidRequest)
    {
        abort_unless($aidRequest->supporting_document_path, 404);
        abort_unless($aidRequest->beneficiary_id === $request->user()->id || in_array($request->user()->role, ['admin', 'staff'], true), 403);
        return Storage::download($aidRequest->supporting_document_path);
    }
}
