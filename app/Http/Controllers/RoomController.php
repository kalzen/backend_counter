<?php

namespace App\Http\Controllers;

use App\Models\Room;
use App\Models\Person;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RoomController extends Controller
{
    /**
     * Display a listing of the rooms.
     */
    public function index(): Response
    {
        $rooms = Room::withCount('persons')
            ->with('counterLogs')
            ->get()
            ->map(function ($room) {
                return [
                    'id' => $room->id,
                    'name' => $room->name,
                    'description' => $room->description,
                    'persons_count' => $room->persons_count,
                    'current_count' => $room->current_count,
                    'in_count' => $room->in_count,
                    'out_count' => $room->out_count,
                    'created_at' => $room->created_at,
                    'updated_at' => $room->updated_at,
                ];
            });

        return Inertia::render('Rooms/Index', [
            'rooms' => $rooms,
        ]);
    }

    /**
     * Show the form for creating a new room.
     */
    public function create(): Response
    {
        return Inertia::render('Rooms/Create');
    }

    /**
     * Store a newly created room in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        Room::create($validated);

        return redirect()->route('rooms.index')
            ->with('success', 'Room created successfully.');
    }

    /**
     * Display the specified room.
     */
    public function show(Room $room): Response
    {
        $room->load('persons', 'counterLogs.person');
        
        // Get all persons for assignment
        $allPersons = Person::all()->map(function ($person) {
            return [
                'id' => $person->id,
                'name' => $person->name,
                'image_path' => $person->image_path,
            ];
        });
        
        return Inertia::render('Rooms/Show', [
            'room' => [
                'id' => $room->id,
                'name' => $room->name,
                'description' => $room->description,
                'current_count' => $room->current_count,
                'in_count' => $room->in_count,
                'out_count' => $room->out_count,
                'persons' => $room->persons->map(function ($person) {
                    return [
                        'id' => $person->id,
                        'name' => $person->name,
                        'image_path' => $person->image_path,
                        'counter_track_id' => $person->pivot->counter_track_id,
                    ];
                }),
                'recent_logs' => $room->counterLogs()
                    ->with('person')
                    ->latest('timestamp')
                    ->take(20)
                    ->get()
                    ->map(function ($log) {
                        return [
                            'id' => $log->id,
                            'person_name' => $log->person?->name ?? 'Unknown',
                            'direction' => $log->direction,
                            'timestamp' => $log->timestamp,
                        ];
                    }),
            ],
            'allPersons' => $allPersons,
        ]);
    }

    /**
     * Show the form for editing the specified room.
     */
    public function edit(Room $room): Response
    {
        $room->load('persons');
        
        return Inertia::render('Rooms/Edit', [
            'room' => [
                'id' => $room->id,
                'name' => $room->name,
                'description' => $room->description,
                'persons' => $room->persons->map(function ($person) {
                    return [
                        'id' => $person->id,
                        'name' => $person->name,
                        'image_path' => $person->image_path,
                        'counter_track_id' => $person->pivot->counter_track_id,
                    ];
                }),
            ],
        ]);
    }

    /**
     * Update the specified room in storage.
     */
    public function update(Request $request, Room $room)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $room->update($validated);

        return redirect()->route('rooms.index')
            ->with('success', 'Room updated successfully.');
    }

    /**
     * Remove the specified room from storage.
     */
    public function destroy(Room $room)
    {
        $room->delete();

        return redirect()->route('rooms.index')
            ->with('success', 'Room deleted successfully.');
    }
}

