<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
 public function up(): void {
  Schema::create('donations', function (Blueprint $t) { $t->id(); $t->foreignId('donor_id')->constrained('users')->cascadeOnDelete(); $t->string('item_name'); $t->string('category')->index(); $t->unsignedInteger('quantity'); $t->text('condition_notes')->nullable(); $t->string('availability_window')->nullable(); $t->enum('status',['pending_match','proposed','matched','fulfilled'])->default('pending_match')->index(); $t->timestamps(); });
  Schema::create('requests', function (Blueprint $t) { $t->id(); $t->foreignId('beneficiary_id')->constrained('users')->cascadeOnDelete(); $t->string('category')->index(); $t->unsignedInteger('quantity_needed'); $t->enum('urgency',['low','medium','high'])->default('medium'); $t->text('justification'); $t->enum('status',['pending_review','approved','rejected','proposed','matched','fulfilled'])->default('pending_review')->index(); $t->timestamps(); });
  Schema::create('matches', function (Blueprint $t) { $t->id(); $t->foreignId('donation_id')->constrained('donations')->cascadeOnDelete(); $t->foreignId('request_id')->constrained('requests')->cascadeOnDelete(); $t->unsignedInteger('matched_quantity'); $t->enum('status',['proposed','confirmed','rejected','fulfilled'])->default('proposed')->index(); $t->timestamps(); });
  Schema::create('relief_notifications', function (Blueprint $t) { $t->id(); $t->foreignId('user_id')->constrained()->cascadeOnDelete(); $t->string('message'); $t->boolean('is_read')->default(false); $t->timestamps(); });
 }
 public function down(): void { Schema::dropIfExists('relief_notifications'); Schema::dropIfExists('matches'); Schema::dropIfExists('requests'); Schema::dropIfExists('donations'); }
};
