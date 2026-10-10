<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('donations', function (Blueprint $table) {
            $table->dropForeign(['donor_id']);
            $table->unsignedBigInteger('donor_id')->nullable()->change();
            $table->foreign('donor_id')->references('id')->on('users')->cascadeOnDelete();
            $table->string('external_donor_name')->nullable();
        });
    }

    public function down(): void
    {
        if (Schema::hasColumn('donations', 'external_donor_name')) {
            Schema::table('donations', function (Blueprint $table) {
                $table->dropColumn('external_donor_name');
            });
        }

        if (\Illuminate\Support\Facades\DB::table('donations')->whereNull('donor_id')->exists()) {
            throw new RuntimeException('Cannot roll back external donations while staff-recorded donations have no donor account.');
        }

        Schema::table('donations', function (Blueprint $table) {
            $table->dropForeign(['donor_id']);
            $table->unsignedBigInteger('donor_id')->nullable(false)->change();
            $table->foreign('donor_id')->references('id')->on('users')->cascadeOnDelete();
        });
    }
};
