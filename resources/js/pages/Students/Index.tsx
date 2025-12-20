import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AlertTriangle, GraduationCap, Users } from 'lucide-react';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationMeta {
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
}

interface StudentRow {
    id: number;
    student_code: string;
    full_name: string;
    class_name: string;
    age: number | null;
    gender: string | null;
    contact_phone: string | null;
    guardian_phone: string | null;
    notes: string | null;
    scenario_group: string | null;
    is_underage: boolean;
    violations_count: number;
    valid_count: number;
    last_activity_at: string | null;
    last_result: 'valid' | 'violation' | null;
}

interface StudentsPageProps {
    students: {
        data: StudentRow[];
        links: PaginationLink[];
        meta: PaginationMeta;
    };
    summary: {
        total_students: number;
        total_violations: number;
        total_valid: number;
        underage_students: number;
    };
}

const formatLabel = (label: string) =>
    label
        .replace(/&laquo;/g, '«')
        .replace(/&raquo;/g, '»')
        .replace(/&nbsp;/g, ' ');

const formatDateTime = (value: string | null) => {
    if (!value) return '—';
    return new Date(value).toLocaleString('vi-VN');
};

const scenarioDescriptions: Record<string, string> = {
    A: 'Nhóm A • ≥16 tuổi • Có biển số • Hợp lệ',
    B: 'Nhóm B • <16 tuổi • Có biển số • Vi phạm',
    C: 'Nhóm C • <16 tuổi • Không biển số • Hợp lệ',
};

export default function StudentsIndex({ students, summary }: StudentsPageProps) {
    const data = Array.isArray(students?.data) ? students.data : [];
    const links = Array.isArray(students?.links) ? students.links : [];
    const meta = students?.meta;

    return (
        <AppLayout>
            <Head title="Quản lý học sinh" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold">Quản lý học sinh</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Danh sách hồ sơ học sinh, trạng thái quẹt thẻ và phân nhóm theo kịch bản kiểm thử.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Tổng học sinh</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.total_students}</div>
                            <p className="text-xs text-muted-foreground">Theo dữ liệu seeder kịch bản 100 học sinh</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Lượt vi phạm</CardTitle>
                            <Badge variant="destructive">{summary.total_violations}</Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">Nhóm B</div>
                            <p className="text-xs text-muted-foreground">28/30 lượt phát hiện đúng, 2 lượt bỏ sót</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Lượt hợp lệ</CardTitle>
                            <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.total_valid}</div>
                            <p className="text-xs text-muted-foreground">Bao gồm toàn bộ nhóm A và C cùng 2 lượt bỏ sót</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Học sinh chưa đủ 16 tuổi</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.underage_students}</div>
                            <p className="text-xs text-muted-foreground">Nhóm B và C theo kịch bản kiểm thử</p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Danh sách học sinh</CardTitle>
                        <CardDescription>Thông tin cơ bản, phân nhóm và kết quả gần nhất.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Học sinh</TableHead>
                                    <TableHead>Lớp</TableHead>
                                    <TableHead>Độ tuổi</TableHead>
                                    <TableHead>Nhóm kịch bản</TableHead>
                                    <TableHead>Thống kê</TableHead>
                                    <TableHead>Lần quẹt gần nhất</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.map((student) => {
                                    const scenario = student.scenario_group ?? '—';
                                    const scenarioText = scenarioDescriptions[scenario] ?? 'Chưa được phân nhóm';
                                    const avatarFallback = student.full_name
                                        .split(/\s+/)
                                        .filter(Boolean)
                                        .slice(-2)
                                        .map((part) => part.charAt(0).toUpperCase())
                                        .join('') || 'HS';

                                    return (
                                        <TableRow key={student.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="size-10">
                                                        <AvatarFallback>{avatarFallback}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="space-y-1">
                                                        <div className="font-semibold leading-none">{student.full_name}</div>
                                                        <div className="text-xs text-muted-foreground">Mã HS: {student.student_code}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            Liên hệ: {student.contact_phone ?? '—'} • Phụ huynh: {student.guardian_phone ?? '—'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">{student.class_name}</TableCell>
                                            <TableCell>{student.age ?? '—'}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <Badge variant={scenario === 'B' ? 'destructive' : 'secondary'}>{scenario}</Badge>
                                                    <Badge variant={student.is_underage ? 'outline' : 'secondary'}>
                                                        {student.is_underage ? 'Chưa đủ 16 tuổi' : '≥ 16 tuổi'}
                                                    </Badge>
                                                </div>
                                                <div className="mt-1 text-xs text-muted-foreground">{scenarioText}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1 text-sm">
                                                    <div>Vi phạm: {student.violations_count}</div>
                                                    <div>Hợp lệ: {student.valid_count}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1 text-xs text-muted-foreground">
                                                    <div>{formatDateTime(student.last_activity_at)}</div>
                                                    <div>
                                                        Trạng thái:{' '}
                                                        {student.last_result === 'violation' ? (
                                                            <Badge variant="destructive" className="ml-1">Vi phạm</Badge>
                                                        ) : student.last_result === 'valid' ? (
                                                            <Badge variant="secondary" className="ml-1">Hợp lệ</Badge>
                                                        ) : (
                                                            <span className="ml-1">—</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {data.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                                            Chưa có dữ liệu học sinh. Hãy chạy seeder để khởi tạo dữ liệu kiểm thử.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>

                        {links.length > 0 && (
                            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
                                <div>
                                    Trang {meta?.current_page ?? 1} / {meta?.last_page ?? 1} • Tổng {meta?.total ?? data.length} học sinh
                                </div>
                                <div className="flex items-center gap-2">
                                    {links.map((link, index) => (
                                        <span key={`${link.label}-${index}`}>
                                            {link.url ? (
                                                <Link
                                                    href={link.url}
                                                    className={`rounded-md px-3 py-1 transition-colors ${
                                                        link.active
                                                            ? 'bg-primary text-primary-foreground shadow'
                                                            : 'hover:bg-muted'
                                                    }`}
                                                >
                                                    {formatLabel(link.label)}
                                                </Link>
                                            ) : (
                                                <span className="rounded-md px-3 py-1 opacity-50">
                                                    {formatLabel(link.label)}
                                                </span>
                                            )}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
