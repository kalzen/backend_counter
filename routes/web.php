<?php

use App\Http\Controllers\RoomController;
use App\Http\Controllers\PersonController;
use App\Http\Controllers\CounterController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
    
    // Room routes
    Route::resource('rooms', RoomController::class);
    
    // Person routes
    Route::resource('persons', PersonController::class)->except(['show', 'edit']);
    Route::post('persons/{person}/assign-room', [PersonController::class, 'assignToRoom'])->name('persons.assign-room');
    Route::delete('persons/{person}/remove-room', [PersonController::class, 'removeFromRoom'])->name('persons.remove-room');
});

// API routes for people counter
Route::prefix('api/counter')->group(function () {
    Route::post('log-event', [CounterController::class, 'logEvent'])->name('api.counter.log-event');
    Route::get('stats', [CounterController::class, 'getStats'])->name('api.counter.stats');
    Route::get('person-name', [CounterController::class, 'getPersonName'])->name('api.counter.person-name');
});

require __DIR__.'/settings.php';
