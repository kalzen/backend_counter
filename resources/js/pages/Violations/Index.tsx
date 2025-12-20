import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';

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

interface StudentLite {
    id: number;
    student_code: string;
    full_name: string;
    class_name: string;
    age: number | null;
}

interface ViolationLog {
    id: number;
    occurred_at: string | null;
    result: 'valid' | 'violation';
    has_license_plate: boolean;
    license_plate_number: string | null;
    violation_reason: string | null;
    metadata: Record<string, unknown> | null;
    student: StudentLite | null;
}

interface ViolationsPageProps {
    logs: {
        data: ViolationLog[];
        links: PaginationLink[];
        meta: PaginationMeta;
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

export default function ViolationsIndex({ logs }: ViolationsPageProps) {
    const data = Array.isArray(logs?.data) ? logs.data : [];
    const links = Array.isArray(logs?.links) ? logs.links : [];
    const meta = logs?.meta;

    const previous = links.find((link) => formatLabel(link.label).includes('«'));
    const next = links.find((link) => formatLabel(link.label).includes('»'));
    const numberedLinks = links.filter((link) => !formatLabel(link.label).includes('«') && !formatLabel(link.label).includes('»'));

    return (
        <AppLayout>
            <Head title="Quản lý vi phạm" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div>
                    <h1 className="text-3xl font-bold">Quản lý vi phạm</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Nhật ký lượt quét thẻ và kết quả phân loại theo kịch bản kiểm thử 100 học sinh.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Nhật ký quẹt thẻ</CardTitle>
                        <CardDescription>Gồm 40 lượt hợp lệ nhóm A, 30 lượt nhóm C và 30 lượt nhóm B (28 phát hiện vi phạm).</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Thời gian</TableHead>
                                    <TableHead>Học sinh</TableHead>
                                    <TableHead>Kết quả</TableHead>
                                    <TableHead>Biển số</TableHead>
                                    <TableHead>Ghi chú</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell className="whitespace-nowrap">{formatDateTime(log.occurred_at)}</TableCell>
                                        <TableCell>
                                            {log.student ? (
                                                <div className="space-y-1">
                                                    <div className="font-medium">{log.student.full_name}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        Mã: {log.student.student_code} • Lớp: {log.student.class_name}
                                                        {typeof log.student.age === 'number' ? ` • Tuổi: ${log.student.age}` : ''}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">Không rõ</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {log.result === 'violation' ? (
                                                <Badge variant="destructive" className="flex items-center gap-1">
                                                    <AlertTriangle className="h-3 w-3" /> Vi phạm
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary" className="flex items-center gap-1">
                                                    <CheckCircle className="h-3 w-3" /> Hợp lệ
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {log.has_license_plate ? log.license_plate_number ?? '—' : 'Không biển số'}
                                        </TableCell>
                                        <TableCell className="max-w-[320px] text-sm text-muted-foreground">
                                            {log.violation_reason ?? (log.metadata?.note as string ?? '—')}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {data.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                                            Chưa có dữ liệu vi phạm. Hãy chạy seeder để khởi tạo dữ liệu kiểm thử.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
                            <div>
                                Hiển thị {data.length} bản ghi • Trang {meta?.current_page ?? 1} / {meta?.last_page ?? 1} • Tổng {meta?.total ?? data.length}
                            </div>
                            <div className="flex items-center gap-2">
                                {previous?.url ? (
                                    <Link href={previous.url} className="inline-flex items-center gap-1 rounded-md px-3 py-1 hover:bg-muted">
                                        <ChevronLeft className="h-4 w-4" /> {formatLabel(previous.label).replace('«', '').trim()}
                                    </Link>
                                ) : (
                                    <span className="inline-flex items-center gap-1 rounded-md px-3 py-1 opacity-50">
                                        <ChevronLeft className="h-4 w-4" /> {previous ? formatLabel(previous.label).replace('«', '').trim() : 'Trước'}
                                    </span>
                                )}

                                {numberedLinks.map((link, idx) => (
                                    <span key={`${link.label}-${idx}`}>
                                        {link.url ? (
                                            <Link
                                                href={link.url}
                                                className={`rounded-md px-3 py-1 transition-colors ${
                                                    link.active ? 'bg-primary text-primary-foreground shadow' : 'hover:bg-muted'
                                                }`}
                                            >
                                                {formatLabel(link.label)}
                                            </Link>
                                        ) : (
                                            <span className="rounded-md px-3 py-1 opacity-50">{formatLabel(link.label)}</span>
                                        )}
                                    </span>
                                ))}

                                {next?.url ? (
                                    <Link href={next.url} className="inline-flex items-center gap-1 rounded-md px-3 py-1 hover:bg-muted">
                                        {formatLabel(next.label).replace('»', '').trim()} <ChevronRight className="h-4 w-4" />
                                    </Link>
                                ) : (
                                    <span className="inline-flex items-center gap-1 rounded-md px-3 py-1 opacity-50">
                                        {next ? formatLabel(next.label).replace('»', '').trim() : 'Sau'} <ChevronRight className="h-4 w-4" />
                                    </span>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
