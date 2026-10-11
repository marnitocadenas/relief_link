<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureActiveAccount
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Older/manual account rows may not have an explicit value. Only an
        // explicit inactive database value should revoke an authenticated API session.
        if ($user && $user->getRawOriginal('is_active') !== null && ! $user->is_active) {
            return response()->json([
                'message' => 'Your account has been deactivated. Please contact the administrator for assistance.',
            ], 403);
        }

        return $next($request);
    }
}
