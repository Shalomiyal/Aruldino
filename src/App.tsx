import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Auth & Public
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

// Modular Imports
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Subjects from "./modules/academic/Subjects";
import Timetable from "./modules/academic/Timetable";
import Attendance from "./modules/attendance/Attendance";
import Exams from "./modules/academic/Exams";
import Communication from "./modules/communication/Communication";
import AuditLogs from "./modules/admin/AuditLogs";
import PermissionControl from "./modules/admin/PermissionControl";

import Assignments from "./pages/Assignments";
import Groups from "./pages/Groups";
import Events from "./pages/Events";
import Analytics from "./pages/Analytics";

// Admin Specific
import UserManagement from "./modules/admin/UserManagement";
import Batches from "./modules/admin/Batches";
import DepartmentManagement from "./modules/admin/DepartmentManagement";
import Grading from "./modules/academic/Grading";
import Enrollments from "./modules/academic/Enrollments";
import FacultyAssignment from "./modules/admin/FacultyAssignment";
import MyGrades from "./modules/student/MyGrades";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Enterprise Control Plane */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/subjects" element={<ProtectedRoute><Subjects /></ProtectedRoute>} />
            <Route path="/timetable" element={<ProtectedRoute><Timetable /></ProtectedRoute>} />
            <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />

            <Route path="/assignments" element={<ProtectedRoute><Assignments /></ProtectedRoute>} />
            <Route path="/groups" element={<ProtectedRoute><Groups /></ProtectedRoute>} />
            <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />

            {/* Restricted Capabilities */}
            <Route path="/analytics" element={<ProtectedRoute allowedRoles={['admin', 'lecturer']} requiredPermission="view:reports"><Analytics /></ProtectedRoute>} />

            {/* Admin Exclusive Control */}
            <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin', 'lecturer']} requiredPermission="manage:users"><UserManagement /></ProtectedRoute>} />
            <Route path="/admin/batches" element={<ProtectedRoute allowedRoles={['admin']}><Batches /></ProtectedRoute>} />
            <Route path="/admin/departments" element={<ProtectedRoute allowedRoles={['admin', 'lecturer']} requiredPermission="manage:departments"><DepartmentManagement /></ProtectedRoute>} />

            {/* Academic & Grading Logic */}
            <Route path="/grading" element={<ProtectedRoute allowedRoles={['admin', 'lecturer']} requiredPermission="manage:grading"><Grading /></ProtectedRoute>} />
            <Route path="/results" element={<ProtectedRoute allowedRoles={['student']}><MyGrades /></ProtectedRoute>} />
            <Route path="/exams" element={<ProtectedRoute><Exams /></ProtectedRoute>} />
            <Route path="/communication" element={<ProtectedRoute><Communication /></ProtectedRoute>} />
            <Route path="/admin/audit" element={<ProtectedRoute allowedRoles={['admin', 'lecturer']} requiredPermission="view:audit_logs"><AuditLogs /></ProtectedRoute>} />
            <Route path="/admin/security" element={<ProtectedRoute allowedRoles={['admin', 'lecturer']} requiredPermission="manage:security"><PermissionControl /></ProtectedRoute>} />
            <Route path="/admin/enrollments" element={<ProtectedRoute allowedRoles={['admin']}><Enrollments /></ProtectedRoute>} />
            <Route path="/admin/faculty" element={<ProtectedRoute allowedRoles={['admin']}><FacultyAssignment /></ProtectedRoute>} />


            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
