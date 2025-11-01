<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Room extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
    ];

    /**
     * Get the persons in this room
     */
    public function persons(): BelongsToMany
    {
        return $this->belongsToMany(Person::class, 'room_persons')
            ->withPivot('counter_track_id')
            ->withTimestamps();
    }

    /**
     * Get counter logs for this room
     */
    public function counterLogs(): HasMany
    {
        return $this->hasMany(CounterLog::class);
    }

    /**
     * Get current count of people in the room
     */
    public function getCurrentCountAttribute(): int
    {
        $in = $this->counterLogs()->where('direction', 'in')->count();
        $out = $this->counterLogs()->where('direction', 'out')->count();
        return max(0, $in - $out);
    }

    /**
     * Get total IN count
     */
    public function getInCountAttribute(): int
    {
        return $this->counterLogs()->where('direction', 'in')->count();
    }

    /**
     * Get total OUT count
     */
    public function getOutCountAttribute(): int
    {
        return $this->counterLogs()->where('direction', 'out')->count();
    }
}

