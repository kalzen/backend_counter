import { useEffect, useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, ArrowRight, Camera, FileDown, PieChart, UserCheck } from 'lucide-react';

interface ViolationSummary {
    id: number;
    student_code: string;
    full_name: string;
    class_name: string;
    age: number | null;
    occurred_at: string | null;
    occurred_at_display?: string | null;
    license_plate_number: string | null;
    has_license_plate: boolean;
    violation_reason: string | null;
    image_url: string | null;
}

interface DashboardStats {
    total_students: number;
    active_cards: number;
    weekly_violations: number;
    average_processing_time: number | null;
    last_sync_at: string | null;
}

interface DashboardProps {
    stats?: DashboardStats;
    recentViolations?: ViolationSummary[];
    exportDefaults?: {
        start_date: string;
        end_date: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('dashboard'),
    },
];

export default function Dashboard({ stats, recentViolations = [], exportDefaults }: DashboardProps) {
    const violations = Array.isArray(recentViolations) ? recentViolations : [];
    const [startDate, setStartDate] = useState(exportDefaults?.start_date ?? '');
    const [endDate, setEndDate] = useState(exportDefaults?.end_date ?? '');

    useEffect(() => {
        if (exportDefaults?.start_date) {
            setStartDate(exportDefaults.start_date);
        }
        if (exportDefaults?.end_date) {
            setEndDate(exportDefaults.end_date);
        }
    }, [exportDefaults?.start_date, exportDefaults?.end_date]);

    const isValidRange = useMemo(() => {
        if (!startDate || !endDate) {
            return false;
        }
        return new Date(startDate) <= new Date(endDate);
    }, [startDate, endDate]);

    const handleViewAllViolations = () => {
        router.visit(route('students.index'));
    };

    const handleExportPdf = () => {
        if (!isValidRange) {
            return;
        }

        const url = route('violations.export', {
            start_date: startDate,
            end_date: endDate,
        });

        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const formatTime = (value: string | null) => {
        if (!value) return 'Chưa có dữ liệu';
        return new Date(value).toLocaleString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const formatNumber = (value: number | null) => {
        if (value === null || Number.isNaN(value)) {
            return '—';
        }
        return new Intl.NumberFormat('vi-VN').format(value);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Giám sát vi phạm" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Giám sát vi phạm</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Theo dõi lượt quẹt thẻ, hình ảnh xe và cảnh báo học sinh vi phạm.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button onClick={handleViewAllViolations} className="gap-2">
                            Xem danh sách vi phạm
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" onClick={() => router.visit(route('students.create'))}>
                            Thêm học sinh mới
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <Card>
                        <CardHeader>
                            <CardDescription>Tổng học sinh theo dõi</CardDescription>
                            <CardTitle className="text-3xl">{formatNumber(stats?.total_students ?? 0)}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            Số hồ sơ học sinh đang được hệ thống quản lý.
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardDescription>Thẻ đang hoạt động</CardDescription>
                            <CardTitle className="text-3xl">{formatNumber(stats?.active_cards ?? 0)}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            Thẻ RFID/QR hợp lệ để vào nhà gửi xe.
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardDescription>Vi phạm trong 7 ngày</CardDescription>
                            <CardTitle className="text-3xl text-destructive">
                                {formatNumber(stats?.weekly_violations ?? 0)}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            Tổng lượt phát hiện vi phạm gần nhất.
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardDescription>Thời gian xử lý trung bình</CardDescription>
                            <CardTitle className="text-3xl">
                                {stats?.average_processing_time ? `${stats.average_processing_time.toFixed(1)}s` : '—'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            Từ lúc quẹt thẻ đến khi có kết luận.
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between gap-4">
                            <div>
                                <CardTitle>Lượt vi phạm gần đây</CardTitle>
                                <CardDescription>
                                    Tổng hợp 10 lượt mới nhất kèm hình ảnh ghi nhận từ camera.
                                </CardDescription>
                            </div>
                            <Badge variant="secondary" className="gap-1">
                                <AlertTriangle className="w-4 h-4" />
                                {formatNumber(violations.length)} lượt
                            </Badge>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {violations.length === 0 ? (
                                <div className="relative overflow-hidden rounded-xl border border-dashed border-sidebar-border/70 p-8 text-center">
                                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                                    <div className="relative z-10 flex flex-col items-center gap-2">
                                        <UserCheck className="w-10 h-10 text-muted-foreground" />
                                        <p className="font-medium">Chưa ghi nhận vi phạm nào</p>
                                        <p className="text-sm text-muted-foreground">
                                            Hệ thống sẽ hiển thị các lượt vi phạm mới nhất tại đây.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                violations.map((violation) => (
                                    <div
                                        key={violation.id}
                                        className="flex flex-col gap-4 rounded-xl border border-border/60 bg-background p-4 shadow-sm transition hover:border-primary/60 hover:shadow-md md:flex-row"
                                    >
                                        <div className="relative w-full overflow-hidden rounded-lg border bg-muted/40 md:w-48">
                                            {violation.image_url ? (
                                                <img
                                                    src={violation.image_url}
                                                    alt={`Ảnh vi phạm của ${violation.full_name}`}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full min-h-[160px] items-center justify-center text-muted-foreground">
                                                    <Camera className="h-10 w-10" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-1 flex-col gap-3">
                                            <div className="flex flex-wrap items-start justify-between gap-2">
                                                <div>
                                                    <h3 className="text-lg font-semibold">
                                                        {violation.full_name}
                                                        <span className="ml-2 text-sm font-normal text-muted-foreground">
                                                            ({violation.class_name})
                                                        </span>
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        Mã học sinh: {violation.student_code}
                                                    </p>
                                                </div>
                                                <Badge variant="destructive" className="gap-1">
                                                    <AlertTriangle className="h-4 w-4" />
                                                    Vi phạm
                                                </Badge>
                                            </div>

                                            <div className="grid gap-1 text-sm text-muted-foreground md:grid-cols-2">
                                                <span>
                                                    Thời gian:{' '}
                                                    {violation.occurred_at_display ??
                                                        (violation.occurred_at
                                                            ? new Date(violation.occurred_at).toLocaleString('vi-VN')
                                                            : 'Không rõ')}
                                                </span>
                                                <span>
                                                    {violation.has_license_plate ? (
                                                        <span>Biển số: {violation.license_plate_number ?? 'Không xác định'}</span>
                                                    ) : (
                                                        'Phương tiện không có biển số'
                                                    )}
                                                </span>
                                            </div>

                                            {violation.violation_reason && (
                                                <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                                                    {violation.violation_reason}
                                                </p>
                                            )}

                                            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                                <span>Tuổi: {violation.age ?? '—'}</span>
                                                <span>Mức độ nguy cơ: {violation.has_license_plate ? 'Cao' : 'Trung bình'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    <div className="grid gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Xuất báo cáo vi phạm</CardTitle>
                                <CardDescription>Lọc theo khoảng thời gian để tải về file PDF.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm">
                                <div className="grid gap-3">
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="export-start">Từ ngày</Label>
                                        <Input
                                            id="export-start"
                                            type="date"
                                            value={startDate}
                                            max={endDate || undefined}
                                            onChange={(event) => setStartDate(event.target.value)}
                                        />
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="export-end">Đến ngày</Label>
                                        <Input
                                            id="export-end"
                                            type="date"
                                            value={endDate}
                                            min={startDate || undefined}
                                            onChange={(event) => setEndDate(event.target.value)}
                                        />
                                    </div>
                                </div>
                                {!isValidRange && (
                                    <p className="text-xs text-destructive">
                                        Vui lòng chọn đầy đủ và đảm bảo ngày bắt đầu không lớn hơn ngày kết thúc.
                                    </p>
                                )}
                                <Button
                                    type="button"
                                    className="w-full gap-2"
                                    onClick={handleExportPdf}
                                    disabled={!isValidRange}
                                >
                                    <FileDown className="h-4 w-4" />
                                    Xuất PDF
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Đề xuất hành động</CardTitle>
                                <CardDescription>Hỗ trợ xử lý nhanh các tình huống vi phạm.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                                    <p className="font-medium">Phân loại lại thẻ học sinh</p>
                                    <p className="text-muted-foreground">
                                        Kiểm tra học sinh vi phạm liên tiếp và cập nhật thông tin người giám hộ.
                                    </p>
                                </div>
                                <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                                    <p className="font-medium">Xuất báo cáo PDF</p>
                                    <p className="text-muted-foreground">
                                        Tổng hợp danh sách vi phạm theo lớp, gửi giáo viên chủ nhiệm mỗi tuần.
                                    </p>
                                </div>
                                <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                                    <p className="font-medium">Cài đặt cảnh báo</p>
                                    <p className="text-muted-foreground">
                                        Kích hoạt gửi SMS/Email cho phụ huynh khi học sinh tái phạm nhiều lần.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Trạng thái hệ thống</CardTitle>
                                <CardDescription>Cập nhật lần cuối: {formatTime(stats?.last_sync_at ?? null)}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 p-3">
                                    <PieChart className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="font-medium">Mô hình AI</p>
                                        <p className="text-muted-foreground">Độ chính xác mục tiêu ≥ 90% trong điều kiện chuẩn.</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 p-3">
                                    <Camera className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="font-medium">Camera nhà gửi xe</p>
                                        <p className="text-muted-foreground">Hỗ trợ ghi hình Full HD, bù sáng tự động.</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 p-3">
                                    <UserCheck className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="font-medium">Đầu đọc thẻ</p>
                                        <p className="text-muted-foreground">Hoạt động ổn định, kiểm thử tính tuổi 0% sai lệch.</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
