<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Bring legacy values into the same canonical form used at registration
        // before MySQL enforces the new database-level guarantees.
        DB::table('users')->orderBy('id')->each(function ($user) {
            DB::table('users')->where('id', $user->id)->update([
                'email' => strtolower(trim($user->email)),
                'contact_number' => $user->contact_number ? trim($user->contact_number) : null,
                'campus_id' => $user->campus_id ? strtoupper(trim($user->campus_id)) : null,
            ]);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->unique('contact_number', 'users_contact_number_unique');
            $table->unique('campus_id', 'users_campus_id_unique');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique('users_contact_number_unique');
            $table->dropUnique('users_campus_id_unique');
        });
    }
};
