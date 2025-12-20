<?php

namespace App\Http\Controllers;

use Barryvdh\DomPDF\Facade\Pdf;
use App\Models\AccessLog;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ViolationController extends Controller
{
    public function index(Request $request): Response
    {
        $logs = AccessLog::with('student')
            ->orderByDesc('occurred_at')
            ->paginate(20)
            ->through(function (AccessLog $log) {
                $student = $log->student;

                return [
                    'id' => $log->id,
                    'occurred_at' => optional($log->occurred_at)->toIso8601String(),
                    'result' => $log->result,
                    'has_license_plate' => $log->has_license_plate,
                    'license_plate_number' => $log->license_plate_number,
                    'violation_reason' => $log->violation_reason,
                    'student' => $student ? [
                        'id' => $student->id,
                        'student_code' => $student->student_code,
                        'full_name' => $student->full_name,
                        'class_name' => $student->class_name,
                        'age' => $student->birth_date instanceof Carbon ? $student->birth_date->age : null,
                    ] : null,
                    'metadata' => $log->metadata,
                ];
            });

        return Inertia::render('Violations/Index', [
            'logs' => $logs,
        ]);
    }

    public function exportPdf(Request $request)
    {
        $validated = $request->validate([
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date'],
        ]);

        $now = now();
        $startInput = $validated['start_date'] ?? null;
        $endInput = $validated['end_date'] ?? null;

        $startDate = $startInput ? Carbon::parse($startInput)->startOfDay() : $now->copy()->subDays(7)->startOfDay();
        $endDate = $endInput ? Carbon::parse($endInput)->endOfDay() : $now->copy()->endOfDay();

        if ($startDate->greaterThan($endDate)) {
            [$startDate, $endDate] = [$endDate->copy()->startOfDay(), $startDate->copy()->endOfDay()];
        }

        $logs = AccessLog::with('student')
            ->where('result', 'violation')
            ->whereBetween('occurred_at', [$startDate, $endDate])
            ->orderBy('occurred_at')
            ->get();

        $summary = [
            'total' => $logs->count(),
            'unique_students' => $logs->pluck('student_id')->filter()->unique()->count(),
            'by_class' => $logs->groupBy(fn (AccessLog $log) => $log->student?->class_name ?? 'Không rõ')->map->count()->sortDesc(),
        ];

        $filters = [
            'start_date' => $startDate,
            'end_date' => $endDate,
            'generated_at' => $now,
        ];

        $logsForExport = $logs->map(function (AccessLog $log) {
            $student = $log->student;
            $imageSrc = $this->resolveImageSource($log->captured_image_path);

            return [
                'occurred_at' => optional($log->occurred_at)->format('d/m/Y H:i'),
                'student_name' => $student?->full_name ?? 'Không rõ',
                'student_code' => $student?->student_code ?? 'N/A',
                'class_name' => $student?->class_name ?? 'Không rõ',
                'age' => $log->student_age ?? ($student?->birth_date?->age),
                'license_plate' => $log->has_license_plate ? ($log->license_plate_number ?? 'Không xác định') : 'Không biển số',
                'violation_reason' => $log->violation_reason ?? ($log->metadata['note'] ?? '—'),
                'image_src' => $imageSrc,
            ];
        });

        $pdf = Pdf::loadView('reports.violations', [
            'logs' => $logsForExport,
            'summary' => $summary,
            'filters' => $filters,
        ])->setPaper('a4', 'portrait');

        $fileName = sprintf(
            'bao-cao-vi-pham_%s_%s.pdf',
            $startDate->format('Ymd'),
            $endDate->format('Ymd')
        );

        return $pdf->download($fileName);
    }

    private function resolveImageSource(?string $path): ?string
    {
        if (blank($path)) {
            return null;
        }

        $relativePath = ltrim($path, '/');
        $publicCandidate = public_path($relativePath);

        $storageCandidate = $relativePath;
        if (Str::startsWith($storageCandidate, 'storage/')) {
            $storageCandidate = Str::after($storageCandidate, 'storage/');
        }
        $storageCandidate = storage_path('app/public/' . ltrim($storageCandidate, '/'));

        $filePath = null;
        if (file_exists($publicCandidate)) {
            $filePath = $publicCandidate;
        } elseif (file_exists($storageCandidate)) {
            $filePath = $storageCandidate;
        }

        if (!$filePath || !is_readable($filePath)) {
            return null;
        }

        $mime = mime_content_type($filePath);
        $data = base64_encode(file_get_contents($filePath));

        return "data:{$mime};base64,{$data}";
    }
}
