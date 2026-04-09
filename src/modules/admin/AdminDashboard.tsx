import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building2, BookOpen, ShieldCheck, Clock, LogIn, TrendingUp, Award } from 'lucide-react';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ users: 0, depts: 0, subjects: 0, activeGrads: 0 });
    const [logs, setLogs] = useState<any[]>([]);
    const [recentLogins, setRecentLogins] = useState<any[]>([]);

    useEffect(() => {
        const fetchStats = async () => {
            const [u, d, s, l, logins] = await Promise.all([
                (supabase.from('profiles') as any).select('id', { count: 'exact' }),
                (supabase.from('departments' as any) as any).select('id', { count: 'exact' }),
                supabase.from('subjects').select('id', { count: 'exact' }),
                (supabase.from('activity_logs') as any).select('*, profiles(full_name)').order('created_at', { ascending: false }).limit(5),
                (supabase.from('activity_logs') as any).select('*, profiles(full_name)').eq('action', 'LOGIN').order('created_at', { ascending: false }).limit(5)
            ]);

            setStats({
                users: u.count || 0,
                depts: d.count || 0,
                subjects: s.count || 0,
                activeGrads: 0
            });
            setLogs(l.data || []);
            setRecentLogins(logins.data || []);
        };
        fetchStats();
    }, []);

    return (
        <div className="space-y-8">
            {/* Stats Grid with 3D Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard3D title="Total Users" value={stats.users} icon={Users} primaryColor="#ff8c00" secondaryColor="#00b7eb" />
                <StatCard3D title="Departments" value={stats.depts} icon={Building2} primaryColor="#00b7eb" secondaryColor="#ff8c00" />
                <StatCard3D title="Active Courses" value={stats.subjects} icon={BookOpen} primaryColor="#ff8c00" secondaryColor="#00b7eb" />
                <StatCard3D title="System Health" value="100%" icon={ShieldCheck} primaryColor="#10b981" secondaryColor="#059669" />
            </div>

            {/* Activity & Logins Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border-0 shadow-2xl bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#ff8c00] via-[#00b7eb] to-[#ff8c00]"></div>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-white">
                            <div className="p-2 rounded-xl bg-gradient-to-br from-[#ff8c00] to-[#ff8c00]/60 shadow-lg">
                                <TrendingUp className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-lg font-bold">Campus Activity</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {logs.length > 0 ? logs.map((log: any) => (
                                <div key={log.id} className="group flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#ff8c00]/30 transition-all duration-300 hover:scale-[1.02]">
                                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#ff8c00] to-[#ff8c00]/60 flex items-center justify-center text-white font-bold text-xs shadow-lg group-hover:shadow-[#ff8c00]/50 transition-shadow">
                                        {log.action.slice(0, 3)}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-white">{log.action}</p>
                                        <p className="text-xs text-white/60">
                                            <span className="font-medium text-[#00b7eb]">{log.profiles?.full_name || 'Unknown'}</span> • {log.entity_type} • {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-center text-white/60 py-8">No recent activity found.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-2xl bg-gradient-to-br from-[#00b7eb]/10 to-slate-800/80 backdrop-blur-xl overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00b7eb] to-[#00b7eb]/60"></div>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-white">
                            <div className="p-2 rounded-xl bg-gradient-to-br from-[#00b7eb] to-[#00b7eb]/60 shadow-lg">
                                <LogIn className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-lg font-bold">Recent Logins</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {recentLogins.length > 0 ? recentLogins.map((login: any) => (
                            <div key={login.id} className="group flex items-center gap-3 p-3 rounded-xl bg-[#00b7eb]/10 border border-[#00b7eb]/20 hover:bg-[#00b7eb]/20 hover:border-[#00b7eb]/40 transition-all duration-300 hover:scale-[1.02]">
                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#00b7eb] to-[#00b7eb]/60 flex items-center justify-center text-white shadow-lg group-hover:shadow-[#00b7eb]/50 transition-shadow">
                                    <LogIn className="h-5 w-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-white truncate">{login.profiles?.full_name || 'Unknown'}</p>
                                    <p className="text-xs text-white/60 flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {new Date(login.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(login.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        )) : (
                            <p className="text-center text-white/60 py-8">No recent logins found.</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Campus Stats Section */}
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#ff8c00] via-[#00b7eb] to-[#ff8c00]"></div>
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-white">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-[#ff8c00] to-[#ff8c00]/60 shadow-lg">
                            <Award className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-lg font-bold">Campus Statistics</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <CampusStatItem label="Total Students" value={stats.users} icon={Users} color="#ff8c00" />
                        <CampusStatItem label="Departments" value={stats.depts} icon={Building2} color="#00b7eb" />
                        <CampusStatItem label="Active Subjects" value={stats.subjects} icon={BookOpen} color="#ff8c00" />
                        <CampusStatItem label="System Uptime" value="99.9%" icon={ShieldCheck} color="#10b981" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

// 3D Stat Card Component
const StatCard3D = ({ title, value, icon: Icon, primaryColor, secondaryColor }: any) => (
    <div className="group relative perspective-1000">
        <Card className="relative border-0 shadow-xl bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r" style={{ backgroundImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}></div>
            <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full opacity-10 transition-transform group-hover:scale-150" style={{ backgroundColor: primaryColor }}></div>
            <CardContent className="p-6 relative z-10">
                <div className="flex justify-between items-start">
                    <div className="space-y-2">
                        <p className="text-xs font-bold uppercase tracking-widest text-white/60">{title}</p>
                        <h3 className="text-4xl font-black text-white" style={{ textShadow: `0 0 20px ${primaryColor}40` }}>{value}</h3>
                    </div>
                    <div
                        className="p-4 rounded-2xl shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-2xl"
                        style={{
                            background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                            boxShadow: `0 4px 20px ${primaryColor}60`
                        }}
                    >
                        <Icon className="h-6 w-6 text-white" />
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
);

// Campus Stat Item
const CampusStatItem = ({ label, value, icon: Icon, color }: any) => (
    <div className="group flex flex-col items-center p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-opacity-50 transition-all duration-300 hover:scale-105" style={{ borderColor: `${color}40` }}>
        <div
            className="p-3 rounded-xl mb-3 shadow-lg transition-all duration-300 group-hover:scale-110"
            style={{
                background: `linear-gradient(135deg, ${color}, ${color}80)`,
                boxShadow: `0 4px 15px ${color}40`
            }}
        >
            <Icon className="h-5 w-5 text-white" />
        </div>
        <p className="text-2xl font-bold text-white mb-1">{value}</p>
        <p className="text-xs text-white/60 text-center uppercase tracking-wide">{label}</p>
    </div>
);

export default AdminDashboard;
