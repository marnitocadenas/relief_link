<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('matches', function (Blueprint $table) {
            $table->unsignedTinyInteger('pin_attempt_count')->default(0)->after('verification_pin');
            $table->timestamp('pin_locked_at')->nullable()->after('pin_attempt_count');
            $table->timestamp('pin_verified_at')->nullable()->after('pin_locked_at');
            $table->timestamp('pin_expires_at')->nullable()->after('pin_verified_at');
        });
    }
    public function down(): void { Schema::table('matches', function (Blueprint $table) { $table->dropColumn(['pin_attempt_count','pin_locked_at','pin_verified_at','pin_expires_at']); }); }
};
