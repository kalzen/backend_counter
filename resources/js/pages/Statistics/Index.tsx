import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, BarChart3, GaugeCircle, Timer } from 'lucide-react';

interface StatisticsPageProps {
    stats: {
        total_students: number;
        active_cards: number;
        violations_total: number;
        valid_total: number;
    };
    metrics: {
        accuracy: number | null;
        recall: number | null;
        precision: number | null;
        average_processing_time: number | null;
    };
    violationsByGroup: Record<string, number>;
    dailyViolations: Record<string, { violations: number; valid: number }>;
}

const groupLabels: Record<string, string> = {
    A: 'Nhóm A • ≥16 tuổi • Có biển số',
    B: 'Nhóm B • <16 tuổi • Có biển số',
    C: 'Nhóm C • <16 tuổi • Không biển số',
};

const formatPercent = (value: number | null) => (typeof value === 'number' ? `${value.toFixed(1)}%` : '—');

const formatSeconds = (value: number | null) => (typeof value === 'number' ? `${value.toFixed(2)} giây` : '—');

export default function StatisticsIndex({ stats, metrics, violationsByGroup, dailyViolations }: StatisticsPageProps) {
    const totalChecks = Object.values(violationsByGroup ?? {}).reduce((sum, current) => sum + current, 0);
    const dailyEntries = Object.entries(dailyViolations ?? {}).sort(([a], [b]) => a.localeCompare(b));

    return (
        <AppLayout>
            <Head title="Thống kê" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div>
                    <h1 className="text-3xl font-bold">Thống kê kịch bản kiểm thử</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Kết quả tổng hợp từ kịch bản 100 học sinh (40 hợp lệ nhóm A, 30 hợp lệ nhóm C, 30 nhóm B có biển số).
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Độ chính xác</CardTitle>
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatPercent(metrics.accuracy)}</div>
                            <p className="text-xs text-muted-foreground">Tổng {totalChecks} lượt • 2 lượt bỏ sót</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Recall</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatPercent(metrics.recall)}</div>
                            <p className="text-xs text-muted-foreground">28 / 30 vi phạm phát hiện đúng</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Precision</CardTitle>
                            <GaugeCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatPercent(metrics.precision)}</div>
                            <p className="text-xs text-muted-foreground">Không có cảnh báo sai (false positive)</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Thời gian xử lý TB</CardTitle>
                            <Timer className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatSeconds(metrics.average_processing_time)}</div>
                            <p className="text-xs text-muted-foreground">Tính trên metadata của AccessLog</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Phân bố theo nhóm</CardTitle>
                            <CardDescription>Số lượt kiểm tra theo phân nhóm kịch bản.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nhóm</TableHead>
                                        <TableHead>Số lượt</TableHead>
                                        <TableHead>Tỉ lệ</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {Object.entries(violationsByGroup ?? {}).map(([group, total]) => {
                                        const percentage = totalChecks > 0 ? ((total / totalChecks) * 100).toFixed(1) : '0.0';
                                        const label = groupLabels[group] ?? `Nhóm ${group}`;
                                        const variant = group === 'B' ? 'destructive' : 'secondary';

                                        return (
                                            <TableRow key={group}>
                                                <TableCell>
                                                    <Badge variant={variant}>{group}</Badge>
                                                    <div className="mt-1 text-xs text-muted-foreground">{label}</div>
                                                </TableCell>
                                                <TableCell>{total}</TableCell>
                                                <TableCell>{percentage}%</TableCell>
                                            </TableRow>
                                        );
                                    })}
                                    {Object.keys(violationsByGroup ?? {}).length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={3} className="py-6 text-center text-sm text-muted-foreground">
                                                Chưa có dữ liệu. Hãy chạy seeder để khởi tạo AccessLog.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Lượt theo ngày</CardTitle>
                            <CardDescription>So sánh số lượt phát hiện vi phạm và hợp lệ trong 7 ngày gần nhất.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Ngày</TableHead>
                                        <TableHead>Hợp lệ</TableHead>
                                        <TableHead>Vi phạm</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {dailyEntries.map(([date, value]) => (
                                        <TableRow key={date}>
                                            <TableCell className="whitespace-nowrap">{new Date(date).toLocaleDateString('vi-VN')}</TableCell>
                                            <TableCell>{value.valid}</TableCell>
                                            <TableCell>{value.violations}</TableCell>
                                        </TableRow>
                                    ))}
                                    {dailyEntries.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={3} className="py-6 text-center text-sm text-muted-foreground">
                                                Chưa có dữ liệu trong 7 ngày gần nhất.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Tổng quan hệ thống</CardTitle>
                        <CardDescription>Đếm tổng học sinh, thẻ đang hoạt động và phân bổ kết quả quẹt thẻ.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-3">
                        <div>
                            <div className="text-sm text-muted-foreground">Tổng học sinh</div>
                            <div className="text-2xl font-semibold">{stats.total_students}</div>
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground">Thẻ đang hoạt động</div>
                            <div className="text-2xl font-semibold">{stats.active_cards}</div>
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground">Lượt hợp lệ / vi phạm</div>
                            <div className="text-2xl font-semibold">
                                {stats.valid_total} / {stats.violations_total}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
