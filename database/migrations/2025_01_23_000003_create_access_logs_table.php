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
        Schema::create('access_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->nullable()->constrained('students')->nullOnDelete();
            $table->foreignId('student_card_id')->nullable()->constrained('student_cards')->nullOnDelete();
            $table->timestamp('occurred_at');
            $table->enum('result', ['valid', 'violation'])->default('valid');
            $table->boolean('has_license_plate')->default(false);
            $table->string('license_plate_number')->nullable();
            $table->string('captured_image_path')->nullable();
            $table->string('violation_reason')->nullable();
            $table->unsignedTinyInteger('student_age')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index('occurred_at');
            $table->index(['student_id', 'result']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('access_logs');
        Schema::enableForeignKeyConstraints();
    }
};
