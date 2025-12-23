<?php

namespace App\Http\Controllers;

use App\Models\AccessLog;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;
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

                // Map gender từ database (male/female/other) sang tiếng Việt để hiển thị
                $genderMap = [
                    'male' => 'Nam',
                    'female' => 'Nữ',
                    'other' => 'Khác',
                ];
                $gender = $student->gender ? ($genderMap[$student->gender] ?? $student->gender) : null;

                return [
                    'id' => $student->id,
                    'student_code' => $student->student_code,
                    'full_name' => $student->full_name,
                    'class_name' => $student->class_name,
                    'age' => $student->birth_date?->age,
                    'gender' => $gender,
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

    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_code' => [
                'required',
                'string',
                'max:50',
                Rule::unique('students', 'student_code'),
            ],
            'full_name' => ['required', 'string', 'max:255'],
            'class_name' => ['nullable', 'string', 'max:100'],
            'birth_date' => ['required', 'date', 'before:today'],
            'gender' => ['nullable', 'string', Rule::in(['Nam', 'Nữ', 'Khác', 'male', 'female', 'other'])],
            'contact_phone' => ['nullable', 'string', 'max:20'],
            'guardian_name' => ['nullable', 'string', 'max:255'],
            'guardian_phone' => ['nullable', 'string', 'max:20'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'scenario_group' => ['nullable', 'string', Rule::in(['A', 'B', 'C'])],
            'enrolled_at' => ['nullable', 'date'],
        ]);

        // Tính toán is_underage dựa trên birth_date
        $birthDate = Carbon::parse($validated['birth_date']);
        $age = $birthDate->age;
        $isUnderage = $age < 16;

        // Map gender từ tiếng Việt sang tiếng Anh (database format)
        $genderMap = [
            'Nam' => 'male',
            'Nữ' => 'female',
            'Khác' => 'other',
        ];
        $gender = $validated['gender'] ?? null;
        if ($gender && isset($genderMap[$gender])) {
            $gender = $genderMap[$gender];
        }

        // Tự động set enrolled_at nếu không có
        if (!isset($validated['enrolled_at'])) {
            $validated['enrolled_at'] = now();
        }

        $student = Student::create([
            'student_code' => $validated['student_code'],
            'full_name' => $validated['full_name'],
            'class_name' => $validated['class_name'] ?? null,
            'birth_date' => $validated['birth_date'],
            'gender' => $gender,
            'contact_phone' => $validated['contact_phone'] ?? null,
            'guardian_name' => $validated['guardian_name'] ?? null,
            'guardian_phone' => $validated['guardian_phone'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'scenario_group' => $validated['scenario_group'] ?? null,
            'is_underage' => $isUnderage,
            'enrolled_at' => $validated['enrolled_at'],
        ]);

        return redirect()
            ->route('students.index')
            ->with('success', "Đã thêm học sinh {$student->full_name} thành công!");
    }
}
