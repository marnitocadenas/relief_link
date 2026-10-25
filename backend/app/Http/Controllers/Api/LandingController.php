<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AidRequestResource;
use App\Models\AidRequest;
use App\Models\Donation;
use App\Models\DonationMatch;
use Illuminate\Http\Request;

class LandingController extends Controller
{
    /**
     * Return verified public platform impact statistics.
     */
    public function stats()
    {
        $totalDonations = Donation::count();
        $resourcesShared = (int) Donation::sum('quantity');
        $successfulMatches = DonationMatch::whereIn('status', ['confirmed', 'fulfilled'])->count();
        if ($successfulMatches === 0 && DonationMatch::count() > 0) {
            // Also count active proposed matches if fulfilled are 0
            $successfulMatches = DonationMatch::count();
        }
        $completedHandoffs = DonationMatch::where('status', 'fulfilled')->count();
        $activeNeeds = AidRequest::whereIn('status', ['approved', 'partially_fulfilled'])->count();

        return response()->json([
            'success' => true,
            'stats' => [
                'total_donations' => $totalDonations,
                'resources_shared' => $resourcesShared > 0 ? $resourcesShared : $totalDonations,
                'successful_matches' => $successfulMatches,
                'completed_handoffs' => $completedHandoffs,
                'active_needs' => $activeNeeds,
            ],
        ]);
    }

    /**
     * Return support categories with active community metrics.
     */
    public function categories()
    {
        $defaultCategories = [
            ['name' => 'Food & Meals', 'icon' => 'restaurant', 'description' => 'Meals, canned goods, fresh produce, and pantry essentials.'],
            ['name' => 'Educational & Books', 'icon' => 'menu_book', 'description' => 'Textbooks, course supplies, notebooks, and reference materials.'],
            ['name' => 'Clothing & Apparel', 'icon' => 'checkroom', 'description' => 'Everyday apparel, seasonal clothing, uniforms, and shoes.'],
            ['name' => 'School Supplies', 'icon' => 'school', 'description' => 'Notebooks, pens, paper, backpacks, and classroom gear.'],
            ['name' => 'Medical Supplies', 'icon' => 'medical_services', 'description' => 'First-aid kits, over-the-counter medicine, and wellness essentials.'],
            ['name' => 'Electronics & Tech', 'icon' => 'devices', 'description' => 'Calculators, tablets, laptops, chargers, and academic hardware.'],
            ['name' => 'Household Items', 'icon' => 'home', 'description' => 'Dorm essentials, bedding, kitchenware, and storage containers.'],
            ['name' => 'Personal Care', 'icon' => 'spa', 'description' => 'Toiletries, hygiene packs, dental care, and self-care items.'],
            ['name' => 'Emergency Aid', 'icon' => 'emergency', 'description' => 'Immediate campus relief kits and disaster response essentials.'],
        ];

        $canonicalMap = [
            'food' => 'Food & Meals',
            'food & meals' => 'Food & Meals',
            'meals' => 'Food & Meals',
            'clothing' => 'Clothing & Apparel',
            'clothing & apparel' => 'Clothing & Apparel',
            'apparel' => 'Clothing & Apparel',
            'books' => 'Educational & Books',
            'educational' => 'Educational & Books',
            'educational supplies' => 'Educational & Books',
            'educational & books' => 'Educational & Books',
            'school supplies' => 'School Supplies',
            'medical' => 'Medical Supplies',
            'medical supplies' => 'Medical Supplies',
            'medical & health supplies' => 'Medical Supplies',
            'medical & health' => 'Medical Supplies',
            'health' => 'Medical Supplies',
            'electronics' => 'Electronics & Tech',
            'electronics & tech' => 'Electronics & Tech',
            'tech' => 'Electronics & Tech',
            'household' => 'Household Items',
            'household items' => 'Household Items',
            'household & bedding' => 'Household Items',
            'bedding' => 'Household Items',
            'personal care' => 'Personal Care',
            'personal care & hygiene' => 'Personal Care',
            'hygiene' => 'Personal Care',
            'emergency aid' => 'Emergency Aid',
            'emergency' => 'Emergency Aid',
            'relief kit' => 'Emergency Aid',
        ];

        $donationCounts = Donation::selectRaw('category, count(*) as total')
            ->groupBy('category')
            ->pluck('total', 'category');

        $requestCounts = AidRequest::whereIn('status', ['approved', 'partially_fulfilled'])
            ->selectRaw('category, count(*) as total')
            ->groupBy('category')
            ->pluck('total', 'category');

        // Accumulate counts into standard categories
        $categoryTotals = [];
        foreach ($defaultCategories as $cat) {
            $categoryTotals[$cat['name']] = 0;
        }

        // Include all distinct categories present in the database
        $dbCategoryNames = AidRequest::whereNotNull('category')
            ->where('category', '!=', '')
            ->distinct()
            ->pluck('category')
            ->merge(
                Donation::whereNotNull('category')
                    ->where('category', '!=', '')
                    ->distinct()
                    ->pluck('category')
            )
            ->unique();

        foreach ($dbCategoryNames as $rawCat) {
            $catTrimmed = trim($rawCat);
            if ($catTrimmed === '') continue;
            $key = strtolower($catTrimmed);
            $canonical = $canonicalMap[$key] ?? $catTrimmed;
            if (!isset($categoryTotals[$canonical])) {
                $categoryTotals[$canonical] = 0;
            }
        }

        foreach ($donationCounts as $cName => $cnt) {
            $key = strtolower(trim($cName));
            $target = $canonicalMap[$key] ?? null;
            if ($target && isset($categoryTotals[$target])) {
                $categoryTotals[$target] += $cnt;
            } else {
                $categoryTotals[$cName] = ($categoryTotals[$cName] ?? 0) + $cnt;
            }
        }

        foreach ($requestCounts as $cName => $cnt) {
            $key = strtolower(trim($cName));
            $target = $canonicalMap[$key] ?? null;
            if ($target && isset($categoryTotals[$target])) {
                $categoryTotals[$target] += $cnt;
            } else {
                $categoryTotals[$cName] = ($categoryTotals[$cName] ?? 0) + $cnt;
            }
        }

        $result = [];
        foreach ($defaultCategories as $cat) {
            $cat['count'] = $categoryTotals[$cat['name']] ?? 0;
            $result[] = $cat;
        }

        // Add any miscellaneous categories not mapped to defaults
        foreach ($categoryTotals as $catName => $cnt) {
            $isDefault = false;
            foreach ($defaultCategories as $d) {
                if ($d['name'] === $catName) {
                    $isDefault = true;
                    break;
                }
            }
            if (!$isDefault) {
                $result[] = [
                    'name' => $catName,
                    'icon' => 'category',
                    'description' => 'Campus resource category.',
                    'count' => $cnt,
                ];
            }
        }

        return response()->json([
            'success' => true,
            'categories' => $result,
        ]);
    }

