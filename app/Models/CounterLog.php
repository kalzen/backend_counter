<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CounterLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'room_id',
        'counter_track_id',
        'person_id',
        'direction',
        'timestamp',
    ];

    protected $casts = [
        'timestamp' => 'datetime',
    ];

    /**
     * Get the room that owns this log
     */
    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    /**
     * Get the person that this log is for
     */
    public function person(): BelongsTo
    {
        return $this->belongsTo(Person::class);
    }
}

