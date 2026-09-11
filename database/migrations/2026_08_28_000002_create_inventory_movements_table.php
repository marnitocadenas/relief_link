<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('inventory_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('donation_id')->constrained()->cascadeOnDelete();
            $table->foreignId('staff_user_id')->constrained('users')->restrictOnDelete();
            $table->enum('movement_type', ['intake', 'adjustment', 'allocation', 'return', 'write_off']);
            $table->integer('quantity_delta');
            $table->unsignedInteger('quantity_after');
            $table->string('reason')->nullable();
            $table->timestamps();
            $table->index(['donation_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_movements');
    }
};
