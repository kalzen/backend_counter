<?php

namespace Database\Seeders;

use App\Models\AccessLog;
use App\Models\Student;
use App\Models\StudentCard;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;

class StudentSeeder extends Seeder
{
    private int $cardSequence = 0;
    private Carbon $now;
    private Carbon $underageCutoff;
    private Carbon $underageMinDate;
        private Carbon $underageMaxDate;
        private Carbon $adultMinDate;
        private Carbon $adultMaxDate;
        private Carbon $violationStartAt;
        private Carbon $violationEndAt;
        private Carbon $nextLogTimestamp;

    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        AccessLog::truncate();
        StudentCard::truncate();
        Student::truncate();
        Schema::enableForeignKeyConstraints();

            date_default_timezone_set('Asia/Ho_Chi_Minh');

            $this->configureAgeBoundaries();

        $datasetPath = database_path('data/students_b8_b12_b3.json');

        if (!File::exists($datasetPath)) {
            $this->command?->error('Không tìm thấy file dữ liệu students_b8_b12_b3.json trong thư mục database/data.');
            return;
        }

        $records = collect(json_decode(File::get($datasetPath), true))
            ->filter(fn (array $row) => filled($row['student_code'] ?? null) && filled($row['full_name'] ?? null))
            ->values();

        if ($records->count() < 100) {
            $this->command?->error('Danh sách mẫu phải có ít nhất 100 học sinh.');
            return;
        }

        $groups = [
            'A' => $records->slice(0, 40)->values(),
            'B' => $records->slice(40, 30)->values(),
            'C' => $records->slice(70, 30)->values(),
        ];

        $detectedViolationTarget = 28; // nhóm B: 28/30 phát hiện đúng
        $violationImages = [
            'storage/violations/vipham1.jpg',
            'storage/violations/vipham2.jpg',
            'storage/violations/vipham3.jpeg',
            'storage/violations/vipham4.png',
            'storage/violations/vipham5.png',
        ];
        $violationImageCount = count($violationImages);
        $violationPlateNumber = '15-MD1 642.81';

