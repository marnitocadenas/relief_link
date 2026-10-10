<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CreateAccountComprehensiveTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Requirement 1 & 2: Account types allowed on user side are ONLY Beneficiary and Donor.
     * Attempting to register as Admin or Staff via public register must fail.
     */
    public function test_public_registration_blocks_admin_and_staff_roles(): void
    {
        $password = 'Secure!Pass2026';

        // Admin attempt
        $resAdmin = $this->postJson('/api/register', [
            'role' => 'admin',
            'first_name' => 'Admin',
            'last_name' => 'Attempt',
            'email' => 'admin.hack@example.com',
            'contact_number' => '+639171112222',
            'password' => $password,
            'password_confirmation' => $password,
        ]);
        $resAdmin->assertUnprocessable()->assertJsonValidationErrors('role');

        // Staff attempt
        $resStaff = $this->postJson('/api/register', [
            'role' => 'staff',
            'first_name' => 'Staff',
            'last_name' => 'Attempt',
            'email' => 'staff.hack@example.com',
            'contact_number' => '+639171112223',
            'password' => $password,
            'password_confirmation' => $password,
        ]);
        $resStaff->assertUnprocessable()->assertJsonValidationErrors('role');
    }

    /**
     * Requirement 2: Account Type is required and produces exact error message when unselected.
     */
    public function test_unselected_account_type_returns_exact_error_message(): void
    {
        $password = 'Secure!Pass2026';

        $response = $this->postJson('/api/register', [
            'first_name' => 'Jane',
            'last_name' => 'Doe',
            'email' => 'jane.doe@example.com',
            'contact_number' => '+639171234567',
            'password' => $password,
            'password_confirmation' => $password,
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors('role')
            ->assertJsonFragment(['role' => ['Please select an account type.']]);
    }

    /**
     * Requirement 3: Beneficiary Form Registration with all 12 ranked fields.
     */
    public function test_beneficiary_registration_with_all_ranked_fields(): void
    {
        $password = 'Beneficiary#Secure123';

        $payload = [
            'role' => 'beneficiary',
            'account_type' => 'beneficiary',
            'first_name' => 'Maria',
            'middle_name' => 'Clara',
            'last_name' => 'Santos',
            'student_id_number' => '21-010956',
            'school_email' => 'maria.santos@tmc.edu.ph',
            'department' => 'College of Arts and Sciences',
            'course' => 'Bachelor of Arts in Communication',
            'year_level' => '2nd Year',
            'contact_number' => '09181234567',
            'country' => 'Philippines',
            'country_code' => 'PH',
            'password' => $password,
            'password_confirmation' => $password,
        ];

        $response = $this->postJson('/api/register', $payload);

        $response->assertCreated()
            ->assertJsonStructure(['user', 'token'])
            ->assertJsonPath('user.first_name', 'Maria')
            ->assertJsonPath('user.middle_name', 'Clara')
            ->assertJsonPath('user.last_name', 'Santos')
            ->assertJsonPath('user.name', 'Maria Clara Santos')
            ->assertJsonPath('user.role', 'beneficiary')
            ->assertJsonPath('user.account_type', 'beneficiary')
            ->assertJsonPath('user.student_id_number', '21-010956')
            ->assertJsonPath('user.email', 'maria.santos@tmc.edu.ph')
            ->assertJsonPath('user.school_email', 'maria.santos@tmc.edu.ph')
            ->assertJsonPath('user.department', 'College of Arts and Sciences')
            ->assertJsonPath('user.course', 'Bachelor of Arts in Communication')
            ->assertJsonPath('user.year_level', '2nd Year')
            ->assertJsonPath('user.contact_number', '09181234567');

        $this->assertDatabaseHas('users', [
            'email' => 'maria.santos@tmc.edu.ph',
            'role' => 'beneficiary',
            'student_id_number' => '21-010956',
            'department' => 'College of Arts and Sciences',
            'course' => 'Bachelor of Arts in Communication',
            'year_level' => '2nd Year',
            'address_line_1' => null,
            'valid_id_type' => null,
        ]);

        $user = User::where('email', 'maria.santos@tmc.edu.ph')->firstOrFail();
        $this->assertTrue(Hash::check($password, $user->password));
    }

    /**
     * Requirement 3 (Optional Middle Name): Beneficiary registration without middle name.
     */
    public function test_beneficiary_registration_without_optional_middle_name(): void
    {
        $password = 'Beneficiary#Secure123';

        $payload = [
            'role' => 'beneficiary',
            'first_name' => 'Alex',
            'last_name' => 'Reyes',
            'student_id_number' => '21-010957',
            'school_email' => 'alex.reyes@tmc.edu.ph',
            'department' => 'College of Office Administration',
            'course' => 'Bachelor of Science in Office Administration',
            'year_level' => '4th Year',
            'contact_number' => '09191234567',
            'country' => 'Philippines',
            'password' => $password,
            'password_confirmation' => $password,
        ];

        $response = $this->postJson('/api/register', $payload);

        $response->assertCreated()
            ->assertJsonPath('user.first_name', 'Alex')
            ->assertJsonPath('user.middle_name', null)
            ->assertJsonPath('user.last_name', 'Reyes')
            ->assertJsonPath('user.name', 'Alex Reyes');
    }

    public function test_faculty_and_staff_can_register_as_campus_beneficiaries(): void
    {
        foreach ([
            ['type' => 'faculty', 'id' => 'FAC-1001', 'email' => 'faculty1001@tmc.edu.ph', 'phone' => '09181234001'],
            ['type' => 'staff', 'id' => 'STF-1002', 'email' => 'staff1002@tmc.edu.ph', 'phone' => '09181234002'],
        ] as $member) {
            $response = $this->postJson('/api/register', [
                'role' => 'beneficiary',
                'account_type' => 'beneficiary',
                'beneficiary_type' => $member['type'],
                'first_name' => ucfirst($member['type']),
                'last_name' => 'Member',
                'campus_id' => $member['id'],
                'school_email' => $member['email'],
                'email' => $member['email'],
                'department' => 'Campus Administration',
                'contact_number' => $member['phone'],
                'password' => 'Secure#Pass2026',
                'password_confirmation' => 'Secure#Pass2026',
            ]);

            $response->assertCreated()
                ->assertJsonPath('user.beneficiary_type', $member['type'])
                ->assertJsonPath('user.campus_id', $member['id'])
                ->assertJsonPath('user.student_id_number', null)
                ->assertJsonPath('user.course', null)
                ->assertJsonPath('user.year_level', null);
        }
    }

    /**
     * Requirement 4: Donor Form Registration with all 16 ranked fields.
     */
    public function test_donor_registration_with_all_ranked_fields(): void
    {
        $password = 'Donor#Secure999';

        $payload = [
            'role' => 'donor',
            'account_type' => 'donor',
            'first_name' => 'Roberto',
            'middle_name' => 'Gonzales',
            'last_name' => 'Lim',
            'email' => 'roberto.lim@alumni.org',
            'contact_number' => '+639201234567',
            'country' => 'Philippines',
            'country_code' => 'PH',
            'address_line_1' => 'Unit 502, Azure Tower, 45 Ayala Ave',
            'state_province_region' => 'National Capital Region',
            'city_municipality' => 'Makati City',
            'district_local_area' => 'San Lorenzo',
            'postal_zip_code' => '1223',
            'valid_id_type' => 'Philippine Passport',
            'valid_id_number' => 'P987654321A',
            'password' => $password,
            'password_confirmation' => $password,
        ];

        $response = $this->postJson('/api/register', $payload);

        $response->assertCreated()
            ->assertJsonStructure(['user', 'token'])
            ->assertJsonPath('user.first_name', 'Roberto')
            ->assertJsonPath('user.middle_name', 'Gonzales')
            ->assertJsonPath('user.last_name', 'Lim')
            ->assertJsonPath('user.name', 'Roberto Gonzales Lim')
            ->assertJsonPath('user.email', 'roberto.lim@alumni.org')
            ->assertJsonPath('user.role', 'donor')
            ->assertJsonPath('user.account_type', 'donor')
            ->assertJsonPath('user.contact_number', '+639201234567')
            ->assertJsonPath('user.country', 'Philippines')
            ->assertJsonPath('user.country_code', 'PH')
            ->assertJsonPath('user.address_line_1', 'Unit 502, Azure Tower, 45 Ayala Ave')
            ->assertJsonPath('user.state_province_region', 'National Capital Region')
            ->assertJsonPath('user.city_municipality', 'Makati City')
            ->assertJsonPath('user.district_local_area', 'San Lorenzo')
            ->assertJsonPath('user.postal_zip_code', '1223')
            ->assertJsonPath('user.valid_id_type', 'Philippine Passport')
            ->assertJsonPath('user.valid_id_number', 'P987654321A');

        $this->assertDatabaseHas('users', [
            'email' => 'roberto.lim@alumni.org',
            'role' => 'donor',
            'address_line_1' => 'Unit 502, Azure Tower, 45 Ayala Ave',
            'valid_id_type' => 'Philippine Passport',
            'valid_id_number' => 'P987654321A',
            'student_id_number' => null,
            'department' => null,
        ]);
    }

    /**
     * Requirement: Donor Registration succeeds without optional Middle Name (e.g. Juan Dela Cruz).
     */
    public function test_donor_registration_without_optional_middle_name_succeeds(): void
    {
        $password = 'Donor#Secure999';

        $payload = [
            'role' => 'donor',
            'account_type' => 'donor',
            'first_name' => 'Juan',
            'middle_name' => '', // optional empty middle name
            'last_name' => 'Dela Cruz',
            'email' => 'juan.delacruz@donor.org',
            'contact_number' => '+639201112233',
            'country' => 'Philippines',
            'country_code' => 'PH',
            'address_line_1' => 'Block 1 Lot 2 Sunset Village',
            'valid_id_type' => 'Driver\'s License',
            'valid_id_number' => 'DL-11223344',
            'password' => $password,
            'password_confirmation' => $password,
        ];

        $response = $this->postJson('/api/register', $payload);

        $response->assertCreated()
            ->assertJsonPath('user.first_name', 'Juan')
            ->assertJsonPath('user.middle_name', null)
            ->assertJsonPath('user.last_name', 'Dela Cruz')
            ->assertJsonPath('user.name', 'Juan Dela Cruz')
            ->assertJsonPath('user.role', 'donor')
            ->assertJsonPath('user.account_type', 'donor');

        $this->assertDatabaseHas('users', [
            'email' => 'juan.delacruz@donor.org',
            'first_name' => 'Juan',
            'middle_name' => null,
            'last_name' => 'Dela Cruz',
            'name' => 'Juan Dela Cruz',
            'role' => 'donor',
        ]);
    }

    /**
     * Requirement: Donor Registration fails when First Name is missing.
     */
    public function test_donor_registration_fails_when_first_name_missing(): void
    {
        $password = 'Donor#Secure999';

        $payload = [
            'role' => 'donor',
            'account_type' => 'donor',
            'first_name' => '', // missing
            'last_name' => 'Dela Cruz',
            'email' => 'missing.first@donor.org',
            'contact_number' => '+639201112234',
            'country' => 'Philippines',
            'address_line_1' => 'Block 1 Lot 2 Sunset Village',
            'valid_id_type' => 'Driver\'s License',
            'valid_id_number' => 'DL-11223345',
            'password' => $password,
            'password_confirmation' => $password,
        ];

        $response = $this->postJson('/api/register', $payload);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors('first_name');
    }

    /**
     * Requirement: Donor Registration fails when Last Name is missing.
     */
    public function test_donor_registration_fails_when_last_name_missing(): void
    {
        $password = 'Donor#Secure999';

        $payload = [
            'role' => 'donor',
            'account_type' => 'donor',
            'first_name' => 'Juan',
            'last_name' => '', // missing
            'email' => 'missing.last@donor.org',
            'contact_number' => '+639201112235',
            'country' => 'Philippines',
            'address_line_1' => 'Block 1 Lot 2 Sunset Village',
            'valid_id_type' => 'Driver\'s License',
            'valid_id_number' => 'DL-11223346',
            'password' => $password,
            'password_confirmation' => $password,
        ];

        $response = $this->postJson('/api/register', $payload);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors('last_name');
    }

    /**
     * Requirement: Donor Registration fails when Email Address is missing.
     */
    public function test_donor_registration_fails_when_email_missing(): void
    {
        $password = 'Donor#Secure999';

        $payload = [
            'role' => 'donor',
            'account_type' => 'donor',
            'first_name' => 'Juan',
            'last_name' => 'Dela Cruz',
            'email' => '', // missing
            'contact_number' => '+639201112235',
            'country' => 'Philippines',
            'address_line_1' => 'Block 1 Lot 2 Sunset Village',
            'valid_id_type' => 'Driver\'s License',
            'valid_id_number' => 'DL-11223346',
            'password' => $password,
            'password_confirmation' => $password,
        ];

        $response = $this->postJson('/api/register', $payload);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['email' => 'Email Address is required.']);
    }

    /**
     * Requirement: Donor Registration fails when Email Address format is invalid.
     */
    public function test_donor_registration_fails_when_email_format_is_invalid(): void
    {
        $password = 'Donor#Secure999';

        $invalidEmails = [
            'user',
            'user@',
            '@gmail.com',
            'user@gmail',
            'user..name@example.com',
        ];

        foreach ($invalidEmails as $invalidEmail) {
            $payload = [
                'role' => 'donor',
                'account_type' => 'donor',
                'first_name' => 'Juan',
                'last_name' => 'Dela Cruz',
                'email' => $invalidEmail,
                'contact_number' => '+639201112235',
                'country' => 'Philippines',
                'address_line_1' => 'Block 1 Lot 2 Sunset Village',
                'valid_id_type' => 'Driver\'s License',
                'valid_id_number' => 'DL-11223346',
                'password' => $password,
                'password_confirmation' => $password,
            ];

            $response = $this->postJson('/api/register', $payload);

            $response->assertUnprocessable()
                ->assertJsonValidationErrors(['email' => 'Please enter a valid email address.']);
        }
    }

    /**
     * Requirement: Donor Registration fails when Email Address is already taken.
     */
    public function test_donor_registration_fails_when_email_is_already_taken(): void
    {
        $existing = \App\Models\User::factory()->create([
            'email' => 'taken.donor@relief.org',
            'role' => 'donor',
        ]);

        $password = 'Donor#Secure999';

        $payload = [
            'role' => 'donor',
            'account_type' => 'donor',
            'first_name' => 'Juan',
            'last_name' => 'Dela Cruz',
            'email' => 'taken.donor@relief.org',
            'contact_number' => '+639201112235',
            'country' => 'Philippines',
            'address_line_1' => 'Block 1 Lot 2 Sunset Village',
            'valid_id_type' => 'Driver\'s License',
            'valid_id_number' => 'DL-11223346',
            'password' => $password,
            'password_confirmation' => $password,
        ];

        $response = $this->postJson('/api/register', $payload);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['email' => 'This email address is already taken. Please use a different email address.']);
    }

    /**
     * Requirement: Real-time availability check endpoint validates email correctly.
     */
    public function test_donor_email_availability_check_endpoint(): void
    {
        \App\Models\User::factory()->create([
            'email' => 'existing.donor@relief.org',
            'role' => 'donor',
        ]);

        // 1. Available email
        $res1 = $this->postJson('/api/register/check-availability', [
            'field' => 'email',
            'value' => 'fresh.donor@relief.org',
            'account_type' => 'donor',
        ]);
        $res1->assertOk()
            ->assertJson([
                'available' => true,
                'message' => 'Email address is available.',
            ]);

        // 2. Taken email
        $res2 = $this->postJson('/api/register/check-availability', [
            'field' => 'email',
            'value' => 'existing.donor@relief.org',
            'account_type' => 'donor',
        ]);
        $res2->assertOk()
            ->assertJson([
                'available' => false,
                'message' => 'This email address is already taken. Please use a different email address.',
            ]);

        // 3. Invalid format
        $res3 = $this->postJson('/api/register/check-availability', [
            'field' => 'email',
            'value' => 'not-an-email',
            'account_type' => 'donor',
        ]);
        $res3->assertOk()
            ->assertJson([
                'available' => false,
                'message' => 'Please enter a valid email address.',
            ]);
    }

    /**
     * Requirement 5: Data isolation & field hygiene between roles.
     */
    public function test_donor_payload_clears_beneficiary_fields_and_vice_versa(): void
    {
        $password = 'Secure!Pass123';

        // Send donor payload with stray student fields
        $this->postJson('/api/register', [
            'role' => 'donor',
            'first_name' => 'Hygiene',
            'last_name' => 'Donor',
            'email' => 'hygiene.donor@example.com',
            'contact_number' => '+639211234567',
            'country' => 'Philippines',
            'address_line_1' => '88 Ocean Drive',
            'valid_id_type' => 'National ID',
            'valid_id_number' => 'NID-990011',
            'student_id_number' => 'SHOULD-BE-IGNORED',
            'department' => 'SHOULD-BE-IGNORED',
            'course' => 'SHOULD-BE-IGNORED',
            'password' => $password,
            'password_confirmation' => $password,
        ])->assertCreated();

        $this->assertDatabaseHas('users', [
            'email' => 'hygiene.donor@example.com',
            'student_id_number' => null,
            'department' => null,
            'course' => null,
        ]);
    }

    /**
     * Requirement 6: Duplicate detection for Email, Student ID Number, and Valid ID Number.
     */
    public function test_duplicate_checks_for_student_id_and_valid_id(): void
    {
        $password = 'Secure!Pass123';

        // Create initial Beneficiary
        $this->postJson('/api/register', [
            'role' => 'beneficiary',
            'first_name' => 'First',
            'last_name' => 'Beneficiary',
            'student_id_number' => '21-010958',
            'school_email' => 'first.ben@tmc.edu.ph',
            'department' => 'College of Computer Studies',
            'course' => 'Bachelor of Science in Information Technology',
            'year_level' => '1st Year',
            'contact_number' => '09221234567',
            'password' => $password,
            'password_confirmation' => $password,
        ])->assertCreated();

        // Duplicate Student ID Number attempt
        $this->postJson('/api/register', [
            'role' => 'beneficiary',
            'first_name' => 'Second',
            'last_name' => 'Beneficiary',
            'student_id_number' => '21-010958',
            'school_email' => 'second.ben@tmc.edu.ph',
            'department' => 'College of Computer Studies',
            'course' => 'Bachelor of Science in Information Technology',
            'year_level' => '1st Year',
            'contact_number' => '09231234567',
            'password' => $password,
            'password_confirmation' => $password,
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('student_id_number');

        // Create initial Donor
        $this->postJson('/api/register', [
            'role' => 'donor',
            'first_name' => 'First',
            'last_name' => 'Donor',
            'email' => 'first.donor@example.com',
            'contact_number' => '+639241234567',
            'country' => 'Philippines',
            'address_line_1' => '123 Avenue',
            'valid_id_type' => 'Driver\'s License',
            'valid_id_number' => 'DL-99887766',
            'password' => $password,
            'password_confirmation' => $password,
        ])->assertCreated();

        // Duplicate Valid ID Number attempt
        $this->postJson('/api/register', [
            'role' => 'donor',
            'first_name' => 'Second',
            'last_name' => 'Donor',
            'email' => 'second.donor@example.com',
            'contact_number' => '+639251234567',
            'country' => 'Philippines',
            'address_line_1' => '456 Avenue',
            'valid_id_type' => 'Driver\'s License',
            'valid_id_number' => 'DL-99887766',
            'password' => $password,
            'password_confirmation' => $password,
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('valid_id_number');
    }

    /**
     * Requirement 7: Login immediately with newly registered account credentials.
     */
    public function test_user_can_login_immediately_after_registration(): void
    {
        $password = 'Alpha!Bravo999';

        $this->postJson('/api/register', [
            'role' => 'beneficiary',
            'first_name' => 'Arthur',
            'last_name' => 'Pendelton',
            'student_id_number' => '21-010959',
            'school_email' => 'arthur.p@tmc.edu.ph',
            'department' => 'College of Criminal Justice Education',
            'course' => 'Bachelor of Science in Criminology',
            'year_level' => '2nd Year',
            'contact_number' => '09261234567',
            'password' => $password,
            'password_confirmation' => $password,
        ])->assertCreated();

        // Login via /api/login
        $loginResponse = $this->postJson('/api/login', [
            'email' => 'arthur.p@tmc.edu.ph',
            'password' => $password,
        ]);

        $loginResponse->assertOk()
            ->assertJsonStructure(['user', 'token'])
            ->assertJsonPath('user.email', 'arthur.p@tmc.edu.ph')
            ->assertJsonPath('user.role', 'beneficiary');
    }

    /**
     * Beneficiary Student ID format validation (YY-###### required).
     */
    public function test_beneficiary_student_id_format_validation(): void
    {
        $password = 'Secure!Pass2026';

        // Invalid format: missing dash or wrong pattern (≤9 chars so only the format error fires)
        $response = $this->postJson('/api/register', [
            'role' => 'beneficiary',
            'first_name' => 'Invalid',
            'last_name' => 'IdFormat',
            'student_id_number' => '21-0956A',
            'school_email' => 'invalid.id@tmc.edu.ph',
            'department' => 'College of Computer Studies',
            'course' => 'Bachelor of Science in Information Technology',
            'year_level' => '1st Year',
            'contact_number' => '09281234567',
            'password' => $password,
            'password_confirmation' => $password,
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors('student_id_number')
            ->assertJsonFragment(['student_id_number' => ['Please enter a valid Student ID Number in the format YY-###### (e.g., 21-010956).']]);
    }

    /**
     * Beneficiary Department-Course matching validation.
     */
    public function test_beneficiary_department_course_mismatch_returns_exact_error(): void
    {
        $password = 'Secure!Pass2026';

        // Mismatched course for College of Computer Studies
        $response = $this->postJson('/api/register', [
            'role' => 'beneficiary',
            'first_name' => 'Mismatch',
            'last_name' => 'Course',
            'student_id_number' => '21-010960',
            'school_email' => 'mismatch.course@tmc.edu.ph',
            'department' => 'College of Computer Studies',
            'course' => 'Bachelor of Science in Criminology', // Belongs to CCJE, not CCS
            'year_level' => '1st Year',
            'contact_number' => '09281234568',
            'password' => $password,
            'password_confirmation' => $password,
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors('course')
            ->assertJsonFragment(['course' => ['The selected course does not belong to the selected department. Please choose a valid course.']]);
    }

    /**
     * Donor registration rejects a foreign country and number.
     */
    public function test_donor_registration_rejects_united_states(): void
    {
        $password = 'US#Donor2026';

        $payload = [
            'role' => 'donor',
            'account_type' => 'donor',
            'first_name' => 'John',
            'middle_name' => 'Fitzgerald',
            'last_name' => 'Smith',
            'email' => 'john.smith@us-donor.org',
            'country' => 'United States',
            'country_code' => 'US',
            'contact_number' => '+12025550143',
            'address_line_1' => '742 Evergreen Terrace',
            'state_province_region' => 'California',
            'city_municipality' => 'Springfield',
            'district_local_area' => 'West District',
            'postal_zip_code' => '97477',
            'valid_id_type' => 'Passport',
            'valid_id_number' => 'US987654321',
            'password' => $password,
            'password_confirmation' => $password,
        ];

        $response = $this->postJson('/api/register', $payload);

        $response->assertUnprocessable()->assertJsonValidationErrors(['country', 'country_code', 'contact_number']);
    }

    /**
     * Donor registration rejects a foreign country even when its number is locally formatted.
     */
    public function test_donor_registration_rejects_japan(): void
    {
        $password = 'Japan#Donor2026';

        $payload = [
            'role' => 'donor',
            'first_name' => 'Kenji',
            'last_name' => 'Sato',
            'email' => 'kenji.sato@jp-donor.co.jp',
            'country' => 'Japan',
            'country_code' => 'JP',
            'contact_number' => '09012345678', // Japanese domestic mobile number
            'address_line_1' => '2-8-1 Nishi-Shinjuku',
            'state_province_region' => 'Tokyo',
            'city_municipality' => 'Shinjuku-ku',
            'postal_zip_code' => '163-8001',
            'valid_id_type' => 'Residence Permit',
            'valid_id_number' => 'JP123456789',
            'password' => $password,
            'password_confirmation' => $password,
        ];

        $response = $this->postJson('/api/register', $payload);

        $response->assertUnprocessable()->assertJsonValidationErrors(['country', 'country_code', 'contact_number']);
    }

    /**
     * Requirement: Donor Registration fails when Country / Region is missing.
     */
    public function test_donor_registration_fails_when_country_is_missing(): void
    {
        $password = 'Secure!Pass2026';

        $response = $this->postJson('/api/register', [
            'role' => 'donor',
            'account_type' => 'donor',
            'first_name' => 'Juan',
            'last_name' => 'Dela Cruz',
            'email' => 'juan.nocountry@donor.org',
            'country' => '', // missing
            'contact_number' => '+639201112235',
            'address_line_1' => 'Block 1 Lot 2 Sunset Village',
            'valid_id_type' => 'Driver\'s License',
            'valid_id_number' => 'DL-11223346',
            'password' => $password,
            'password_confirmation' => $password,
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['country' => 'Donor registration is limited to the Philippines.']);
    }

    /**
     * Donor registration rejects invalid Philippine mobile numbers.
     */
    public function test_donor_phone_number_rejection_for_invalid_numbers(): void
    {
        $password = 'Secure!Pass2026';

        $response = $this->postJson('/api/register', [
            'role' => 'donor',
            'first_name' => 'Invalid',
            'last_name' => 'Phone',
            'email' => 'invalid.phone@example.com',
            'country' => 'Philippines',
            'country_code' => 'PH',
            'contact_number' => '12345', // Too short / invalid Philippine number
            'address_line_1' => '123 Main St',
            'valid_id_type' => 'Passport',
            'valid_id_number' => 'PASS-123456',
            'password' => $password,
            'password_confirmation' => $password,
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['contact_number' => 'Please enter a valid Philippine mobile number (09XXXXXXXXX).']);
    }

    /**
     * Requirement: Real-time availability check endpoint validates contact number correctly.
     */
    public function test_donor_contact_number_availability_check_endpoint(): void
    {
        User::factory()->create([
            'email' => 'existing.phone.donor@relief.org',
            'contact_number' => '+639171234567',
            'role' => 'donor',
        ]);

        // 1. Available contact number
        $res1 = $this->postJson('/api/register/check-availability', [
            'field' => 'contact_number',
            'value' => '09209876543',
            'country' => 'Philippines',
            'country_code' => 'PH',
            'account_type' => 'donor',
        ]);
        $res1->assertOk()
            ->assertJson([
                'available' => true,
                'message' => 'Contact Number is available.',
            ]);

        // 2. Taken contact number (E.164 match)
        $res2 = $this->postJson('/api/register/check-availability', [
            'field' => 'contact_number',
            'value' => '09171234567',
            'country' => 'Philippines',
            'country_code' => 'PH',
            'account_type' => 'donor',
        ]);
        $res2->assertOk()
            ->assertJson([
                'available' => false,
                'message' => 'This contact number is already taken. Please use a different contact number.',
            ]);

        // 3. Invalid contact number format for country
        $res3 = $this->postJson('/api/register/check-availability', [
            'field' => 'contact_number',
            'value' => '12345',
            'country' => 'United States',
            'country_code' => 'US',
            'account_type' => 'donor',
        ]);
        $res3->assertOk()
            ->assertJson([
                'available' => false,
                'message' => 'Donor registration is limited to the Philippines.',
            ]);
    }

    /**
     * Requirement: Donor Registration fails when Contact Number is missing.
     */
    public function test_donor_registration_fails_when_contact_number_is_missing(): void
    {
        $password = 'Secure!Pass2026';

        $response = $this->postJson('/api/register', [
            'role' => 'donor',
            'account_type' => 'donor',
            'first_name' => 'Juan',
            'last_name' => 'Dela Cruz',
            'email' => 'juan.nophone@donor.org',
            'country' => 'Philippines',
            'country_code' => 'PH',
            'contact_number' => '', // missing
            'address_line_1' => 'Block 1 Lot 2 Sunset Village',
            'valid_id_type' => 'Driver\'s License',
            'valid_id_number' => 'DL-11223346',
            'password' => $password,
            'password_confirmation' => $password,
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['contact_number' => 'Contact Number is required.']);
    }

    /**
     * Requirement: Donor Registration fails when Contact Number is already taken.
     */
    public function test_donor_registration_fails_when_contact_number_is_already_taken(): void
    {
        User::factory()->create([
            'email' => 'taken.phone.owner@donor.org',
            'contact_number' => '+639171234567',
            'role' => 'donor',
        ]);

        $password = 'Secure!Pass2026';

        $response = $this->postJson('/api/register', [
            'role' => 'donor',
            'account_type' => 'donor',
            'first_name' => 'Juan',
            'last_name' => 'Dela Cruz',
            'email' => 'juan.duplicatephone@donor.org',
            'country' => 'Philippines',
            'country_code' => 'PH',
            'contact_number' => '09171234567', // national format duplicate of +639171234567
            'address_line_1' => 'Block 1 Lot 2 Sunset Village',
            'valid_id_type' => 'Driver\'s License',
            'valid_id_number' => 'DL-11223346',
            'password' => $password,
            'password_confirmation' => $password,
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['contact_number' => 'This contact number is already taken. Please use a different contact number.']);
    }

    /**
     * Donors cannot change their profile to international country or phone details.
     */
    public function test_donor_cannot_update_profile_with_international_fields(): void
    {
        $donor = User::factory()->create([
            'role' => 'donor',
            'first_name' => 'Initial',
            'last_name' => 'Donor',
            'name' => 'Initial Donor',
            'email' => 'initial.donor@example.com',
            'country' => 'Philippines',
            'country_code' => 'PH',
            'contact_number' => '+639171234567',
        ]);

        Sanctum::actingAs($donor);

        $updateResponse = $this->postJson('/api/profile', [
            'name' => 'Updated UK Donor',
            'email' => 'updated.uk@example.co.uk',
            'country' => 'United Kingdom',
            'country_code' => 'GB',
            'contact_number' => '+447911123456',
            'address_line_1' => '10 Downing Street',
            'city_municipality' => 'London',
            'state_province_region' => 'Greater London',
            'postal_zip_code' => 'SW1A 2AA',
            'valid_id_type' => 'UK Driving Licence',
            'valid_id_number' => 'SMITH905204JK9AB',
        ]);

        $updateResponse->assertUnprocessable()->assertJsonValidationErrors(['country', 'country_code', 'contact_number']);

        $this->assertDatabaseHas('users', [
            'id' => $donor->id,
            'country' => 'Philippines',
            'country_code' => 'PH',
            'contact_number' => '+639171234567',
        ]);
    }
}
