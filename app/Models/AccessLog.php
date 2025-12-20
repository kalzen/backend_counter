<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AccessLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'student_card_id',
        'occurred_at',
        'result',
        'has_license_plate',
        'license_plate_number',
        'captured_image_path',
        'violation_reason',
        'student_age',
        'metadata',
    ];

    protected $casts = [
        'occurred_at' => 'datetime',
        'has_license_plate' => 'boolean',
        'metadata' => 'array',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function studentCard(): BelongsTo
    {
        return $this->belongsTo(StudentCard::class);
    }
}
