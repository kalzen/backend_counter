<?php

namespace Database\Seeders;

use App\Models\SystemSetting;
use Illuminate\Database\Seeder;

class SystemSettingSeeder extends Seeder
{
    public function run(): void
    {
        SystemSetting::updateOrCreate(
            ['key' => 'camera.gate_01'],
            [
                'label' => 'Camera cổng nhà xe',
                'description' => 'Thiết bị ghi hình chính đặt tại barrier vào nhà gửi xe.',
                'value' => [
                    'ip' => '192.168.1.20',
                    'manufacturer' => 'Hikvision',
                    'resolution' => '1920x1080',
                ],
            ]
        );

        SystemSetting::updateOrCreate(
            ['key' => 'ai.license_plate_model'],
            [
                'label' => 'Mô hình AI nhận diện biển số',
                'description' => 'Thông tin cấu hình mô hình phát hiện biển số cho môi trường thử nghiệm.',
                'value' => [
                    'version' => 'YOLOv8s-plate-v1',
                    'confidence_threshold' => 0.65,
                    'last_retrained_at' => now()->subWeeks(2)->toIso8601String(),
                ],
            ]
        );

        SystemSetting::updateOrCreate(
            ['key' => 'alerts.thresholds'],
            [
                'label' => 'Ngưỡng cảnh báo vi phạm',
                'description' => 'Quy định số lần vi phạm trước khi gửi thông báo tới phụ huynh.',
                'value' => [
                    'max_violations_per_week' => 2,
                    'notify_guardian_after' => 3,
                    'escalate_to_teacher_after' => 5,
                ],
            ]
        );
    }
}
