<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Room;
use App\Models\Person;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create admin user
        User::firstOrCreate(
            ['email' => 'admin@gmail.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('123456a@'),
                'email_verified_at' => now(),
            ]
        );

        // Create sample rooms
        $room1 = Room::firstOrCreate(
            ['name' => 'Phòng họp A'],
            ['description' => 'Phòng họp tầng 1']
        );

        $room2 = Room::firstOrCreate(
            ['name' => 'Phòng họp B'],
            ['description' => 'Phòng họp tầng 2']
        );

        // Create sample persons
        $person1 = Person::firstOrCreate(
            ['name' => 'Nguyễn Văn A'],
            ['image_path' => null]
        );

        $person2 = Person::firstOrCreate(
            ['name' => 'Trần Thị B'],
            ['image_path' => null]
        );

        $person3 = Person::firstOrCreate(
            ['name' => 'Lê Văn C'],
            ['image_path' => null]
        );

        // Assign persons to rooms with counter track IDs
        $room1->persons()->syncWithoutDetaching([
            $person1->id => ['counter_track_id' => '1'],
            $person2->id => ['counter_track_id' => '2'],
        ]);

        $room2->persons()->syncWithoutDetaching([
            $person3->id => ['counter_track_id' => '3'],
            $person1->id => ['counter_track_id' => '4'],
        ]);
    }
}
