import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building2, BookOpen, Activity, UserCheck, ShieldCheck } from 'lucide-react';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ users: 0, depts: 0, subjects: 0, activeGrads: 0 });
    const [logs, setLogs] = useState<any[]>([]);

    useEffect(() => {
        const fetchStats = async () => {
            const [u, d, s, l] = await Promise.all([
                (supabase.from('profiles') as any).select('id', { count: 'exact' }),
                (supabase.from('departments' as any) as any).select('id', { count: 'exact' }),
                supabase.from('subjects').select('id', { count: 'exact' }),
                (supabase.from('activity_logs') as any).select('*, profiles(full_name)').order('created_at', { ascending: false }).limit(5)
            ]);

            setStats({
                users: u.count || 0,
                depts: d.count || 0,
                subjects: s.count || 0,
                activeGrads: 0
            });
            setLogs(l.data || []);
        };
        fetchStats();
    }, []);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Users" value={stats.users} icon={Users} color="text-blue-600" />
                <StatCard title="Departments" value={stats.depts} icon={Building2} color="text-purple-600" />
                <StatCard title="Active Courses" value={stats.subjects} icon={BookOpen} color="text-orange-600" />
                <StatCard title="System Health" value="100%" icon={ShieldCheck} color="text-green-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader><CardTitle>System Activity Logs</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {logs.length > 0 ? logs.map((log: any) => (
                                <div key={log.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary whitespace-nowrap px-2 font-bold text-[10px]">LOG</div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{log.action}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {log.profiles?.full_name} performed {log.entity_type} action • {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-center text-muted-foreground py-8">No recent activity found.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Real-time Status</CardTitle></CardHeader>
                    <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
                        <div className="h-24 w-24 rounded-full border-8 border-primary border-t-transparent animate-spin" />
                        <p className="font-medium">Monitoring Active Sessions</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <Card className="overflow-hidden border-none shadow-premium bg-card/50 backdrop-blur-sm">
        <CardContent className="p-6">
            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{title}</p>
                    <h3 className="text-3xl font-black font-heading tracking-tight">{value}</h3>
                </div>
                <div className={`p-3 rounded-xl bg-muted/50 ${color}`}>
                    <Icon className="h-5 w-5" />
                </div>
            </div>
        </CardContent>
    </Card>
);

export default AdminDashboard;
