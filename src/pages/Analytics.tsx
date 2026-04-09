import { useEffect, useState, Suspense, lazy } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  BarChart3, TrendingUp, Users, FileText,
  PieChart as PieChartIcon, LineChart as LineChartIcon,
  Briefcase, GraduationCap, Loader2
} from 'lucide-react';
import StatCard from '@/components/StatCard';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Lazy load chart components
const ChartComponents = lazy(() => import('./AnalyticsCharts'));

const Analytics = () => {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [attendanceStats, setAttendanceStats] = useState<any[]>([]);
  const [workloadData, setWorkloadData] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    totalStudents: 0,
    avgAttendance: 0,
    activeSubjects: 0
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Performance Data
      const { data: perf } = await supabase.from('view_subject_performance' as any).select('*');
      setPerformanceData(perf || []);

      // 2. Attendance Stats
      const { data: att } = await supabase.from('view_attendance_stats' as any).select('*');
      setAttendanceStats(att || []);

      // 3. Workload (Only for Admins)
      if (role === 'admin') {
        const { data: work } = await supabase.from('view_lecturer_workload' as any).select('*');
        setWorkloadData(work || []);
      }

      // 4. Summary Stats
      const [studentsCount, subjectsCount] = await Promise.all([
        (supabase.from('profiles' as any).select('id', { count: 'exact', head: true }) as any).eq('status', 'active'),
        (supabase.from('subjects' as any).select('id', { count: 'exact', head: true }) as any).eq('is_active', true)
      ]);

      const avgAtt = (att || []).reduce((acc: number, curr: any) => acc + ((curr as any).attendance_rate || 0), 0) / (att?.length || 1);

      setSummary({
        totalStudents: studentsCount.count || 0,
        avgAttendance: Math.round(avgAtt),
        activeSubjects: subjectsCount.count || 0
      });

    } catch (error: any) {
      toast({ title: 'Analytics Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user, role]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="h-[60vh] flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in pb-10">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold font-heading tracking-tight">Institutional Intelligence</h1>
          <p className="text-muted-foreground">Real-time performance metrics and engagement monitoring.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Student Body"
            value={summary.totalStudents.toString()}
            icon={Users}
            className="bg-primary/5 border-primary/10"
          />
          <StatCard
            title="Avg Attendance"
            value={`${summary.avgAttendance}%`}
            icon={BarChart3}
            className="bg-success/5 border-success/10"
          />
          <StatCard
            title="Active Courses"
            value={summary.activeSubjects.toString()}
            icon={TrendingUp}
            className="bg-info/5 border-info/10"
          />
        </div>

        <Suspense fallback={
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }>
          <ChartComponents
            performanceData={performanceData}
            attendanceStats={attendanceStats}
            workloadData={workloadData}
            summary={summary}
            role={role || ''}
          />
        </Suspense>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
