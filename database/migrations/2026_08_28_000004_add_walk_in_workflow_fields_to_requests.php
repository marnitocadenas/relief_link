<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('requests', function (Blueprint $table) {
            $table->boolean('is_walk_in')->default(false)->after('status')->index();
            $table->string('walk_in_status')->nullable()->after('is_walk_in')->index();
            $table->foreignId('created_by_staff_id')->nullable()->after('verified_by_user_id')->constrained('users')->nullOnDelete();
            $table->text('staff_internal_notes')->nullable()->after('verification_notes');
            $table->string('referral_destination')->nullable()->after('staff_internal_notes');
        });
    }

    public function down(): void
    {
        Schema::table('requests', function (Blueprint $table) {
            $table->dropForeign(['created_by_staff_id']);
            $table->dropIndex(['is_walk_in']);
            $table->dropIndex(['walk_in_status']);
            $table->dropColumn(['is_walk_in', 'walk_in_status', 'created_by_staff_id', 'staff_internal_notes', 'referral_destination']);
        });
    }
};
