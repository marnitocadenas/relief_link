<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('relief_notifications', function (Blueprint $table) {
            $table->string('type')->default('system')->index()->after('message');
            $table->string('priority')->default('normal')->index()->after('type');
            $table->string('subject_type')->nullable()->after('priority');
            $table->unsignedBigInteger('subject_id')->nullable()->after('subject_type');
            $table->string('action_url')->nullable()->after('subject_id');
            $table->index(['subject_type', 'subject_id']);
        });
    }

    public function down(): void
    {
        Schema::table('relief_notifications', function (Blueprint $table) {
            $table->dropIndex(['subject_type', 'subject_id']);
            $table->dropColumn(['type', 'priority', 'subject_type', 'subject_id', 'action_url']);
        });
    }
};
