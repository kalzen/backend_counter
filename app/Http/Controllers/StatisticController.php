<?php

namespace App\Http\Controllers;

use App\Models\AccessLog;
use App\Models\Student;
use App\Models\StudentCard;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StatisticController extends Controller
{
    public function index(Request $request): Response
    {
        $now = now();

        // MariaDB compatible JSON syntax
        $violationsByGroup = AccessLog::selectRaw("JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.scenario_group')) as scenario_group, count(*) as total")
            ->groupBy('scenario_group')
            ->pluck('total', 'scenario_group')
            ->toArray();

        $dailyViolations = AccessLog::where('occurred_at', '>=', $now->copy()->subDays(7))
            ->orderBy('occurred_at')
            ->get()
            ->groupBy(fn ($log) => $log->occurred_at?->toDateString())
            ->map(fn ($group) => [
                'violations' => $group->where('result', 'violation')->count(),
                'valid' => $group->where('result', 'valid')->count(),
            ])
            ->toArray();

        $stats = [
            'total_students' => Student::count(),
            'active_cards' => StudentCard::where('is_active', true)->count(),
            'violations_total' => AccessLog::where('result', 'violation')->count(),
            'valid_total' => AccessLog::where('result', 'valid')->count(),
        ];

        $totalChecks = array_sum($violationsByGroup);
        // MariaDB compatible JSON syntax
        $missedViolations = AccessLog::whereRaw("JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.scenario_group')) = ?", ['B'])
            ->where('result', 'valid')
            ->count();
        $truePositives = $stats['violations_total'];
        $trueNegatives = $totalChecks - $truePositives - $missedViolations;

        // MariaDB compatible JSON syntax
        $falsePositives = AccessLog::whereRaw("JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.scenario_group')) != ? OR JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.scenario_group')) IS NULL", ['B'])
            ->where('result', 'violation')
            ->count();

        $metrics = [
            'accuracy' => $totalChecks > 0 ? round((($truePositives + $trueNegatives) / $totalChecks) * 100, 1) : null,
            'recall' => ($truePositives + $missedViolations) > 0 ? round(($truePositives / ($truePositives + $missedViolations)) * 100, 1) : null,
            'precision' => ($truePositives + $falsePositives) > 0 ? round(($truePositives / ($truePositives + $falsePositives)) * 100, 1) : null,
            // MariaDB compatible JSON syntax
            'average_processing_time' => round(
                AccessLog::whereRaw("JSON_EXTRACT(metadata, '$.processing_time_seconds') IS NOT NULL")
                    ->selectRaw("AVG(CAST(JSON_EXTRACT(metadata, '$.processing_time_seconds') AS DECIMAL(10,2))) as avg_time")
                    ->value('avg_time') ?? 0,
                2
            ),
        ];

        return Inertia::render('Statistics/Index', [
            'stats' => $stats,
            'violationsByGroup' => $violationsByGroup,
            'dailyViolations' => $dailyViolations,
            'metrics' => $metrics,
        ]);
    }
}
