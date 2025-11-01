<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Person extends Model
{
    use HasFactory;

    protected $table = 'persons';

    protected $fillable = [
        'name',
        'image_path',
    ];

    /**
     * Get the rooms this person is assigned to
     */
    public function rooms(): BelongsToMany
    {
        return $this->belongsToMany(Room::class, 'room_persons')
            ->withPivot('counter_track_id')
            ->withTimestamps();
    }

    /**
     * Get counter logs for this person
     */
    public function counterLogs(): HasMany
    {
        return $this->hasMany(CounterLog::class);
    }

    /**
     * Get the image URL
     */
    public function getImageUrlAttribute(): ?string
    {
        if (!$this->image_path) {
            return null;
        }
        
        if (str_starts_with($this->image_path, 'http')) {
            return $this->image_path;
        }
        
        return asset('storage/' . $this->image_path);
    }
}

