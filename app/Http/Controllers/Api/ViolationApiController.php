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
        try {
            // Validate request
            // Lưu ý: Python có thể gửi boolean dưới dạng string "True"/"False" hoặc integer 1/0
            try {
                $validated = $request->validate([
                    'card_code' => ['required', 'string'],
                    'timestamp' => ['nullable', 'date'],
                    'has_plate' => ['required'], // Không validate boolean ngay, sẽ convert sau
                    'is_violation' => ['required'], // Không validate boolean ngay, sẽ convert sau
                    'image' => ['nullable', 'image', 'mimes:jpeg,jpg,png', 'max:10240'], // Max 10MB
                    'student_id' => ['nullable', 'integer', 'exists:students,id'],
                    'student_name' => ['nullable', 'string'],
                    'student_class' => ['nullable', 'string'],
                    'student_age' => ['nullable', 'integer'],
                ]);
            } catch (\Illuminate\Validation\ValidationException $e) {
                \Log::error('Validation failed in ViolationApiController', [
                    'errors' => $e->errors(),
                    'request_data' => $request->all(),
                ]);
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $e->errors(),
                ], 422);
            }

            // Convert has_plate và is_violation sang boolean
            $validated['has_plate'] = filter_var($validated['has_plate'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? false;
            $validated['is_violation'] = filter_var($validated['is_violation'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? false;

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

        // Xử lý timestamp
        $occurredAt = null;
        if (!empty($validated['timestamp'])) {
            try {
                $occurredAt = \Carbon\Carbon::parse($validated['timestamp']);
            } catch (\Exception $e) {
                // Nếu parse lỗi, dùng now()
                $occurredAt = now();
            }
        } else {
            $occurredAt = now();
        }

        // Chuẩn bị metadata
        $metadata = [
            'card_code' => $validated['card_code'],
            'student_name' => $validated['student_name'] ?? $student?->full_name,
            'student_class' => $validated['student_class'] ?? $student?->class_name,
            'detected_at' => now()->toIso8601String(),
        ];

        // Tạo AccessLog với try-catch để bắt lỗi
        try {
            $accessLog = AccessLog::create([
                'student_id' => $student?->id,
                'student_card_id' => $studentCard?->id,
                'occurred_at' => $occurredAt,
                'result' => $result,
                'has_license_plate' => $validated['has_plate'] ? true : false, // Đảm bảo boolean
                'license_plate_number' => null, // Có thể mở rộng để nhận diện OCR sau
                'captured_image_path' => $imagePath,
                'violation_reason' => $violationReason,
                'student_age' => $validated['student_age'] ?? $student?->birth_date?->age,
                'metadata' => $metadata,
            ]);

            \Log::info('AccessLog created successfully', [
                'id' => $accessLog->id,
                'result' => $result,
                'student_id' => $accessLog->student_id,
                'card_code' => $validated['card_code'],
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
        } catch (\Exception $e) {
            \Log::error('Failed to create AccessLog', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'data' => [
                    'card_code' => $validated['card_code'],
                    'result' => $result,
                    'has_plate' => $validated['has_plate'],
                    'student_id' => $student?->id,
                ],
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Không thể tạo AccessLog: ' . $e->getMessage(),
                'error' => $e->getMessage(),
            ], 500);
        }
        } catch (\Exception $e) {
            \Log::error('Unexpected error in ViolationApiController', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all(),
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Lỗi server: ' . $e->getMessage(),
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}

