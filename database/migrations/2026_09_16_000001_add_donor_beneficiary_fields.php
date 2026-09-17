<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('campus_role')->nullable()->after('role');
            $table->string('contact_number')->nullable()->after('campus_role');
            $table->string('campus_id')->nullable()->after('contact_number');
            $table->string('organization_name')->nullable()->after('campus_id');
            $table->string('other_role_specify')->nullable()->after('organization_name');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['campus_role', 'contact_number', 'campus_id', 'organization_name', 'other_role_specify']);
        });
    }
};