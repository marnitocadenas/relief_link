<?php
namespace App\Http\Resources; use Illuminate\Http\Resources\Json\JsonResource;
class UserResource extends JsonResource { public function toArray($r):array{return ['id'=>$this->id,'name'=>$this->name,'email'=>$this->email,'role'=>$this->role,'profile_photo_url'=>$this->profile_photo_path ? url('storage/'.$this->profile_photo_path) : null,'created_at'=>$this->created_at];} }
