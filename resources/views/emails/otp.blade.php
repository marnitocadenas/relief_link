<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ReliefLink OTP Verification</title>
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff; font-family: 'Figtree', Arial, sans-serif; color: #2563EB;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" max-width="560" cellspacing="0" cellpadding="0" border="0" style="max-width: 560px; border: 2px solid #2563EB; border-radius: 16px; background-color: #ffffff; padding: 32px; text-align: center;">
                    <!-- Header Branding -->
                    <tr>
                        <td align="center" style="padding-bottom: 24px; border-bottom: 2px solid #2563EB;">
                            <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #2563EB; letter-spacing: -0.5px;">ReliefLink</h1>
                            <p style="margin: 4px 0 0; font-size: 11px; font-weight: 800; color: #2563EB; text-transform: uppercase; letter-spacing: 2px;">Campus Resource Exchange</p>
                        </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                        <td align="center" style="padding: 28px 0 16px;">
                            <p style="margin: 0; font-size: 12px; font-weight: 800; color: #2563EB; text-transform: uppercase; letter-spacing: 1.5px;">PASSWORD RESET REQUEST</p>
                            <h2 style="margin: 8px 0 0; font-size: 22px; font-weight: 800; color: #2563EB;">Verification OTP Code</h2>
                            <p style="margin: 12px 0 24px; font-size: 14px; color: #2563EB; line-height: 1.5;">
                                Use the 6-digit verification code below to reset your ReliefLink account password.
                            </p>
                        </td>
                    </tr>

                    <!-- OTP Code Box -->
                    <tr>
                        <td align="center" style="padding: 12px 0 24px;">
                            <div style="display: inline-block; background-color: #2563EB; color: #ffffff; font-family: monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; padding: 18px 36px; border-radius: 12px; border: 2px solid #2563EB;">
                                {{ $otp }}
                            </div>
                        </td>
                    </tr>

                    <!-- Expiration Notice -->
                    <tr>
                        <td align="center" style="padding-bottom: 24px;">
                            <div style="border: 1px solid #22C55E; background-color: #ffffff; border-radius: 10px; padding: 12px; font-size: 12px; font-weight: 700; color: #22C55E; max-width: 420px;">
                                &#10003; This code expires in 10 minutes. Do not share this code with anyone.
                            </div>
                        </td>
                    </tr>

                    <!-- Footer Note -->
                    <tr>
                        <td align="center" style="border-top: 1px solid #2563EB; padding-top: 20px;">
                            <p style="margin: 0; font-size: 12px; color: #2563EB; line-height: 1.5;">
                                If you did not request a password reset, you can safely ignore this email. Your account credentials remain secure.
                            </p>
                            <p style="margin: 12px 0 0; font-size: 11px; font-weight: 700; color: #2563EB;">
                                &copy; {{ date('Y') }} ReliefLink Campus System. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
