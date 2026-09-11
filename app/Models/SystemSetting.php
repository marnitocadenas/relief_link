<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class SystemSetting extends Model { protected $fillable=['key','value','updated_by_user_id']; protected $casts=['value'=>'json']; public function updatedBy(){return $this->belongsTo(User::class,'updated_by_user_id');} }
