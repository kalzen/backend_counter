<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('room_persons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('room_id')->constrained('rooms')->onDelete('cascade');
            $table->foreignId('person_id')->constrained('persons')->onDelete('cascade');
            $table->string('counter_track_id')->unique(); // ID từ people counter
            $table->timestamps();
            
            $table->unique(['room_id', 'person_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop in correct order
        Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('room_persons');
        Schema::enableForeignKeyConstraints();
    }
};

