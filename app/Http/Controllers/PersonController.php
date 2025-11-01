<?php

namespace App\Http\Controllers;

use App\Models\Person;
use App\Models\Room;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PersonController extends Controller
{
    /**
     * Display a listing of the persons.
     */
    public function index(): Response
    {
        $persons = Person::with('rooms')->get()->map(function ($person) {
            return [
                'id' => $person->id,
                'name' => $person->name,
                'image_path' => $person->image_path,
                'image_url' => $person->image_url,
                'rooms_count' => $person->rooms->count(),
                'created_at' => $person->created_at,
                'updated_at' => $person->updated_at,
            ];
        });

        return Inertia::render('Persons/Index', [
            'persons' => $persons,
        ]);
    }

    /**
     * Store a newly created person in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'image_path' => 'nullable|string',
            'room_id' => 'required|exists:rooms,id',
            'counter_track_id' => 'required|string',
        ]);

        $person = Person::create([
            'name' => $validated['name'],
            'image_path' => $validated['image_path'],
        ]);

        // Attach to room
        $person->rooms()->attach($validated['room_id'], [
            'counter_track_id' => $validated['counter_track_id'],
        ]);

        return redirect()->back()->with('success', 'Person created and assigned successfully.');
    }

    /**
     * Update the specified person in storage.
     */
    public function update(Request $request, Person $person)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'image_path' => 'nullable|string',
        ]);

        $person->update($validated);

        return redirect()->back()->with('success', 'Person updated successfully.');
    }

    /**
     * Remove the specified person from storage.
     */
    public function destroy(Person $person)
    {
        $person->delete();

        return redirect()->back()->with('success', 'Person deleted successfully.');
    }

    /**
     * Assign person to a room
     */
    public function assignToRoom(Request $request, Person $person)
    {
        $validated = $request->validate([
            'room_id' => 'required|exists:rooms,id',
            'counter_track_id' => 'required|string',
        ]);

        $person->rooms()->syncWithoutDetaching([
            $validated['room_id'] => ['counter_track_id' => $validated['counter_track_id']],
        ]);

        return redirect()->back()->with('success', 'Person assigned to room successfully.');
    }

    /**
     * Remove person from a room
     */
    public function removeFromRoom(Request $request, Person $person)
    {
        $validated = $request->validate([
            'room_id' => 'required|exists:rooms,id',
        ]);

        $person->rooms()->detach($validated['room_id']);

        return redirect()->back()->with('success', 'Person removed from room successfully.');
    }
}

