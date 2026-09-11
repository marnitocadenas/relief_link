<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('requests', function (Blueprint $table) {
            $table->string('verification_state')->default('pending')->after('verification_tier')->index();
            $table->json('verification_checklist')->nullable()->after('verification_state');
            $table->text('verification_decision_reason')->nullable()->after('verification_notes');
            $table->timestamp('verification_decided_at')->nullable()->after('verified_by_user_id');
        });
    }

    public function down(): void
    {
        Schema::table('requests', function (Blueprint $table) {
            $table->dropIndex(['verification_state']);
            $table->dropColumn(['verification_state', 'verification_checklist', 'verification_decision_reason', 'verification_decided_at']);
        });
    }
};
