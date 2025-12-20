<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentCard extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'card_code',
        'card_type',
        'issued_at',
        'expires_at',
        'is_active',
    ];

    protected $casts = [
        'issued_at' => 'date',
        'expires_at' => 'date',
        'is_active' => 'boolean',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }
}
