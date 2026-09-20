<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('requests', function (Blueprint $table) {
            $table->string('request_type')->default('physical')->after('beneficiary_id');
            $table->string('unit')->nullable()->after('quantity_needed');
            $table->decimal('amount_requested', 12, 2)->nullable()->after('unit');
            $table->string('currency', 10)->nullable()->default('PHP')->after('amount_requested');
            $table->text('purpose_of_funds')->nullable()->after('currency');
            $table->string('preferred_assistance_date')->nullable()->after('justification');
            $table->text('additional_info')->nullable()->after('item_details');
            $table->string('status')->default('pending_review')->change();
        });

        Schema::table('donations', function (Blueprint $table) {
            $table->string('donation_type')->default('physical')->after('donor_id');
            $table->decimal('amount', 12, 2)->nullable()->after('quantity');
            $table->string('currency', 10)->nullable()->default('PHP')->after('amount');
            $table->string('status')->default('pending_match')->change();
        });

        Schema::table('matches', function (Blueprint $table) {
            $table->decimal('matched_amount', 12, 2)->nullable()->after('matched_quantity');
            $table->string('status')->default('proposed')->change();
        });
    }

    public function down(): void
    {
        Schema::table('matches', function (Blueprint $table) {
            $table->dropColumn(['matched_amount']);
        });

        Schema::table('donations', function (Blueprint $table) {
            $table->dropColumn(['donation_type', 'amount', 'currency']);
        });

        Schema::table('requests', function (Blueprint $table) {
            $table->dropColumn([
                'request_type',
                'unit',
                'amount_requested',
                'currency',
                'purpose_of_funds',
                'preferred_assistance_date',
                'additional_info',
            ]);
        });
    }
};
