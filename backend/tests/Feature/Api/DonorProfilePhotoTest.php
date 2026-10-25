<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DonorProfilePhotoTest extends TestCase
{
    use RefreshDatabase;

    public function test_donor_profile_photo_upload_replacement_and_removal_persist_for_authenticated_user(): void
    {
        Storage::fake('public');
        $donor = User::factory()->create([
            'role' => 'donor',
            'account_type' => 'donor',
            'country' => 'Philippines',
            'country_code' => 'PH',
        ]);
        Sanctum::actingAs($donor);

        $profileFields = [
            'name' => $donor->name,
            'email' => $donor->email,
            'country' => 'Philippines',
            'country_code' => 'PH',
        ];

        $this->post('/api/profile', $profileFields + [
            'profile_photo' => UploadedFile::fake()->create('donor-first.png', 10, 'image/png'),
        ], ['Accept' => 'application/json'])->assertOk();

        $donor->refresh();
        $firstPath = $donor->profile_photo_path;
        $this->assertNotEmpty($firstPath);
        Storage::disk('public')->assertExists($firstPath);
        $this->getJson('/api/user')
            ->assertOk()
            ->assertJsonPath(
                'data.profile_photo_url',
                route('profile-photos.show', ['filename' => basename($firstPath)])
            );

        $this->post('/api/profile', $profileFields + [
            'profile_photo' => UploadedFile::fake()->create('donor-replacement.png', 10, 'image/png'),
        ], ['Accept' => 'application/json'])->assertOk();

        $donor->refresh();
        $replacementPath = $donor->profile_photo_path;
        $this->assertNotEmpty($replacementPath);
        $this->assertNotSame($firstPath, $replacementPath);
        Storage::disk('public')->assertMissing($firstPath);
        Storage::disk('public')->assertExists($replacementPath);

        $this->postJson('/api/profile', $profileFields + ['remove_photo' => true])
            ->assertOk()
            ->assertJsonPath('data.profile_photo_path', null)
            ->assertJsonPath('data.profile_photo_url', null);

        $this->assertDatabaseHas('users', [
            'id' => $donor->id,
            'profile_photo_path' => null,
        ]);
        Storage::disk('public')->assertMissing($replacementPath);
    }
}
