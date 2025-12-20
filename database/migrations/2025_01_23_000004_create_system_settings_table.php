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
        Schema::create('counter_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('room_id')->constrained('rooms')->onDelete('cascade');
            $table->string('counter_track_id')->nullable(); // ID từ people counter
            $table->foreignId('person_id')->nullable()->constrained('persons')->onDelete('set null');
            $table->enum('direction', ['in', 'out']);
            $table->timestamp('timestamp');
            $table->timestamps();
            
            $table->index('room_id');
            $table->index('timestamp');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop in correct order
        Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('counter_logs');
        Schema::enableForeignKeyConstraints();
    }
};

