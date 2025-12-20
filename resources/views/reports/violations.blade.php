<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="utf-8">
    <title>Báo cáo vi phạm</title>
    <style>
        * {
            font-family: "DejaVu Sans", sans-serif;
            box-sizing: border-box;
        }
        body {
            margin: 0;
            padding: 24px;
            font-size: 12px;
            color: #1f2937;
            background-color: #f8fafc;
        }
        h1 {
            font-size: 24px;
            margin: 0 0 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #0f172a;
        }
        .meta {
            margin-bottom: 16px;
            padding: 12px 16px;
            background: #e0f2fe;
            border-left: 4px solid #0284c7;
            border-radius: 6px;
        }
        .meta p {
            margin: 2px 0;
            font-weight: 600;
            color: #0f172a;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 16px;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 6px rgba(15, 23, 42, 0.08);
        }
        thead th {
            background: linear-gradient(90deg, #1d4ed8, #2563eb);
            color: #f8fafc;
            font-weight: 700;
            padding: 10px;
            text-align: left;
            font-size: 12px;
            text-transform: uppercase;
        }
        tbody td {
            border: 1px solid #e2e8f0;
            padding: 9px;
            vertical-align: top;
            background-color: #ffffff;
        }
        tbody tr:nth-child(even) td {
            background-color: #f1f5f9;
        }
        tbody tr:hover td {
            background-color: #e0f2fe;
        }
        .summary {
            display: flex;
            gap: 16px;
            flex-wrap: wrap;
            margin-top: 12px;
        }
        .summary-item {
            flex: 1 1 160px;
            background: linear-gradient(135deg, #1e40af, #2563eb);
            color: #f8fafc;
            padding: 12px 14px;
            border-radius: 8px;
            box-shadow: 0 1px 4px rgba(15, 23, 42, 0.15);
        }
        .summary-item strong {
            display: block;
            font-size: 14px;
            margin-bottom: 4px;
            font-weight: 700;
        }
        .summary-item span {
            font-size: 18px;
            font-weight: 600;
        }
        .note {
            margin-top: 24px;
            font-style: italic;
            color: #475569;
        }
        .student-cell small {
            display: block;
            color: #475569;
            margin-top: 2px;
            font-size: 11px;
        }
        .image-wrapper {
            width: 80px;
            height: 50px;
            border-radius: 6px;
            overflow: hidden;
            border: 1px solid #cbd5f5;
        }
        .image-wrapper img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
    </style>
</head>
<body>
    <h1>BÁO CÁO VI PHẠM HỌC SINH</h1>
    <div class="meta">
        <p><strong>Khoảng thời gian:</strong> {{ $filters['start_date']->format('d/m/Y') }} - {{ $filters['end_date']->format('d/m/Y') }}</p>
        <p><strong>Thời gian xuất:</strong> {{ $filters['generated_at']->format('d/m/Y H:i') }}</p>
    </div>

    <div class="summary">
        <div class="summary-item">
            <strong>Tổng lượt vi phạm</strong>
            <span>{{ $summary['total'] }}</span>
        </div>
        <div class="summary-item" style="background: linear-gradient(135deg, #047857, #22c55e);">
            <strong>Số học sinh liên quan</strong>
            <span>{{ $summary['unique_students'] }}</span>
        </div>
        @foreach($summary['by_class'] as $className => $count)
            <div class="summary-item" style="background: linear-gradient(135deg, #7c3aed, #6366f1);">
                <strong>Lớp {{ $className }}</strong>
                <span>{{ $count }} lượt</span>
            </div>
        @endforeach
    </div>

    <table>
        <thead>
            <tr>
                <th>#</th>
                <th>Thời gian</th>
                <th>Học sinh</th>
                <th>Lớp</th>
                <th>Tuổi</th>
                <th>Biển số</th>
                <th>Lý do vi phạm</th>
                <th>Hình ảnh</th>
            </tr>
        </thead>
        <tbody>
        @forelse($logs as $index => $log)
            <tr>
                <td>{{ $index + 1 }}</td>
                <td>{{ $log['occurred_at'] }}</td>
                <td class="student-cell">
                    {{ $log['student_name'] }}<br>
                    <small>Mã HS: {{ $log['student_code'] }}</small>
                </td>
                <td>{{ $log['class_name'] }}</td>
                <td>{{ $log['age'] ?? '—' }}</td>
                <td>{{ $log['license_plate'] }}</td>
                <td>{{ $log['violation_reason'] }}</td>
                <td>
                    @if($log['image_src'])
                        <div class="image-wrapper">
                            <img src="{{ $log['image_src'] }}" alt="Ảnh vi phạm" />
                        </div>
                    @else
                        —
                    @endif
                </td>
            </tr>
        @empty
            <tr>
                <td colspan="8" style="text-align: center; font-weight: 600;">Không có lượt vi phạm nào trong khoảng thời gian đã chọn.</td>
            </tr>
        @endforelse
        </tbody>
    </table>

    <p class="note">Báo cáo được tạo tự động bởi hệ thống giám sát vi phạm học sinh.</p>
</body>
</html>
