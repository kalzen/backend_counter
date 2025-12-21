<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AccessLog;
use App\Models\Student;
use App\Models\StudentCard;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ViolationApiController extends Controller
{
    /**
     * Ghi nhận vi phạm giao thông từ phần mềm Python.
     *
     * Endpoint: POST /api/violations
     *
     * Request body (multipart/form-data hoặc JSON):
     * - card_code: string (required)
     * - timestamp: string (ISO 8601, optional, mặc định là now)
     * - has_plate: boolean (required)
     * - is_violation: boolean (required)
     * - image: file (JPEG image, optional)
     * - student_id: integer (optional, nếu có sẽ dùng luôn)
     * - student_name: string (optional)
     * - student_class: string (optional)
     * - student_age: integer (optional)
     *
     * @param  Request  $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        // Validate request
        $validated = $request->validate([
            'card_code' => ['required', 'string'],
            'timestamp' => ['nullable', 'date'],
            'has_plate' => ['required', 'boolean'],
            'is_violation' => ['required', 'boolean'],
            'image' => ['nullable', 'image', 'mimes:jpeg,jpg,png', 'max:10240'], // Max 10MB
            'student_id' => ['nullable', 'integer', 'exists:students,id'],
            'student_name' => ['nullable', 'string'],
            'student_class' => ['nullable', 'string'],
            'student_age' => ['nullable', 'integer'],
        ]);

        // Tìm học sinh theo card_code (thực tế là student_code) nếu chưa có student_id
        $student = null;
        $studentCard = null;

        if ($validated['student_id']) {
            $student = Student::find($validated['student_id']);
        } else {
            // Python gửi lên card_code nhưng đó là mã HS (student_code) trên server
            // Tìm học sinh trực tiếp theo student_code trước
            $student = Student::where('student_code', $validated['card_code'])->first();

            // Nếu không tìm thấy, thử tìm qua StudentCard (để tương thích)
            if (!$student) {
                $studentCard = StudentCard::where('card_code', $validated['card_code'])
                    ->where('is_active', true)
                    ->with('student')
                    ->first();

                if ($studentCard && $studentCard->student) {
                    $student = $studentCard->student;
                }
            } else {
                // Nếu tìm thấy student, tìm studentCard tương ứng
                $studentCard = StudentCard::where('student_id', $student->id)
                    ->where('is_active', true)
                    ->first();
            }
        }

        // Xử lý ảnh nếu có
        $imagePath = null;
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $fileName = sprintf(
                'violations/%s_%s_%s.%s',
                date('Y-m-d'),
                Str::slug($validated['card_code']),
                Str::random(8),
                $image->getClientOriginalExtension()
            );
            // Lưu vào storage/app/public/violations/
            $storedPath = $image->storeAs('public/violations', basename($fileName));
            // Lưu path tương đối từ public để dễ truy cập
            $imagePath = 'storage/violations/' . basename($fileName);
        }

        // Xác định result: 'violation' hoặc 'valid'
        $result = $validated['is_violation'] ? 'violation' : 'valid';

        // Tạo violation reason nếu là vi phạm
        $violationReason = null;
        if ($validated['is_violation']) {
            if ($student) {
                $age = $validated['student_age'] ?? $student->birth_date?->age;
                $violationReason = sprintf(
                    'Học sinh %s (%d tuổi) điều khiển xe có biển số khi chưa đủ 16 tuổi',
                    $student->full_name,
                    $age ?? 'N/A'
                );
            } else {
                $violationReason = 'Học sinh dưới 16 tuổi điều khiển xe có biển số';
            }
        }

        // Tạo AccessLog
        $accessLog = AccessLog::create([
            'student_id' => $student?->id,
            'student_card_id' => $studentCard?->id,
            'occurred_at' => $validated['timestamp'] ?? now(),
            'result' => $result,
            'has_license_plate' => $validated['has_plate'],
            'license_plate_number' => null, // Có thể mở rộng để nhận diện OCR sau
            'captured_image_path' => $imagePath,
            'violation_reason' => $violationReason,
            'student_age' => $validated['student_age'] ?? $student?->birth_date?->age,
            'metadata' => [
                'card_code' => $validated['card_code'],
                'student_name' => $validated['student_name'] ?? $student?->full_name,
                'student_class' => $validated['student_class'] ?? $student?->class_name,
                'detected_at' => now()->toIso8601String(),
            ],
        ]);

        return response()->json([
            'status' => 'ok',
            'message' => $result === 'violation' ? 'Đã ghi nhận vi phạm' : 'Đã ghi nhận lượt vào hợp lệ',
            'access_log_id' => $accessLog->id,
            'result' => $result,
            'student' => $student ? [
                'id' => $student->id,
                'full_name' => $student->full_name,
                'class_name' => $student->class_name,
                'age' => $student->birth_date?->age,
            ] : null,
        ], 201);
    }
}

