<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('donations', function (Blueprint $t) {
            $t->string('storage_location')->nullable()->after('pickup_location');
            $t->enum('condition_grade', ['new', 'like_new', 'good', 'fair', 'damaged'])->default('good')->after('storage_location');
            $t->text('intake_notes')->nullable()->after('condition_grade');
            $t->date('expiry_date')->nullable()->after('intake_notes');
        });

        Schema::table('requests', function (Blueprint $t) {
            $t->foreignId('verified_by_user_id')->nullable()->after('status')->constrained('users')->nullOnDelete();
            $t->enum('verification_tier', ['unverified', 'identity_verified', 'financial_hardship', 'emergency'])->default('unverified')->after('verified_by_user_id');
            $t->text('verification_notes')->nullable()->after('verification_tier');
            $t->string('student_id_number')->nullable()->after('verification_notes');
        });

        Schema::table('matches', function (Blueprint $t) {
            $t->string('pickup_hub')->nullable()->after('status');
            $t->string('verification_pin', 6)->nullable()->after('pickup_hub');
            $t->foreignId('handed_off_by_user_id')->nullable()->after('verification_pin')->constrained('users')->nullOnDelete();
            $t->timestamp('handed_off_at')->nullable()->after('handed_off_by_user_id');
        });
    }

    public function down(): void {
        Schema::table('matches', function (Blueprint $t) {
            $t->dropForeign(['handed_off_by_user_id']);
            $t->dropColumn(['pickup_hub', 'verification_pin', 'handed_off_by_user_id', 'handed_off_at']);
        });

        Schema::table('requests', function (Blueprint $t) {
            $t->dropForeign(['verified_by_user_id']);
            $t->dropColumn(['verified_by_user_id', 'verification_tier', 'verification_notes', 'student_id_number']);
        });

        Schema::table('donations', function (Blueprint $t) {
            $t->dropColumn(['storage_location', 'condition_grade', 'intake_notes', 'expiry_date']);
        });
    }
};
