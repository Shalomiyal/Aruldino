import { useAuth } from '@/context/AuthContext';
import AdminDashboard from '@/modules/admin/AdminDashboard';
import LecturerDashboard from '@/modules/lecturer/LecturerDashboard';
import StudentDashboard from '@/modules/student/StudentDashboard';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Loader2 } from 'lucide-react';

const Dashboard = () => {
  const { role, loading } = useAuth();

  const renderDashboard = () => {
    switch (role) {
      case 'admin':
      case 'superadmin':
        return <AdminDashboard />;
      case 'lecturer':
        return <LecturerDashboard />;
      case 'student':
        return <StudentDashboard />;
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Unauthorized Access</p>
          </div>
        );
    }
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <h1 className="text-2xl font-black font-heading tracking-tight mb-2 underline decoration-primary decoration-4 underline-offset-4">
          Campus Overview
        </h1>
        <p className="text-muted-foreground mb-8">Accessing SAMS Control Plane as <span className="text-primary font-bold uppercase">{role}</span></p>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          renderDashboard()
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
