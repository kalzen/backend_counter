<?php

namespace App\Http\Controllers;

use App\Models\CounterLog;
use App\Models\Person;
use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CounterController extends Controller
{
    /**
     * Handle incoming counter events from people_counter
     */
    public function logEvent(Request $request)
    {
        try {
            $validated = $request->validate([
                'room_id' => 'required|exists:rooms,id',
                'track_id' => 'required|string',
                'direction' => 'required|in:in,out',
                'timestamp' => 'nullable|date',
            ]);

            // Try to find person by counter_track_id
            $person = Person::whereHas('rooms', function ($query) use ($validated) {
                $query->where('rooms.id', $validated['room_id'])
                      ->where('room_persons.counter_track_id', $validated['track_id']);
            })->first();

            // Create counter log
            CounterLog::create([
                'room_id' => $validated['room_id'],
                'counter_track_id' => $validated['track_id'],
                'person_id' => $person?->id,
                'direction' => $validated['direction'],
                'timestamp' => $validated['timestamp'] ?? now(),
            ]);

            return response()->json([
                'success' => true,
                'person_name' => $person?->name,
            ]);
        } catch (\Exception $e) {
            Log::error('Counter log error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Get current stats for all rooms
     */
    public function getStats()
    {
        $rooms = Room::with('counterLogs')
            ->get()
            ->map(function ($room) {
                return [
                    'id' => $room->id,
                    'name' => $room->name,
                    'current_count' => $room->current_count,
                    'in_count' => $room->in_count,
                    'out_count' => $room->out_count,
                ];
            });

        return response()->json([
            'success' => true,
            'rooms' => $rooms,
        ]);
    }

    /**
     * Get person name by room and track ID
     */
    public function getPersonName(Request $request)
    {
        $validated = $request->validate([
            'room_id' => 'required|exists:rooms,id',
            'track_id' => 'required|string',
        ]);

        $person = Person::whereHas('rooms', function ($query) use ($validated) {
            $query->where('rooms.id', $validated['room_id'])
                  ->where('room_persons.counter_track_id', $validated['track_id']);
        })->first();

        return response()->json([
            'success' => true,
            'person_name' => $person?->name ?? null,
        ]);
    }
}

