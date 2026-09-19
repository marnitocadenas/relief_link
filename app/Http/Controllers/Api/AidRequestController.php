<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreAidRequest;
use App\Http\Resources\AidRequestResource;
use App\Models\AidRequest;
use App\Services\ActivityService;
use App\Services\AlertService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use App\Services\SystemSettings;

class AidRequestController extends Controller
{
    public function index(Request $request)
    {
        $query = AidRequest::with(['beneficiary', 'verifiedBy'])->filter($request->all());
        if (in_array($request->user()->role, ['admin', 'staff'], true)) {
            // Operations users can review the complete queue.
        } elseif ($request->user()->role === 'beneficiary') {
            $query->where('beneficiary_id', $request->user()->id);
        } else {
            $query->whereIn('status', ['pending_review', 'approved', 'proposed', 'matched']);
        }
        return AidRequestResource::collection($query->latest()->paginate(20));
    }

    public function store(StoreAidRequest $request)
    {
        $this->authorize('create', AidRequest::class);
        $data = $request->validated();
        $data['justification'] = $data['justification'] ?? '';
        $activeRequests = $request->user()->aidRequests()->whereIn('status', ['pending_review', 'approved', 'proposed', 'matched']);
        if ((clone $activeRequests)->where('category', $data['category'])->exists()) {
            throw ValidationException::withMessages(['category' => 'You already have an active request in this category. Update or cancel it instead of creating a duplicate.']);
        }
        if ($activeRequests->count() >= SystemSettings::get('max_pending_per_user')) throw ValidationException::withMessages(['category' => 'You have reached the maximum number of active support requests.']);
        if ($request->hasFile('image')) $data['supporting_document_path'] = $request->file('image')->store('request-supporting-documents');
        unset($data['image']);
        $aidRequest = $request->user()->aidRequests()->create($data);
        ActivityService::log($request->user(), 'created support request', $aidRequest);
        AlertService::send($request->user(), 'Your support request was submitted and is awaiting verification.', 'request', 'normal', $aidRequest, '/requests');
        AlertService::sendToRoles(['staff', 'admin'], 'A new support request requires verification.', 'request', $aidRequest->urgency === 'high' ? 'high' : 'normal', $aidRequest, '/staff/verifications');
        return new AidRequestResource($aidRequest->load('beneficiary'));
    }

    public function update(StoreAidRequest $request, AidRequest $aidRequest)
    {
        abort_unless($aidRequest->beneficiary_id === $request->user()->id && $aidRequest->status === 'pending_review', 403);
        $data = $request->validated();
        if ($request->hasFile('image')) {
            Storage::delete($aidRequest->supporting_document_path);
            $data['supporting_document_path'] = $request->file('image')->store('request-supporting-documents');
        }
        unset($data['image']);
        $aidRequest->update($data);
        ActivityService::log($request->user(), 'updated support request', $aidRequest);
        return new AidRequestResource($aidRequest->load('beneficiary'));
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
        abort_unless($aidRequest->beneficiary_id === $request->user()->id && $aidRequest->status === 'pending_review', 403);
        if ($aidRequest->supporting_document_path) {
            Storage::delete($aidRequest->supporting_document_path);
        }
        ActivityService::log($request->user(), 'deleted support request', $aidRequest);
        $aidRequest->delete();
        return response()->noContent();
    }

    public function cancel(Request $request, AidRequest $aidRequest)
    {
        abort_unless($aidRequest->beneficiary_id === $request->user()->id && in_array($aidRequest->status, ['pending_review', 'approved'], true), 403);
        $reason = $request->validate(['reason' => 'required|string|max:1000'])['reason'];
        $aidRequest->update(['status' => 'rejected', 'cancellation_reason' => $reason, 'cancelled_at' => now()]);
        ActivityService::log($request->user(), 'cancelled support request', $aidRequest, ['reason' => $reason]);
        AlertService::send($request->user(), 'Your support request was cancelled.', 'request', 'normal', $aidRequest, '/requests');
        return new AidRequestResource($aidRequest);
    }

    public function document(Request $request, AidRequest $aidRequest)
    {
        abort_unless($aidRequest->supporting_document_path, 404);
        abort_unless($aidRequest->beneficiary_id === $request->user()->id || in_array($request->user()->role, ['admin', 'staff'], true), 403);
        return Storage::download($aidRequest->supporting_document_path);
    }
}
