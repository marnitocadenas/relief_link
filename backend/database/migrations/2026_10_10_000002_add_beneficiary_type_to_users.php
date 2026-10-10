<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('beneficiary_type', 20)->nullable()->after('student_id_number');
        });

        DB::table('users')
            ->where('role', 'beneficiary')
            ->whereNotNull('student_id_number')
            ->update(['beneficiary_type' => 'student']);
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('beneficiary_type');
        });
    }
};
