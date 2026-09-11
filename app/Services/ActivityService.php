<?php
namespace App\Services; use App\Models\ActivityLog; use App\Models\User; use Illuminate\Database\Eloquent\Model;
class ActivityService { public static function log(?User $user,string $action,?Model $subject=null,array $metadata=[]):void { ActivityLog::create(['user_id'=>$user?->id,'action'=>$action,'subject_type'=>$subject ? $subject::class : 'system','subject_id'=>$subject?->id,'metadata'=>$metadata]); } }
