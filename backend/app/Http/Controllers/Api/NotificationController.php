<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ReliefNotification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $user->reliefNotifications()->whereNull('seen_at')->update(['seen_at' => now()]);

        $perPage = min(max((int) $request->query('per_page', 100), 1), 100);
        $notifications = $user->reliefNotifications()->latest()->paginate($perPage);
        $total = $user->reliefNotifications()->count();
        $unread = $user->reliefNotifications()->where('is_read', false)->count();

        return [
            'data' => $notifications->items(),
            'links' => [
                'first' => $notifications->url(1),
                'last' => $notifications->url($notifications->lastPage()),
                'prev' => $notifications->previousPageUrl(),
                'next' => $notifications->nextPageUrl(),
            ],
            'meta' => [
                'current_page' => $notifications->currentPage(),
                'last_page' => $notifications->lastPage(),
                'per_page' => $notifications->perPage(),
                'total' => $total,
            ],
            'summary' => [
                'total_count' => $total,
                'unread_count' => $unread,
                'read_count' => $total - $unread,
            ],
        ];
    }

    public function read(Request $request, ReliefNotification $notification)
    {
        abort_unless($notification->user_id === $request->user()->id, 403);
        $notification->update(['is_read' => true, 'seen_at' => $notification->seen_at ?? now()]);
        return $notification->fresh();
    }

    public function readAll(Request $request)
    {
        $request->user()->reliefNotifications()->where('is_read', false)->update(['is_read' => true, 'seen_at' => now()]);
        return response()->noContent();
    }

    public function destroy(Request $request, ReliefNotification $notification)
    {
        abort_unless($notification->user_id === $request->user()->id, 403);
        $notification->delete();
        return response()->noContent();
    }

    public function clear(Request $request)
    {
        $request->user()->reliefNotifications()->delete();
        return response()->noContent();
    }
}
