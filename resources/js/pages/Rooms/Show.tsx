import { router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, LogIn, LogOut, Plus, Users } from 'lucide-react';

interface Person {
    id: number;
    name: string;
    image_path: string | null;
    counter_track_id: string;
}

interface LogEntry {
    id: number;
    person_name: string;
    direction: 'in' | 'out';
    timestamp: string;
}

interface Room {
    id: number;
    name: string;
    description: string | null;
    current_count: number;
    in_count: number;
    out_count: number;
    persons: Person[];
    recent_logs: LogEntry[];
}

interface ShowRoomProps {
    room: Room;
}

export default function ShowRoom({ room }: ShowRoomProps) {
    const handleEdit = () => {
        router.visit(route('rooms.edit', room.id));
    };

    const handleBack = () => {
        router.visit(route('rooms.index'));
    };

    const formatTimestamp = (timestamp: string) => {
        return new Date(timestamp).toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    return (
        <AppLayout>
            <Head title={room.name} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={handleBack}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold">{room.name}</h1>
                        {room.description && (
                            <p className="text-gray-600 dark:text-gray-400 mt-1">{room.description}</p>
                        )}
                    </div>
                    <Button onClick={handleEdit} className="gap-2">
                        <Edit className="w-4 h-4" />
                        Sửa phòng
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    {/* Stats Overview */}
                    <div className="grid gap-4 md:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Tổng quan</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                                        {room.in_count}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
                                        <LogIn className="w-4 h-4" />
                                        Đã vào
                                    </div>
                                </div>
                                <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                    <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-1">
                                        {room.out_count}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
                                        <LogOut className="w-4 h-4" />
                                        Đã ra
                                    </div>
                                </div>
                                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                    <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                                        {room.current_count}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        Hiện tại trong phòng
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Persons List & Recent Activity */}
                    <div className="grid gap-4 md:col-span-2">
                        {/* Persons */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-5 h-5" />
                                        <CardTitle className="text-lg">Danh sách người</CardTitle>
                                    </div>
                                    <Badge variant="secondary">{room.persons.length} người</Badge>
                                </div>
                                <CardDescription>Danh sách người được gán với counter ID trong phòng này</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {room.persons.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500">Chưa có người nào được gán</p>
                                        <Button variant="outline" className="mt-4 gap-2">
                                            <Plus className="w-4 h-4" />
                                            Thêm người
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {room.persons.map((person) => (
                                            <div 
                                                key={person.id} 
                                                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                            >
                                                <div className="flex items-center gap-3 w-full">
                                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <Users className="w-5 h-5 text-primary" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-medium">{person.name}</p>
                                                        <p className="text-xs text-gray-500">Counter ID: {person.counter_track_id}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Recent Activity */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Hoạt động gần đây</CardTitle>
                                <CardDescription>Lịch sử 20 hoạt động cuối cùng</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {room.recent_logs.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500">Chưa có hoạt động nào</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {room.recent_logs.map((log) => (
                                            <div 
                                                key={log.id}
                                                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                                            >
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                                    log.direction === 'in' 
                                                        ? 'bg-green-100 dark:bg-green-900/20' 
                                                        : 'bg-red-100 dark:bg-red-900/20'
                                                }`}>
                                                    {log.direction === 'in' ? (
                                                        <LogIn className={`w-4 h-4 ${log.direction === 'in' ? 'text-green-600 dark:text-green-400' : ''}`} />
                                                    ) : (
                                                        <LogOut className="w-4 h-4 text-red-600 dark:text-red-400" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium">{log.person_name}</p>
                                                    <p className="text-xs text-gray-500">{formatTimestamp(log.timestamp)}</p>
                                                </div>
                                                <Badge variant={log.direction === 'in' ? 'default' : 'destructive'}>
                                                    {log.direction === 'in' ? 'Vào' : 'Ra'}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

