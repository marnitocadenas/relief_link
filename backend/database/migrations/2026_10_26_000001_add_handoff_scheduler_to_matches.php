<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('matches', function (Blueprint $table) {
            $table->boolean('handoff_staff_scheduled')->default(false)->after('handoff_scheduled_at');
        });
        DB::table('matches')->whereNotNull('handoff_scheduled_at')->update(['handoff_staff_scheduled' => true]);
    }

    public function down(): void
    {
        Schema::table('matches', function (Blueprint $table) {
            $table->dropColumn('handoff_staff_scheduled');
        });
    }
};
