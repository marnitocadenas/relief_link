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
        // and resolve any duplicate values in legacy test data before MySQL enforces uniqueness.
        $seenContacts = [];
        $seenCampusIds = [];
        DB::table('users')->orderBy('id')->each(function ($user) use (&$seenContacts, &$seenCampusIds) {
            $contact = $user->contact_number ? trim($user->contact_number) : null;
            if ($contact !== null) {
                if (in_array($contact, $seenContacts, true)) {
                    $contact = $contact . '-dup-' . $user->id;
                } else {
                    $seenContacts[] = $contact;
                }
            }

            $campusId = $user->campus_id ? strtoupper(trim($user->campus_id)) : null;
            if ($campusId !== null) {
                if (in_array($campusId, $seenCampusIds, true)) {
                    $campusId = $campusId . '-DUP-' . $user->id;
                } else {
                    $seenCampusIds[] = $campusId;
                }
            }

            DB::table('users')->where('id', $user->id)->update([
                'email' => strtolower(trim($user->email)),
                'contact_number' => $contact,
                'campus_id' => $campusId,
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
