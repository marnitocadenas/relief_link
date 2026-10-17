<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminAddMemberComprehensiveTest extends TestCase
{
    use RefreshDatabase;

    public function test_deactivated_users_cannot_log_in_and_reactivation_restores_access(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $member = User::factory()->create([
            'role' => 'staff',
            'is_active' => true,
            'email' => 'status.member@example.test',
            'password' => Hash::make('Member#Pass2026'),
        ]);
        $existingToken = $member->createToken('existing-session');
        Sanctum::actingAs($admin);

        $this->patchJson("/api/admin/users/{$member->id}/status", ['is_active' => false])
            ->assertOk()
            ->assertJsonPath('data.is_active', false);

        $this->assertDatabaseHas('users', ['id' => $member->id, 'is_active' => false]);
        $this->assertDatabaseMissing('personal_access_tokens', ['id' => $existingToken->accessToken->id]);

        $this->postJson('/api/login', [
            'email' => $member->email,
            'password' => 'Member#Pass2026',
        ])->assertForbidden()
            ->assertJsonPath('message', 'Your account has been deactivated. Please contact the administrator for assistance.');

        $this->patchJson("/api/admin/users/{$member->id}/status", ['is_active' => true])
            ->assertOk()
            ->assertJsonPath('data.is_active', true);

        $this->assertDatabaseHas('users', ['id' => $member->id, 'is_active' => true]);
        $this->postJson('/api/login', [
            'email' => $member->email,
            'password' => 'Member#Pass2026',
        ])->assertOk()->assertJsonStructure(['user', 'token']);
    }

    /**
     * Requirement 10: Backend Authorization - Only Administrators can create accounts via Admin Panel.
     * Guests, Donors, Beneficiaries, and Staff must be forbidden.
     */
    public function test_only_administrators_can_access_add_new_member_endpoint(): void
    {
        $payload = [
            'role' => 'staff',
            'first_name' => 'Unauthorized',
            'last_name' => 'Staff',
            'campus_id' => 'STF-UNAUTH-001',
            'email' => 'unauth.staff@tmc.edu.ph',
            'department' => 'Operations',
            'contact_number' => '+639170001111',
            'password' => 'Secure!Pass2026',
            'password_confirmation' => 'Secure!Pass2026',
        ];

        // 1. Guest
        $this->postJson('/api/admin/users', $payload)->assertUnauthorized();

        // 2. Staff user
        $staff = User::factory()->create(['role' => 'staff']);
        Sanctum::actingAs($staff);
        $this->postJson('/api/admin/users', $payload)->assertForbidden();

        // 3. Beneficiary user
        $beneficiary = User::factory()->create(['role' => 'beneficiary']);
        Sanctum::actingAs($beneficiary);
        $this->postJson('/api/admin/users', $payload)->assertForbidden();

        // 4. Donor user
        $donor = User::factory()->create(['role' => 'donor']);
        Sanctum::actingAs($donor);
        $this->postJson('/api/admin/users', $payload)->assertForbidden();
    }

    /**
     * Requirement 2 & 3: Account Type is mandatory and returns exact error message when unselected.
     */
    public function test_unselected_account_type_returns_exact_error_message(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/admin/users', [
            'first_name' => 'No',
            'last_name' => 'Role',
            'email' => 'norole@tmc.edu.ph',
            'contact_number' => '+639171234567',
            'password' => 'Secure!Pass2026',
            'password_confirmation' => 'Secure!Pass2026',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors('role')
            ->assertJsonFragment(['role' => ['Please select an account type.']]);
    }

    public function test_add_user_rejects_duplicate_email_without_changing_existing_credentials(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $existingPassword = 'Existing#Pass2026';
        $existing = User::factory()->create([
            'role' => 'staff',
            'email' => 'already.registered@example.test',
            'password' => Hash::make($existingPassword),
        ]);
        $originalHash = $existing->password;
        Sanctum::actingAs($admin);

        $this->postJson('/api/admin/users', [
            'role' => 'staff',
            'first_name' => 'New',
            'last_name' => 'Account',
            'campus_id' => 'STF-DUPLICATE-001',
            'email' => $existing->email,
            'department' => 'Operations',
            'contact_number' => '+639171112233',
            'password' => 'NewAccount#2026',
            'password_confirmation' => 'NewAccount#2026',
        ])->assertUnprocessable()->assertJsonValidationErrors('email');

        $this->assertSame(1, User::where('email', $existing->email)->count());
        $this->assertSame($originalHash, $existing->fresh()->password);
        $this->assertTrue(Hash::check($existingPassword, $existing->fresh()->password));
    }

    public function test_add_user_rejects_mismatched_password_confirmation_without_creating_account(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin);

        $this->postJson('/api/admin/users', [
            'role' => 'staff',
            'first_name' => 'Mismatch',
            'last_name' => 'Password',
            'campus_id' => 'STF-MISMATCH-001',
            'email' => 'mismatch.password@example.test',
            'department' => 'Operations',
            'contact_number' => '+639171112244',
            'password' => 'NewAccount#2026',
            'password_confirmation' => 'Different#2026',
        ])->assertUnprocessable()->assertJsonValidationErrors('password');

        $this->assertDatabaseMissing('users', ['email' => 'mismatch.password@example.test']);
    }

    /**
     * QA Test A: Administrator Account Creation (Rank #1 - #10).
     */
    public function test_qa_test_a_administrator_account_creation(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin);

        $password = 'Admin#Master2026';
        $payload = [
            'role' => 'admin',
            'account_type' => 'Administrator',
            'first_name' => 'Eleanor',
            'middle_name' => 'Vance',
            'last_name' => 'Castillo',
            'campus_id' => 'ADM-2026-001',
            'email' => 'eleanor.castillo@tmc.edu.ph',
            'department' => 'Office of the Campus Chancellor',
            'contact_number' => '+639171112233',
            'password' => $password,
            'password_confirmation' => $password,
        ];

        $response = $this->postJson('/api/admin/users', $payload);

        $response->assertCreated()
            ->assertJsonPath('data.first_name', 'Eleanor')
            ->assertJsonPath('data.middle_name', 'Vance')
            ->assertJsonPath('data.last_name', 'Castillo')
            ->assertJsonPath('data.name', 'Eleanor Vance Castillo')
            ->assertJsonPath('data.role', 'admin')
            ->assertJsonPath('data.account_type', 'admin')
            ->assertJsonPath('data.campus_id', 'ADM-2026-001')
            ->assertJsonPath('data.email', 'eleanor.castillo@tmc.edu.ph')
            ->assertJsonPath('data.department', 'Office of the Campus Chancellor')
            ->assertJsonPath('data.contact_number', '+639171112233');

        $this->assertDatabaseHas('users', [
            'email' => 'eleanor.castillo@tmc.edu.ph',
            'role' => 'admin',
            'campus_id' => 'ADM-2026-001',
            'department' => 'Office of the Campus Chancellor',
            'student_id_number' => null,
            'address_line_1' => null,
            'valid_id_type' => null,
        ]);

        $created = User::where('email', 'eleanor.castillo@tmc.edu.ph')->firstOrFail();
        $this->assertTrue(Hash::check($password, $created->password));
    }

    /**
     * QA Test B: Staff Account Creation (Rank #1 - #10).
     */
    public function test_qa_test_b_staff_account_creation(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin);

        $password = 'Staff#Logistics2026';
        $payload = [
            'role' => 'staff',
            'account_type' => 'Staff',
            'first_name' => 'Carlos',
            'middle_name' => 'Ramos',
            'last_name' => 'Dela Vega',
            'campus_id' => 'STF-2026-002',
            'email' => 'carlos.delavega@tmc.edu.ph',
            'department' => 'Disaster Relief & Campus Operations',
            'contact_number' => '+639172223344',
            'password' => $password,
            'password_confirmation' => $password,
        ];

        $response = $this->postJson('/api/admin/users', $payload);

        $response->assertCreated()
            ->assertJsonPath('data.first_name', 'Carlos')
            ->assertJsonPath('data.middle_name', 'Ramos')
            ->assertJsonPath('data.last_name', 'Dela Vega')
            ->assertJsonPath('data.name', 'Carlos Ramos Dela Vega')
            ->assertJsonPath('data.role', 'staff')
            ->assertJsonPath('data.campus_id', 'STF-2026-002')
            ->assertJsonPath('data.email', 'carlos.delavega@tmc.edu.ph')
            ->assertJsonPath('data.department', 'Disaster Relief & Campus Operations')
            ->assertJsonPath('data.contact_number', '+639172223344');

        $this->assertDatabaseHas('users', [
            'email' => 'carlos.delavega@tmc.edu.ph',
            'role' => 'staff',
            'campus_id' => 'STF-2026-002',
            'department' => 'Disaster Relief & Campus Operations',
            'student_id_number' => null,
            'address_line_1' => null,
        ]);
    }

    /**
     * QA Test C: Beneficiary Account Creation (Rank #1 - #12).
     */
    public function test_qa_test_c_beneficiary_account_creation(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin);

        $password = 'Student#Help2026';
        $payload = [
            'role' => 'beneficiary',
            'account_type' => 'Beneficiary',
            'beneficiary_type' => 'student',
            'first_name' => 'Beatriz',
            'middle_name' => '', // Optional middle name omitted
            'last_name' => 'Mendoza',
            'student_id_number' => '26-005544',
            'email' => 'beatriz.mendoza@tmc.edu.ph',
            'department' => 'College of Arts and Sciences',
            'course' => 'Bachelor of Arts in Political Science',
            'year_level' => '3rd Year',
            'contact_number' => '09173334455',
            'password' => $password,
            'password_confirmation' => $password,
        ];

        $response = $this->postJson('/api/admin/users', $payload);

        $response->assertCreated()
            ->assertJsonPath('data.first_name', 'Beatriz')
            ->assertJsonPath('data.middle_name', null)
            ->assertJsonPath('data.last_name', 'Mendoza')
            ->assertJsonPath('data.name', 'Beatriz Mendoza')
            ->assertJsonPath('data.role', 'beneficiary')
            ->assertJsonPath('data.student_id_number', '26-005544')
            ->assertJsonPath('data.email', 'beatriz.mendoza@tmc.edu.ph')
            ->assertJsonPath('data.school_email', 'beatriz.mendoza@tmc.edu.ph')
            ->assertJsonPath('data.department', 'College of Arts and Sciences')
            ->assertJsonPath('data.course', 'Bachelor of Arts in Political Science')
            ->assertJsonPath('data.year_level', '3rd Year')
            ->assertJsonPath('data.contact_number', '09173334455');

        $this->assertDatabaseHas('users', [
            'email' => 'beatriz.mendoza@tmc.edu.ph',
            'role' => 'beneficiary',
            'student_id_number' => '26-005544',
            'department' => 'College of Arts and Sciences',
            'course' => 'Bachelor of Arts in Political Science',
            'year_level' => '3rd Year',
            'campus_id' => null,
            'address_line_1' => null,
        ]);
    }

    public function test_updating_a_faculty_beneficiary_preserves_campus_id_and_clears_student_fields(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $faculty = User::factory()->create([
            'role' => 'beneficiary',
            'account_type' => 'beneficiary',
            'beneficiary_type' => 'faculty',
            'campus_id' => 'FAC-2026-041',
            'student_id_number' => null,
            'course' => null,
            'year_level' => null,
            'department' => 'College of Arts and Sciences',
        ]);
        Sanctum::actingAs($admin);

        $this->patchJson("/api/admin/users/{$faculty->id}", [
            'role' => 'beneficiary',
            'account_type' => 'beneficiary',
            'beneficiary_type' => 'faculty',
            'campus_id' => 'FAC-2026-041',
            'department' => 'College of Arts and Sciences',
        ])->assertOk()
            ->assertJsonPath('data.beneficiary_type', 'faculty')
            ->assertJsonPath('data.campus_id', 'FAC-2026-041')
            ->assertJsonPath('data.student_id_number', null)
            ->assertJsonPath('data.course', null)
            ->assertJsonPath('data.year_level', null);

        $this->assertDatabaseHas('users', [
            'id' => $faculty->id,
            'campus_id' => 'FAC-2026-041',
            'student_id_number' => null,
            'course' => null,
            'year_level' => null,
        ]);
    }

    public function test_staff_profile_update_keeps_campus_id_separate_from_donor_valid_id(): void
    {
        $staff = User::factory()->create([
            'role' => 'staff',
            'account_type' => 'staff',
            'campus_id' => 'STF-2026-088',
            'valid_id_number' => null,
            'department' => 'Campus Operations',
        ]);
        Sanctum::actingAs($staff);

        $this->postJson('/api/profile', [
            'name' => $staff->name,
            'email' => $staff->email,
            'contact_number' => '+639176543210',
            'campus_id' => 'STF-2026-088',
            'department' => 'Campus Operations',
        ])->assertOk()
            ->assertJsonPath('data.campus_id', 'STF-2026-088')
            ->assertJsonPath('data.valid_id_number', null)
            ->assertJsonPath('data.contact_number', '+639176543210')
            ->assertJsonPath('data.department', 'Campus Operations');

        $this->assertDatabaseHas('users', [
            'id' => $staff->id,
            'campus_id' => 'STF-2026-088',
            'valid_id_number' => null,
            'contact_number' => '+639176543210',
            'department' => 'Campus Operations',
        ]);
    }

    /**
     * QA Test D: Donor Account Creation (Rank #1 - #16).
     */
    public function test_qa_test_d_donor_account_creation(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin);

        $password = 'Donor#Generous2026';
        $payload = [
            'role' => 'donor',
            'account_type' => 'Donor',
            'first_name' => 'Federico',
            'middle_name' => 'Luis',
            'last_name' => 'Tan',
            'email' => 'federico.tan@philanthropy.org',
            'contact_number' => '+639174445566',
            'country' => 'Philippines',
            'country_code' => 'PH',
            'address_line_1' => 'Tower 1, Unit 801, Ayala Triangle Gardens',
            'state_province_region' => 'National Capital Region',
            'city_municipality' => 'Makati City',
            'district_local_area' => 'Bel-Air',
            'postal_zip_code' => '1209',
            'valid_id_type' => 'Philippine Passport',
            'valid_id_number' => 'P33221100B',
            'password' => $password,
            'password_confirmation' => $password,
        ];

        $response = $this->postJson('/api/admin/users', $payload);

        $response->assertCreated()
            ->assertJsonPath('data.first_name', 'Federico')
            ->assertJsonPath('data.middle_name', 'Luis')
            ->assertJsonPath('data.last_name', 'Tan')
            ->assertJsonPath('data.name', 'Federico Luis Tan')
            ->assertJsonPath('data.role', 'donor')
            ->assertJsonPath('data.email', 'federico.tan@philanthropy.org')
            ->assertJsonPath('data.contact_number', '+639174445566')
            ->assertJsonPath('data.country', 'Philippines')
            ->assertJsonPath('data.country_code', 'PH')
            ->assertJsonPath('data.address_line_1', 'Tower 1, Unit 801, Ayala Triangle Gardens')
            ->assertJsonPath('data.state_province_region', 'National Capital Region')
            ->assertJsonPath('data.city_municipality', 'Makati City')
            ->assertJsonPath('data.district_local_area', 'Bel-Air')
            ->assertJsonPath('data.postal_zip_code', '1209')
            ->assertJsonPath('data.valid_id_type', 'Philippine Passport')
            ->assertJsonPath('data.valid_id_number', 'P33221100B');

        $this->assertDatabaseHas('users', [
            'email' => 'federico.tan@philanthropy.org',
            'role' => 'donor',
            'address_line_1' => 'Tower 1, Unit 801, Ayala Triangle Gardens',
            'valid_id_type' => 'Philippine Passport',
            'valid_id_number' => 'P33221100B',
            'student_id_number' => null,
            'department' => null,
        ]);
    }

    /**
     * Requirement 8 & 9: Role Switching and Field Isolation in Database.
     */
    public function test_role_switching_sanitizes_obsolete_fields_on_creation(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin);

        // Admin payload containing stray donor / student fields
        $this->postJson('/api/admin/users', [
            'role' => 'admin',
            'first_name' => 'Sanitized',
            'last_name' => 'Admin',
            'campus_id' => 'ADM-CLEAN-01',
            'email' => 'clean.admin@tmc.edu.ph',
            'department' => 'Administration',
            'contact_number' => '+639175556677',
            'address_line_1' => 'SHOULD_BE_REMOVED',
            'valid_id_number' => 'SHOULD_BE_REMOVED',
            'student_id_number' => 'SHOULD_BE_REMOVED',
            'course' => 'SHOULD_BE_REMOVED',
            'password' => 'Secure!Pass2026',
            'password_confirmation' => 'Secure!Pass2026',
        ])->assertCreated();

        $this->assertDatabaseHas('users', [
            'email' => 'clean.admin@tmc.edu.ph',
            'role' => 'admin',
            'campus_id' => 'ADM-CLEAN-01',
            'department' => 'Administration',
            'address_line_1' => null,
            'valid_id_number' => null,
            'student_id_number' => null,
            'course' => null,
        ]);
    }

    /**
     * Requirement 12: User Management Table and Profile Single Source of Truth.
     */
    public function test_user_management_listing_and_profile_integration(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin);

        // 1. Create a new Staff Member
        $createRes = $this->postJson('/api/admin/users', [
            'role' => 'staff',
            'first_name' => 'Marissa',
            'last_name' => 'Santos',
            'campus_id' => 'STF-MGT-099',
            'email' => 'marissa.santos@tmc.edu.ph',
            'department' => 'Logistics Department',
            'contact_number' => '+639176667788',
            'password' => 'Staff#Pass2026',
            'password_confirmation' => 'Staff#Pass2026',
        ]);
        $createRes->assertCreated();
        $createdUserId = $createRes->json('data.id');

        // 2. Admin retrieves User Management list
        $listRes = $this->getJson('/api/admin/users');
        $listRes->assertOk();
        $staffInList = collect($listRes->json('data'))->firstWhere('id', $createdUserId);
        $this->assertNotNull($staffInList);
        $this->assertSame('Marissa Santos', $staffInList['name']);
        $this->assertSame('marissa.santos@tmc.edu.ph', $staffInList['email']);
        $this->assertSame('staff', $staffInList['role']);
        $this->assertSame('STF-MGT-099', $staffInList['campus_id']);
        $this->assertSame('Logistics Department', $staffInList['department']);

        // 3. Authenticate as the new Staff user and inspect Profile (/api/user)
        $staffUser = User::find($createdUserId);
        Sanctum::actingAs($staffUser);
        $profileRes = $this->getJson('/api/user');
        $profileRes->assertOk()
            ->assertJsonPath('data.name', 'Marissa Santos')
            ->assertJsonPath('data.email', 'marissa.santos@tmc.edu.ph')
            ->assertJsonPath('data.role', 'staff')
            ->assertJsonPath('data.campus_id', 'STF-MGT-099')
            ->assertJsonPath('data.department', 'Logistics Department')
            ->assertJsonPath('data.contact_number', '+639176667788');

        // 4. Admin updates the Staff member's information
        Sanctum::actingAs($admin);
        $updateRes = $this->patchJson("/api/admin/users/{$createdUserId}", [
            'first_name' => 'Marissa',
            'middle_name' => 'G.',
            'last_name' => 'Santos-Cruz',
            'department' => 'Senior Relief Operations',
            'contact_number' => '+639179990000',
        ]);
        $updateRes->assertOk()
            ->assertJsonPath('data.name', 'Marissa G. Santos-Cruz')
            ->assertJsonPath('data.department', 'Senior Relief Operations')
            ->assertJsonPath('data.contact_number', '+639179990000');

        // The updated record is also returned by the User Management list.
        $updatedListRes = $this->getJson('/api/admin/users');
        $updatedListRes->assertOk();
        $updatedStaffInList = collect($updatedListRes->json('data'))->firstWhere('id', $createdUserId);
        $this->assertNotNull($updatedStaffInList);
        $this->assertSame('Marissa G. Santos-Cruz', $updatedStaffInList['name']);
        $this->assertSame('Senior Relief Operations', $updatedStaffInList['department']);
        $this->assertSame('+639179990000', $updatedStaffInList['contact_number']);

        // 5. Staff re-verifies updated Profile (Single Source of Truth)
        Sanctum::actingAs($staffUser->fresh());
        $this->getJson('/api/user')
            ->assertOk()
            ->assertJsonPath('data.name', 'Marissa G. Santos-Cruz')
            ->assertJsonPath('data.department', 'Senior Relief Operations')
            ->assertJsonPath('data.contact_number', '+639179990000');
    }

    /**
     * Admin Beneficiary Student ID format validation (YY-###### required).
     */
    public function test_admin_beneficiary_student_id_format_validation(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/admin/users', [
            'role' => 'beneficiary',
            'beneficiary_type' => 'student',
            'first_name' => 'Invalid',
            'last_name' => 'StudentId',
            'student_id_number' => '21-0956A',
            'email' => 'invalid.stu@tmc.edu.ph',
            'department' => 'College of Computer Studies',
            'course' => 'Bachelor of Science in Information Technology',
            'year_level' => '1st Year',
            'contact_number' => '09281234567',
            'password' => 'Secure!Pass2026',
            'password_confirmation' => 'Secure!Pass2026',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors('student_id_number')
            ->assertJsonFragment(['student_id_number' => ['Please enter a valid Student ID Number in the format YY-###### (e.g., 21-010956).']]);
    }

    /**
     * Admin Beneficiary Department-Course matching validation.
     */
    public function test_admin_beneficiary_department_course_mismatch_validation(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/admin/users', [
            'role' => 'beneficiary',
            'beneficiary_type' => 'student',
            'first_name' => 'Mismatch',
            'last_name' => 'Course',
            'student_id_number' => '21-010961',
            'email' => 'mismatch.admin@tmc.edu.ph',
            'department' => 'College of Computer Studies',
            'course' => 'Bachelor of Science in Criminology', // Belongs to CCJE
            'year_level' => '1st Year',
            'contact_number' => '09281234568',
            'password' => 'Secure!Pass2026',
            'password_confirmation' => 'Secure!Pass2026',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors('course')
            ->assertJsonFragment(['course' => ['The selected course does not belong to the selected department. Please choose a valid course.']]);
    }
}
