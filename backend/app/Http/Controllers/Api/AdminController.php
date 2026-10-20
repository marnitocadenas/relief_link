<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\{AidRequestResource, DonationMatchResource, DonationResource, UserResource};
use App\Models\{ActivityLog, AidRequest, Donation, DonationMatch, InventoryMovement, User};
use App\Services\{ActivityService, AlertService, MatchingService, SystemSettings};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Barryvdh\DomPDF\Facade\Pdf;
use PhpOffice\PhpWord\IOFactory;
use PhpOffice\PhpWord\PhpWord;
use PhpOffice\PhpWord\Settings;
use App\Http\Requests\Api\RegisterRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class AdminController extends Controller
{
    public function stats()
    {
        $t = DonationMatch::count();
        return [
            'total_donations' => Donation::count(),
            'total_requests' => AidRequest::count(),
            'physical_requests' => AidRequest::where(function ($q) {
                $q->whereNull('request_type')->orWhere('request_type', 'physical');
            })->count(),
            'financial_requests' => AidRequest::where('request_type', 'financial')->count(),
            'total_financial_amount_requested' => (float) AidRequest::where('request_type', 'financial')->sum('amount_requested'),
            'total_financial_amount_fulfilled' => (float) DonationMatch::where('status', 'fulfilled')->sum('matched_amount'),
            'total_matches' => $t,
            'fulfillment_rate' => $t ? round(DonationMatch::where('status', 'fulfilled')->count() / $t * 100) : 0,
            'pending_reviews' => AidRequest::whereIn('status', ['pending_review', 'under_review'])->count(),
            'proposed_matches' => DonationMatch::where('status', 'proposed')->count(),
            'role_counts' => User::selectRaw('role,count(*) as total')->groupBy('role')->get(),
            'priority_queue' => AidRequest::whereIn('status', ['approved', 'partially_fulfilled'])
                ->orderByRaw("CASE urgency WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END")
                ->oldest()
                ->limit(5)
                ->get(),
            'low_stock_categories' => Donation::selectRaw('category, sum(quantity) as stock')->where('status', 'pending_match')->groupBy('category')->havingRaw('sum(quantity) < 5')->get(),
            'donation_trends' => Donation::selectRaw('DATE(created_at) as date, count(*) as total')
                ->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])
                ->groupBy('date')->orderBy('date')->get(),
            'request_statuses' => AidRequest::selectRaw('status, count(*) as total')->groupBy('status')->get(),
            'match_statuses' => DonationMatch::selectRaw('status, count(*) as total')->groupBy('status')->get(),
        ];
    }

    public function report(Request $request)
    {
        $period = $request->validate(['period' => ['sometimes', 'in:all_time,today,this_week,this_month']])['period'] ?? 'all_time';
        return $this->buildPerformanceReport($period);
    }

    public function exportPerformanceReport(Request $request)
    {
        $data = $request->validate([
            'period' => ['sometimes', 'in:all_time,today,this_week,this_month'],
            'format' => ['required', 'in:csv,pdf,word'],
        ]);
        $period = $data['period'] ?? 'all_time';
        $format = $data['format'];
        $report = $this->buildPerformanceReport($period);
        $filename = 'ReliefLink_Performance_Report_' . $period . '_' . now()->format('Y-m-d');

        try {
            return match ($format) {
                'csv' => $this->downloadPerformanceReportCsv($report, $filename . '.csv'),
                'pdf' => $this->downloadPerformanceReportPdf($report, $filename . '.pdf'),
                'word' => $this->downloadPerformanceReportWord($report, $filename . '.docx'),
            };
        } catch (\Throwable $exception) {
            report($exception);
            return response()->json(['message' => 'Could not generate the requested report export.'], 500);
        }
    }

    private function buildPerformanceReport(string $period): array
    {
        $start = match ($period) {
            'today' => now()->startOfDay(),
            'this_week' => now()->startOfWeek(),
            'this_month' => now()->startOfMonth(),
            default => null,
        };
        $requests = AidRequest::query()->when($start, fn ($q) => $q->where('created_at', '>=', $start));
        $donations = Donation::query()->when($start, fn ($q) => $q->where('created_at', '>=', $start));
        $matches = DonationMatch::query()->when($start, fn ($q) => $q->where('created_at', '>=', $start));
        $physicalRequests = (clone $requests)->where(fn ($q) => $q->whereNull('request_type')->orWhere('request_type', 'physical'));
        $physicalDonations = (clone $donations)->where(fn ($q) => $q->whereNull('donation_type')->orWhere('donation_type', 'physical'));
        $reviewedRequests = (clone $requests)->whereNotIn('status', ['pending_review', 'under_review']);
        $approvedRequests = (clone $reviewedRequests)->whereNotIn('status', ['rejected', 'cancelled']);

        $categoryNames = (clone $physicalDonations)->select('category')->distinct()->pluck('category')
            ->merge((clone $physicalRequests)->select('category')->distinct()->pluck('category'))->unique()->values();

        return [
            'period' => $period,
            'approval_rate' => $reviewedRequests->count() ? round($approvedRequests->count() / $reviewedRequests->count() * 100) : 0,
            'confirmation_rate' => (clone $matches)->count() ? round((clone $matches)->whereIn('status', ['confirmed', 'fulfilled'])->count() / (clone $matches)->count() * 100) : 0,
            'coverage' => [
                'active_donors' => User::where('role', 'donor')->where('is_active', true)->count(),
                'active_beneficiaries' => User::where('role', 'beneficiary')->where('is_active', true)->count(),
                'fulfilled_donations' => (clone $donations)->where('status', 'fulfilled')->count(),
                'fulfilled_requests' => (clone $requests)->where('status', 'fulfilled')->count(),
                'physical_requests' => (clone $requests)->where(function ($q) {
                    $q->whereNull('request_type')->orWhere('request_type', 'physical');
                })->count(),
                'financial_requests' => (clone $requests)->where('request_type', 'financial')->count(),
                'financial_amount_requested' => (float) (clone $requests)->where('request_type', 'financial')->sum('amount_requested'),
                'financial_amount_fulfilled' => (float) (clone $matches)->where('status', 'fulfilled')->sum('matched_amount'),
            ],
            'category_balance' => $categoryNames->map(fn ($category) => [
                'category' => $category,
                'donated_quantity' => (int) (clone $physicalDonations)->where('category', $category)->sum('quantity'),
                'requested_quantity' => (int) (clone $physicalRequests)->where('category', $category)->sum('quantity_needed'),
                'fulfilled_quantity' => (int) DB::table('matches')->join('requests', 'matches.request_id', '=', 'requests.id')
                    ->where('matches.status', 'fulfilled')->where(fn ($q) => $q->whereNull('requests.request_type')->orWhere('requests.request_type', '!=', 'financial'))
                    ->where('requests.category', $category)->when($start, fn ($q) => $q->where('matches.created_at', '>=', $start))->sum('matches.matched_quantity'),
            ]),
        ];
    }

    private function reportRows(array $report): array
    {
        $rows = [
            ['Metric', 'Value'],
            ['Reporting period', str_replace('_', ' ', ucfirst($report['period']))],
            ['Request approval rate', $report['approval_rate'] . '%'],
            ['Match confirmation rate', $report['confirmation_rate'] . '%'],
            ['Active donors', $report['coverage']['active_donors']],
            ['Active beneficiaries', $report['coverage']['active_beneficiaries']],
            ['Fulfilled donations', $report['coverage']['fulfilled_donations']],
            ['Fulfilled requests', $report['coverage']['fulfilled_requests']],
            ['Physical requests', $report['coverage']['physical_requests']],
            ['Financial requests', $report['coverage']['financial_requests']],
            ['Financial amount requested', number_format($report['coverage']['financial_amount_requested'], 2, '.', '')],
            ['Financial amount fulfilled', number_format($report['coverage']['financial_amount_fulfilled'], 2, '.', '')],
            [],
            ['Category', 'Donated quantity', 'Requested quantity', 'Balance', 'Fulfilled quantity', 'Fulfillment coverage (%)'],
        ];

        foreach ($report['category_balance'] as $category) {
            $requested = (int) $category['requested_quantity'];
            $fulfilled = (int) $category['fulfilled_quantity'];
            $rows[] = [
                $category['category'],
                (int) $category['donated_quantity'],
                $requested,
                (int) $category['donated_quantity'] - $requested,
                $fulfilled,
                $requested > 0 ? min(100, (int) round($fulfilled / $requested * 100)) : 0,
            ];
        }

        return $rows;
    }

    private function downloadPerformanceReportCsv(array $report, string $filename)
    {
        $stream = fopen('php://temp', 'r+');
        foreach ($this->reportRows($report) as $row) {
            $row = array_map(static function ($value) {
                if (is_string($value) && preg_match('/^[=+@\-\t\r]/', $value)) {
                    return "'" . $value;
                }
                return $value;
            }, $row);
            fputcsv($stream, $row, ',', '"', '\\');
        }
        rewind($stream);
        $csv = "\xEF\xBB\xBF" . stream_get_contents($stream);
        fclose($stream);

        return Response::make($csv, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    private function downloadPerformanceReportPdf(array $report, string $filename)
    {
        $pdf = Pdf::loadView('reports.performance', ['report' => $report])
            ->setPaper('a4', 'portrait');

        return $pdf->download($filename);
    }

    private function downloadPerformanceReportWord(array $report, string $filename)
    {
        $word = new PhpWord();
        $word->setDefaultFontName('Aptos');
        $word->setDefaultFontSize(10);
        $section = $word->addSection(['marginTop' => 900, 'marginBottom' => 900]);
        $section->addTitle('ReliefLink Performance Report', 1);
        $section->addText('Reporting period: ' . str_replace('_', ' ', ucfirst($report['period'])));
        $section->addText('Generated: ' . now()->format('Y-m-d H:i:s'));
        $section->addTitle('Performance Summary', 2);

        $summary = $section->addTable(['borderSize' => 4, 'borderColor' => 'D6E2F1', 'cellMargin' => 80]);
        foreach (array_slice($this->reportRows($report), 1, 11) as $row) {
            $summary->addRow();
            $summary->addCell(4800, ['bgColor' => 'F1F5FB'])->addText((string) $row[0], ['bold' => true]);
            $summary->addCell(4000)->addText((string) ($row[1] ?? ''));
        }

        $section->addTitle('Category Balance & Distribution', 2);
        $table = $section->addTable(['borderSize' => 4, 'borderColor' => 'D6E2F1', 'cellMargin' => 70]);
        $headers = ['Category', 'Donated', 'Requested', 'Balance', 'Fulfilled', 'Coverage'];
        $table->addRow();
        foreach ($headers as $header) {
            $table->addCell(1500, ['bgColor' => '1E3A5F'])->addText($header, ['bold' => true, 'color' => 'FFFFFF']);
        }
        foreach (array_slice($this->reportRows($report), 14) as $row) {
            $table->addRow();
            foreach ($row as $index => $value) {
                $table->addCell($index === 0 ? 2200 : 1300)->addText((string) $value . ($index === 5 ? '%' : ''));
            }
        }

        $path = tempnam(sys_get_temp_dir(), 'relieflink-report-');
        if ($path === false) {
            throw new \RuntimeException('Could not prepare the Word report for download.');
        }

        try {
            // PHPWord's bundled PCLZip writer supports environments where the
            // optional PHP zip extension has not been enabled.
            Settings::setZipClass(Settings::PCLZIP);
            IOFactory::createWriter($word, 'Word2007')->save($path);
            return response()->download($path, $filename, [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ])->deleteFileAfterSend(true);
        } catch (\Throwable $exception) {
            @unlink($path);
            report($exception);
            return response()->json(['message' => 'Could not generate the Word report.'], 500);
        }
    }

    private function activityQuery(Request $request)
    {
        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:120'],
            'module' => ['nullable', 'in:all,users,requests,donations,matches,system'],
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date', 'after_or_equal:from'],
            'sort' => ['nullable', 'in:newest,oldest'],
        ]);
        $query = ActivityLog::with('user:id,name');
        if ($request->user()->role === 'staff') {
            $query->whereIn('subject_type', [AidRequest::class, Donation::class, DonationMatch::class]);
            abort_if(in_array($request->input('module'), ['users', 'system'], true), 403, 'Staff activity access is limited to requests, donations, and matches.');
        }
        $types = [
            'users' => User::class,
            'requests' => AidRequest::class,
            'donations' => Donation::class,
            'matches' => DonationMatch::class,
            'system' => 'system',
        ];
        if (($filters['module'] ?? 'all') !== 'all') {
            $module = $filters['module'];
            $module === 'users'
                ? $query->where(fn ($q) => $q->where('subject_type', User::class)->orWhere('action', 'like', '%user%'))
                : $query->where('subject_type', $types[$module]);
        }
        $query->when($filters['from'] ?? null, fn ($q, $date) => $q->whereDate('created_at', '>=', $date))
            ->when($filters['to'] ?? null, fn ($q, $date) => $q->whereDate('created_at', '<=', $date))
            ->when($filters['q'] ?? null, function ($q, $term) {
                $q->where(fn ($sub) => $sub->where('action', 'like', "%{$term}%")
                    ->orWhere('subject_type', 'like', "%{$term}%")
                    ->orWhere('subject_id', 'like', "%{$term}%")
                    ->orWhereHas('user', fn ($user) => $user->where('name', 'like', "%{$term}%")));
            });
        return $query->orderBy('created_at', ($filters['sort'] ?? 'newest') === 'oldest' ? 'asc' : 'desc')->orderBy('id', 'desc');
    }

    public function activities(Request $request)
    {
        $request->validate(['per_page' => ['sometimes', 'integer', 'between:10,100']]);
        $query = $this->activityQuery($request);
        $summary = [
            'total' => (clone $query)->count(),
            'users' => (clone $query)->where('subject_type', User::class)->count(),
            'requests' => (clone $query)->where('subject_type', AidRequest::class)->count(),
            'donations' => (clone $query)->where('subject_type', Donation::class)->count(),
            'matches' => (clone $query)->where('subject_type', DonationMatch::class)->count(),
        ];
        return $query->paginate($request->integer('per_page', 20))->toArray() + ['summary' => $summary];
    }

    public function exportActivities(Request $request)
    {
        $stream = fopen('php://temp', 'r+');
        fputcsv($stream, ['Log ID', 'Action', 'Actor', 'Module', 'Target Type', 'Target ID', 'Metadata', 'Timestamp']);
        $this->activityQuery($request)->chunk(500, function ($logs) use ($stream) {
            foreach ($logs as $log) {
                fputcsv($stream, [$log->id, $log->action, $log->user?->name ?? 'System', class_basename($log->subject_type), $log->subject_type, $log->subject_id, json_encode($log->metadata), $log->created_at?->toISOString()]);
            }
        });
        rewind($stream);
        $csv = stream_get_contents($stream);
        fclose($stream);
        return Response::make($csv, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="relieflink_activity_logs_' . now()->format('Y-m-d') . '.csv"',
        ]);
    }

    public function users()
    {
        return UserResource::collection(User::latest()->get());
    }

    public function updateUserStatus(Request $r, User $user)
    {
        $data = $r->validate(['is_active' => 'required|boolean']);
        try {
            $updatedUser = DB::transaction(function () use ($r, $user, $data) {
                $user->is_active = $data['is_active'];
                if (! $user->save()) {
                    throw new \RuntimeException('Could not update account status.');
                }

                if (! $user->is_active) {
                    $user->tokens()->delete();
                }

                ActivityService::log($r->user(), $user->is_active ? 'reactivated user' : 'deactivated user', $user);
                return $user->fresh();
            });

            return new UserResource($updatedUser);
        } catch (\Throwable $e) {
            report($e);
            return response()->json(['message' => 'Could not update account status. Please try again.'], 500);
        }
    }

    public function storeUser(Request $r)
    {
        $rawRole = strtolower(trim((string) ($r->input('account_type') ?: $r->input('role', ''))));
        if ($rawRole === 'administrator') {
            $rawRole = 'admin';
        }

        $r->merge([
            'role' => $rawRole ?: null,
            'account_type' => $rawRole ?: null,
        ]);

        $role = $rawRole;
        $isAdmin = $role === 'admin';
        $isStaff = $role === 'staff';
        $isAdminOrStaff = $isAdmin || $isStaff;
        $isBeneficiary = $role === 'beneficiary';
        $isDonor = $role === 'donor';
        $beneficiaryType = $r->input('beneficiary_type');
        $isStudentBeneficiary = $isBeneficiary && $beneficiaryType === 'student';
        $isEmployeeBeneficiary = $isBeneficiary && $beneficiaryType === 'faculty';

        // Use full strong password rules for beneficiary and donor (same as user-side RegisterRequest),
        // and a simpler rule for admin/staff (internal accounts).
        $strongPasswordRule = ($isBeneficiary || $isDonor)
            ? [
                'required',
                'string',
                'confirmed',
                Password::min(8)
                    ->max(64)
                    ->letters()
                    ->mixedCase()
                    ->numbers()
                    ->symbols(),
                function ($attribute, $value, $fail) use ($r) {
                    if (!preg_match('/[!@#$%^&*()_\-+=\[\]{}|:;,.?]/', $value)) {
                        $fail('The password must contain an allowed special character (!@#$%^&*()_-+=[]{}|:;,.?).');
                        return;
                    }
                    if (trim($value) !== $value) {
                        $fail('The password cannot start or end with spaces.');
                        return;
                    }
                    $weakPasswords = ['password', '12345678', 'qwerty', 'admin', 'welcome', '123456', 'password123', 'relieflink', 'letmein'];
                    if (in_array(strtolower($value), $weakPasswords, true)) {
                        $fail('This password is too common or easily guessable. Please choose a stronger password.');
                        return;
                    }
                    $firstName = strtolower(trim((string) $r->input('first_name', '')));
                    $lastName = strtolower(trim((string) $r->input('last_name', '')));
                    $emailInput = strtolower(trim((string) ($r->input('email', '') ?: $r->input('school_email', ''))));
                    $emailUsername = explode('@', $emailInput)[0] ?? '';
                    foreach (array_filter([$firstName, $lastName]) as $part) {
                        if (strlen($part) >= 3 && stripos($value, $part) !== false) {
                            $fail('The password cannot contain your name.');
                            return;
                        }
                    }
                    if (!empty($emailUsername) && strlen($emailUsername) >= 3 && stripos($value, $emailUsername) !== false) {
                        $fail('The password cannot contain your email address.');
                        return;
                    }
                },
            ]
            : 'required|string|min:8|confirmed';

        $rules = [
            'role' => 'required|in:admin,staff,beneficiary,donor',
            'account_type' => 'required|in:admin,staff,beneficiary,donor',
            'first_name' => 'required|string|max:100',
            'middle_name' => 'nullable|string|max:100',
            'last_name' => 'required|string|max:100',
            'password' => $strongPasswordRule,
        ];

        if ($isAdminOrStaff) {
            $rules['campus_id'] = 'required|string|max:50|unique:users,campus_id';
            $rules['email'] = 'required|email|max:255|unique:users,email';
            $rules['department'] = 'required|string|max:255';
            $rules['contact_number'] = 'required|string|max:30|unique:users,contact_number';
        } elseif ($isBeneficiary) {
            $rules['beneficiary_type'] = ['required', Rule::in(['student', 'faculty'])];
            $rules['student_id_number'] = [$isStudentBeneficiary ? 'required' : 'nullable', 'string', 'max:9', $isStudentBeneficiary ? 'regex:/^\d{2}-\d{6}$/' : 'nullable', 'unique:users,student_id_number'];
            $rules['campus_id'] = [$isEmployeeBeneficiary ? 'required' : 'nullable', 'string', 'min:3', 'max:50', 'unique:users,campus_id'];
            $rules['email'] = 'required|email|max:255|unique:users,email';
            $rules['school_email'] = 'nullable|email|max:255';
            $rules['department'] = ['required', 'string', 'max:255', ...($isStudentBeneficiary ? [Rule::in(RegisterRequest::BENEFICIARY_DEPARTMENTS)] : [])];
            $rules['course'] = [$isStudentBeneficiary ? 'required' : 'nullable', 'string', 'max:255', ...($isStudentBeneficiary ? [function ($attribute, $value, $fail) use ($r) {
                $dept = $r->input('department');
                $allowed = RegisterRequest::DEPARTMENT_COURSES[$dept] ?? [];
                if (!in_array($value, $allowed, true)) {
                    $fail('The selected course does not belong to the selected department. Please choose a valid course.');
                }
            }] : [])];
            $rules['year_level'] = [$isStudentBeneficiary ? 'required' : 'nullable', 'string', 'max:50', ...($isStudentBeneficiary ? [Rule::in(RegisterRequest::BENEFICIARY_YEAR_LEVELS)] : [])];
            $rules['contact_number'] = ['required', 'string', 'regex:/^09[0-9]{9}$/', 'unique:users,contact_number'];
        } elseif ($isDonor) {
            $rules['email'] = 'required|email|max:255|unique:users,email';
            $rules['contact_number'] = 'required|string|max:30|unique:users,contact_number';
            $rules['country'] = 'required|string|max:100';
            $rules['country_code'] = 'nullable|string|size:2';
            $rules['address_line_1'] = 'required|string|max:255';
            $rules['state_province_region'] = 'nullable|string|max:255';
            $rules['city_municipality'] = 'nullable|string|max:255';
            $rules['district_local_area'] = 'nullable|string|max:255';
            $rules['postal_zip_code'] = 'nullable|string|max:50';
            $rules['valid_id_type'] = 'required|string|max:100';
            $rules['valid_id_number'] = 'required|string|max:50|unique:users,valid_id_number';
        }

        $messages = [
            'role.required' => 'Please select an account type.',
            'role.in' => 'Please select a valid account type.',
            'account_type.required' => 'Please select an account type.',
            'account_type.in' => 'Please select a valid account type.',
            'first_name.required' => 'First Name is required.',
            'last_name.required' => 'Last Name is required.',
            'email.required' => 'Email Address is required.',
            'email.unique' => 'This email address is already registered.',
            'campus_id.required' => ($isBeneficiary ? 'Campus ID Number' : ($isAdmin ? 'Administrator ID / Campus ID Number' : 'Staff ID / Campus ID Number')) . ' is required.',
            'campus_id.unique' => 'This Campus ID number is already taken.',
            'student_id_number.required' => 'Student ID Number is required.',
            'student_id_number.regex' => 'Please enter a valid Student ID Number in the format YY-###### (e.g., 21-010956).',
            'student_id_number.unique' => 'This Student ID Number is already registered.',
            'department.required' => 'Please select a department.',
            'department.in' => 'Please select a valid department.',
            'course.required' => 'Please select a course.',
            'course.in' => 'Please select a valid course.',
            'year_level.required' => 'Please select a year level.',
            'year_level.in' => 'Please select a valid year level.',
            'contact_number.required' => 'Contact Number is required.',
            'contact_number.regex' => 'Contact Number must begin with 09 and contain exactly 11 digits.',
            'contact_number.unique' => 'This Contact Number is already registered.',
            'country.required' => 'Country / Region is required.',
            'address_line_1.required' => 'Address Line is required.',
            'valid_id_type.required' => 'Valid ID Type is required.',
            'valid_id_number.required' => 'Valid ID Number is required.',
            'valid_id_number.unique' => 'This Valid ID Number is already taken.',
            'password.required' => 'Password is required.',
            'password.confirmed' => 'Passwords do not match.',
            'password.min' => 'The password must be at least 8 characters long.',
            'password.max' => 'The password cannot exceed 64 characters.',
            'password.mixed' => 'The password must contain both uppercase and lowercase letters.',
            'password.letters' => 'The password must contain at least one letter.',
            'password.numbers' => 'The password must contain at least one number.',
            'password.symbols' => 'The password must contain at least one special character (!@#$%^&*()_-+=[]{}|:;,.?).',
        ];

        $d = $r->validate($rules, $messages);

        if (empty($d['name']) && (!empty($d['first_name']) || !empty($d['last_name']))) {
            $d['name'] = trim(($d['first_name'] ?? '') . (!empty($d['middle_name']) ? ' ' . $d['middle_name'] : '') . ' ' . ($d['last_name'] ?? ''));
        }

        if ($role === 'beneficiary') {
            $d['campus_id'] = $isEmployeeBeneficiary ? $d['campus_id'] : null;
            $d['student_id_number'] = $isStudentBeneficiary ? $d['student_id_number'] : null;
            $d['address'] = null;
            $d['address_line_1'] = null;
            $d['state_province_region'] = null;
            $d['city_municipality'] = null;
            $d['district_local_area'] = null;
            $d['postal_zip_code'] = null;
            $d['valid_id_type'] = null;
            $d['valid_id_number'] = null;
            $d['country'] = null;
            $d['country_code'] = null;
            $d['school_email'] = $d['email'];
        } elseif ($role === 'donor') {
            $d['campus_id'] = null;
            $d['student_id_number'] = null;
            $d['beneficiary_type'] = null;
            $d['school_email'] = null;
            $d['department'] = null;
            $d['course'] = null;
            $d['year_level'] = null;
            $d['country_code'] = RegisterRequest::resolveCountryIso($d['country'] ?? '', $r->input('country_code'));
            if (!empty($d['address_line_1'])) {
                $d['address'] = implode(', ', array_filter([
                    $d['address_line_1'],
                    $d['district_local_area'] ?? null,
                    $d['city_municipality'] ?? null,
                    $d['state_province_region'] ?? null,
                    $d['postal_zip_code'] ?? null,
                    $d['country'] ?? null,
                ]));
            }
        } elseif ($isAdminOrStaff) {
            $d['address'] = null;
            $d['address_line_1'] = null;
            $d['state_province_region'] = null;
            $d['city_municipality'] = null;
            $d['district_local_area'] = null;
            $d['postal_zip_code'] = null;
            $d['valid_id_type'] = null;
            $d['valid_id_number'] = null;
            $d['student_id_number'] = null;
            $d['beneficiary_type'] = null;
            $d['school_email'] = null;
            $d['course'] = null;
            $d['year_level'] = null;
            $d['country'] = null;
            $d['country_code'] = null;
        }

        $d['account_type'] = $role;
        $d['password'] = Hash::make($d['password']);
        $d['email_verified_at'] = now();
        $u = User::create($d);
        ActivityService::log($r->user(), 'created user', $u);
        return new UserResource($u);
    }

    public function updateUser(Request $r, User $user)
    {
        $rawRole = strtolower(trim((string) ($r->input('account_type') ?: $r->input('role', $user->role))));
        if ($rawRole === 'administrator') {
            $rawRole = 'admin';
        }
        $role = $rawRole;
        $isAdminOrStaff = in_array($role, ['admin', 'staff'], true);
        $beneficiaryType = $r->input('beneficiary_type', $user->beneficiary_type);
        $isStudentBeneficiary = $role === 'beneficiary' && $beneficiaryType === 'student';

        $d = $r->validate([
            'name' => 'sometimes|nullable|string|max:255',
            'first_name' => 'nullable|string|max:100',
            'middle_name' => 'nullable|string|max:100',
            'last_name' => 'nullable|string|max:100',
            'email' => 'sometimes|required|email|max:255|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:8',
            'role' => 'sometimes|required|in:donor,beneficiary,staff,admin',
            'account_type' => 'nullable|in:donor,beneficiary,staff,admin',
            'beneficiary_type' => ['sometimes', 'nullable', Rule::in(['student', 'faculty', 'staff'])],
            'contact_number' => 'nullable|string|max:30|unique:users,contact_number,' . $user->id,
            'country' => 'nullable|string|max:100',
            'country_code' => 'nullable|string|size:2',
            'campus_id' => 'sometimes|nullable|string|min:3|max:50|unique:users,campus_id,' . $user->id,
            'address' => 'nullable|string|max:255',
            'address_line_1' => 'nullable|string|max:255',
            'state_province_region' => 'nullable|string|max:255',
            'city_municipality' => 'nullable|string|max:255',
            'district_local_area' => 'nullable|string|max:255',
            'postal_zip_code' => 'nullable|string|max:50',
            'valid_id_type' => 'nullable|string|max:100',
            'valid_id_number' => $role === 'donor' ? 'nullable|string|max:50|unique:users,valid_id_number,' . $user->id : 'nullable|string|max:50|unique:users,valid_id_number,' . $user->id,
            'student_id_number' => ['nullable', 'string', 'max:50', $isStudentBeneficiary ? 'regex:/^\d{2}-\d{6}$/' : 'nullable', 'unique:users,student_id_number,' . $user->id],
            'school_email' => 'nullable|email|max:255',
            'department' => $role === 'beneficiary' && $isStudentBeneficiary ? ['nullable', 'string', Rule::in(RegisterRequest::BENEFICIARY_DEPARTMENTS)] : 'nullable|string|max:255',
            'course' => ['nullable', 'string', function ($attribute, $value, $fail) use ($r, $user, $isStudentBeneficiary) {
                if (!empty($value) && $isStudentBeneficiary) {
                    $dept = $r->input('department', $user->department);
                    $allowed = RegisterRequest::DEPARTMENT_COURSES[$dept] ?? [];
                    if (!in_array($value, $allowed, true)) {
                        $fail('The selected course does not belong to the selected department. Please choose a valid course.');
                    }
                }
            }],
            'year_level' => $isStudentBeneficiary ? ['nullable', 'string', Rule::in(RegisterRequest::BENEFICIARY_YEAR_LEVELS)] : 'nullable|string|max:255',
        ]);

        if (empty($d['name']) && (!empty($d['first_name']) || !empty($d['last_name']))) {
            $d['name'] = trim(($d['first_name'] ?? '') . (!empty($d['middle_name']) ? ' ' . $d['middle_name'] : '') . ' ' . ($d['last_name'] ?? ''));
        }

        if (array_key_exists('role', $d) || array_key_exists('account_type', $d)) {
            $effectiveRole = $d['role'] ?? ($d['account_type'] ?? $role);
            $d['role'] = $effectiveRole;
            $d['account_type'] = $effectiveRole;

            if ($effectiveRole === 'beneficiary') {
                $effectiveBeneficiaryType = $d['beneficiary_type'] ?? $user->beneficiary_type;
                if ($effectiveBeneficiaryType === 'student') {
                    $d['campus_id'] = null;
                } else {
                    $d['student_id_number'] = null;
                    $d['course'] = null;
                    $d['year_level'] = null;
                }
                $d['address'] = null;
                $d['address_line_1'] = null;
                $d['state_province_region'] = null;
                $d['city_municipality'] = null;
                $d['district_local_area'] = null;
                $d['postal_zip_code'] = null;
                $d['valid_id_type'] = null;
                $d['valid_id_number'] = null;
                $d['country'] = null;
                $d['country_code'] = null;
            } elseif ($effectiveRole === 'donor') {
                $d['campus_id'] = null;
                $d['student_id_number'] = null;
                $d['beneficiary_type'] = null;
                $d['school_email'] = null;
                $d['department'] = null;
                $d['course'] = null;
                $d['year_level'] = null;
                if (isset($d['country'])) {
                    $d['country_code'] = RegisterRequest::resolveCountryIso($d['country'], $r->input('country_code'));
                }
                if (isset($d['address_line_1'])) {
                    $d['address'] = implode(', ', array_filter([
                        $d['address_line_1'],
                        $d['district_local_area'] ?? $user->district_local_area,
                        $d['city_municipality'] ?? $user->city_municipality,
                        $d['state_province_region'] ?? $user->state_province_region,
                        $d['postal_zip_code'] ?? $user->postal_zip_code,
                        $d['country'] ?? $user->country,
                    ]));
                }
            } elseif (in_array($effectiveRole, ['admin', 'staff'], true)) {
                $d['address'] = null;
                $d['address_line_1'] = null;
                $d['state_province_region'] = null;
                $d['city_municipality'] = null;
                $d['district_local_area'] = null;
                $d['postal_zip_code'] = null;
                $d['valid_id_type'] = null;
                $d['valid_id_number'] = null;
                $d['student_id_number'] = null;
                $d['beneficiary_type'] = null;
                $d['school_email'] = null;
                $d['course'] = null;
                $d['year_level'] = null;
                $d['country'] = null;
                $d['country_code'] = null;
            }
        }

        if (!empty($d['password'])) {
            $d['password'] = Hash::make($d['password']);
        } else {
            unset($d['password']);
        }
        if (!$user->update($d)) {
            return response()->json(['message' => 'Could not save user changes. Please try again.'], 500);
        }
        ActivityService::log($r->user(), 'updated user', $user);
        return new UserResource($user->fresh());
    }

    public function destroyUser(Request $r, User $user)
    {
        abort_if($user->role === 'admin' && User::where('role', 'admin')->count() === 1, 422, 'Keep at least one administrator.');
        ActivityService::log($r->user(), 'deleted user', $user);
        $user->delete();
        return response()->noContent();
    }

    public function destroyDonation(Request $r, Donation $donation)
    {
        if ($donation->image_path) {
            Storage::disk('public')->delete($donation->image_path);
        }
        ActivityService::log($r->user(), 'deleted donation', $donation);
        $donation->delete();
        return response()->noContent();
    }

    public function destroyRequest(Request $r, AidRequest $aidRequest)
    {
        if ($aidRequest->supporting_document_path) {
            Storage::delete($aidRequest->supporting_document_path);
        }
        ActivityService::log($r->user(), 'deleted support request', $aidRequest);
        $aidRequest->delete();
        return response()->noContent();
    }

    public function donations(Request $r)
    {
        return DonationResource::collection(Donation::with(['donor', 'matches'])->filter($r->all())->latest()->paginate(50));
    }

    public function inventoryMovements(Request $r)
    {
        return InventoryMovement::with(['staff:id,name', 'donation:id,item_name,category'])
            ->when($r->integer('donation_id'), fn ($query, $id) => $query->where('donation_id', $id))
            ->latest()
            ->paginate(50);
    }

    public function requests(Request $r)
    {
        return AidRequestResource::collection(AidRequest::with(['beneficiary', 'verifiedBy'])->filter($r->all())->latest()->paginate(50));
    }

    public function showRequest(Request $r, AidRequest $aidRequest)
    {
        return new AidRequestResource($aidRequest->load(['beneficiary', 'verifiedBy', 'matches.donation.donor']));
    }

    public function updateRequest(Request $r, AidRequest $aidRequest, MatchingService $matchingService)
    {
        // Anti-Fraud Self Approval Check
        if ($r->user()->id === $aidRequest->beneficiary_id) {
            return response()->json(['message' => 'Anti-Fraud Guard: Staff members cannot approve or reject their own aid requests.'], 403);
        }

        $d = $r->validate([
            'status' => 'required|in:approved,rejected,pending_review,under_review',
            'verification_tier' => 'nullable|in:unverified,identity_verified,financial_hardship,emergency',
            'verification_state' => 'nullable|in:pending,under_review,needs_revision,approved,rejected',
            'verification_checklist' => 'nullable|array',
            'verification_notes' => 'nullable|string|max:1000',
            'verification_decision_reason' => 'nullable|string|max:1000',
            'student_id_number' => 'nullable|string|max:100',
        ]);

        if ($d['status'] === 'rejected' && $aidRequest->matches()->whereIn('status', ['proposed', 'confirmed', 'fulfilled'])->exists()) {
            throw ValidationException::withMessages([
                'status' => 'This request already has aid reserved or distributed. Cancel or resolve its matches before rejecting it.',
            ]);
        }

        // The verification decision is authoritative. Keeping status in sync prevents
        // an "approved" message from being sent for a rejected/revision decision.
        if (($d['verification_state'] ?? null) === 'approved') {
            $d['status'] = 'approved';
        } elseif (($d['verification_state'] ?? null) === 'rejected') {
            $d['status'] = 'rejected';
        } elseif (($d['verification_state'] ?? null) === 'under_review') {
            $d['status'] = 'under_review';
        } elseif (($d['verification_state'] ?? null) === 'needs_revision') {
            $d['status'] = 'pending_review';
        }

        $d['verified_by_user_id'] = $r->user()->id;
        $d['verification_state'] = $d['verification_state'] ?? ($d['status'] === 'approved' ? 'approved' : ($d['status'] === 'rejected' ? 'rejected' : ($d['status'] === 'under_review' ? 'under_review' : 'needs_revision')));
        if (in_array($d['verification_state'], ['rejected', 'needs_revision'], true) && blank($d['verification_decision_reason'] ?? null)) {
            throw ValidationException::withMessages([
                'verification_decision_reason' => 'A reason is required when rejecting a request or requesting a revision.',
            ]);
        }
        if (in_array($d['verification_state'], ['approved', 'rejected', 'needs_revision', 'under_review'], true)) {
            $d['verification_decided_at'] = now();
        }
        $previousStatus = $aidRequest->status;
        $previousVerificationState = $aidRequest->verification_state;
        $aidRequest->update($d);

        $message = match ($d['verification_state']) {
            'under_review' => 'Your help request is currently under review by campus operations.',
            'needs_revision' => 'Your help request needs additional information before it can be verified.',
            'rejected' => 'Your help request was rejected.',
            'approved' => 'Your help request was approved and is ready for matching.',
            default => 'Your help request was updated.',
        };
        AlertService::send($aidRequest->beneficiary, $message, 'request', $d['verification_state'] === 'rejected' ? 'high' : 'normal', $aidRequest, '/requests');
        ActivityService::log($r->user(), $d['verification_state'] . ' support request', $aidRequest, [
            'status_before' => $previousStatus,
            'status_after' => $aidRequest->status,
            'verification_state_before' => $previousVerificationState,
            'verification_state_after' => $aidRequest->verification_state,
            'checklist' => $d['verification_checklist'] ?? [],
        ]);

        // Matching also needs to run when a request becomes eligible after its
        // donation has already cleared staff intake.
        if ($aidRequest->status === 'approved' && $previousStatus !== 'approved' && SystemSettings::get('auto_matching')) {
            $matchingService->run();
            $aidRequest->refresh();
        }

        return new AidRequestResource($aidRequest->load(['beneficiary', 'verifiedBy']));
    }

    /**
     * Admin content-edit: update the request's field data (not status/verification).
     * Route: PUT /api/admin/requests/{aidRequest}/content
     */
    public function editRequestContent(Request $r, AidRequest $aidRequest)
    {
        $validated = $r->validate([
            'request_type'              => 'nullable|in:physical,financial',
            'category'                  => 'required|string|max:80',
            'urgency'                   => 'required|in:low,medium,high',
            'quantity_needed'           => 'nullable|integer|min:1',
            'unit'                      => 'nullable|string|max:50',
            'item_details'              => 'nullable|string|max:255',
            'amount_requested'          => 'nullable|numeric|min:0',
            'currency'                  => 'nullable|in:PHP',
            'purpose_of_funds'          => 'nullable|string|max:2000',
            'justification'             => 'nullable|string|max:2000',
            'preferred_assistance_date' => 'nullable|string|max:100',
            'additional_info'           => 'nullable|string|max:2000',
            'pickup_location'           => 'nullable|string|max:255',
            'availability_window'       => 'nullable|string|max:255',
            'staff_internal_notes'      => 'nullable|string|max:2000',
        ]);

        $activeMatches = $aidRequest->matches()->whereIn('status', ['proposed', 'confirmed', 'fulfilled'])->get();
        if (($validated['request_type'] ?? $aidRequest->request_type) === 'financial') {
            $validated['currency'] = 'PHP';
        }
        if ($activeMatches->isNotEmpty()) {
            $allocationChanged = (isset($validated['category']) && $validated['category'] !== $aidRequest->category)
                || (isset($validated['request_type']) && $validated['request_type'] !== $aidRequest->request_type);
            $reservedQuantity = (int) $activeMatches->sum('matched_quantity');
            $reservedAmount = (float) $activeMatches->sum('matched_amount');
            if ($allocationChanged
                || (isset($validated['quantity_needed']) && $validated['quantity_needed'] < $reservedQuantity)
                || (isset($validated['amount_requested']) && $validated['amount_requested'] < $reservedAmount)) {
                throw ValidationException::withMessages([
                    'request' => 'Category and request type cannot change while aid is matched, and the requested total cannot be reduced below the amount already reserved or distributed.',
                ]);
            }
        }

        $aidRequest->update($validated);
        ActivityService::log($r->user(), 'edited support request content', $aidRequest);

        return new AidRequestResource($aidRequest->load(['beneficiary', 'verifiedBy']));
    }

    public function storeStaffIntake(Request $r)
    {
        $d = $r->validate([
            'donor_id' => 'nullable|exists:users,id,role,donor',
            'donor_name' => 'required_without:donor_id|string|max:255',
            'item_name' => 'required|string|max:255',
            'category' => 'required|string',
            'quantity' => 'required|integer|min:1',
            'condition_notes' => 'nullable|string',
            'storage_location' => 'required|string|max:255',
            'condition_grade' => 'required|in:new,like_new,good,fair,damaged',
            'intake_notes' => 'nullable|string',
            'expiry_date' => 'nullable|date',
        ]);

        $donation = Donation::create([
            'donor_id' => $d['donor_id'] ?? null,
            'external_donor_name' => empty($d['donor_id']) ? trim($d['donor_name']) : null,
            'item_name' => $d['item_name'],
            'category' => $d['category'],
            'quantity' => $d['quantity'],
            'condition_notes' => $d['condition_notes'] ?? null,
            'storage_location' => $d['storage_location'],
            'condition_grade' => $d['condition_grade'],
            'intake_notes' => $d['intake_notes'] ?? 'Physical intake processed by staff desk.',
            'expiry_date' => $d['expiry_date'] ?? null,
            'status' => 'pending_match',
            'availability_window' => 'Immediate Campus Warehouse Stock',
            'pickup_location' => $d['storage_location'],
        ]);

        InventoryMovement::create([
            'donation_id' => $donation->id,
            'staff_user_id' => $r->user()->id,
            'movement_type' => 'intake',
            'quantity_delta' => $donation->quantity,
            'quantity_after' => $donation->quantity,
            'reason' => 'Physical warehouse intake',
        ]);
        ActivityService::log($r->user(), 'processed physical item intake', $donation, [
            'movement_type' => 'intake', 'quantity_delta' => (int) $donation->quantity,
            'quantity_after' => (int) $donation->quantity,
        ]);

        return new DonationResource($donation->load('donor'));
    }

    public function updateDonationStock(Request $r, Donation $donation, MatchingService $s)
    {
        $quantityBefore = $donation->quantity;
        $d = $r->validate([
            'storage_location' => 'sometimes|required|string|max:255',
            'condition_grade' => 'sometimes|required|in:new,like_new,good,fair,damaged',
            'quantity' => 'sometimes|required|integer|min:0',
            'intake_notes' => 'nullable|string',
            'expiry_date' => 'nullable|date',
            'status' => 'sometimes|required|in:pending_intake,pending_match',
        ]);

        if (array_key_exists('quantity', $d)) {
            $reservedQuantity = (int) $donation->matches()
                ->whereIn('status', ['proposed', 'confirmed', 'fulfilled'])
                ->sum('matched_quantity');
            if ($d['quantity'] < $reservedQuantity) {
                throw ValidationException::withMessages([
                    'quantity' => "Stock cannot be reduced below the {$reservedQuantity} unit(s) already reserved or distributed.",
                ]);
            }
        }

        if (($d['status'] ?? null) === 'pending_intake'
            && $donation->status !== 'pending_intake'
            && $donation->matches()->whereIn('status', ['proposed', 'confirmed', 'fulfilled'])->exists()) {
            throw ValidationException::withMessages([
                'status' => 'An item with reserved or distributed aid cannot be returned to intake review.',
            ]);
        }

        $previousStatus = $donation->status;
        $donation->update($d);
        if ($previousStatus === 'pending_intake' && $donation->status === 'pending_match') {
            InventoryMovement::create([
                'donation_id' => $donation->id,
                'staff_user_id' => $r->user()->id,
                'movement_type' => 'intake',
                'quantity_delta' => (int) $donation->quantity,
                'quantity_after' => (int) $donation->quantity,
                'reason' => 'Donor-submitted contribution received and inspected by staff.',
            ]);
            ActivityService::log($r->user(), 'verified donation intake and released it for matching', $donation, [
                'movement_type' => 'intake', 'quantity_delta' => (int) $donation->quantity,
                'quantity_after' => (int) $donation->quantity,
            ]);
            if ($donation->donor) {
                AlertService::send($donation->donor, 'Campus staff received and verified your donation. It is now available for matching.', 'donation', 'normal', $donation, '/donations');
            }
            if (SystemSettings::get('auto_matching')) {
                // The donor's preferred request is prioritized by MatchingService.
                // Matching creates a proposal; an administrator still confirms it.
                $s->run();
            }
        }
        if (array_key_exists('quantity', $d) && $quantityBefore !== $donation->quantity) {
            InventoryMovement::create([
                'donation_id' => $donation->id,
                'staff_user_id' => $r->user()->id,
                'movement_type' => 'adjustment',
                'quantity_delta' => $donation->quantity - $quantityBefore,
                'quantity_after' => $donation->quantity,
                'reason' => $d['intake_notes'] ?? 'Staff stock adjustment',
            ]);
        }
        ActivityService::log($r->user(), 'updated inventory stock item', $donation, [
            'quantity_before' => (int) $quantityBefore,
            'quantity_after' => (int) $donation->quantity,
            'quantity_delta' => (int) $donation->quantity - (int) $quantityBefore,
            'status_before' => $previousStatus,
            'status_after' => $donation->status,
        ]);

        return new DonationResource($donation->refresh()->load('donor'));
    }

    public function matches()
    {
        return DonationMatchResource::collection(DonationMatch::with(['donation.donor', 'request.beneficiary', 'handedOffBy'])->latest()->paginate(50));
    }

    public function run(MatchingService $s)
    {
        if (!SystemSettings::get('auto_matching')) return ['created' => 0, 'message' => 'Automated matching is disabled in system settings.'];
        return ['created' => $s->run()];
    }

    public function updateMatch(Request $r, DonationMatch $match, MatchingService $s)
    {
        $d = $r->validate([
            'status' => 'required|in:confirmed,rejected',
            'pickup_hub' => 'nullable|string|max:255',
            'handoff_scheduled_at' => 'nullable|date',
            'handoff_notes' => 'nullable|string',
        ]);

        $previousStatus = $match->status;
        $match->update($d);

        if ($d['status'] === 'confirmed' && $previousStatus !== 'confirmed') {
            if ($match->donation->donor) {
                AlertService::send($match->donation->donor, 'Your donation match was confirmed.', 'match', 'normal', $match, '/matches');
            }
            AlertService::send($match->request->beneficiary, 'Your donation match was confirmed.', 'match', 'normal', $match, '/matches');
        }

        if ($d['status'] === 'rejected' && $previousStatus !== 'rejected') {
            if ($match->donation->donor) {
                AlertService::send($match->donation->donor, 'A donation match was cancelled by the operations team.', 'match', 'normal', $match, '/matches');
            }
            AlertService::send($match->request->beneficiary, 'A proposed support match was cancelled. Your request remains eligible for matching.', 'match', 'normal', $match, '/matches');
        }

        $s->refreshStatuses($match);
        ActivityService::log($r->user(), $d['status'] . ' match', $match, [
            'status_before' => $previousStatus,
            'status_after' => $match->status,
        ]);

        return new DonationMatchResource($match->load(['donation.donor', 'request.beneficiary', 'handedOffBy']));
    }

    public function verifyHandoffPin(Request $r, DonationMatch $match, MatchingService $s)
    {
        $d = $r->validate([
            'pin' => 'required|digits:6',
            'pickup_notes' => 'nullable|string',
        ]);

        abort_if($match->status === 'fulfilled', 422, 'This handoff has already been completed.');
        abort_unless($match->status === 'confirmed', 422, 'Confirm and schedule this match before completing the handoff.');
        abort_unless($match->handoff_scheduled_at, 422, 'Schedule the pickup before completing the handoff.');
        abort_if($match->handoff_scheduled_at->isFuture(), 422, 'This pickup is scheduled for a later time.');
        abort_if($match->pin_locked_at, 422, 'PIN verification is locked after too many invalid attempts. Escalate to a supervisor.');
        abort_if($match->pin_expires_at && $match->pin_expires_at->isPast(), 422, 'This pickup PIN has expired. Reschedule the pickup before releasing the item.');
        if (trim($d['pin']) !== trim($match->verification_pin)) {
            $attempts = $match->pin_attempt_count + 1;
            $match->update(['pin_attempt_count' => $attempts, 'pin_locked_at' => $attempts >= 5 ? now() : null]);
            ActivityService::log($r->user(), 'failed handoff PIN attempt', $match, ['attempt' => $attempts]);
            if ($attempts === 1 || $attempts >= 5) {
                $message = $attempts >= 5
                    ? 'A handoff PIN has been locked after five invalid attempts and requires supervisor attention.'
                    : 'A handoff PIN verification failed. Further attempts will be monitored.';
                AlertService::sendToRoles(['staff', 'admin'], $message, 'handoff', $attempts >= 5 ? 'high' : 'normal', $match, '/staff/handoffs');
            }
            return response()->json(['message' => 'Invalid 6-digit verification PIN entered.'], 422);
        }

        $match->update([
            'status' => 'fulfilled',
            'handed_off_by_user_id' => $r->user()->id,
            'handed_off_at' => now(),
            'pin_verified_at' => now(),
            'donor_completed_at' => now(),
            'beneficiary_completed_at' => now(),
            'handoff_notes' => ($match->handoff_notes ? $match->handoff_notes . " | " : "") . "Handoff verified by staff PIN clearance." . (!empty($d['pickup_notes']) ? " Staff remarks: " . $d['pickup_notes'] : ''),
        ]);

        $remainingStock = max(0, $match->donation->quantity - DonationMatch::where('donation_id', $match->donation_id)
            ->whereIn('status', ['proposed', 'confirmed', 'fulfilled'])
            ->sum('matched_quantity'));
        InventoryMovement::create([
            'donation_id' => $match->donation_id,
            'staff_user_id' => $r->user()->id,
            'movement_type' => 'allocation',
            'quantity_delta' => -$match->matched_quantity,
            'quantity_after' => $remainingStock,
            'reason' => 'Distributed through verified recipient handoff #' . $match->id,
        ]);

        $s->refreshStatuses($match);
        if ($match->donation->donor) {
            AlertService::send($match->donation->donor, 'Your donation has been physically collected and handed off!', 'handoff', 'normal', $match, '/donor/fulfillment');
        }
        AlertService::send($match->request->beneficiary, 'Your aid request item has been successfully handed off to you!', 'handoff', 'normal', $match, '/beneficiary/fulfillment');

        ActivityService::log($r->user(), 'completed handoff with PIN clearance', $match);

        return new DonationMatchResource($match->load(['donation.donor', 'request.beneficiary', 'handedOffBy']));
    }

    public function exportReportCsv()
    {
        $requests = AidRequest::with(['beneficiary', 'verifiedBy'])->get();
        $stream = fopen('php://temp', 'r+');
        fputcsv($stream, ['ID', 'Beneficiary Name', 'Category', 'Quantity Needed', 'Urgency', 'Status', 'Verification Tier', 'Verified By', 'Created At'], ',', '"', '');

        foreach ($requests as $req) {
            fputcsv($stream, [
                $req->id,
                $req->beneficiary->name ?? 'N/A',
                $req->category,
                $req->quantity_needed,
                $req->urgency,
                $req->status,
                $req->verification_tier ?? 'unverified',
                $req->verifiedBy->name ?? 'N/A',
                $req->created_at,
            ], ',', '"', '');
        }

        rewind($stream);
        $csv = stream_get_contents($stream);
        fclose($stream);

        return Response::make($csv, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="relieflink_staff_report_' . date('Y-m-d') . '.csv"',
        ]);
    }
}
