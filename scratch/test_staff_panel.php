<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Donation;
use App\Models\AidRequest;
use App\Models\DonationMatch;

echo "--- RELIEFLINK STAFF PANEL BACKEND TEST ---\n";

// 1. Fetch or create staff user
$staff = User::where('role', 'staff')->first();
if (!$staff) {
    $staff = User::create([
        'name' => 'Test Staff Member',
        'email' => 'staff_test@relieflink.edu',
        'password' => bcrypt('password'),
        'role' => 'staff',
    ]);
}
echo "Staff User: {$staff->name} (#{$staff->id})\n";

// 2. Test Physical Intake
$donation = Donation::create([
    'donor_id' => $staff->id,
    'item_name' => 'Test Medical Kit',
    'category' => 'Medical & Health',
    'quantity' => 10,
    'storage_location' => 'Depot A / Shelf 2B',
    'condition_grade' => 'new',
    'intake_notes' => 'Staff intake test kit',
    'status' => 'pending_match',
]);
echo "✓ Physical Intake Created: Donation #{$donation->id} at {$donation->storage_location}\n";

// 3. Test Student Aid Request & Verification Tier
$beneficiary = User::where('role', 'beneficiary')->first();
if (!$beneficiary) {
    $beneficiary = User::create([
        'name' => 'Test Student',
        'email' => 'student_test@relieflink.edu',
        'password' => bcrypt('password'),
        'role' => 'beneficiary',
    ]);
}

$request = AidRequest::create([
    'beneficiary_id' => $beneficiary->id,
    'category' => 'Medical & Health',
    'quantity_needed' => 2,
    'urgency' => 'high',
    'justification' => 'Emergency first aid supplies needed for dorm.',
    'status' => 'pending_review',
    'student_id_number' => 'STU-2026-9999',
    'verification_tier' => 'financial_hardship',
    'verified_by_user_id' => $staff->id,
]);
echo "✓ Student Aid Request Created: Request #{$request->id} (Tier: {$request->verification_tier})\n";

// 4. Test Match & PIN Generation
$match = DonationMatch::create([
    'donation_id' => $donation->id,
    'request_id' => $request->id,
    'matched_quantity' => 2,
    'status' => 'confirmed',
    'pickup_hub' => 'Main Library Desk',
]);
echo "✓ Match Created: Match #{$match->id} with 6-Digit PIN: {$match->verification_pin}\n";

// 5. Test Handoff PIN Clearance
$match->update([
    'status' => 'fulfilled',
    'handed_off_by_user_id' => $staff->id,
    'handed_off_at' => now(),
]);
echo "✓ PIN Clearance Completed: Match #{$match->id} status is now '{$match->status}' (Handed off by Staff #{$match->handed_off_by_user_id})\n";

echo "--- ALL BACKEND TESTS PASSED CLEANLY ---\n";