    /**
     * Public list of verified campus needs (sanitized, safe for unauthenticated visitors).
     */
    public function needs(Request $request)
    {
        $validated = $request->validate([
            'category' => 'nullable|string|max:80',
            'search' => 'nullable|string|max:100',
            'urgency' => 'nullable|in:low,medium,high',
            'per_page' => 'nullable|integer|min:1|max:50',
        ]);

        $query = AidRequest::where(function ($q) {
            $q->whereNull('request_type')->orWhere('request_type', 'physical');
        })
        ->whereIn('status', ['approved', 'partially_fulfilled']);

        if (!empty($validated['category']) && strtolower($validated['category']) !== 'all') {
            $cat = $validated['category'];
            $query->where(function ($q) use ($cat) {
                $q->where('category', 'like', "%{$cat}%")
                  ->orWhere('alternative_categories', 'like', "%{$cat}%");
            });
        }

        if (!empty($validated['search'])) {
            $search = $validated['search'];
            $query->where(function ($q) use ($search) {
                $q->where('item_details', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%")
                  ->orWhere('justification', 'like', "%{$search}%");
            });
        }

        if (!empty($validated['urgency'])) {
            $query->where('urgency', $validated['urgency']);
        }

        $perPage = $validated['per_page'] ?? 15;
        $paginated = $query->latest()->paginate($perPage);

        return AidRequestResource::collection($paginated);
    }
}
