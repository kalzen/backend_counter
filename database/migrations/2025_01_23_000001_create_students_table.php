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
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->string('student_code')->unique();
            $table->string('full_name');
            $table->date('birth_date');
            $table->string('class_name');
            $table->enum('gender', ['male', 'female', 'other'])->nullable();
            $table->string('avatar_path')->nullable();
            $table->string('contact_phone')->nullable();
            $table->string('guardian_name')->nullable();
            $table->string('guardian_phone')->nullable();
            $table->text('notes')->nullable();
            $table->enum('scenario_group', ['A', 'B', 'C'])->default('A')->index();
            $table->boolean('is_underage')->default(false)->index();
            $table->date('enrolled_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('students');
        Schema::enableForeignKeyConstraints();
    }
};