        foreach ($groups as $groupKey => $groupRecords) {
            foreach ($groupRecords as $index => $record) {
                $birthDate = $this->generateBirthDate($groupKey, $record['birth_date'] ?? null);
                $studentAge = $this->calculateAge($birthDate);

                $student = Student::create([
                    'student_code' => (string) $record['student_code'],
                    'full_name' => $record['full_name'] ?? 'Không rõ',
                    'class_name' => $record['class_name'] ?? $this->defaultClassName($groupKey),
                    'birth_date' => $birthDate,
                    'gender' => $this->normalizeGender($record['gender'] ?? null, $groupKey),
                    'contact_phone' => $record['contact_phone'] ?? null,
                    'guardian_name' => $record['guardian_name'] ?? ('Phụ huynh ' . ($record['full_name'] ?? '')),
                    'guardian_phone' => $record['guardian_phone'] ?? null,
                    'notes' => $this->buildNotes($record['notes'] ?? null, $groupKey),
                    'scenario_group' => $groupKey,
                    'is_underage' => $groupKey !== 'A',
                    'enrolled_at' => $this->now->copy()->subDays(rand(30, 365)),
                ]);

                $card = StudentCard::create([
                    'student_id' => $student->id,
                    'card_code' => $this->generateCardCode($student->student_code),
                    'card_type' => 'RFID',
                    'issued_at' => $this->now->copy()->subDays(rand(45, 120)),
                    'expires_at' => $this->now->copy()->addYear(),
                    'is_active' => true,
                ]);

                $hasLicensePlate = $groupKey !== 'C';
                $shouldBeViolation = $groupKey === 'B';
                $detectedViolation = $shouldBeViolation && $index < $detectedViolationTarget;

                $logResult = match (true) {
                    $groupKey === 'B' && $detectedViolation => 'violation',
                    default => 'valid',
                };

                $metadata = [
                    'scenario_group' => $groupKey,
                    'processing_time_seconds' => round(1.8 + ($index % 5) * 0.08, 2),
                    'test_case' => 'scenario-5',
                    'expected_violation' => $shouldBeViolation,
                    'detected_violation' => $shouldBeViolation && $detectedViolation,
                    'age_snapshot' => $studentAge,
                ];

                if ($shouldBeViolation && !$detectedViolation) {
                    $metadata['note'] = 'Biển số bị che - hệ thống không phát hiện';
                }

                $licensePlate = null;
                if ($hasLicensePlate) {
                    $licensePlate = $shouldBeViolation ? $violationPlateNumber : $this->generatePlate($groupKey, $index);
                }

                    $occurredAt = $this->nextOccurredAt();

                    AccessLog::create([
                    'student_id' => $student->id,
                    'student_card_id' => $card->id,
                        'occurred_at' => $occurredAt,
                    'result' => $logResult,
                    'has_license_plate' => $hasLicensePlate,
                    'license_plate_number' => $licensePlate,
                    'captured_image_path' => $shouldBeViolation
                        ? $violationImages[$index % $violationImageCount]
                        : null,
                    'violation_reason' => $logResult === 'violation' ? 'Học sinh dưới 16 tuổi điều khiển xe có biển số' : null,
                    'student_age' => $studentAge,
                    'metadata' => $metadata,
                ]);
            }
        }
    }

    private function configureAgeBoundaries(): void
    {
        $this->now = now()->startOfDay();
        $this->underageCutoff = $this->now->copy()->subYears(16)->startOfDay();
        $this->underageMinDate = $this->underageCutoff->copy()->addDay()->startOfDay();
        $this->underageMaxDate = $this->underageCutoff->copy()->addMonths(11)->endOfDay();
        $this->adultMaxDate = $this->underageCutoff->copy();
        $this->adultMinDate = $this->underageCutoff->copy()->subYears(2)->startOfDay();
        $this->violationStartAt = Carbon::create(
            $this->now->year,
            10,
            22,
            16,
            0,
            12,
            'Asia/Ho_Chi_Minh'
        );
        $this->violationEndAt = $this->violationStartAt->copy()->setTime(17, 0, 0);
        $this->violationStartAt = $this->violationStartAt->startOfSecond();
        $this->nextLogTimestamp = $this->violationStartAt->copy();
    }

    private function generateBirthDate(string $groupKey, ?string $rawBirthDate): Carbon
    {
        $base = $rawBirthDate ? Carbon::parse($rawBirthDate) : $this->now;

        [$startDate, $endDate] = $groupKey === 'A'
            ? [$this->adultMinDate, $this->adultMaxDate]
            : [$this->underageMinDate, $this->underageMaxDate];

        if ($startDate->greaterThan($endDate)) {
            [$startDate, $endDate] = [$endDate, $startDate];
        }

        $candidate = Carbon::createFromTimestamp(
            random_int($startDate->timestamp, $endDate->timestamp)
        )->setTime(0, 0);

        // Giữ lại ngày/tháng gốc nếu phù hợp, đồng thời đảm bảo nằm trong khoảng giới hạn
        $candidate = $candidate->setMonth($base->month)->setDay(
            min($base->day, $candidate->daysInMonth)
        );

        if ($candidate->lt($startDate)) {
            $candidate = $startDate->copy()->addDays(random_int(0, 6));
        }

        if ($candidate->gt($endDate)) {
            $candidate = $endDate->copy()->subDays(random_int(0, 6));
        }

        return $candidate;
    }

    private function calculateAge(Carbon $birthDate): int
    {
        return $birthDate->diffInYears($this->now);
    }

        private function nextOccurredAt(): Carbon
        {
            $occurredAt = $this->nextLogTimestamp->copy();
            $this->nextLogTimestamp->addSeconds(random_int(25, 30));

            return $occurredAt;
        }

    private function normalizeGender(?string $gender, string $groupKey): string
    {
        $normalized = strtolower(trim((string) $gender));

        return match ($normalized) {
            'nam', 'male', 'm' => 'male',
            'nữ', 'nu', 'female', 'f' => 'female',
            default => match ($groupKey) {
                'A' => 'male',
                'B' => 'female',
                default => 'other',
            },
        };
    }

    private function buildNotes(?string $existing, string $groupKey): string
    {
        $scenario = match ($groupKey) {
            'A' => 'Nhóm A: ≥16 tuổi, xe có biển số (hợp lệ)',
            'B' => 'Nhóm B: <16 tuổi, xe có biển số (vi phạm)',
            default => 'Nhóm C: <16 tuổi, xe không biển số (hợp lệ)',
        };

        return collect([$existing, $scenario])->filter()->implode(' | ');
    }

    private function defaultClassName(string $groupKey): string
    {
        return match ($groupKey) {
            'A' => '12A1',
            'B' => '10B1',
            default => '9C1',
        };
    }

    private function generateCardCode(string $studentCode): string
    {
        $this->cardSequence++;

        return sprintf('RFID-%s-%03d', $studentCode, $this->cardSequence);
    }

    private function generatePlate(string $groupKey, int $index): string
    {
        return sprintf('59%s-%04d', strtoupper($groupKey), $index + 101);
    }
}
