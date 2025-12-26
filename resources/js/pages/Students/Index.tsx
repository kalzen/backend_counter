import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { AlertTriangle, GraduationCap, Users, Plus, Pencil } from 'lucide-react';
import { useState } from 'react';

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
    guardian_name: string | null;
    guardian_phone: string | null;
    notes: string | null;
    scenario_group: string | null;
    birth_date: string | null;
    enrolled_at: string | null;
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

// Tính toán min/max date cho birth_date (12-30 tuổi)
const getBirthDateConstraints = () => {
    const today = new Date();
    const maxDate = new Date(today);
    maxDate.setFullYear(today.getFullYear() - 12); // Tối thiểu 12 tuổi
    
    const minDate = new Date(today);
    minDate.setFullYear(today.getFullYear() - 30); // Tối đa 30 tuổi
    
    return {
        min: minDate.toISOString().split('T')[0],
        max: maxDate.toISOString().split('T')[0],
    };
};

export default function StudentsIndex({ students, summary }: StudentsPageProps) {
    const data = Array.isArray(students?.data) ? students.data : [];
    const links = Array.isArray(students?.links) ? students.links : [];
    const meta = students?.meta;
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<StudentRow | null>(null);
    const birthDateConstraints = getBirthDateConstraints();

    const { data: formData, setData, post, processing, errors, reset } = useForm({
        student_code: '',
        full_name: '',
        class_name: '',
        birth_date: '',
        gender: '',
        contact_phone: '',
        guardian_name: '',
        guardian_phone: '',
        notes: '',
        scenario_group: '',
        enrolled_at: '',
    });

    const { 
        data: editFormData, 
        setData: setEditData, 
        put: putEdit, 
        processing: editProcessing, 
        errors: editErrors, 
        reset: resetEdit 
    } = useForm({
        student_code: '',
        full_name: '',
        class_name: '',
        birth_date: '',
        gender: '',
        contact_phone: '',
        guardian_name: '',
        guardian_phone: '',
        notes: '',
        scenario_group: '',
        enrolled_at: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('students.store'), {
            onSuccess: () => {
                setIsDialogOpen(false);
                reset();
            },
        });
    };

    const handleEditClick = (student: StudentRow) => {
        setEditingStudent(student);
        // Format birth_date và enrolled_at từ string sang YYYY-MM-DD
        const formatDate = (dateStr: string | null) => {
            if (!dateStr) return '';
            try {
                return new Date(dateStr).toISOString().split('T')[0];
            } catch {
                return '';
            }
        };
        
        setEditData({
            student_code: student.student_code,
            full_name: student.full_name,
            class_name: student.class_name || '',
            birth_date: formatDate(student.birth_date),
            gender: student.gender || '',
            contact_phone: student.contact_phone || '',
            guardian_name: student.guardian_name || '',
            guardian_phone: student.guardian_phone || '',
            notes: student.notes || '',
            scenario_group: student.scenario_group || '',
            enrolled_at: formatDate(student.enrolled_at),
        });
        setIsEditDialogOpen(true);
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingStudent) return;
        
        putEdit(route('students.update', { student: editingStudent.id }), {
            onSuccess: () => {
                setIsEditDialogOpen(false);
                setEditingStudent(null);
                resetEdit();
            },
        });
    };

    const handleEditCancel = () => {
        setIsEditDialogOpen(false);
        setEditingStudent(null);
        resetEdit();
    };

    return (
        <AppLayout>
            <Head title="Quản lý học sinh" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-bold">Quản lý học sinh</h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Danh sách hồ sơ học sinh, trạng thái quẹt thẻ và phân nhóm theo kịch bản kiểm thử.
                        </p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Thêm học sinh
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Thêm học sinh mới</DialogTitle>
                                <DialogDescription>
                                    Điền thông tin học sinh vào form bên dưới. Các trường có dấu * là bắt buộc.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="student_code">
                                            Mã học sinh <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="student_code"
                                            value={formData.student_code}
                                            onChange={(e) => setData('student_code', e.target.value)}
                                            placeholder="VD: HS001"
                                            required
                                            aria-invalid={errors.student_code ? 'true' : 'false'}
                                        />
                                        {errors.student_code && (
                                            <p className="text-sm text-destructive">{errors.student_code}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="full_name">
                                            Họ và tên <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="full_name"
                                            value={formData.full_name}
                                            onChange={(e) => setData('full_name', e.target.value)}
                                            placeholder="VD: Nguyễn Văn A"
                                            required
                                            aria-invalid={errors.full_name ? 'true' : 'false'}
                                        />
                                        {errors.full_name && (
                                            <p className="text-sm text-destructive">{errors.full_name}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="class_name">Lớp</Label>
                                        <Input
                                            id="class_name"
                                            value={formData.class_name}
                                            onChange={(e) => setData('class_name', e.target.value)}
                                            placeholder="VD: 10A1"
                                            aria-invalid={errors.class_name ? 'true' : 'false'}
                                        />
                                        {errors.class_name && (
                                            <p className="text-sm text-destructive">{errors.class_name}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="birth_date">
                                            Ngày sinh <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="birth_date"
                                            type="date"
                                            value={formData.birth_date}
                                            onChange={(e) => setData('birth_date', e.target.value)}
                                            required
                                            min={birthDateConstraints.min}
                                            max={birthDateConstraints.max}
                                            aria-invalid={errors.birth_date ? 'true' : 'false'}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Độ tuổi từ 12 đến 30 tuổi
                                        </p>
                                        {errors.birth_date && (
                                            <p className="text-sm text-destructive">{errors.birth_date}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="gender">Giới tính</Label>
                                        <Select
                                            value={formData.gender}
                                            onValueChange={(value) => setData('gender', value)}
                                        >
                                            <SelectTrigger id="gender">
                                                <SelectValue placeholder="Chọn giới tính" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Nam">Nam</SelectItem>
                                                <SelectItem value="Nữ">Nữ</SelectItem>
                                                <SelectItem value="Khác">Khác</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.gender && (
                                            <p className="text-sm text-destructive">{errors.gender}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="scenario_group">Nhóm kịch bản</Label>
                                        <Select
                                            value={formData.scenario_group}
                                            onValueChange={(value) => setData('scenario_group', value)}
                                        >
                                            <SelectTrigger id="scenario_group">
                                                <SelectValue placeholder="Chọn nhóm" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="A">Nhóm A (≥16 tuổi, có biển số)</SelectItem>
                                                <SelectItem value="B">Nhóm B (&lt;16 tuổi, có biển số)</SelectItem>
                                                <SelectItem value="C">Nhóm C (&lt;16 tuổi, không biển số)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.scenario_group && (
                                            <p className="text-sm text-destructive">{errors.scenario_group}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="contact_phone">Số điện thoại</Label>
                                        <Input
                                            id="contact_phone"
                                            value={formData.contact_phone}
                                            onChange={(e) => setData('contact_phone', e.target.value)}
                                            placeholder="VD: 0901234567"
                                            aria-invalid={errors.contact_phone ? 'true' : 'false'}
                                        />
                                        {errors.contact_phone && (
                                            <p className="text-sm text-destructive">{errors.contact_phone}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="guardian_name">Tên phụ huynh</Label>
                                        <Input
                                            id="guardian_name"
                                            value={formData.guardian_name}
                                            onChange={(e) => setData('guardian_name', e.target.value)}
                                            placeholder="VD: Nguyễn Văn B"
                                            aria-invalid={errors.guardian_name ? 'true' : 'false'}
                                        />
                                        {errors.guardian_name && (
                                            <p className="text-sm text-destructive">{errors.guardian_name}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="guardian_phone">Số điện thoại phụ huynh</Label>
                                    <Input
                                        id="guardian_phone"
                                        value={formData.guardian_phone}
                                        onChange={(e) => setData('guardian_phone', e.target.value)}
                                        placeholder="VD: 0901234567"
                                        aria-invalid={errors.guardian_phone ? 'true' : 'false'}
                                    />
                                    {errors.guardian_phone && (
                                        <p className="text-sm text-destructive">{errors.guardian_phone}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="enrolled_at">Ngày nhập học</Label>
                                    <Input
                                        id="enrolled_at"
                                        type="date"
                                        value={formData.enrolled_at}
                                        onChange={(e) => setData('enrolled_at', e.target.value)}
                                        aria-invalid={errors.enrolled_at ? 'true' : 'false'}
                                    />
                                    {errors.enrolled_at && (
                                        <p className="text-sm text-destructive">{errors.enrolled_at}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="notes">Ghi chú</Label>
                                    <Textarea
                                        id="notes"
                                        value={formData.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        placeholder="Ghi chú thêm về học sinh..."
                                        rows={3}
                                        aria-invalid={errors.notes ? 'true' : 'false'}
                                    />
                                    {errors.notes && (
                                        <p className="text-sm text-destructive">{errors.notes}</p>
                                    )}
                                </div>

                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setIsDialogOpen(false);
                                            reset();
                                        }}
                                        disabled={processing}
                                    >
                                        Hủy
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Đang thêm...' : 'Thêm học sinh'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>

                    {/* Dialog Sửa học sinh */}
                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Sửa thông tin học sinh</DialogTitle>
                                <DialogDescription>
                                    Cập nhật thông tin học sinh. Các trường có dấu * là bắt buộc.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleEditSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="edit_student_code">
                                            Mã học sinh <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="edit_student_code"
                                            value={editFormData.student_code}
                                            onChange={(e) => setEditData('student_code', e.target.value)}
                                            placeholder="VD: HS001"
                                            required
                                            aria-invalid={editErrors.student_code ? 'true' : 'false'}
                                        />
                                        {editErrors.student_code && (
                                            <p className="text-sm text-destructive">{editErrors.student_code}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="edit_full_name">
                                            Họ và tên <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="edit_full_name"
                                            value={editFormData.full_name}
                                            onChange={(e) => setEditData('full_name', e.target.value)}
                                            placeholder="VD: Nguyễn Văn A"
                                            required
                                            aria-invalid={editErrors.full_name ? 'true' : 'false'}
                                        />
                                        {editErrors.full_name && (
                                            <p className="text-sm text-destructive">{editErrors.full_name}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="edit_class_name">Lớp</Label>
                                        <Input
                                            id="edit_class_name"
                                            value={editFormData.class_name}
                                            onChange={(e) => setEditData('class_name', e.target.value)}
                                            placeholder="VD: 10A1"
                                            aria-invalid={editErrors.class_name ? 'true' : 'false'}
                                        />
                                        {editErrors.class_name && (
                                            <p className="text-sm text-destructive">{editErrors.class_name}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="edit_birth_date">
                                            Ngày sinh <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="edit_birth_date"
                                            type="date"
                                            value={editFormData.birth_date}
                                            onChange={(e) => setEditData('birth_date', e.target.value)}
                                            required
                                            min={birthDateConstraints.min}
                                            max={birthDateConstraints.max}
                                            aria-invalid={editErrors.birth_date ? 'true' : 'false'}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Độ tuổi từ 12 đến 30 tuổi
                                        </p>
                                        {editErrors.birth_date && (
                                            <p className="text-sm text-destructive">{editErrors.birth_date}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="edit_gender">Giới tính</Label>
                                        <Select
                                            value={editFormData.gender}
                                            onValueChange={(value) => setEditData('gender', value)}
                                        >
                                            <SelectTrigger id="edit_gender">
                                                <SelectValue placeholder="Chọn giới tính" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Nam">Nam</SelectItem>
                                                <SelectItem value="Nữ">Nữ</SelectItem>
                                                <SelectItem value="Khác">Khác</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {editErrors.gender && (
                                            <p className="text-sm text-destructive">{editErrors.gender}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="edit_scenario_group">Nhóm kịch bản</Label>
                                        <Select
                                            value={editFormData.scenario_group}
                                            onValueChange={(value) => setEditData('scenario_group', value)}
                                        >
                                            <SelectTrigger id="edit_scenario_group">
                                                <SelectValue placeholder="Chọn nhóm" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="A">Nhóm A (≥16 tuổi, có biển số)</SelectItem>
                                                <SelectItem value="B">Nhóm B (&lt;16 tuổi, có biển số)</SelectItem>
                                                <SelectItem value="C">Nhóm C (&lt;16 tuổi, không biển số)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {editErrors.scenario_group && (
                                            <p className="text-sm text-destructive">{editErrors.scenario_group}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="edit_contact_phone">Số điện thoại</Label>
                                        <Input
                                            id="edit_contact_phone"
                                            value={editFormData.contact_phone}
                                            onChange={(e) => setEditData('contact_phone', e.target.value)}
                                            placeholder="VD: 0901234567"
                                            aria-invalid={editErrors.contact_phone ? 'true' : 'false'}
                                        />
                                        {editErrors.contact_phone && (
                                            <p className="text-sm text-destructive">{editErrors.contact_phone}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="edit_guardian_name">Tên phụ huynh</Label>
                                        <Input
                                            id="edit_guardian_name"
                                            value={editFormData.guardian_name}
                                            onChange={(e) => setEditData('guardian_name', e.target.value)}
                                            placeholder="VD: Nguyễn Văn B"
                                            aria-invalid={editErrors.guardian_name ? 'true' : 'false'}
                                        />
                                        {editErrors.guardian_name && (
                                            <p className="text-sm text-destructive">{editErrors.guardian_name}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit_guardian_phone">Số điện thoại phụ huynh</Label>
                                    <Input
                                        id="edit_guardian_phone"
                                        value={editFormData.guardian_phone}
                                        onChange={(e) => setEditData('guardian_phone', e.target.value)}
                                        placeholder="VD: 0901234567"
                                        aria-invalid={editErrors.guardian_phone ? 'true' : 'false'}
                                    />
                                    {editErrors.guardian_phone && (
                                        <p className="text-sm text-destructive">{editErrors.guardian_phone}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit_enrolled_at">Ngày nhập học</Label>
                                    <Input
                                        id="edit_enrolled_at"
                                        type="date"
                                        value={editFormData.enrolled_at}
                                        onChange={(e) => setEditData('enrolled_at', e.target.value)}
                                        aria-invalid={editErrors.enrolled_at ? 'true' : 'false'}
                                    />
                                    {editErrors.enrolled_at && (
                                        <p className="text-sm text-destructive">{editErrors.enrolled_at}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit_notes">Ghi chú</Label>
                                    <Textarea
                                        id="edit_notes"
                                        value={editFormData.notes}
                                        onChange={(e) => setEditData('notes', e.target.value)}
                                        placeholder="Ghi chú thêm về học sinh..."
                                        rows={3}
                                        aria-invalid={editErrors.notes ? 'true' : 'false'}
                                    />
                                    {editErrors.notes && (
                                        <p className="text-sm text-destructive">{editErrors.notes}</p>
                                    )}
                                </div>

                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleEditCancel}
                                        disabled={editProcessing}
                                    >
                                        Hủy
                                    </Button>
                                    <Button type="submit" disabled={editProcessing}>
                                        {editProcessing ? 'Đang cập nhật...' : 'Cập nhật'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
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
                                    <TableHead>Thao tác</TableHead>
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
                                            <TableCell>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEditClick(student)}
                                                    className="gap-2"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                    Sửa
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {data.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
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
