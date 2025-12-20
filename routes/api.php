<?php

use App\Http\Controllers\Api\CheckApiController;
use App\Http\Controllers\Api\StudentApiController;
use App\Http\Controllers\Api\ViolationApiController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes cho phần mềm Python
|--------------------------------------------------------------------------
|
| Các API này được gọi từ phần mềm Python để:
| - Lấy thông tin học sinh theo card_code
| - Kiểm tra học sinh (tuổi, đủ 16 tuổi hay chưa) - dùng cho external check
| - Ghi nhận vi phạm giao thông
|
*/

Route::prefix('api')->group(function () {
    // API lấy thông tin học sinh theo card_code
    Route::get('students/{card_code}', [StudentApiController::class, 'getByCardCode'])
        ->name('api.students.get-by-card-code');

    // API kiểm tra học sinh (nhận card_code + image, trả về thông tin học sinh)
    Route::post('check', [CheckApiController::class, 'check'])
        ->name('api.check');

    // API ghi nhận vi phạm
    Route::post('violations', [ViolationApiController::class, 'store'])
        ->name('api.violations.store');
});

