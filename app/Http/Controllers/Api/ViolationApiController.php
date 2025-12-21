<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AccessLog;
use App\Models\Student;
use App\Models\StudentCard;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
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
                    'student_age' => ['nullable', 'numeric'], // Cho phép float hoặc integer
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
            try {
                $image = $request->file('image');
                $fileName = sprintf(
                    '%s_%s_%s.%s',
                    date('Y-m-d'),
                    Str::slug($validated['card_code']),
                    Str::random(8),
                    $image->getClientOriginalExtension()
                );
                
                // Đảm bảo thư mục violations tồn tại
                $violationsDir = storage_path('app/public/violations');
                if (!file_exists($violationsDir)) {
                    File::makeDirectory($violationsDir, 0755, true);
                    \Log::info('Created violations directory', ['path' => $violationsDir]);
                }
                
                // Lưu vào storage/app/public/violations/
                // storeAs('public/violations', ...) sẽ lưu vào storage/app/public/violations/
                $storedPath = $image->storeAs('public/violations', $fileName);
                
                // Kiểm tra xem file có được lưu không
                if ($storedPath && Storage::disk('public')->exists('violations/' . $fileName)) {
                    // Dùng Storage::url() để tạo URL đúng (tự động xử lý storage link)
                    // Storage::url() sẽ trả về URL dạng /storage/violations/filename.jpg
                    $imagePath = Storage::disk('public')->url('violations/' . $fileName);
                    
                    // Đảm bảo path không có dấu / ở đầu (để tương thích với asset())
                    $imagePath = ltrim($imagePath, '/');
                    
                    \Log::info('Image saved successfully', [
                        'stored_path' => $storedPath,
                        'image_path' => $imagePath,
                        'full_url' => asset($imagePath),
                        'file_name' => $fileName,
                        'file_size' => Storage::disk('public')->size('violations/' . $fileName),
                        'file_exists' => Storage::disk('public')->exists('violations/' . $fileName),
                        'absolute_path' => Storage::disk('public')->path('violations/' . $fileName),
                    ]);
                } else {
                    \Log::error('Failed to save image or file not found', [
                        'stored_path' => $storedPath,
                        'file_name' => $fileName,
                        'expected_path' => 'violations/' . $fileName,
                        'exists_check' => $storedPath ? Storage::disk('public')->exists('violations/' . $fileName) : false,
                        'violations_dir_exists' => file_exists($violationsDir),
                        'violations_dir_writable' => is_writable($violationsDir),
                    ]);
                }
            } catch (\Exception $e) {
                \Log::error('Error saving image', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);
                // Không throw exception, chỉ log lỗi để không làm gián đoạn việc tạo AccessLog
            }
        }

        // Xác định result: 'violation' hoặc 'valid'
        $result = $validated['is_violation'] ? 'violation' : 'valid';

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

        // Tính tuổi: ưu tiên từ request, nếu không có thì tự tính từ student
        $studentAge = null;
        if (isset($validated['student_age']) && $validated['student_age'] !== null && $validated['student_age'] !== '') {
            // Nếu có gửi từ Python, convert sang integer (có thể là float như 15.54)
            $studentAge = (int) round((float) $validated['student_age']);
        } elseif ($student && $student->birth_date) {
            // Tự tính tuổi từ birth_date (chính xác theo năm, tháng, ngày)
            $today = \Carbon\Carbon::today();
            $birthDate = \Carbon\Carbon::parse($student->birth_date);
            $age = $birthDate->diffInYears($today);
            // Kiểm tra xem đã đến sinh nhật trong năm nay chưa
            $birthdayThisYear = \Carbon\Carbon::create($today->year, $birthDate->month, $birthDate->day);
            if ($today->lt($birthdayThisYear)) {
                $age--; // Chưa đến sinh nhật, trừ 1 tuổi
            }
            $studentAge = $age;
        }

        // Tạo violation reason nếu là vi phạm
        $violationReason = null;
        if ($validated['is_violation']) {
            if ($student) {
                $age = $studentAge ?? ($student->birth_date ? $student->birth_date->age : null);
                $violationReason = sprintf(
                    'Học sinh %s (%d tuổi) điều khiển xe có biển số khi chưa đủ 16 tuổi',
                    $student->full_name,
                    $age ?? 'N/A'
                );
            } else {
                $violationReason = 'Học sinh dưới 16 tuổi điều khiển xe có biển số';
            }
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
                'student_age' => $studentAge, // Tự tính từ student nếu không có từ request
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

