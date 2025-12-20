<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\StudentCard;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class CheckApiController extends Controller
{
    /**
     * API kiểm tra học sinh và trả về thông tin (tuổi, đủ 16 tuổi hay chưa).
     * 
     * Endpoint: POST /api/check
     * 
     * Request body (multipart/form-data):
     * - card_code: string (required) - Mã thẻ học sinh
     * - image: file (optional) - Ảnh từ camera (JPEG)
     * - timestamp: string (optional) - ISO 8601 timestamp
     * 
     * Response:
     * {
     *   "status": "ok",
     *   "student": {
     *     "id": 1,
     *     "card_code": "3183268",
     *     "full_name": "Nguyễn Văn A",
     *     "date_of_birth": "2010-05-15",
     *     "class_name": "10A1",
     *     "age": 15,
     *     "age_years": 15,
     *     "is_under_16": true
     *   }
     * }
     * 
     * @param  Request  $request
     * @return JsonResponse
     */
    public function check(Request $request): JsonResponse
    {
        // Validate request
        $validated = $request->validate([
            'card_code' => ['required', 'string'],
            'image' => ['nullable', 'image', 'mimes:jpeg,jpg,png', 'max:10240'], // Max 10MB
            'timestamp' => ['nullable', 'date'],
        ]);

        $card_code = $validated['card_code'];

        // Python gửi lên mã thẻ nhưng đó là mã HS (student_code) trên server
        // Tìm học sinh trực tiếp theo student_code trước
        $student = Student::where('student_code', $card_code)->first();

        // Nếu không tìm thấy, thử tìm qua StudentCard (để tương thích)
        if (!$student) {
            $card = StudentCard::where('card_code', $card_code)
                ->where('is_active', true)
                ->with('student')
                ->first();

            if ($card && $card->student) {
                $student = $card->student;
            }
        }

        if (!$student) {
            return response()->json([
                'status' => 'error',
                'error' => 'Không tìm thấy học sinh với mã: ' . $card_code,
            ], 404);
        }

        // Tính tuổi chính xác (theo năm, tháng, ngày)
        $age = null;
        $isUnder16 = false;
        
        if ($student->birth_date instanceof Carbon) {
            $today = Carbon::today();
            $birthDate = $student->birth_date;
            
            // Tính tuổi chính xác
            $age = $birthDate->diffInYears($today);
            
            // Kiểm tra xem đã đến sinh nhật trong năm nay chưa
            $birthdayThisYear = Carbon::create($today->year, $birthDate->month, $birthDate->day);
            if ($today->lt($birthdayThisYear)) {
                $age--; // Chưa đến sinh nhật, trừ 1 tuổi
            }
            
            // Kiểm tra dưới 16 tuổi
            $isUnder16 = $age < 16;
        }

        // Trả về thông tin học sinh
        return response()->json([
            'status' => 'ok',
            'student' => [
                'id' => $student->id,
                'card_code' => $card_code,
                'full_name' => $student->full_name,
                'date_of_birth' => $student->birth_date?->format('Y-m-d'),
                'dob' => $student->birth_date?->format('Y-m-d'), // Alias
                'class_name' => $student->class_name,
                'class' => $student->class_name, // Alias
                'student_code' => $student->student_code,
                'gender' => $student->gender,
                'age' => $age,
                'age_years' => $age, // Tên field mà Python đang expect
                'is_under_16' => $isUnder16,
            ],
        ]);
    }
}

