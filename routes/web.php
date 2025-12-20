<?php

use App\Http\Controllers\CounterController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PersonController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\StatisticController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\ViolationController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');
    Route::get('students', [StudentController::class, 'index'])->name('students.index');
    Route::get('violations', [ViolationController::class, 'index'])->name('violations.index');
    Route::get('violations/export/pdf', [ViolationController::class, 'exportPdf'])->name('violations.export');
    Route::get('statistics', [StatisticController::class, 'index'])->name('statistics.index');

    // Room routes (giữ lại để tương thích các chức năng cũ nếu cần)
    Route::resource('rooms', RoomController::class);

    // Person routes (giữ lại để tương thích các chức năng cũ nếu cần)
    Route::resource('persons', PersonController::class)->except(['show', 'edit']);
    Route::post('persons/{person}/assign-room', [PersonController::class, 'assignToRoom'])->name('persons.assign-room');
    Route::delete('persons/{person}/remove-room', [PersonController::class, 'removeFromRoom'])->name('persons.remove-room');
});

// API routes cho thiết bị đếm người (giữ lại phục vụ demo phần cứng)
Route::prefix('api/counter')->group(function () {
    Route::post('log-event', [CounterController::class, 'logEvent'])->name('api.counter.log-event');
    Route::get('stats', [CounterController::class, 'getStats'])->name('api.counter.stats');
    Route::get('person-name', [CounterController::class, 'getPersonName'])->name('api.counter.person-name');
});

require __DIR__.'/settings.php';
// API routes được load tự động trong bootstrap/app.php, không cần require ở đây
