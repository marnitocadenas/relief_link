<?php

namespace Tests\Feature;

use App\Models\{ActivityLog, AidRequest, Donation, DonationMatch, InventoryMovement, ReliefNotification, User};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use App\Services\SystemSettings;
use App\Services\AlertService;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ReliefLinkWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_donor_and_beneficiary_registration_save_remaining_fields_without_campus_role(): void
    {
        $password = 'Strong!Pass123';

        foreach ([
            ['Donor User', 'donor@example.test', 'donor', 'DONOR-001', '+639171234567'],
            ['Beneficiary User', 'beneficiary@example.test', 'beneficiary', 'BEN-001', '+639171234568'],
        ] as [$name, $email, $role, $campusId, $contactNumber]) {
            $this->postJson('/api/register', compact('name', 'email', 'role') + [
                'campus_id' => $campusId,
                'contact_number' => $contactNumber,
                'country' => 'Philippines',
                'country_code' => 'PH',
                'password' => $password,
                'password_confirmation' => $password,
            ])->assertCreated();

            $this->assertDatabaseHas('users', compact('email', 'role') + [
                'campus_id' => $campusId,
                'contact_number' => $contactNumber,
                'country' => 'Philippines',
                'country_code' => 'PH',
            ]);
        }
    }

    public function test_core_relief_workflow_updates_all_connected_records(): void
    {
        $donor = User::factory()->create(['role' => 'donor']);
        $beneficiary = User::factory()->create(['role' => 'beneficiary']);
        $staff = User::factory()->create(['role' => 'staff']);
        $admin = User::factory()->create(['role' => 'admin']);

        Sanctum::actingAs($donor);
        $this->postJson('/api/donations', [
            'item_name' => 'Emergency Food Pack', 'category' => 'Food & Meals', 'quantity' => 3,
            'condition_notes' => 'Sealed and ready for distribution.', 'pickup_location' => 'Campus Depot A',
        ])->assertCreated();
        $donation = Donation::firstOrFail();

        Sanctum::actingAs($beneficiary);
        $this->postJson('/api/requests', [
            'category' => 'Food & Meals', 'quantity_needed' => 2, 'urgency' => 'high',
            'justification' => 'Immediate food support is needed.',
        ])->assertCreated();
        $request = AidRequest::firstOrFail();

        Sanctum::actingAs($staff);
        $this->patchJson('/api/admin/requests/'.$request->id, [
            'status' => 'approved', 'verification_state' => 'approved',
            'verification_tier' => 'identity_verified', 'student_id_number' => 'STU-1001',
            'verification_notes' => 'Campus identification checked.',
            'verification_checklist' => ['identity' => true, 'eligibility' => true, 'justification' => true],
        ])->assertOk();
        $this->assertDatabaseHas('requests', ['id' => $request->id, 'status' => 'approved', 'verification_state' => 'approved']);

        Sanctum::actingAs($admin);
        $this->postJson('/api/admin/matches/run')->assertOk();
        $match = DonationMatch::firstOrFail();
        $this->assertSame('proposed', $match->status);
        $this->assertSame(2, $match->matched_quantity);
        $this->assertDatabaseHas('donations', ['id' => $donation->id, 'status' => 'pending_match']);
        $this->assertDatabaseHas('requests', ['id' => $request->id, 'status' => 'proposed']);

        Sanctum::actingAs($donor);
        $this->patchJson('/api/matches/'.$match->id.'/complete')->assertForbidden();
        $this->assertDatabaseHas('matches', ['id' => $match->id, 'status' => 'proposed']);
        $this->patchJson('/api/matches/'.$match->id.'/schedule', [
            'handoff_scheduled_at' => now()->addDay()->toIso8601String(),
            'handoff_notes' => 'Campus Student Center pickup desk.',
        ])->assertOk();
        $this->assertDatabaseHas('matches', ['id' => $match->id, 'status' => 'confirmed']);
        $this->getJson('/api/donations')->assertOk()->assertJsonPath('data.0.id', $donation->id);
        $this->getJson('/api/matches')->assertOk()->assertJsonPath('data.0.id', $match->id)
            ->assertJsonMissing(['beneficiary_id' => $beneficiary->id]);

        Sanctum::actingAs($staff);
        $this->postJson('/api/admin/matches/'.$match->id.'/verify-handoff', ['pin' => $match->verification_pin, 'pickup_notes' => 'ID and quantity checked.'])
            ->assertOk();
        $this->assertDatabaseHas('matches', ['id' => $match->id, 'status' => 'fulfilled', 'handed_off_by_user_id' => $staff->id]);
        $this->assertDatabaseHas('donations', ['id' => $donation->id, 'status' => 'pending_match']);
        $this->assertDatabaseHas('requests', ['id' => $request->id, 'status' => 'fulfilled']);
        $this->assertDatabaseHas('inventory_movements', ['donation_id' => $donation->id, 'movement_type' => 'allocation', 'quantity_delta' => -2]);
        $this->assertGreaterThanOrEqual(2, ReliefNotification::whereIn('user_id', [$donor->id, $beneficiary->id])->count());
        $this->assertTrue(ActivityLog::where('action', 'completed handoff with PIN clearance')->exists());
    }

    public function test_role_scoping_hides_other_users_records_and_staff_notes(): void
    {
        $owner = User::factory()->create(['role' => 'donor']);
        $otherDonor = User::factory()->create(['role' => 'donor']);
        $beneficiary = User::factory()->create(['role' => 'beneficiary']);
        $staff = User::factory()->create(['role' => 'staff']);
        $donation = Donation::create(['donor_id' => $owner->id, 'item_name' => 'Medical Kit', 'category' => 'Medical & Health', 'quantity' => 1, 'status' => 'pending_match']);
        $request = AidRequest::create(['beneficiary_id' => $beneficiary->id, 'category' => 'Medical & Health', 'quantity_needed' => 1, 'urgency' => 'high', 'justification' => 'Need supplies.', 'status' => 'pending_review', 'staff_internal_notes' => 'Sensitive staff note']);

        Sanctum::actingAs($otherDonor);
        $this->getJson('/api/donations')->assertOk()->assertJsonCount(0, 'data');
        $this->getJson('/api/requests')->assertOk()->assertJsonPath('data.0.id', $request->id)->assertJsonMissing(['staff_internal_notes' => 'Sensitive staff note']);

        Sanctum::actingAs($beneficiary);
        $this->getJson('/api/requests')->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $request->id);
        $this->getJson('/api/donations')->assertOk()->assertJsonMissing(['storage_location']);

        Sanctum::actingAs($staff);
        $this->getJson('/api/admin/requests')->assertOk()->assertJsonPath('data.0.staff_internal_notes', 'Sensitive staff note');
        $this->getJson('/api/admin/donations')->assertOk()->assertJsonPath('data.0.id', $donation->id);
    }

    public function test_pin_lockout_expiry_and_match_cancellation_keep_records_consistent(): void
    {
        $donor = User::factory()->create(['role' => 'donor']);
        $beneficiary = User::factory()->create(['role' => 'beneficiary']);
        $staff = User::factory()->create(['role' => 'staff']);
        $donation = Donation::create(['donor_id' => $donor->id, 'item_name' => 'Hygiene Kit', 'category' => 'Personal Care & Hygiene', 'quantity' => 1, 'status' => 'proposed']);
        $request = AidRequest::create(['beneficiary_id' => $beneficiary->id, 'category' => 'Personal Care & Hygiene', 'quantity_needed' => 1, 'urgency' => 'medium', 'justification' => 'Need supplies.', 'status' => 'proposed']);
        $match = DonationMatch::create(['donation_id' => $donation->id, 'request_id' => $request->id, 'matched_quantity' => 1, 'status' => 'confirmed']);

        Sanctum::actingAs($staff);
        $this->postJson('/api/admin/matches/'.$match->id.'/verify-handoff', ['pin' => 'not-a-pin'])
            ->assertUnprocessable()->assertJsonValidationErrors('pin');
        for ($attempt = 1; $attempt <= 5; $attempt++) {
            $this->postJson('/api/admin/matches/'.$match->id.'/verify-handoff', ['pin' => '111111'])->assertUnprocessable();
        }
        $this->assertNotNull($match->fresh()->pin_locked_at);
        $this->assertSame(5, $match->fresh()->pin_attempt_count);
        $this->assertTrue(ActivityLog::where('action', 'failed handoff PIN attempt')->exists());

        Sanctum::actingAs($donor);
        $this->patchJson('/api/matches/'.$match->id.'/cancel', ['reason' => 'Recipient rescheduled.'])->assertOk();
        $this->assertDatabaseHas('matches', ['id' => $match->id, 'status' => 'rejected']);
        $this->assertDatabaseHas('donations', ['id' => $donation->id, 'status' => 'pending_match']);
        $this->assertDatabaseHas('requests', ['id' => $request->id, 'status' => 'approved']);
    }

    public function test_staff_inventory_intake_and_adjustment_create_auditable_stock_movements(): void
    {
        $staff = User::factory()->create(['role' => 'staff']);
        Sanctum::actingAs($staff);

        $this->postJson('/api/admin/donations/intake', [
            'donor_name' => 'Campus Health Office',
            'item_name' => 'First Aid Kits',
            'category' => 'Medical & Health',
            'quantity' => 12,
            'storage_location' => 'Depot A / Shelf 2B',
            'condition_grade' => 'new',
            'intake_notes' => 'Counted at receiving desk.',
        ])->assertCreated();

        $donation = Donation::firstOrFail();
        $this->assertDatabaseHas('inventory_movements', [
            'donation_id' => $donation->id, 'staff_user_id' => $staff->id,
            'movement_type' => 'intake', 'quantity_delta' => 12, 'quantity_after' => 12,
        ]);

        $this->patchJson('/api/admin/donations/'.$donation->id.'/stock', [
            'quantity' => 10,
            'storage_location' => 'Depot A / Shelf 3A',
            'condition_grade' => 'good',
            'intake_notes' => 'Two damaged units quarantined.',
        ])->assertOk();

        $this->assertDatabaseHas('donations', ['id' => $donation->id, 'quantity' => 10, 'storage_location' => 'Depot A / Shelf 3A']);
        $this->assertDatabaseHas('inventory_movements', [
            'donation_id' => $donation->id, 'movement_type' => 'adjustment',
            'quantity_delta' => -2, 'quantity_after' => 10,
        ]);
        $this->assertTrue(ActivityLog::where('action', 'updated inventory stock item')->exists());

        $reservedRequest = AidRequest::create([
            'beneficiary_id' => User::factory()->create(['role' => 'beneficiary'])->id,
            'category' => 'Medical & Health', 'quantity_needed' => 6, 'urgency' => 'medium',
            'justification' => 'Reserved item check.', 'status' => 'proposed',
        ]);
        DonationMatch::create([
            'donation_id' => $donation->id, 'request_id' => $reservedRequest->id,
            'matched_quantity' => 6, 'status' => 'confirmed',
        ]);
        $this->patchJson('/api/admin/donations/'.$donation->id.'/stock', ['quantity' => 5])
            ->assertUnprocessable()->assertJsonValidationErrors('quantity');
    }

    public function test_walk_in_allocation_validates_stock_and_prevents_duplicate_requests(): void
    {
        $staff = User::factory()->create(['role' => 'staff']);
        $donor = User::factory()->create(['role' => 'donor']);
        $donation = Donation::create([
            'donor_id' => $donor->id, 'item_name' => 'Food Packs', 'category' => 'Food & Meals',
            'quantity' => 2, 'condition_grade' => 'new', 'status' => 'pending_match',
        ]);
        Sanctum::actingAs($staff);

        $base = [
            'student_name' => 'Walk In Student', 'student_email' => 'walkin@example.test',
            'student_id_number' => 'STU-WALK-1', 'quantity_needed' => 1, 'urgency' => 'high',
            'justification' => 'Student needs immediate support.', 'instant_donation_id' => $donation->id,
        ];
        $this->postJson('/api/admin/requests/walk-in', $base + ['category' => 'Medical & Health'])
            ->assertUnprocessable()->assertJsonValidationErrors('instant_donation_id');
        $this->assertDatabaseMissing('users', ['email' => 'walkin@example.test']);

        $this->postJson('/api/admin/requests/walk-in', $base + ['category' => 'Food & Meals'])
            ->assertCreated();
        $walkIn = AidRequest::firstOrFail();
        $this->assertTrue($walkIn->is_walk_in);
        $this->assertSame('allocated', $walkIn->walk_in_status);
        $this->assertDatabaseHas('matches', ['request_id' => $walkIn->id, 'donation_id' => $donation->id, 'status' => 'confirmed']);

        $this->postJson('/api/admin/requests/walk-in', $base + ['category' => 'Food & Meals'])
            ->assertUnprocessable()->assertJsonFragment(['message' => 'A current Food & Meals request already exists for this student (Request #'.$walkIn->id.'). Review that record before opening another walk-in request.']);
    }

    public function test_staff_verification_validation_permissions_and_reports_are_connected(): void
    {
        $beneficiary = User::factory()->create(['role' => 'beneficiary']);
        $staff = User::factory()->create(['role' => 'staff']);
        $request = AidRequest::create([
            'beneficiary_id' => $beneficiary->id, 'category' => 'School Supplies', 'quantity_needed' => 1,
            'urgency' => 'low', 'justification' => 'Required for classes.', 'status' => 'pending_review',
        ]);

        Sanctum::actingAs($staff);
        $this->patchJson('/api/admin/requests/'.$request->id, [
            'status' => 'rejected', 'verification_state' => 'rejected',
        ])->assertUnprocessable()->assertJsonValidationErrors('verification_decision_reason');
        $this->patchJson('/api/admin/requests/'.$request->id, [
            'status' => 'pending_review', 'verification_state' => 'needs_revision',
            'verification_decision_reason' => 'Please provide your current enrolment proof.',
        ])->assertOk();
        $this->assertDatabaseHas('requests', ['id' => $request->id, 'verification_state' => 'needs_revision']);
        $this->assertTrue(ReliefNotification::where('user_id', $beneficiary->id)->exists());

        $ownStaffRequest = AidRequest::create([
            'beneficiary_id' => $staff->id, 'category' => 'Food & Meals', 'quantity_needed' => 1,
            'urgency' => 'low', 'justification' => 'Must not self-approve.', 'status' => 'pending_review',
        ]);
        $this->patchJson('/api/admin/requests/'.$ownStaffRequest->id, [
            'status' => 'approved', 'verification_state' => 'approved',
        ])->assertForbidden();

        $this->getJson('/api/admin/activities')->assertOk()->assertJsonPath('data.0.action', 'needs_revision support request');
        $this->getJson('/api/admin/reports')->assertOk()->assertJsonStructure([
            'approval_rate', 'confirmation_rate', 'coverage', 'category_balance',
        ]);
    }

    public function test_staff_access_is_limited_to_operational_modules(): void
    {
        $staff = User::factory()->create(['role' => 'staff']);
        $beneficiary = User::factory()->create(['role' => 'beneficiary']);

        $this->getJson('/api/admin/stats')->assertUnauthorized();

        Sanctum::actingAs($beneficiary);
        $this->getJson('/api/admin/stats')->assertForbidden();

        Sanctum::actingAs($staff);
        $this->getJson('/api/admin/stats')->assertOk()->assertJsonStructure([
            'total_donations', 'total_requests', 'total_matches', 'fulfillment_rate',
        ]);
        $this->postJson('/api/admin/users', [
            'name' => 'Unauthorized User', 'email' => 'unauthorized@example.test',
            'password' => 'password123', 'role' => 'donor',
        ])->assertForbidden();
    }

    public function test_beneficiary_request_details_documents_and_match_visibility_are_integrated(): void
    {
        Storage::fake('local');
        $beneficiary = User::factory()->create(['role' => 'beneficiary']);
        $otherBeneficiary = User::factory()->create(['role' => 'beneficiary']);
        $staff = User::factory()->create(['role' => 'staff']);
        $admin = User::factory()->create(['role' => 'admin']);
        $donor = User::factory()->create(['role' => 'donor']);

        Sanctum::actingAs($beneficiary);
        $this->post('/api/requests', [
            'category' => 'food', 'quantity_needed' => 1, 'urgency' => 'high',
            'justification' => 'I need a meal package this week.', 'item_details' => 'Vegetarian option if available',
            'alternative_categories' => 'hygiene', 'pickup_location' => 'Campus Student Center',
            'availability_window' => 'Weekdays after 2 PM',
            'image' => UploadedFile::fake()->create('enrolment-proof.pdf', 120, 'application/pdf'),
        ])->assertCreated()->assertJsonPath('data.item_details', 'Vegetarian option if available');
        $request = AidRequest::firstOrFail();
        $this->assertNotNull($request->supporting_document_path);
        Storage::disk('local')->assertExists($request->supporting_document_path);
        $this->assertDatabaseHas('requests', ['id' => $request->id, 'pickup_location' => 'Campus Student Center']);

        $this->postJson('/api/requests', [
            'category' => 'food', 'quantity_needed' => 1, 'urgency' => 'high', 'justification' => 'Duplicate request.',
        ])->assertUnprocessable()->assertJsonValidationErrors('category');

        Sanctum::actingAs($otherBeneficiary);
        $this->getJson('/api/requests/'.$request->id.'/document')->assertForbidden();
        $this->getJson('/api/requests')->assertOk()->assertJsonCount(0, 'data');

        Sanctum::actingAs($staff);
        $this->getJson('/api/admin/requests')->assertOk()->assertJsonPath('data.0.item_details', 'Vegetarian option if available');
        $this->patchJson('/api/admin/requests/'.$request->id, [
            'status' => 'approved', 'verification_state' => 'approved', 'verification_tier' => 'identity_verified',
        ])->assertOk();

        Sanctum::actingAs($donor);
        $this->postJson('/api/donations', [
            'item_name' => 'Vegetarian Meal Pack', 'category' => 'food', 'quantity' => 1,
            'condition_notes' => 'Sealed meal pack.', 'pickup_location' => 'Campus Student Center',
        ])->assertCreated();

        Sanctum::actingAs($admin);
        $this->postJson('/api/admin/matches/run')->assertOk();
        $match = DonationMatch::firstOrFail();
        $this->get('/api/requests/'.$request->id.'/document')->assertOk();

        Sanctum::actingAs($beneficiary);
        $this->getJson('/api/requests')->assertOk()->assertJsonPath('data.0.status', 'proposed')
            ->assertJsonPath('data.0.supporting_document_url', url('/api/requests/'.$request->id.'/document'));
        $this->getJson('/api/matches')->assertOk()->assertJsonPath('data.0.id', $match->id)
            ->assertJsonPath('data.0.donation.item_name', 'Vegetarian Meal Pack');
    }

    public function test_notifications_are_role_scoped_actionable_and_support_read_lifecycle(): void
    {
        $beneficiary = User::factory()->create(['role' => 'beneficiary']);
        $otherBeneficiary = User::factory()->create(['role' => 'beneficiary']);
        $staff = User::factory()->create(['role' => 'staff']);
        $admin = User::factory()->create(['role' => 'admin']);
        $donor = User::factory()->create(['role' => 'donor']);

        Sanctum::actingAs($beneficiary);
        $this->postJson('/api/requests', [
            'category' => 'hygiene', 'quantity_needed' => 1, 'urgency' => 'high',
            'justification' => 'Need personal care supplies.',
        ])->assertCreated();
        $request = AidRequest::firstOrFail();
        $this->assertDatabaseHas('relief_notifications', [
            'user_id' => $beneficiary->id, 'type' => 'request', 'priority' => 'normal',
            'subject_id' => $request->id, 'action_url' => '/requests',
        ]);
        $this->assertDatabaseCount('relief_notifications', 3);

        Sanctum::actingAs($staff);
        $staffNotification = ReliefNotification::where('user_id', $staff->id)->firstOrFail();
        $this->getJson('/api/notifications')->assertOk()->assertJsonPath('unread_count', 1)
            ->assertJsonPath('data.0.type', 'request')->assertJsonPath('data.0.action_url', '/staff/verifications');
        $this->assertNotNull($staffNotification->fresh()->seen_at);
        $this->patchJson('/api/notifications/'.$staffNotification->id.'/read')->assertOk();
        $this->patchJson('/api/notifications/'.$staffNotification->id.'/read')->assertOk();
        $this->assertDatabaseHas('relief_notifications', ['id' => $staffNotification->id, 'is_read' => true]);
        AlertService::send($staff, 'A new support request requires verification.', 'request', 'high', $request, '/staff/verifications');
        $this->assertSame(1, ReliefNotification::where('user_id', $staff->id)->where('subject_id', $request->id)->count());

        Sanctum::actingAs($otherBeneficiary);
        $this->patchJson('/api/notifications/'.$staffNotification->id.'/read')->assertForbidden();
        $this->getJson('/api/notifications')->assertOk()->assertJsonCount(0, 'data');

        Sanctum::actingAs($donor);
        $this->postJson('/api/donations', [
            'item_name' => 'Hygiene Pack', 'category' => 'hygiene', 'quantity' => 1,
            'condition_notes' => 'New and sealed.', 'pickup_location' => 'Campus Depot A',
        ])->assertCreated();
        $donation = Donation::firstOrFail();
        $this->assertDatabaseHas('relief_notifications', [
            'user_id' => $donor->id, 'type' => 'donation', 'subject_id' => $donation->id, 'action_url' => '/donations',
        ]);
        $this->assertDatabaseHas('relief_notifications', [
            'user_id' => $admin->id, 'type' => 'donation', 'action_url' => '/staff/inventory',
        ]);

        Sanctum::actingAs($admin);
        $this->patchJson('/api/notifications/read-all')->assertNoContent();
        $this->assertSame(0, ReliefNotification::where('user_id', $admin->id)->where('is_read', false)->count());
    }

    public function test_admin_settings_persist_are_role_protected_and_control_registration_and_request_limits(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $beneficiary = User::factory()->create(['role' => 'beneficiary']);
        $settings = SystemSettings::DEFAULTS;
        $settings['allow_self_registration'] = false;
        $settings['max_pending_per_user'] = 1;
        $settings['require_justification'] = false;

        Sanctum::actingAs($admin);
        $this->getJson('/api/admin/settings')->assertOk()->assertJsonPath('data.max_pending_per_user', 3);
        $this->putJson('/api/admin/settings', $settings)->assertOk()
            ->assertJsonPath('data.allow_self_registration', false)->assertJsonPath('data.max_pending_per_user', 1);
        $this->assertDatabaseHas('system_settings', ['key' => 'allow_self_registration', 'value' => 'false', 'updated_by_user_id' => $admin->id]);
        $settings['auto_matching'] = false;
        $this->putJson('/api/admin/settings', $settings)->assertOk();
        $this->postJson('/api/admin/matches/run')->assertOk()->assertJsonPath('created', 0)
            ->assertJsonPath('message', 'Automated matching is disabled in system settings.');

        Sanctum::actingAs($beneficiary);
        $this->getJson('/api/admin/settings')->assertForbidden();
        $this->postJson('/api/requests', ['category' => 'food', 'quantity_needed' => 1, 'urgency' => 'low'])
            ->assertCreated();
        $this->postJson('/api/requests', ['category' => 'clothing', 'quantity_needed' => 1, 'urgency' => 'low'])
            ->assertUnprocessable()->assertJsonValidationErrors('category');

        $this->postJson('/api/register', [
            'name' => 'Blocked User', 'email' => 'blocked@example.test', 'role' => 'donor',
            'campus_id' => 'STU-BLOCKED-01',
            'contact_number' => '+639171234567',
            'password' => 'Strong!Pass123', 'password_confirmation' => 'Strong!Pass123',
        ])->assertForbidden();
    }

    public function test_registration_negative_validation_cases(): void
    {
        $password = 'Strong!Pass123';

        // 1. Empty Full Name
        $this->postJson('/api/register', [
            'name' => '',
            'email' => 'empty-name@example.test',
            'role' => 'donor',
            'campus_id' => 'STU-123',
            'contact_number' => '+639171234567',
            'password' => $password,
            'password_confirmation' => $password,
        ])->assertUnprocessable()->assertJsonValidationErrors('name');

        // 2. Invalid Role (e.g. attempting to self-register as admin)
        $this->postJson('/api/register', [
            'name' => 'Admin Exploiter',
            'email' => 'admin-exploit@example.test',
            'role' => 'admin',
            'campus_id' => 'ADMIN-001',
            'contact_number' => '+639171234567',
            'password' => $password,
            'password_confirmation' => $password,
        ])->assertUnprocessable()->assertJsonValidationErrors('role');

        // 3. Invalid Email Format
        $this->postJson('/api/register', [
            'name' => 'Bad Email User',
            'email' => 'not-an-email',
            'role' => 'donor',
            'campus_id' => 'STU-123',
            'contact_number' => '+639171234567',
            'password' => $password,
            'password_confirmation' => $password,
        ])->assertUnprocessable()->assertJsonValidationErrors('email');

        // 4. Duplicate Email
        User::factory()->create(['email' => 'existing@example.test']);
        $this->postJson('/api/register', [
            'name' => 'Duplicate User',
            'email' => 'existing@example.test',
            'role' => 'donor',
            'campus_id' => 'STU-124',
            'contact_number' => '+639171234567',
            'password' => $password,
            'password_confirmation' => $password,
        ])->assertUnprocessable()->assertJsonValidationErrors('email');

        // 5. Password Mismatch
        $this->postJson('/api/register', [
            'name' => 'Mismatch User',
            'email' => 'mismatch@example.test',
            'role' => 'donor',
            'campus_id' => 'STU-125',
            'contact_number' => '+639171234567',
            'password' => 'Strong!Pass123',
            'password_confirmation' => 'Different!Pass123',
        ])->assertUnprocessable()->assertJsonValidationErrors('password');

        // 6. Weak Password (missing special character)
        $this->postJson('/api/register', [
            'name' => 'Weak Pass User',
            'email' => 'weakpass@example.test',
            'role' => 'donor',
            'campus_id' => 'STU-126',
            'contact_number' => '+639171234567',
            'password' => 'PlainPassword123',
            'password_confirmation' => 'PlainPassword123',
        ])->assertUnprocessable()->assertJsonValidationErrors('password');

        // 7. Incomplete / Invalid Contact Numbers
        $this->postJson('/api/register', [
            'name' => 'Short Phone User',
            'email' => 'shortphone@example.test',
            'role' => 'donor',
            'campus_id' => 'STU-127',
            'contact_number' => '+63917',
            'password' => $password,
            'password_confirmation' => $password,
        ])->assertUnprocessable()->assertJsonValidationErrors('contact_number');

        $this->postJson('/api/register', [
            'name' => 'Invalid Phone User',
            'email' => 'invalidphone@example.test',
            'role' => 'donor',
            'campus_id' => 'STU-128',
            'contact_number' => '12345',
            'password' => $password,
            'password_confirmation' => $password,
        ])->assertUnprocessable()->assertJsonValidationErrors('contact_number');
    }

    public function test_end_to_end_registration_to_profile_to_admin_user_management_flow(): void
    {
        // 1. Create Account / Registration
        $regPassword = 'Secure!PassWord2026';
        $regResponse = $this->postJson('/api/register', [
            'name' => 'John Doe',
            'email' => 'john.doe@example.test',
            'role' => 'beneficiary',
            'campus_id' => '2024-019852',
            'contact_number' => '+639123456789',
            'password' => $regPassword,
            'password_confirmation' => $regPassword,
        ]);

        $regResponse->assertCreated()
            ->assertJsonPath('user.name', 'John Doe')
            ->assertJsonPath('user.email', 'john.doe@example.test')
            ->assertJsonPath('user.role', 'beneficiary')
            ->assertJsonPath('user.campus_id', '2024-019852')
            ->assertJsonPath('user.contact_number', '+639123456789');

        $user = User::where('email', 'john.doe@example.test')->firstOrFail();
        $this->assertSame('John Doe', $user->name);
        $this->assertSame('beneficiary', $user->role);
        $this->assertSame('2024-019852', $user->campus_id);
        $this->assertSame('+639123456789', $user->contact_number);
        $this->assertTrue(\Illuminate\Support\Facades\Hash::check($regPassword, $user->password));

        // 2. Beneficiary Profile Retrieval
        Sanctum::actingAs($user);
        $profileResponse = $this->getJson('/api/user');
        $profileResponse->assertOk()
            ->assertJsonPath('data.name', 'John Doe')
            ->assertJsonPath('data.email', 'john.doe@example.test')
            ->assertJsonPath('data.role', 'beneficiary')
            ->assertJsonPath('data.campus_id', '2024-019852')
            ->assertJsonPath('data.contact_number', '+639123456789');

        // 3. Beneficiary Profile Update
        $updateProfileResponse = $this->postJson('/api/profile', [
            'name' => 'John A. Doe',
            'email' => 'john.doe@example.test',
            'contact_number' => '+639998887777',
            'campus_id' => '2024-019852-B',
        ]);

        $updateProfileResponse->assertOk()
            ->assertJsonPath('data.name', 'John A. Doe')
            ->assertJsonPath('data.contact_number', '+639998887777')
            ->assertJsonPath('data.campus_id', '2024-019852-B');

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'John A. Doe',
            'contact_number' => '+639998887777',
            'campus_id' => '2024-019852-B',
        ]);

        // 4. Admin User Management View
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin);

        $adminUsersResponse = $this->getJson('/api/admin/users');
        $adminUsersResponse->assertOk();
        $beneficiaryInList = collect($adminUsersResponse->json('data'))->firstWhere('id', $user->id);
        $this->assertNotNull($beneficiaryInList);
        $this->assertSame('John A. Doe', $beneficiaryInList['name']);
        $this->assertSame('john.doe@example.test', $beneficiaryInList['email']);
        $this->assertSame('beneficiary', $beneficiaryInList['role']);
        $this->assertSame('2024-019852-B', $beneficiaryInList['campus_id']);
        $this->assertSame('+639998887777', $beneficiaryInList['contact_number']);

        // 5. Admin updates user record
        $this->patchJson('/api/admin/users/' . $user->id, [
            'name' => 'John A. Doe Jr.',
            'contact_number' => '+639112223344',
            'campus_id' => '2024-019852-C',
        ])->assertOk()
            ->assertJsonPath('data.name', 'John A. Doe Jr.')
            ->assertJsonPath('data.contact_number', '+639112223344')
            ->assertJsonPath('data.campus_id', '2024-019852-C');

        // 6. Beneficiary checks Profile again (Single Source of Truth)
        Sanctum::actingAs($user->fresh());
        $this->getJson('/api/user')
            ->assertOk()
            ->assertJsonPath('data.name', 'John A. Doe Jr.')
            ->assertJsonPath('data.contact_number', '+639112223344')
            ->assertJsonPath('data.campus_id', '2024-019852-C');
    }

    public function test_international_phone_number_registration_and_validation(): void
    {
        $password = 'Secure!PassWord2026';

        // 1. Valid International Registration: United Kingdom
        $ukRes = $this->postJson('/api/register', [
            'name' => 'UK Donor',
            'email' => 'uk.donor@example.test',
            'role' => 'donor',
            'country' => 'United Kingdom',
            'campus_id' => 'INT-UK-001',
            'contact_number' => '+447911123456',
            'password' => $password,
            'password_confirmation' => $password,
        ]);
        $ukRes->assertCreated()
            ->assertJsonPath('user.contact_number', '+447911123456');

        // 2. Valid International Registration: Singapore
        $sgRes = $this->postJson('/api/register', [
            'name' => 'SG Donor',
            'email' => 'sg.donor@example.test',
            'role' => 'donor',
            'country' => 'Singapore',
            'campus_id' => 'INT-SG-001',
            'contact_number' => '+6581234567',
            'password' => $password,
            'password_confirmation' => $password,
        ]);
        $sgRes->assertCreated()
            ->assertJsonPath('user.contact_number', '+6581234567');

        // 3. National number with leading zero auto-normalized to E.164
        $phRes = $this->postJson('/api/register', [
            'name' => 'PH Student',
            'email' => 'ph.student@example.test',
            'role' => 'beneficiary',
            'campus_id' => '2024-998877',
            'contact_number' => '09171234567',
            'password' => $password,
            'password_confirmation' => $password,
        ]);
        $phRes->assertCreated()
            ->assertJsonPath('user.contact_number', '+639171234567');

        // 4. Incomplete Singapore number (only 4 digits) -> rejected
        $this->postJson('/api/register', [
            'name' => 'Incomplete SG',
            'email' => 'incompletesg@example.test',
            'role' => 'donor',
            'country' => 'Singapore',
            'campus_id' => 'INT-SG-002',
            'contact_number' => '+658123',
            'password' => $password,
            'password_confirmation' => $password,
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('contact_number')
            ->assertJsonFragment(['contact_number' => ['Please enter a valid mobile number for the selected country.']]);
    }
}
