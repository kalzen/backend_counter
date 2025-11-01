import { router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';

interface Room {
    id: number;
    name: string;
    description: string | null;
    persons_count: number;
    current_count: number;
    in_count: number;
    out_count: number;
    created_at: string;
    updated_at: string;
}

interface RoomsIndexProps {
    rooms?: Room[];
}

export default function RoomsIndex({ rooms = [] }: RoomsIndexProps) {
    const handleEdit = (id: number) => {
        router.visit(route('rooms.edit', id));
    };

    const handleDelete = (id: number) => {
        if (confirm('Bạn có chắc muốn xóa phòng này?')) {
            router.delete(route('rooms.destroy', id), {
                preserveScroll: true,
                onSuccess: () => {
                    router.reload();
                },
            });
        }
    };

    const handleCreate = () => {
        router.visit(route('rooms.create'));
    };

    const handleView = (id: number) => {
        router.visit(route('rooms.show', id));
    };

    return (
        <AppLayout>
            <Head title="Danh sách phòng" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Danh sách phòng</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Quản lý các phòng theo dõi người ra vào</p>
                    </div>
                    <Button onClick={handleCreate} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Thêm phòng mới
                    </Button>
                </div>
                
                {rooms.length === 0 ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>Chưa có phòng nào</CardTitle>
                            <CardDescription>Hãy tạo phòng đầu tiên của bạn để bắt đầu quản lý</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button onClick={handleCreate} className="mt-4">Tạo phòng ngay</Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {rooms.map((room) => (
                            <Card key={room.id} className="flex flex-col hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="text-xl">{room.name}</CardTitle>
                                            {room.description && (
                                                <CardDescription className="mt-1">{room.description}</CardDescription>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1 space-y-4">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                                {room.in_count}
                                            </div>
                                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                                Đã vào
                                            </div>
                                        </div>
                                        <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                                                {room.out_count}
                                            </div>
                                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                                Đã ra
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                            {room.current_count}
                                        </div>
                                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                            Hiện tại trong phòng
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary">
                                            {room.persons_count} người được gán
                                        </Badge>
                                    </div>
                                    <div className="flex gap-2 pt-4 border-t">
                                        <Button 
                                            variant="outline" 
                                            onClick={() => handleView(room.id)}
                                            className="flex-1"
                                        >
                                            Xem chi tiết
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            onClick={() => handleEdit(room.id)}
                                            className="flex-1"
                                        >
                                            Sửa
                                        </Button>
                                        <Button 
                                            variant="destructive" 
                                            onClick={() => handleDelete(room.id)}
                                        >
                                            Xóa
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

