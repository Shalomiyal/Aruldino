import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard, BookOpen, ClipboardCheck, FileText, Users,
  Calendar as CalendarIcon, BarChart3, Bell, LogOut, Menu, X, GraduationCap,
  Settings, ChevronDown, UserCircle, Layers, BookOpenCheck, Wallet,
  Award, Calculator, Trophy, Shield, ShieldCheck, UserPlus, MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import NotificationCenter from '@/components/NotificationCenter';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  roles?: string[];
  permission?: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Subjects', path: '/subjects', icon: BookOpen, roles: ['admin', 'lecturer'] },
  { label: 'Timetable', path: '/timetable', icon: CalendarIcon, roles: ['admin', 'lecturer'] },
  { label: 'Exams', path: '/exams', icon: Trophy, roles: ['lecturer'] },
  { label: 'Common Room', path: '/communication', icon: Bell },
  { label: 'Attendance', path: '/attendance', icon: ClipboardCheck, roles: ['lecturer'] },

  { label: 'Assignments', path: '/assignments', icon: FileText, roles: ['lecturer'] },
  { label: 'Academy Events', path: '/events', icon: CalendarIcon, roles: ['admin', 'lecturer'] },
  { label: 'Social Hub', path: '/groups', icon: MessageSquare },

  { label: 'Grading', path: '/grading', icon: Calculator, roles: ['lecturer'] },
  { label: 'My Results', path: '/results', icon: Award, roles: ['student'] },
  { label: 'Departments', path: '/admin/departments', icon: BookOpenCheck, roles: ['admin', 'lecturer'] },
  { label: 'Manage Batches', path: '/admin/batches', icon: Layers, roles: ['admin', 'lecturer'] },
  { label: 'Enrollments', path: '/admin/enrollments', icon: UserPlus, roles: ['admin', 'lecturer'] },
  { label: 'Users', path: '/admin/users', icon: Settings, roles: ['admin', 'lecturer'], permission: 'manage:users' },
  { label: 'Audit Logs', path: '/admin/audit', icon: Shield, roles: ['admin', 'lecturer'], permission: 'view:audit_logs' },
  { label: 'Security', path: '/admin/security', icon: ShieldCheck, roles: ['admin', 'lecturer'], permission: 'manage:security' },
  { label: 'System Admin', path: '/admin/system', icon: Shield, roles: ['admin'] },
  { label: 'Reports', path: '/analytics', icon: BarChart3, roles: ['admin', 'lecturer'] },
];

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { profile, role, signOut, hasPermission } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState<string>('');

  const filteredNav = navItems.filter(item => {
    const hasRole = !item.roles || (role && (item.roles.includes(role) || (role === 'superadmin' && item.roles.includes('admin'))));
    const hasPerm = !item.permission || hasPermission(item.permission);
    return hasRole && hasPerm;
  });

  const handleSignOut = async () => {
    await signOut();
  };

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const roleLabel = role ? role.charAt(0).toUpperCase() + role.slice(1) : '';

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-200">
            <img src="/logo.png" alt="Logo" className="h-10 w-10 object-contain" />
            <div>
              <h1 className="text-lg font-bold font-heading text-slate-900">SAMS</h1>
              <p className="text-xs text-slate-500">Academic Management</p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="ml-auto lg:hidden text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1 custom-scrollbar">
            {filteredNav.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 group hover-lift ${isActive
                    ? 'bg-gradient-to-r from-[#2baec1] to-[#2baec1]/90 text-white shadow-lg shadow-[#2baec1]/30'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                >
                  <item.icon className={`h-5 w-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-[#2baec1]'}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="border-t border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="gradient-primary text-white text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {profile?.full_name || 'User'}
                </p>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-slate-100 text-slate-700 border border-slate-200">
                  {roleLabel}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden relative">
        {/* Decorative background element */}
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#ff8c00]/5 blur-[100px] rounded-full -z-10 pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-[#00b7eb]/5 blur-[80px] rounded-full -z-10 pointer-events-none"></div>

        {/* Topbar */}
        <header className="flex items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-xl px-4 py-4 lg:px-8 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-slate-700"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="hidden lg:block">
            <h2 className="text-lg font-semibold font-heading text-slate-900">
              {filteredNav.find(i => i.path === location.pathname)?.label || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <NotificationCenter />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="gradient-primary text-white text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-white border border-slate-200 shadow-xl">
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <UserCircle className="mr-2 h-4 w-4 text-slate-600" />
                  <span className="text-slate-700">Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-200" />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-transparent">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
