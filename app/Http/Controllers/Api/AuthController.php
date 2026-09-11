<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Models\PasswordOtp;
use App\Mail\OtpMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Services\SystemSettings;

class AuthController extends Controller
{
    public function register(RegisterRequest $r)
    {
        abort_unless(SystemSettings::get('allow_self_registration'), 403, 'Self-registration is currently disabled. Please contact an administrator.');
        $u = User::create([
            ...$r->validated(),
            'password' => Hash::make($r->password),
            'email_verified_at' => now(),
            'remember_token' => \Illuminate\Support\Str::random(10),
        ]);
        return response()->json([
            'user' => new UserResource($u),
            'token' => $u->createToken('react-spa')->plainTextToken
        ], 201);
    }

    public function login(Request $r)
    {
        $d = $r->validate([
            'email' => 'required|email',
            'password' => 'required',
            'remember' => 'nullable|boolean',
        ]);
        $u = User::where('email', $d['email'])->first();
        abort_unless($u && Hash::check($d['password'], $u->password), 422, 'Invalid credentials.');

        // Ensure email_verified_at and remember_token are populated
        if (is_null($u->email_verified_at)) {
            $u->email_verified_at = now();
        }
        if ($r->boolean('remember') || is_null($u->remember_token)) {
            $u->remember_token = \Illuminate\Support\Str::random(10);
        }
        $u->save();

        return [
            'user' => new UserResource($u),
            'token' => $u->createToken('react-spa')->plainTextToken
        ];
    }

    public function sendOtp(Request $r)
    {
        $d = $r->validate([
            'email' => 'required|email|exists:users,email'
        ], [
            'email.exists' => 'No registered user account was found matching this email address.'
        ]);

        // Rate limiting check: 60 seconds cooldown
        $recent = PasswordOtp::where('email', $d['email'])
            ->where('created_at', '>=', now()->subSeconds(60))
            ->first();

        if ($recent) {
            abort(429, 'Please wait 60 seconds before requesting another OTP code.');
        }

        // Generate 6-digit OTP code
        $otpCode = (string) rand(100000, 999999);

        // Store OTP in database
        PasswordOtp::create([
            'email' => $d['email'],
            'otp' => Hash::make($otpCode),
            'expires_at' => now()->addMinutes(10),
            'attempts' => 0,
            'used' => false,
        ]);

        // Dispatch real email via Brevo SMTP / Laravel Mailer
        try {
            Mail::to($d['email'])->send(new OtpMail($otpCode));
        } catch (\Exception $e) {
            Log::error('Failed to send OTP email: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Verification OTP has been sent to your registered email address.'
        ]);
    }

    public function verifyOtp(Request $r)
    {
        $d = $r->validate([
            'email' => 'required|email',
            'otp' => 'required|string|size:6',
        ]);

        $otpRecord = PasswordOtp::where('email', $d['email'])
            ->where('used', false)
            ->where('expires_at', '>', now())
            ->latest()
            ->first();

        if (!$otpRecord) {
            abort(422, 'Verification OTP has expired or is invalid. Please request a new code.');
        }

        if ($otpRecord->attempts >= 5) {
            abort(422, 'Maximum OTP verification attempts exceeded. Please request a new code.');
        }

        $otpRecord->increment('attempts');

        // STRICT HASH CHECK ONLY (No fallback code)
        if (!Hash::check($d['otp'], $otpRecord->otp)) {
            abort(422, 'Incorrect OTP verification code. Please check and try again.');
        }

        $otpRecord->update(['verified_at' => now()]);

        return response()->json([
            'message' => 'OTP verified successfully. You may now create your new password.'
        ]);
    }

    public function resetPassword(Request $r)
    {
        $d = $r->validate([
            'email' => 'required|email|exists:users,email',
            'otp' => 'required|string|size:6',
            'password' => [
                'required',
                'string',
                'confirmed',
                \Illuminate\Validation\Rules\Password::min(8)
                    ->max(64)
                    ->letters()
                    ->mixedCase()
                    ->numbers()
                    ->symbols(),
                function ($attribute, $value, $fail) use ($r) {
                    if (trim($value) !== $value) {
                        $fail('The password cannot start or end with spaces.');
                        return;
                    }
                    $weakPasswords = ['password', '12345678', 'qwerty', 'admin', 'welcome', '123456', 'password123', 'relieflink', 'letmein'];
                    if (in_array(strtolower($value), $weakPasswords, true)) {
                        $fail('This password is too common or easily guessable. Please choose a stronger password.');
                        return;
                    }
                    $emailParts = explode('@', strtolower($r->email ?? ''));
                    $emailUsername = $emailParts[0] ?? '';
                    if (!empty($emailUsername) && strlen($emailUsername) >= 3 && stripos($value, $emailUsername) !== false) {
                        $fail('The password cannot contain your email address.');
                        return;
                    }
                }
            ],
        ]);

        $otpRecord = PasswordOtp::where('email', $d['email'])
            ->where('used', false)
            ->whereNotNull('verified_at')
            ->latest()
            ->first();

        if (!$otpRecord) {
            abort(422, 'OTP verification record not found or expired. Please verify your OTP code first.');
        }

        $user = User::where('email', $d['email'])->firstOrFail();
        $user->update([
            'password' => Hash::make($d['password'])
        ]);

        $otpRecord->update(['used' => true]);

        // Revoke all active tokens for session invalidation on password reset
        $user->tokens()->delete();

        Log::info('Password reset completed and tokens revoked', ['user_id' => $user->id]);

        return response()->json([
            'message' => 'Your password has been reset successfully. Please log in with your new password.'
        ]);
    }

    public function user(Request $r)
    {
        return new UserResource($r->user());
    }

    public function updateProfile(Request $r)
    {
        $u = $r->user();
        $data = $r->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $u->id,
            'password' => 'nullable|min:8|confirmed',
            'profile_photo' => 'nullable|image|max:2048'
        ]);
        if ($r->hasFile('profile_photo')) {
            $data['profile_photo_path'] = $r->file('profile_photo')->store('profiles', 'public');
        }
        if (empty($data['password'])) {
            unset($data['password']);
        } else {
            $data['password'] = Hash::make($data['password']);
        }
        unset($data['profile_photo']);
        $u->update($data);
        if (isset($data['password'])) $u->tokens()->where('id', '!=', $u->currentAccessToken()?->id)->delete();
        return new UserResource($u->fresh());
    }

    public function logout(Request $r)
    {
        $r->user()->currentAccessToken()?->delete();
        return response()->noContent();
    }
}
