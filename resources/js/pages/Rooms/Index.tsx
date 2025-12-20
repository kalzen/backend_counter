import { router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Camera, Filter, Plus, Users } from 'lucide-react';

interface ViolationStudent {
    id: number;
    student_code: string;
    full_name: string;
    class_name: string;
    age: number | null;
    total_violations: number;
    latest_violation_at: string | null;
    latest_violation_reason: string | null;
    latest_image_url: string | null;
    license_plate_number: string | null;
    has_license_plate: boolean;
}

interface StudentsIndexProps {
    students?: ViolationStudent[];
    total_students?: number;
    total_active_cards?: number;
    summary_period?: string;
}

export default function StudentsIndex({
    students = [],
    total_students = 0,
    total_active_cards = 0,
    summary_period = '7 ngày gần đây',
}: StudentsIndexProps) {
    const handleCreate = () => {
        router.visit(route('students.create'));
    };

    const handleView = (id: number) => {
        router.visit(route('students.show', id));
    };

    const handleEdit = (id: number) => {
        router.visit(route('students.edit', id));
    };

    const formatDateTime = (value: string | null) => {
        if (!value) return 'Chưa có dữ liệu';
        return new Date(value).toLocaleString('vi-VN');
    };

    return (
        <AppLayout>
            <Head title="Danh sách vi phạm" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Danh sách học sinh vi phạm</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Theo dõi các học sinh bị phát hiện điều khiển xe không phù hợp trong {summary_period}.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" className="gap-2">
                            <Filter className="w-4 h-4" />
                            Bộ lọc nâng cao
                        </Button>
                        <Button onClick={handleCreate} className="gap-2">
                            <Plus className="w-4 h-4" />
                            Thêm học sinh
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Học sinh được giám sát</CardTitle>
                            <CardDescription>Tổng hồ sơ đã kích hoạt.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between">
                            <div className="text-3xl font-bold">{total_students}</div>
                            <Users className="h-8 w-8 text-primary" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Thẻ đang hoạt động</CardTitle>
                            <CardDescription>Số thẻ RFID/QR hợp lệ.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between">
                            <div className="text-3xl font-bold">{total_active_cards}</div>
                            <Badge variant="secondary">Đang theo dõi</Badge>
                        </CardContent>
                    </Card>
                    <Card className="border-destructive/20">
                        <CardHeader>
                            <CardTitle>Vi phạm được ghi nhận</CardTitle>
                            <CardDescription>Hiển thị các vi phạm đã phân loại.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex items-center gap-3 text-sm text-muted-foreground">
                            <AlertTriangle className="h-6 w-6 text-destructive" />
                            Dữ liệu vi phạm sẽ được đồng bộ với báo cáo tuần và gửi cảnh báo nếu cần.
                        </CardContent>
                    </Card>
                </div>

                {students.length === 0 ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>Chưa có học sinh vi phạm</CardTitle>
                            <CardDescription>
                                Hệ thống sẽ hiển thị các hồ sơ vi phạm ngay khi camera phát hiện bất thường.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-xl border border-dashed border-sidebar-border/60 p-8 text-center">
                                <p className="text-sm text-muted-foreground">
                                    Vui lòng kiểm tra kết nối camera, đầu đọc thẻ và cấu hình AI.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {students.map((student) => (
                            <Card
                                key={student.id}
                                className="group flex flex-col overflow-hidden border border-border/60 shadow-sm transition hover:border-primary/60 hover:shadow-lg"
                            >
                                <div className="relative h-48 w-full overflow-hidden bg-muted/30">
                                    {student.latest_image_url ? (
                                        <img
                                            src={student.latest_image_url}
                                            alt={`Ảnh vi phạm gần nhất của ${student.full_name}`}
                                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-muted-foreground">
                                            <Camera className="h-10 w-10" />
                                        </div>
                                    )}
                                    <Badge className="absolute left-3 top-3 flex items-center gap-1" variant="destructive">
                                        <AlertTriangle className="h-4 w-4" />
                                        {student.total_violations} lượt
                                    </Badge>
                                </div>
                                <CardHeader className="flex flex-col gap-2">
                                    <CardTitle className="text-xl">
                                        {student.full_name}
                                        <span className="ml-2 text-sm font-normal text-muted-foreground">
                                            ({student.class_name})
                                        </span>
                                    </CardTitle>
                                    <CardDescription>
                                        Mã HS: {student.student_code} • Tuổi: {student.age ?? '—'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex flex-1 flex-col gap-3 text-sm text-muted-foreground">
                                    <div>
                                        <p className="font-medium text-foreground">Lần vi phạm gần nhất</p>
                                        <p>{formatDateTime(student.latest_violation_at)}</p>
                                    </div>
                                    <div>
                                        {student.latest_violation_reason ? (
                                            <p className="rounded-lg bg-destructive/10 p-3 text-destructive">
                                                {student.latest_violation_reason}
                                            </p>
                                        ) : (
                                            <p className="rounded-lg border border-dashed border-border/60 p-3">
                                                Chưa có mô tả chi tiết.
                                            </p>
                                        )}
                                    </div>
                                    <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                                        {student.has_license_plate ? (
                                            <p>Biển số: {student.license_plate_number ?? 'Không xác định'}</p>
                                        ) : (
                                            <p>Phương tiện không có biển số</p>
                                        )}
                                    </div>
                                    <div className="mt-auto flex gap-2 pt-4">
                                        <Button
                                            variant="outline"
                                            onClick={() => handleView(student.id)}
                                            className="flex-1"
                                        >
                                            Xem chi tiết
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => handleEdit(student.id)}
                                            className="flex-1"
                                        >
                                            Cập nhật
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
