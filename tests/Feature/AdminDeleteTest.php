<?php

namespace Tests\Feature;

use App\Models\AidRequest;
use App\Models\Donation;
use App\Models\DonationMatch;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminDeleteTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_delete_donation_and_related_records_cascade(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $donor = User::factory()->create(['role' => 'donor']);
        $beneficiary = User::factory()->create(['role' => 'beneficiary']);

        $donation = Donation::create([
            'donor_id' => $donor->id,
            'item_name' => 'Canned Goods',
            'category' => 'food',
            'quantity' => 10,
            'status' => 'pending_match',
        ]);

        $request = AidRequest::create([
            'beneficiary_id' => $beneficiary->id,
            'category' => 'food',
            'quantity_needed' => 2,
            'urgency' => 'high',
            'justification' => 'Need food',
            'status' => 'approved',
        ]);

        $match = DonationMatch::create([
            'donation_id' => $donation->id,
            'request_id' => $request->id,
            'matched_quantity' => 2,
            'status' => 'proposed',
        ]);

        Sanctum::actingAs($admin);

        $response = $this->deleteJson("/api/admin/donations/{$donation->id}");
        $response->assertNoContent();

        $this->assertDatabaseMissing('donations', ['id' => $donation->id]);
        $this->assertDatabaseMissing('matches', ['id' => $match->id]);
        // The request itself should still exist
        $this->assertDatabaseHas('requests', ['id' => $request->id]);
    }

    public function test_admin_can_delete_aid_request_and_related_matches(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $donor = User::factory()->create(['role' => 'donor']);
        $beneficiary = User::factory()->create(['role' => 'beneficiary']);

        $donation = Donation::create([
            'donor_id' => $donor->id,
            'item_name' => 'Blankets',
            'category' => 'clothing',
            'quantity' => 5,
            'status' => 'pending_match',
        ]);

        $request = AidRequest::create([
            'beneficiary_id' => $beneficiary->id,
            'category' => 'clothing',
            'quantity_needed' => 1,
            'urgency' => 'medium',
            'justification' => 'Cold weather',
            'status' => 'approved',
        ]);

        $match = DonationMatch::create([
            'donation_id' => $donation->id,
            'request_id' => $request->id,
            'matched_quantity' => 1,
            'status' => 'proposed',
        ]);

        Sanctum::actingAs($admin);

        $response = $this->deleteJson("/api/admin/requests/{$request->id}");
        $response->assertNoContent();

        $this->assertDatabaseMissing('requests', ['id' => $request->id]);
        $this->assertDatabaseMissing('matches', ['id' => $match->id]);
        $this->assertDatabaseHas('donations', ['id' => $donation->id]);
    }

    public function test_admin_can_delete_user(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $donor = User::factory()->create(['role' => 'donor']);

        Sanctum::actingAs($admin);

        $response = $this->deleteJson("/api/admin/users/{$donor->id}");
        $response->assertNoContent();

        $this->assertDatabaseMissing('users', ['id' => $donor->id]);
    }

    public function test_donor_cannot_delete_via_admin_endpoint(): void
    {
        $donor = User::factory()->create(['role' => 'donor']);
        $donation = Donation::create([
            'donor_id' => $donor->id,
            'item_name' => 'Shoes',
            'category' => 'clothing',
            'quantity' => 1,
            'status' => 'pending_match',
        ]);

        Sanctum::actingAs($donor);

        $response = $this->deleteJson("/api/admin/donations/{$donation->id}");
        $response->assertForbidden();
    }
}
