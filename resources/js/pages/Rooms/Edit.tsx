import { router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save } from 'lucide-react';

interface Person {
    id: number;
    name: string;
    image_path: string | null;
    counter_track_id: string;
}

interface Room {
    id: number;
    name: string;
    description: string | null;
    persons: Person[];
}

interface EditRoomProps {
    room: Room;
}

export default function EditRoom({ room }: EditRoomProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: room.name,
        description: room.description || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('rooms.update', room.id), {
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
            <Head title={`Sửa phòng - ${room.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={handleCancel}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Sửa phòng</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Chỉnh sửa thông tin phòng</p>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Thông tin phòng</CardTitle>
                            <CardDescription>Cập nhật thông tin cơ bản về phòng</CardDescription>
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
                                        {processing ? 'Đang lưu...' : 'Lưu thay đổi'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Người trong phòng</CardTitle>
                            <CardDescription>{room.persons.length} người</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {room.persons.length === 0 ? (
                                <p className="text-sm text-gray-500">Chưa có người nào được gán</p>
                            ) : (
                                room.persons.map((person) => (
                                    <div 
                                        key={person.id} 
                                        className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                                    >
                                        <span className="text-sm font-medium">{person.name}</span>
                                        <span className="text-xs text-gray-500">ID: {person.counter_track_id}</span>
                                    </div>
                                ))
                            )}
                            <Button 
                                variant="outline" 
                                className="w-full mt-4"
                                onClick={() => router.visit(route('rooms.show', room.id))}
                            >
                                Quản lý người
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}

