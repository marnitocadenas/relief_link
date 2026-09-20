<?php

namespace Tests\Feature;

use App\Models\ActivityLog;
use App\Models\AidRequest;
use App\Models\Donation;
use App\Models\DonationMatch;
use App\Models\ReliefNotification;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AidRequestWorkflowIntegrationTest extends TestCase
{
    use RefreshDatabase;

    protected User $beneficiary;
    protected User $donor;
    protected User $staff;
    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->beneficiary = User::factory()->create([
            'name' => 'Jane Student',
            'email' => 'jane.student@campus.edu',
            'role' => 'beneficiary',
            'student_id_number' => 'STU-2026-001',
            'school_email' => 'jane.student@univ.edu.ph',
            'department' => 'College of Engineering',
            'course' => 'BS Computer Science',
            'year_level' => '3rd Year',
            'contact_number' => '09171234567',
        ]);

        $this->donor = User::factory()->create([
            'name' => 'Campus Alumni Donor',
            'email' => 'alumni.donor@campus.edu',
            'role' => 'donor',
            'contact_number' => '09181234567',
        ]);

        $this->staff = User::factory()->create([
            'name' => 'Relief Desk Staff',
            'email' => 'desk.staff@campus.edu',
            'role' => 'staff',
        ]);

        $this->admin = User::factory()->create([
            'name' => 'Relief Administrator',
            'email' => 'admin@campus.edu',
            'role' => 'admin',
        ]);
    }

    public function test_beneficiary_can_create_physical_item_request_with_full_integration(): void
    {
        $response = $this->actingAs($this->beneficiary, 'sanctum')
            ->postJson('/api/requests', [
                'request_type' => 'physical',
                'category' => 'books',
                'item_name' => 'Discrete Mathematics Textbook',
                'quantity_needed' => 2,
                'unit' => 'copies',
                'urgency' => 'high',
                'justification' => 'Required for Midterm exam review in CS201 course this semester.',
                'alternative_categories' => 'pdf / digital copy',
                'additional_info' => 'Prefer hardbound edition if available.',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.request_type', 'physical')
            ->assertJsonPath('data.category', 'books')
            ->assertJsonPath('data.quantity_needed', 2)
            ->assertJsonPath('data.unit', 'copies')
            ->assertJsonPath('data.urgency', 'high')
            ->assertJsonPath('data.remaining_quantity', 2)
            ->assertJsonPath('data.status', 'pending_review')
            ->assertJsonPath('data.beneficiary.student_id_number', 'STU-2026-001')
            ->assertJsonPath('data.beneficiary.department', 'College of Engineering');

        $this->assertDatabaseHas('requests', [
            'beneficiary_id' => $this->beneficiary->id,
            'request_type' => 'physical',
            'category' => 'books',
            'quantity_needed' => 2,
            'unit' => 'copies',
            'urgency' => 'high',
            'status' => 'pending_review',
        ]);

        $this->assertDatabaseHas('activity_logs', [
            'user_id' => $this->beneficiary->id,
            'action' => 'created support request',
        ]);
    }

    public function test_beneficiary_can_create_financial_assistance_request_with_full_integration(): void
    {
        $preferredDate = now()->addDays(7)->format('Y-m-d');

        $response = $this->actingAs($this->beneficiary, 'sanctum')
            ->postJson('/api/requests', [
                'request_type' => 'financial',
                'category' => 'tuition',
                'amount_requested' => 3500.00,
                'currency' => 'PHP',
                'purpose_of_funds' => 'Graduation Assessment Fee and Laboratory Clearance',
                'preferred_assistance_date' => $preferredDate,
                'urgency' => 'high',
                'justification' => 'Immediate financial assistance needed before enrollment deadline.',
                'additional_info' => 'Can accept GCash or Direct Bank Transfer to student account.',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.request_type', 'financial')
            ->assertJsonPath('data.category', 'tuition')
            ->assertJsonPath('data.amount_requested', 3500)
            ->assertJsonPath('data.currency', 'PHP')
            ->assertJsonPath('data.purpose_of_funds', 'Graduation Assessment Fee and Laboratory Clearance')
            ->assertJsonPath('data.preferred_assistance_date', $preferredDate)
            ->assertJsonPath('data.remaining_amount', 3500)
            ->assertJsonPath('data.urgency', 'high')
            ->assertJsonPath('data.status', 'pending_review');

        $this->assertDatabaseHas('requests', [
            'beneficiary_id' => $this->beneficiary->id,
            'request_type' => 'financial',
            'category' => 'tuition',
            'amount_requested' => 3500.00,
            'purpose_of_funds' => 'Graduation Assessment Fee and Laboratory Clearance',
            'preferred_assistance_date' => $preferredDate,
            'status' => 'pending_review',
        ]);

        $this->assertDatabaseHas('activity_logs', [
            'user_id' => $this->beneficiary->id,
            'action' => 'created support request',
        ]);
    }

    public function test_financial_request_requires_amount_and_purpose(): void
    {
        $response = $this->actingAs($this->beneficiary, 'sanctum')
            ->postJson('/api/requests', [
                'request_type' => 'financial',
                'category' => 'tuition',
                'urgency' => 'high',
                'justification' => 'Testing validation error for missing amount and purpose.',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['amount_requested', 'purpose_of_funds']);
    }

    public function test_physical_request_requires_quantity(): void
    {
        $response = $this->actingAs($this->beneficiary, 'sanctum')
            ->postJson('/api/requests', [
                'request_type' => 'physical',
                'category' => 'clothing',
                'urgency' => 'medium',
                'justification' => 'Testing validation error for missing quantity.',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['quantity_needed']);
    }

    public function test_admin_and_staff_can_review_and_approve_request(): void
    {
        $request = AidRequest::create([
            'beneficiary_id' => $this->beneficiary->id,
            'request_type' => 'financial',
            'category' => 'medical',
            'amount_requested' => 1200.00,
            'currency' => 'PHP',
            'purpose_of_funds' => 'Prescription Eye Drops and Health Exam',
            'urgency' => 'high',
            'status' => 'pending_review',
            'verification_state' => 'pending_review',
            'quantity_needed' => 1,
            'justification' => 'Prescribed medication from campus clinic.',
        ]);

        // Staff moves to under_review
        $response = $this->actingAs($this->staff, 'sanctum')
            ->patchJson("/api/admin/requests/{$request->id}", [
                'status' => 'under_review',
                'verification_state' => 'under_review',
                'verification_notes' => 'Checking clinic prescription copy.',
            ]);

        $response->assertOk()
            ->assertJsonPath('data.status', 'under_review')
            ->assertJsonPath('data.verification_state', 'under_review');

        // Admin approves request
        $response2 = $this->actingAs($this->admin, 'sanctum')
            ->patchJson("/api/admin/requests/{$request->id}", [
                'status' => 'approved',
                'verification_state' => 'approved',
                'verification_notes' => 'Prescription verified with health office.',
            ]);

        $response2->assertOk()
            ->assertJsonPath('data.status', 'approved')
            ->assertJsonPath('data.verification_state', 'approved');
    }

    public function test_donor_can_fulfill_physical_request_and_update_remaining_quantities(): void
    {
        $request = AidRequest::create([
            'beneficiary_id' => $this->beneficiary->id,
            'request_type' => 'physical',
            'category' => 'books',
            'item_name' => 'Data Structures Book',
            'quantity_needed' => 4,
            'unit' => 'copies',
            'urgency' => 'high',
            'status' => 'approved',
            'verification_state' => 'approved',
            'justification' => 'Required textbooks for team study group.',
        ]);

        // Donor donates 2 units towards the request (partial match)
        $response = $this->actingAs($this->donor, 'sanctum')
            ->postJson('/api/donations', [
                'donation_type' => 'physical',
                'category' => 'books',
                'item_name' => 'Data Structures in C++ (Clean copies)',
                'quantity' => 2,
                'request_id' => $request->id,
                'condition_notes' => '2 gently used copies donated for student request',
                'pickup_location' => 'Main Library Handoff Desk',
                'availability_window' => 'Available Immediately',
                'preferred_handoff_slots' => 'Morning (8:00 AM - 12:00 PM)',
            ]);

        $response->assertStatus(201);

        $request->refresh();
        $this->assertEquals(2, $request->getActiveMatchedQuantity());
        $this->assertEquals(2, $request->getRemainingQuantity());
        $this->assertEquals('partially_fulfilled', $request->status);

        // Donor donates another 2 units (full match)
        $response2 = $this->actingAs($this->donor, 'sanctum')
            ->postJson('/api/donations', [
                'donation_type' => 'physical',
                'category' => 'books',
                'item_name' => 'Data Structures 2nd Edition',
                'quantity' => 2,
                'request_id' => $request->id,
                'condition_notes' => 'Remaining 2 copies donated',
                'pickup_location' => 'Main Library Handoff Desk',
                'availability_window' => 'Available Immediately',
            ]);

        $response2->assertStatus(201);

        $request->refresh();
        $this->assertEquals(4, $request->getActiveMatchedQuantity());
        $this->assertEquals(0, $request->getRemainingQuantity());
        $this->assertEquals('matched', $request->status);
    }

    public function test_donor_can_fulfill_financial_request_and_update_remaining_amounts(): void
    {
        $request = AidRequest::create([
            'beneficiary_id' => $this->beneficiary->id,
            'request_type' => 'financial',
            'category' => 'tuition',
            'amount_requested' => 5000.00,
            'currency' => 'PHP',
            'purpose_of_funds' => 'Midterm Tuition Balance',
            'urgency' => 'high',
            'status' => 'approved',
            'verification_state' => 'approved',
            'quantity_needed' => 1,
            'justification' => 'Needs tuition balance coverage before exams.',
        ]);

        // Donor donates partial ₱2,000.00
        $response = $this->actingAs($this->donor, 'sanctum')
            ->postJson('/api/donations', [
                'donation_type' => 'financial',
                'category' => 'tuition',
                'item_name' => 'Tuition Grant Part 1',
                'amount' => 2000.00,
                'currency' => 'PHP',
                'request_id' => $request->id,
                'condition_notes' => 'Sent via GCash Ref #123456789',
                'pickup_location' => 'Online Transfer / Campus Cashier',
                'availability_window' => 'Available Immediately',
            ]);

        $response->assertStatus(201);

        $request->refresh();
        $this->assertEquals(2000.00, $request->getActiveMatchedAmount());
        $this->assertEquals(3000.00, $request->getRemainingAmount());
        $this->assertEquals('partially_fulfilled', $request->status);

        // Donor donates remaining ₱3,000.00
        $response2 = $this->actingAs($this->donor, 'sanctum')
            ->postJson('/api/donations', [
                'donation_type' => 'financial',
                'category' => 'tuition',
                'item_name' => 'Tuition Grant Part 2',
                'amount' => 3000.00,
                'currency' => 'PHP',
                'request_id' => $request->id,
                'condition_notes' => 'Sent via Bank Transfer Ref #987654321',
                'pickup_location' => 'Online Transfer / Campus Cashier',
                'availability_window' => 'Available Immediately',
            ]);

        $response2->assertStatus(201);

        $request->refresh();
        $this->assertEquals(5000.00, $request->getActiveMatchedAmount());
        $this->assertEquals(0.00, $request->getRemainingAmount());
        $this->assertEquals('matched', $request->status);
    }

    public function test_beneficiary_can_cancel_own_pending_request_with_reason(): void
    {
        $request = AidRequest::create([
            'beneficiary_id' => $this->beneficiary->id,
            'request_type' => 'physical',
            'category' => 'books',
            'quantity_needed' => 1,
            'urgency' => 'low',
            'status' => 'pending_review',
            'justification' => 'Calculus book request.',
        ]);

        $response = $this->actingAs($this->beneficiary, 'sanctum')
            ->postJson("/api/requests/{$request->id}/cancel", [
                'reason' => 'Already borrowed a copy from classmate.',
            ]);

        $response->assertOk()
            ->assertJsonPath('data.status', 'cancelled');

        $this->assertDatabaseHas('requests', [
            'id' => $request->id,
            'status' => 'cancelled',
        ]);

        $this->assertDatabaseHas('activity_logs', [
            'user_id' => $this->beneficiary->id,
            'action' => 'cancelled support request',
        ]);
    }

    public function test_beneficiary_cannot_cancel_another_users_request(): void
    {
        $otherUser = User::factory()->create([
            'role' => 'beneficiary',
        ]);

        $request = AidRequest::create([
            'beneficiary_id' => $otherUser->id,
            'request_type' => 'physical',
            'category' => 'food',
            'quantity_needed' => 3,
            'urgency' => 'high',
            'status' => 'pending_review',
            'justification' => 'Food support request.',
        ]);

        $response = $this->actingAs($this->beneficiary, 'sanctum')
            ->postJson("/api/requests/{$request->id}/cancel", [
                'reason' => 'Attempting unauthorized cancellation.',
            ]);

        $response->assertStatus(403);
    }
}
