<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ReliefNotification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $request->user()->reliefNotifications()->whereNull('seen_at')->update(['seen_at' => now()]);

        return [
            'data' => $request->user()->reliefNotifications()->latest()->limit(100)->get(),
            'unread_count' => $request->user()->reliefNotifications()->where('is_read', false)->count(),
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
