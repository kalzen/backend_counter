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

interface FormData {
    student_code: string;
    full_name: string;
    class_name: string;
    gender: 'male' | 'female' | 'other' | '';
    birth_date: string;
    avatar_path: string;
    contact_phone: string;
    guardian_name: string;
    guardian_phone: string;
    notes: string;
    card_code: string;
    card_type: 'RFID' | 'QR';
    issued_at: string;
    expires_at: string;
}

export default function CreateStudent() {
    const { data, setData, post, processing, errors } = useForm<FormData>({
        student_code: '',
        full_name: '',
        class_name: '',
        gender: '',
        birth_date: '',
        avatar_path: '',
        contact_phone: '',
        guardian_name: '',
        guardian_phone: '',
        notes: '',
        card_code: '',
        card_type: 'RFID',
        issued_at: '',
        expires_at: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('students.store'), {
            preserveScroll: true,
        });
    };

    const handleCancel = () => {
        router.visit(route('students.index'));
    };

    return (
        <AppLayout>
            <Head title="Thêm học sinh" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={handleCancel}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Thêm học sinh mới</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Tạo hồ sơ học sinh và gắn thẻ quẹt để theo dõi vi phạm.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid gap-4 xl:grid-cols-[2fr_1fr]">
                    <Card className="space-y-6">
                        <CardHeader>
                            <CardTitle>Thông tin học sinh</CardTitle>
                            <CardDescription>
                                Nhập thông tin cơ bản của học sinh, hệ thống sẽ tự động tính tuổi khi ghi nhận lượt vào ra.
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
                                        placeholder="VD: HS0001"
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
                                        placeholder="VD: Nguyễn Văn A"
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
                                        placeholder="VD: 10A1"
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
                                        onValueChange={(value: FormData['gender']) => setData('gender', value)}
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
                                        placeholder="VD: 0912xxxxxx"
                                        className={errors.contact_phone ? 'border-red-500' : ''}
                                    />
                                    {errors.contact_phone && (
                                        <p className="text-sm text-red-500">{errors.contact_phone}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="avatar_path">Ảnh đại diện (tuỳ chọn)</Label>
                                    <Input
                                        id="avatar_path"
                                        value={data.avatar_path}
                                        onChange={(e) => setData('avatar_path', e.target.value)}
                                        placeholder="Đường dẫn ảnh hoặc URL"
                                        className={errors.avatar_path ? 'border-red-500' : ''}
                                    />
                                    {errors.avatar_path && (
                                        <p className="text-sm text-red-500">{errors.avatar_path}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Ghi chú</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Ví dụ: học sinh thường gửi xe sau 6h30, đề nghị chú ý"
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
                                <CardTitle>Thông tin phụ huynh</CardTitle>
                                <CardDescription>
                                    Liên hệ dùng để cảnh báo khi phát hiện học sinh vi phạm nhiều lần.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="space-y-2">
                                    <Label htmlFor="guardian_name">Tên phụ huynh</Label>
                                    <Input
                                        id="guardian_name"
                                        value={data.guardian_name}
                                        onChange={(e) => setData('guardian_name', e.target.value)}
                                        placeholder="VD: Trần Thị B"
                                        className={errors.guardian_name ? 'border-red-500' : ''}
                                    />
                                    {errors.guardian_name && (
                                        <p className="text-sm text-red-500">{errors.guardian_name}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="guardian_phone">Số điện thoại phụ huynh</Label>
                                    <Input
                                        id="guardian_phone"
                                        value={data.guardian_phone}
                                        onChange={(e) => setData('guardian_phone', e.target.value)}
                                        placeholder="VD: 0987xxxxxx"
                                        className={errors.guardian_phone ? 'border-red-500' : ''}
                                    />
                                    {errors.guardian_phone && (
                                        <p className="text-sm text-red-500">{errors.guardian_phone}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Gán thẻ quẹt</CardTitle>
                                <CardDescription>
                                    Mỗi học sinh cần tối thiểu một thẻ RFID/QR để hệ thống xác định khi vào nhà xe.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="space-y-2">
                                    <Label htmlFor="card_code">
                                        Mã thẻ <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="card_code"
                                        value={data.card_code}
                                        onChange={(e) => setData('card_code', e.target.value)}
                                        placeholder="VD: RFID001"
                                        required
                                        className={errors.card_code ? 'border-red-500' : ''}
                                    />
                                    {errors.card_code && (
                                        <p className="text-sm text-red-500">{errors.card_code}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label>Loại thẻ</Label>
                                    <Select
                                        value={data.card_type}
                                        onValueChange={(value: FormData['card_type']) => setData('card_type', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="RFID">RFID</SelectItem>
                                            <SelectItem value="QR">QR code</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.card_type && (
                                        <p className="text-sm text-red-500">{errors.card_type}</p>
                                    )}
                                </div>
                                <div className="grid gap-3 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="issued_at">Ngày cấp</Label>
                                        <Input
                                            id="issued_at"
                                            type="date"
                                            value={data.issued_at}
                                            onChange={(e) => setData('issued_at', e.target.value)}
                                            className={errors.issued_at ? 'border-red-500' : ''}
                                        />
                                        {errors.issued_at && (
                                            <p className="text-sm text-red-500">{errors.issued_at}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="expires_at">Ngày hết hạn</Label>
                                        <Input
                                            id="expires_at"
                                            type="date"
                                            value={data.expires_at}
                                            onChange={(e) => setData('expires_at', e.target.value)}
                                            className={errors.expires_at ? 'border-red-500' : ''}
                                        />
                                        {errors.expires_at && (
                                            <p className="text-sm text-red-500">{errors.expires_at}</p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="outline" onClick={handleCancel} disabled={processing}>
                                Hủy
                            </Button>
                            <Button type="submit" disabled={processing} className="gap-2">
                                <Save className="w-4 h-4" />
                                {processing ? 'Đang lưu...' : 'Tạo hồ sơ'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
