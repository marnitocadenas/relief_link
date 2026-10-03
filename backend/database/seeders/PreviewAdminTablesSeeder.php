<?php

namespace Database\Seeders;

use App\Models\AidRequest;
use App\Models\Donation;
use App\Models\DonationMatch;
use App\Models\User;
use Illuminate\Database\Seeder;

class PreviewAdminTablesSeeder extends Seeder
{
    /**
     * Add stable preview records for the admin request and matching tables.
     */
    public function run(): void
    {
        $donor = User::firstOrCreate(
            ['email' => 'jordan.reyes.preview@relieflink.test'],
            [
                'name' => 'Jordan Reyes',
                'password' => 'password',
                'role' => 'donor',
                'department' => 'Student Affairs',
                'is_active' => true,
            ]
        );

        $beneficiary = User::firstOrCreate(
            ['email' => 'maya.santos.preview@relieflink.test'],
            [
                'name' => 'Maya Santos',
                'password' => 'password',
                'role' => 'beneficiary',
                'department' => 'Engineering',
                'course' => 'BS Information Technology',
                'year_level' => '2nd Year',
                'is_active' => true,
            ]
        );

        $request = AidRequest::firstOrCreate(
            [
                'beneficiary_id' => $beneficiary->id,
                'category' => 'School Supplies',
                'item_details' => 'Scientific calculator and notebook set',
            ],
            [
                'request_type' => 'physical',
                'quantity_needed' => 5,
                'unit' => 'sets',
                'urgency' => 'high',
                'justification' => 'Needed for laboratory classes and daily coursework this term.',
                'preferred_assistance_date' => 'October 15, 2026',
                'pickup_location' => 'Student Affairs Office',
                'availability_window' => 'Weekdays, 9:00 AM–4:00 PM',
                'status' => 'partially_fulfilled',
                'verification_tier' => 'identity_verified',
                'verification_state' => 'approved',
                'student_id_number' => '2026-004218',
            ]
        );

        $donation = Donation::firstOrCreate(
            [
                'donor_id' => $donor->id,
                'item_name' => 'Scientific calculator and notebook set',
                'category' => 'School Supplies',
            ],
            [
                'donation_type' => 'physical',
                'quantity' => 5,
                'condition_notes' => 'New calculators with unused ruled notebooks.',
                'availability_window' => 'Weekdays, 9:00 AM–4:00 PM',
                'pickup_location' => 'Campus Student Center, Room 104',
                'condition_grade' => 'new',
                'status' => 'proposed',
            ]
        );

        $match = DonationMatch::firstOrCreate(
            [
                'donation_id' => $donation->id,
                'request_id' => $request->id,
            ],
            [
                'matched_quantity' => 3,
                'status' => 'proposed',
                'pickup_hub' => 'Campus Student Center',
                'handoff_notes' => 'Three of five requested sets are available for review.',
            ]
        );

        $approvalRequest = AidRequest::firstOrCreate(
            [
                'beneficiary_id' => $beneficiary->id,
                'category' => 'books',
                'item_details' => 'Introduction to programming textbook',
            ],
            [
                'request_type' => 'physical',
                'quantity_needed' => 2,
                'unit' => 'books',
                'urgency' => 'medium',
                'justification' => 'Required reference text for the second-year programming course.',
                'preferred_assistance_date' => 'November 3, 2026',
                'status' => 'pending_review',
                'verification_tier' => 'unverified',
                'verification_state' => 'pending',
                'student_id_number' => '2026-004218',
            ]
        );

        $this->command?->info("Preview records ready: request #{$request->id}, match #{$match->id}, approval #{$approvalRequest->id}.");
    }
}
