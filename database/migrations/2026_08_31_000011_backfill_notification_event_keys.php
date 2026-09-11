<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        $rows = DB::table('relief_notifications')->whereNull('event_key')->orderBy('id')->get();
        $processed = [];

        foreach ($rows as $row) {
            $key = hash('sha256', implode('|', [$row->type ?? 'system', $row->subject_type, $row->subject_id, $row->message]));
            $scope = $row->user_id.'|'.$key;

            if (isset($processed[$scope]) || DB::table('relief_notifications')->where('user_id', $row->user_id)->where('event_key', $key)->exists()) {
                DB::table('relief_notifications')->where('id', $row->id)->delete();
                continue;
            }

            DB::table('relief_notifications')->where('id', $row->id)->update(['event_key' => $key]);
            $processed[$scope] = true;
        }
    }

    public function down(): void
    {
        DB::table('relief_notifications')->update(['event_key' => null]);
    }
};
