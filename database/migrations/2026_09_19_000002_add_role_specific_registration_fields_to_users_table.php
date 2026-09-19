<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('address')->nullable()->after('campus_id');
            $table->string('student_id_number')->nullable()->unique()->after('address');
            $table->string('school_email')->nullable()->after('student_id_number');
            $table->string('department')->nullable()->after('school_email');
            $table->string('course')->nullable()->after('department');
            $table->string('year_level', 50)->nullable()->after('course');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['student_id_number']);
            $table->dropColumn(['address', 'student_id_number', 'school_email', 'department', 'course', 'year_level']);
        });
    }
};
