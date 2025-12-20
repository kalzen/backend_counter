import { router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface StudentCardItem {
    id: number;
    card_code: string;
    card_type: 'RFID' | 'QR';
    issued_at: string | null;
    expires_at: string | null;
    is_active: boolean;
}

interface EditStudentProps {
    student: {
        id: number;
        student_code: string;
        full_name: string;
        class_name: string;
        gender: 'male' | 'female' | 'other' | null;
        birth_date: string;
        avatar_url: string | null;
        contact_phone: string | null;
        guardian_name: string | null;
        guardian_phone: string | null;
        notes: string | null;
        violation_count: number;
        cards: StudentCardItem[];
    };
}

export default function EditStudent({ student }: EditStudentProps) {
    const { data, setData, put, processing, errors } = useForm({
        student_code: student.student_code,
        full_name: student.full_name,
        class_name: student.class_name,
        gender: student.gender ?? '',
        birth_date: student.birth_date,
        contact_phone: student.contact_phone ?? '',
        guardian_name: student.guardian_name ?? '',
        guardian_phone: student.guardian_phone ?? '',
        notes: student.notes ?? '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('students.update', student.id), {
            preserveScroll: true,
        });
    };

    const handleCancel = () => {
        router.visit(route('students.show', student.id));
    };

    return (
        <AppLayout>
            <Head title={`Chỉnh sửa học sinh - ${student.full_name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={handleCancel}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Chỉnh sửa hồ sơ</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Cập nhật thông tin học sinh và theo dõi thẻ được gắn.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid gap-4 xl:grid-cols-[2fr_1fr]">
                    <Card className="space-y-6">
                        <CardHeader>
                            <CardTitle>Thông tin học sinh</CardTitle>
                            <CardDescription>
                                Cập nhật thông tin cơ bản; hệ thống sẽ đồng bộ với module xử lý vi phạm.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="student_code">
                                        Mã học sinh <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="student_code"
                                        value={data.student_code}
                                        onChange={(e) => setData('student_code', e.target.value)}
                                        required
                                        className={errors.student_code ? 'border-red-500' : ''}
                                    />
                                    {errors.student_code && (
                                        <p className="text-sm text-red-500">{errors.student_code}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="full_name">
                                        Họ và tên <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="full_name"
                                        value={data.full_name}
                                        onChange={(e) => setData('full_name', e.target.value)}
                                        required
                                        className={errors.full_name ? 'border-red-500' : ''}
                                    />
                                    {errors.full_name && (
                                        <p className="text-sm text-red-500">{errors.full_name}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="class_name">
                                        Lớp <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="class_name"
                                        value={data.class_name}
                                        onChange={(e) => setData('class_name', e.target.value)}
                                        required
                                        className={errors.class_name ? 'border-red-500' : ''}
                                    />
                                    {errors.class_name && (
                                        <p className="text-sm text-red-500">{errors.class_name}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label>Giới tính</Label>
                                    <Select
                                        value={data.gender}
                                        onValueChange={(value: typeof data.gender) => setData('gender', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn giới tính" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="male">Nam</SelectItem>
                                            <SelectItem value="female">Nữ</SelectItem>
                                            <SelectItem value="other">Khác</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.gender && (
                                        <p className="text-sm text-red-500">{errors.gender}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="birth_date">
                                        Ngày sinh <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="birth_date"
                                        type="date"
                                        value={data.birth_date}
                                        onChange={(e) => setData('birth_date', e.target.value)}
                                        required
                                        className={errors.birth_date ? 'border-red-500' : ''}
                                    />
                                    {errors.birth_date && (
                                        <p className="text-sm text-red-500">{errors.birth_date}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="contact_phone">Số điện thoại học sinh</Label>
                                    <Input
                                        id="contact_phone"
                                        value={data.contact_phone}
                                        onChange={(e) => setData('contact_phone', e.target.value)}
                                        className={errors.contact_phone ? 'border-red-500' : ''}
                                    />
                                    {errors.contact_phone && (
                                        <p className="text-sm text-red-500">{errors.contact_phone}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="guardian_phone">Số điện thoại phụ huynh</Label>
                                    <Input
                                        id="guardian_phone"
                                        value={data.guardian_phone}
                                        onChange={(e) => setData('guardian_phone', e.target.value)}
                                        className={errors.guardian_phone ? 'border-red-500' : ''}
                                    />
                                    {errors.guardian_phone && (
                                        <p className="text-sm text-red-500">{errors.guardian_phone}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="guardian_name">Tên phụ huynh</Label>
                                <Input
                                    id="guardian_name"
                                    value={data.guardian_name}
                                    onChange={(e) => setData('guardian_name', e.target.value)}
                                    className={errors.guardian_name ? 'border-red-500' : ''}
                                />
                                {errors.guardian_name && (
                                    <p className="text-sm text-red-500">{errors.guardian_name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Ghi chú</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    rows={4}
                                    className={errors.notes ? 'border-red-500' : ''}
                                />
                                {errors.notes && <p className="text-sm text-red-500">{errors.notes}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Thẻ đã gán</CardTitle>
                                <CardDescription>
                                    Hệ thống sử dụng thẻ này để nhận diện khi học sinh quẹt tại nhà xe.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {student.cards.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">
                                        Chưa có thẻ nào. Hãy gán thẻ cho học sinh trong mục quản lý thẻ.
                                    </p>
                                ) : (
                                    student.cards.map((card) => (
                                        <div
                                            key={card.id}
                                            className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 p-3"
                                        >
                                            <div>
                                                <p className="font-medium">{card.card_code}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Loại: {card.card_type === 'RFID' ? 'RFID' : 'QR code'}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Cấp: {card.issued_at ? new Date(card.issued_at).toLocaleDateString('vi-VN') : 'Chưa rõ'}
                                                </p>
                                            </div>
                                            <Badge variant={card.is_active ? 'secondary' : 'outline'}>
                                                {card.is_active ? 'Đang hoạt động' : 'Đã vô hiệu'}
                                            </Badge>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Thống kê vi phạm</CardTitle>
                                <CardDescription>
                                    Tổng số lần hệ thống ghi nhận học sinh sử dụng xe không phù hợp.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm text-muted-foreground">
                                <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 p-3">
                                    <span>Lượt vi phạm</span>
                                    <span className="text-lg font-semibold text-destructive">{student.violation_count}</span>
                                </div>
                                <p>
                                    Khi vượt quá 3 lượt vi phạm/tháng, hệ thống sẽ đề xuất gửi thông báo tới phụ huynh và
                                    giáo viên chủ nhiệm.
                                </p>
                            </CardContent>
                        </Card>

                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={handleCancel} disabled={processing}>
                                Hủy
                            </Button>
                            <Button type="submit" disabled={processing} className="gap-2">
                                <Save className="w-4 h-4" />
                                {processing ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
