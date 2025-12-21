<?php

namespace App\Http\Controllers;

use App\Models\AccessLog;
use App\Models\Student;
use App\Models\StudentCard;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $now = now();

        $stats = [
            'total_students' => Student::count(),
            'active_cards' => StudentCard::where('is_active', true)->count(),
            'weekly_violations' => AccessLog::where('result', 'violation')
                ->where('occurred_at', '>=', $now->copy()->subDays(7))
                ->count(),
            // MariaDB compatible JSON syntax
            'average_processing_time' => AccessLog::whereRaw("JSON_EXTRACT(metadata, '$.processing_time_seconds') IS NOT NULL")
                ->selectRaw("AVG(CAST(JSON_EXTRACT(metadata, '$.processing_time_seconds') AS DECIMAL(10,2))) as avg_time")
                ->value('avg_time'),
            'last_sync_at' => AccessLog::latest('occurred_at')->value('occurred_at'),
        ];

        $exportDefaults = [
            'start_date' => $now->copy()->subDays(7)->toDateString(),
            'end_date' => $now->toDateString(),
        ];

        $recentViolations = AccessLog::with(['student', 'studentCard'])
            ->where('result', 'violation')
            ->latest('occurred_at')
            ->limit(10)
            ->get()
            ->map(function (AccessLog $log) {
                $student = $log->student;

                $displayTimezone = config('app.timezone', 'Asia/Ho_Chi_Minh');
                $occurredAt = $log->occurred_at?->copy()->setTimezone($displayTimezone);
                $occurredAtDisplay = $occurredAt?->format('d/m/Y H:i:s');

                // Xử lý image_url: nếu có captured_image_path, tạo full URL
                $imageUrl = null;
                if ($log->captured_image_path) {
                    // Nếu đã là full URL (bắt đầu với http), dùng trực tiếp
                    if (str_starts_with($log->captured_image_path, 'http')) {
                        $imageUrl = $log->captured_image_path;
                    } else {
                        // Nếu là relative path, tạo asset URL
                        $imageUrl = asset($log->captured_image_path);
                    }
                }

                // Lấy thông tin từ metadata nếu student không có
                $metadata = $log->metadata ?? [];
                $studentName = $student?->full_name ?? $metadata['student_name'] ?? null;
                $studentCode = $student?->student_code ?? $metadata['card_code'] ?? null;
                $className = $student?->class_name ?? $metadata['student_class'] ?? null;
                $age = $log->student_age ?? ($student?->birth_date instanceof Carbon ? $student->birth_date->age : null);

                return [
                    'id' => $log->id,
                    'student_code' => $studentCode,
                    'full_name' => $studentName,
                    'class_name' => $className,
                    'age' => $age,
                    'occurred_at' => $occurredAt
                        ? $occurredAt->toIso8601String()
                        : null,
                    'occurred_at_display' => $occurredAtDisplay,
                    'license_plate_number' => $log->license_plate_number,
                    'has_license_plate' => $log->has_license_plate,
                    'violation_reason' => $log->violation_reason,
                    'image_url' => $imageUrl,
                ];
            })
            ->filter(function ($violation) {
                // Chỉ trả về các vi phạm có thông tin học sinh (ít nhất là tên hoặc mã)
                return !empty($violation['full_name']) || !empty($violation['student_code']);
            })
            ->values();

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'recentViolations' => $recentViolations,
            'exportDefaults' => $exportDefaults,
        ]);
    }
}
