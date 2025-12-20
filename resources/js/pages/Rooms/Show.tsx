import { router } from '@inertiajs/react';
import { useMemo } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    AlertTriangle,
    ArrowLeft,
    Camera,
    CreditCard,
    Edit,
    Phone,
    ShieldCheck,
    User as UserIcon,
} from 'lucide-react';

interface StudentCardItem {
    id: number;
    card_code: string;
    card_type: 'RFID' | 'QR';
    is_active: boolean;
    issued_at: string | null;
    expires_at: string | null;
}

interface ViolationLog {
    id: number;
    occurred_at: string;
    license_plate_number: string | null;
    has_license_plate: boolean;
    violation_reason: string | null;
    image_url: string | null;
    result: 'valid' | 'violation';
}

interface StudentDetail {
    id: number;
    student_code: string;
    full_name: string;
    class_name: string;
    age: number | null;
    gender: 'male' | 'female' | 'other' | null;
    birth_date: string;
    avatar_url: string | null;
    contact_phone: string | null;
    guardian_name: string | null;
    guardian_phone: string | null;
    notes: string | null;
    violation_count: number;
    valid_entries_count: number;
    cards: StudentCardItem[];
    violations: ViolationLog[];
    latest_violation: ViolationLog | null;
}

interface LegacyRoom {
    id: number;
    name: string;
    description: string | null;
    current_count?: number;
    in_count?: number;
    out_count?: number;
    persons?: Array<{
        id: number;
        name: string;
        image_path: string | null;
        counter_track_id: string;
    }>;
    recent_logs?: Array<{
        id: number;
        person_name: string;
        direction: 'in' | 'out';
        timestamp: string;
    }>;
}

interface ShowStudentProps {
    student?: StudentDetail;
    room?: LegacyRoom;
}

const resolveRoute = (name: string, params?: unknown): string | null => {
    try {
        return route(name, params);
    } catch (error) {
        if (import.meta.env.DEV) {
            console.warn(`Route ${name} chưa được định nghĩa`, error);
        }
        return null;
    }
};

const mapRoomToStudent = (room: LegacyRoom | undefined): StudentDetail | null => {
    if (!room) {
        return null;
    }

    const violations: ViolationLog[] = (room.recent_logs ?? []).map((log) => ({
        id: log.id,
        occurred_at: log.timestamp,
        license_plate_number: null,
        has_license_plate: false,
        violation_reason: log.direction === 'in' ? 'Sự kiện vào' : 'Sự kiện ra',
        image_url: null,
        result: 'violation',
    }));

    return {
        id: room.id,
        student_code: `ROOM-${room.id}`,
        full_name: room.name,
        class_name: room.description ?? 'Không xác định',
        age: null,
        gender: null,
        birth_date: '1970-01-01T00:00:00.000Z',
        avatar_url: null,
        contact_phone: null,
        guardian_name: null,
        guardian_phone: null,
        notes: room.description,
        violation_count: violations.length,
        valid_entries_count: 0,
        cards: (room.persons ?? []).map((person) => ({
            id: person.id,
            card_code: person.counter_track_id,
            card_type: 'RFID',
            is_active: true,
            issued_at: null,
            expires_at: null,
        })),
        violations,
        latest_violation: violations[0] ?? null,
    };
};

