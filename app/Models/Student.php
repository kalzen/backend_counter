<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

class Student extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_code',
        'full_name',
        'class_name',
        'birth_date',
        'gender',
        'avatar_path',
        'contact_phone',
        'guardian_name',
        'guardian_phone',
        'notes',
        'scenario_group',
        'is_underage',
        'enrolled_at',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'enrolled_at' => 'date',
        'is_underage' => 'boolean',
    ];

    protected $appends = [
        'avatar_url',
        'age',
    ];

    public function cards(): HasMany
    {
        return $this->hasMany(StudentCard::class);
    }

    public function accessLogs(): HasMany
    {
        return $this->hasMany(AccessLog::class);
    }

    protected function avatarUrl(): Attribute
    {
        return Attribute::get(function (): ?string {
            if (!$this->avatar_path) {
                return null;
            }

            if (str_starts_with($this->avatar_path, 'http')) {
                return $this->avatar_path;
            }

            return asset('storage/' . ltrim($this->avatar_path, '/'));
        });
    }

    protected function age(): Attribute
    {
        return Attribute::get(function (): ?int {
            if (!$this->birth_date instanceof Carbon) {
                return null;
            }

            return $this->birth_date->age;
        });
    }
}
