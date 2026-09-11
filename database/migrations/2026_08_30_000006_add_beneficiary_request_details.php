<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('requests', function (Blueprint $table) {
            $table->string('item_details')->nullable()->after('justification');
            $table->string('pickup_location')->nullable()->after('alternative_categories');
            $table->string('availability_window')->nullable()->after('pickup_location');
            $table->string('supporting_document_path')->nullable()->after('availability_window');
        });
    }

    public function down(): void
    {
        Schema::table('requests', function (Blueprint $table) {
            $table->dropColumn(['item_details', 'pickup_location', 'availability_window', 'supporting_document_path']);
        });
    }
};