export default function ShowStudent(props: ShowStudentProps) {
    const student = useMemo(() => props.student ?? mapRoomToStudent(props.room), [props.student, props.room]);

    const listRoute = resolveRoute('students.index') ?? resolveRoute('rooms.index');
    const editRoute = student
        ? resolveRoute('students.edit', student.id) ?? resolveRoute('rooms.edit', student.id)
        : null;

    const handleEdit = () => {
        if (editRoute) {
            router.visit(editRoute);
        }
    };

    const handleBack = () => {
        if (listRoute) {
            router.visit(listRoute);
        }
    };

    const formatDate = (value: string | null) => {
        if (!value) return 'Không rõ';
        return new Date(value).toLocaleDateString('vi-VN');
    };

    const formatDateTime = (value: string) => new Date(value).toLocaleString('vi-VN');

    if (!student) {
        return (
            <AppLayout>
                <Head title="Chi tiết học sinh" />
                <div className="flex h-full flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
                    <Badge variant="outline">Dữ liệu chưa sẵn sàng</Badge>
                    <p className="text-muted-foreground">
                        Trang này cần backend mới. Vui lòng thử lại sau khi hệ thống được cập nhật.
                    </p>
                    {listRoute && (
                        <Button onClick={handleBack} className="gap-2">
                            <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
                        </Button>
                    )}
                </div>
            </AppLayout>
        );
    }

    const violations = student.violations ?? [];

    return (
        <AppLayout>
            <Head title={student.full_name} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                        {listRoute && (
                            <Button variant="ghost" size="icon" onClick={handleBack}>
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        )}
                        <div className="flex flex-col gap-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-3xl font-bold">{student.full_name}</h1>
                                <Badge variant="secondary">{student.class_name}</Badge>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Mã học sinh: {student.student_code} • Tuổi: {student.age ?? '—'}
                            </p>
                        </div>
                    </div>
                    {editRoute && (
                        <Button onClick={handleEdit} className="gap-2 w-full sm:w-auto">
                            <Edit className="w-4 h-4" />
                            Chỉnh sửa hồ sơ
                        </Button>
                    )}
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    <div className="grid gap-4 lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle>Thông tin tổng quan</CardTitle>
                                <CardDescription>Thông tin chi tiết phục vụ kiểm tra vi phạm.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-3">
                                    <UserIcon className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="text-foreground font-medium">{student.full_name}</p>
                                        <p>Lớp {student.class_name}</p>
                                        <p>Ngày sinh: {formatDate(student.birth_date)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone className="h-5 w-5 text-primary" />
                                    <div>
                                        <p>SĐT học sinh: {student.contact_phone ?? '—'}</p>
                                        <p>Phụ huynh: {student.guardian_name ?? '—'}</p>
                                        <p>SĐT phụ huynh: {student.guardian_phone ?? '—'}</p>
                                    </div>
                                </div>
                                <div className="rounded-lg border border-border/50 bg-muted/40 p-3">
                                    <p className="text-xs font-medium uppercase tracking-wide text-primary">Tình trạng</p>
                                    <p className="mt-1 text-sm">
                                        Tổng {student.violation_count} vi phạm, {student.valid_entries_count} lượt hợp lệ.
                                    </p>
                                </div>
                                {student.notes && (
                                    <div className="rounded-lg border border-dashed border-border/60 bg-muted/30 p-3">
                                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                            Ghi chú nội bộ
                                        </p>
                                        <p className="mt-1 text-sm text-foreground">{student.notes}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Thẻ đã gắn</CardTitle>
                                    <CardDescription>Quản lý thẻ RFID/QR của học sinh.</CardDescription>
                                </div>
                                <CreditCard className="h-5 w-5 text-primary" />
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {student.cards.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">
                                        Chưa có thẻ nào. Vui lòng gán thẻ để hệ thống nhận diện.
                                    </p>
                                ) : (
                                    student.cards.map((card) => (
                                        <div
                                            key={card.id}
                                            className="flex flex-col gap-1 rounded-lg border border-border/60 bg-muted/30 p-3"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-semibold">{card.card_code}</span>
                                                <Badge variant={card.is_active ? 'secondary' : 'outline'} size="sm">
                                                    {card.is_active ? 'Kích hoạt' : 'Vô hiệu'}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Loại: {card.card_type === 'RFID' ? 'RFID' : 'QR code'}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Cấp ngày: {formatDate(card.issued_at)} • Hết hạn: {formatDate(card.expires_at)}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-4 lg:col-span-2">
                        <Card>
                            <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <CardTitle>Vi phạm gần nhất</CardTitle>
                                    <CardDescription>
                                        Dữ liệu ghi nhận từ camera và phân tích AI tại cổng nhà gửi xe.
                                    </CardDescription>
                                </div>
                                {student.latest_violation && (
                                    <Badge variant="destructive" className="gap-1">
                                        <AlertTriangle className="h-4 w-4" />
                                        {formatDateTime(student.latest_violation.occurred_at)}
                                    </Badge>
                                )}
                            </CardHeader>
                            <CardContent>
                                {student.latest_violation ? (
                                    <div className="flex flex-col gap-4 lg:flex-row">
                                        <div className="relative w-full overflow-hidden rounded-xl border bg-muted/40 lg:w-64">
                                            {student.latest_violation.image_url ? (
                                                <img
                                                    src={student.latest_violation.image_url}
                                                    alt={`Ảnh vi phạm của ${student.full_name}`}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full min-h-[200px] items-center justify-center text-muted-foreground">
                                                    <Camera className="h-10 w-10" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-1 flex-col gap-3 text-sm text-muted-foreground">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Badge variant="destructive">Vi phạm</Badge>
                                                <span>
                                                    Thời gian: {formatDateTime(student.latest_violation.occurred_at)}
                                                </span>
                                            </div>
                                            <p>
                                                Biển số:{' '}
                                                {student.latest_violation.has_license_plate
                                                    ? student.latest_violation.license_plate_number ?? 'Không đọc được'
                                                    : 'Phương tiện không có biển số'}
                                            </p>
                                            {student.latest_violation.violation_reason && (
                                                <p className="rounded-lg bg-destructive/10 p-3 text-destructive">
                                                    {student.latest_violation.violation_reason}
                                                </p>
                                            )}
                                            <p>
                                                Đề nghị: Nhắc nhở học sinh cung cấp giấy tờ xe hợp lệ hoặc chuyển qua khu vực
                                                xe không biển số.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="rounded-xl border border-dashed border-border/50 p-6 text-center text-sm text-muted-foreground">
                                        Chưa ghi nhận vi phạm nào.
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <CardTitle>Lịch sử vi phạm</CardTitle>
                                    <CardDescription>
                                        Tổng hợp 20 lượt mới nhất, bao gồm thông tin biển số và hình ảnh lưu trữ.
                                    </CardDescription>
                                </div>
                                <Badge variant="secondary" className="gap-1">
                                    <ShieldCheck className="h-4 w-4" />
                                    {student.violation_count} lượt
                                </Badge>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {violations.length === 0 ? (
                                    <div className="rounded-xl border border-dashed border-border/50 p-6 text-center text-sm text-muted-foreground">
                                        Chưa có dữ liệu vi phạm.
                                    </div>
                                ) : (
                                    violations.map((log) => (
                                        <div
                                            key={log.id}
                                            className="flex flex-col gap-3 rounded-xl border border-border/60 bg-background p-4 shadow-sm transition hover:border-primary/60 hover:shadow-md md:flex-row"
                                        >
                                            <div className="relative w-full overflow-hidden rounded-lg border bg-muted/30 md:w-44">
                                                {log.image_url ? (
                                                    <img
                                                        src={log.image_url}
                                                        alt={`Minh chứng vi phạm ${student.full_name}`}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full min-h-[140px] items-center justify-center text-muted-foreground">
                                                        <Camera className="h-8 w-8" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-1 flex-col gap-2 text-sm text-muted-foreground">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <Badge variant={log.result === 'violation' ? 'destructive' : 'secondary'}>
                                                        {log.result === 'violation' ? 'Vi phạm' : 'Hợp lệ'}
                                                    </Badge>
                                                    <span>{formatDateTime(log.occurred_at)}</span>
                                                </div>
                                                <p>
                                                    {log.has_license_plate
                                                        ? `Biển số: ${log.license_plate_number ?? 'Không đọc được'}`
                                                        : 'Xe không có biển số'}
                                                </p>
                                                {log.violation_reason && (
                                                    <p className="rounded-lg bg-destructive/10 p-3 text-destructive">
                                                        {log.violation_reason}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
