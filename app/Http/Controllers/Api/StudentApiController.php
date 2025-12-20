<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\StudentCard;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudentApiController extends Controller
{
    /**
     * Lấy thông tin học sinh theo card_code (mã thẻ).
     *
     * Endpoint: GET /api/students/{card_code}
     *
     * @param  string  $card_code  Mã thẻ từ ICLOCK 9000-G
     * @return JsonResponse
     */
    public function getByCardCode(string $card_code): JsonResponse
    {
        // Tìm thẻ học sinh theo card_code
        $card = StudentCard::where('card_code', $card_code)
            ->where('is_active', true)
            ->with('student')
            ->first();

        if (!$card || !$card->student) {
            return response()->json([
                'error' => 'Không tìm thấy học sinh với mã thẻ: ' . $card_code,
            ], 404);
        }

        $student = $card->student;

        // Trả về thông tin học sinh theo format mà Python đang expect
        return response()->json([
            'id' => $student->id,
            'card_code' => $card_code,
            'full_name' => $student->full_name,
            'date_of_birth' => $student->birth_date?->format('Y-m-d'),
            'dob' => $student->birth_date?->format('Y-m-d'), // Alias cho tương thích
            'class_name' => $student->class_name,
            'class' => $student->class_name, // Alias cho tương thích
            'lop' => $student->class_name, // Alias cho tương thích
            'student_code' => $student->student_code,
            'gender' => $student->gender,
            'age' => $student->birth_date?->age, // Tuổi tính tự động từ birth_date
        ]);
    }
}

