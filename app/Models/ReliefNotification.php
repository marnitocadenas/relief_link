<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class ReliefNotification extends Model { protected $fillable=['user_id','message','type','priority','subject_type','subject_id','action_url','event_key','is_read','seen_at']; protected $casts=['is_read'=>'boolean','seen_at'=>'datetime']; public function user(){return $this->belongsTo(User::class);} }
