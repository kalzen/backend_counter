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
            'average_processing_time' => AccessLog::whereNotNull('metadata->processing_time_seconds')
                ->avg('metadata->processing_time_seconds'),
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

                return [
                    'id' => $log->id,
                    'student_code' => $student?->student_code,
                    'full_name' => $student?->full_name,
                    'class_name' => $student?->class_name,
                    'age' => $student?->birth_date instanceof Carbon ? $student->birth_date->age : null,
                    'occurred_at' => $occurredAt
                        ? $occurredAt->toIso8601String()
                        : null,
                    'occurred_at_display' => $occurredAtDisplay,
                    'license_plate_number' => $log->license_plate_number,
                    'has_license_plate' => $log->has_license_plate,
                    'violation_reason' => $log->violation_reason,
                    'image_url' => $log->captured_image_path,
                ];
            });

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'recentViolations' => $recentViolations,
            'exportDefaults' => $exportDefaults,
        ]);
    }
}
