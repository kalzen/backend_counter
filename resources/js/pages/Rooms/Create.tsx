import { router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save } from 'lucide-react';

interface FormData {
    name: string;
    description: string;
}

export default function CreateRoom() {
    const { data, setData, post, processing, errors } = useForm<FormData>({
        name: '',
        description: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('rooms.store'), {
            onSuccess: () => {
                // Success will redirect automatically
            },
        });
    };

    const handleCancel = () => {
        router.visit(route('rooms.index'));
    };

    return (
        <AppLayout>
            <Head title="Thêm phòng mới" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={handleCancel}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Thêm phòng mới</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Tạo một phòng mới để theo dõi người ra vào</p>
                    </div>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Thông tin phòng</CardTitle>
                        <CardDescription>Nhập thông tin cơ bản về phòng</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    Tên phòng <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="VD: Phòng họp A"
                                    required
                                    className={errors.name ? 'border-red-500' : ''}
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-500">{errors.name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Mô tả</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="VD: Phòng họp tầng 1, sức chứa 20 người"
                                    rows={4}
                                    className={errors.description ? 'border-red-500' : ''}
                                />
                                {errors.description && (
                                    <p className="text-sm text-red-500">{errors.description}</p>
                                )}
                            </div>

                            <div className="flex gap-2 justify-end pt-4">
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={handleCancel}
                                    disabled={processing}
                                >
                                    Hủy
                                </Button>
                                <Button type="submit" disabled={processing} className="gap-2">
                                    <Save className="w-4 h-4" />
                                    {processing ? 'Đang tạo...' : 'Tạo phòng'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

