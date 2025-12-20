<?php

namespace App\Http\Controllers;

use App\Models\AccessLog;
use App\Models\Student;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    public function index(Request $request): Response
    {
        $students = Student::withCount([
                'accessLogs as violations_count' => fn ($query) => $query->where('result', 'violation'),
                'accessLogs as valid_count' => fn ($query) => $query->where('result', 'valid'),
            ])
            ->with(['accessLogs' => fn ($query) => $query->latest('occurred_at')->limit(1)])
            ->orderBy('full_name')
            ->paginate(20)
            ->through(function (Student $student) {
                $latestLog = $student->accessLogs->first();

                return [
                    'id' => $student->id,
                    'student_code' => $student->student_code,
                    'full_name' => $student->full_name,
                    'class_name' => $student->class_name,
                    'age' => $student->birth_date?->age,
                    'gender' => $student->gender,
                    'contact_phone' => $student->contact_phone,
                    'guardian_phone' => $student->guardian_phone,
                    'notes' => $student->notes,
                    'scenario_group' => $student->scenario_group,
                    'is_underage' => $student->is_underage,
                    'violations_count' => $student->violations_count,
                    'valid_count' => $student->valid_count,
                    'last_activity_at' => optional($latestLog?->occurred_at)->toIso8601String(),
                    'last_result' => $latestLog?->result,
                ];
            });

        $summary = [
            'total_students' => Student::count(),
            'total_violations' => AccessLog::where('result', 'violation')->count(),
            'total_valid' => AccessLog::where('result', 'valid')->count(),
            'underage_students' => Student::where('is_underage', true)->count(),
        ];

        return Inertia::render('Students/Index', [
            'students' => $students,
            'summary' => $summary,
        ]);
    }
}
