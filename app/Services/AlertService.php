<?php

namespace App\Services;

use App\Models\{ReliefNotification, User};
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Mail;

class AlertService
{
    public static function send(User $user, string $message, string $type = 'system', string $priority = 'normal', ?Model $subject = null, ?string $actionUrl = null): void
    {
        $subjectType = $subject?->getMorphClass();
        $subjectId = $subject?->getKey();
        $eventKey = hash('sha256', implode('|', [$type, $subjectType, $subjectId, $message]));
        $notification = ReliefNotification::firstOrCreate([
            'user_id' => $user->id,
            'event_key' => $eventKey,
        ], [
            'user_id' => $user->id,
            'message' => $message,
            'type' => $type,
            'priority' => $priority,
            'subject_type' => $subjectType,
            'subject_id' => $subjectId,
            'action_url' => $actionUrl,
            'event_key' => $eventKey,
        ]);

        // Only a newly-created in-app event may produce an email. Retries, reads,
        // and repeated status updates therefore cannot create duplicate messages.
        if (! $notification->wasRecentlyCreated) {
            return;
        }

        $emailEnabled = $type === 'handoff'
            ? SystemSettings::get('email_handoff_alerts')
            : ($type === 'match' ? SystemSettings::get('email_match_alerts') : ($type === 'request' ? SystemSettings::get('email_approval_alerts') : true));

        if ($emailEnabled) {
            try {
                Mail::raw($message, fn ($mail) => $mail->to($user->email)->subject('ReliefLink update'));
            } catch (\Throwable $e) {
                report($e);
            }
        }
    }

    public static function sendToRoles(array $roles, string $message, string $type = 'system', string $priority = 'normal', ?Model $subject = null, ?string $actionUrl = null): void
    {
        User::whereIn('role', $roles)->each(fn (User $user) => self::send($user, $message, $type, $priority, $subject, $actionUrl));
    }
}
