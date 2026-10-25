<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LandingTest extends TestCase
{
    use RefreshDatabase;
    public function test_landing_stats_returns_successful_data(): void
    {
        $response = $this->getJson('/api/landing/stats');
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'stats' => [
                    'total_donations',
                    'resources_shared',
                    'successful_matches',
                    'completed_handoffs',
                    'active_needs',
                ],
            ]);
    }

    public function test_landing_categories_returns_list_with_metrics(): void
    {
        $response = $this->getJson('/api/landing/categories');
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'categories' => [
                    '*' => ['name', 'icon', 'description', 'count'],
                ],
            ]);
    }

    public function test_landing_needs_returns_sanitized_public_requests(): void
    {
        $response = $this->getJson('/api/landing/needs');
        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'category',
                        'quantity_needed',
                        'urgency',
                        'status',
                    ],
                ],
                'links',
                'meta',
            ]);

        // Ensure sensitive internal beneficiary fields are NOT present
        $data = $response->json('data');
        if (!empty($data)) {
            $first = $data[0];
            $this->assertArrayNotHasKey('beneficiary_name', $first);
            $this->assertArrayNotHasKey('beneficiary_email', $first);
            $this->assertArrayNotHasKey('supporting_document_url', $first);
            $this->assertArrayNotHasKey('student_id_number', $first);
        }
    }
}
