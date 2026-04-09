import { lazy } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

interface AnalyticsChartsProps {
  performanceData: any[];
  attendanceStats: any[];
  workloadData: any[];
  summary: {
    totalStudents: number;
    avgAttendance: number;
    activeSubjects: number;
  };
  role: string;
}

const AnalyticsCharts = ({ performanceData, attendanceStats, workloadData, summary, role }: AnalyticsChartsProps) => {
  const COLORS = ['#2baec1', '#2e406a', '#ff8c00', '#00b7eb'];

  return (
    <div className="grid gap-6">
      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-[#2baec1]" />
            Subject Performance Overview
          </CardTitle>
          <CardDescription>Grade distribution across subjects</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="subject_name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="avg_grade" fill="#2baec1" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Attendance Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#2e406a]" />
            Attendance Statistics
          </CardTitle>
          <CardDescription>Monthly attendance trends</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={attendanceStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="present_count" fill="#2e406a" />
              <Bar dataKey="absent_count" fill="#ff8c00" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Lecturer Workload - Admin Only */}
      {role === 'admin' && workloadData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-[#00b7eb]" />
              Lecturer Workload Distribution
            </CardTitle>
            <CardDescription>Subject assignments per lecturer</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={workloadData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ lecturer_name, subject_count }) => `${lecturer_name}: ${subject_count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="subject_count"
                >
                  {workloadData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Students"
          value={summary.totalStudents}
          icon={Users}
          color="#2baec1"
        />
        <StatCard
          title="Average Attendance"
          value={`${summary.avgAttendance}%`}
          icon={TrendingUp}
          color="#2e406a"
        />
        <StatCard
          title="Active Subjects"
          value={summary.activeSubjects}
          icon={FileText}
          color="#ff8c00"
        />
      </div>
    </div>
  );
};

export default AnalyticsCharts;