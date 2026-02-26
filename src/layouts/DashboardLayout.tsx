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
  { label: 'Subjects', path: '/subjects', icon: BookOpen },
  { label: 'Timetable', path: '/timetable', icon: CalendarIcon },
  { label: 'Exams', path: '/exams', icon: Trophy },
  { label: 'Common Room', path: '/communication', icon: Bell },
  { label: 'Attendance', path: '/attendance', icon: ClipboardCheck },

  { label: 'Assignments', path: '/assignments', icon: FileText },
  { label: 'Academy Events', path: '/events', icon: CalendarIcon },
  { label: 'Social Hub', path: '/groups', icon: MessageSquare },

  { label: 'Grading', path: '/grading', icon: Calculator, roles: ['admin', 'lecturer'], permission: 'manage:grading' },
  { label: 'My Results', path: '/results', icon: Award, roles: ['student'] },
  { label: 'Departments', path: '/admin/departments', icon: BookOpenCheck, roles: ['admin'], permission: 'manage:departments' },
  { label: 'Manage Batches', path: '/admin/batches', icon: Layers, roles: ['admin'] },
  { label: 'Enrollments', path: '/admin/enrollments', icon: UserPlus, roles: ['admin'] },
  { label: 'Users', path: '/admin/users', icon: Settings, roles: ['admin', 'lecturer'], permission: 'manage:users' },
  { label: 'Audit Logs', path: '/admin/audit', icon: Shield, roles: ['admin', 'lecturer'], permission: 'view:audit_logs' },
  { label: 'Security', path: '/admin/security', icon: ShieldCheck, roles: ['admin', 'lecturer'], permission: 'manage:security' },
  { label: 'Reports', path: '/analytics', icon: BarChart3, roles: ['admin', 'lecturer'], permission: 'view:reports' },
];

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { profile, role, signOut, hasPermission } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState<string>('');

  const filteredNav = navItems.filter(item => {
    const hasRole = !item.roles || (role && item.roles.includes(role));
    const hasPerm = !item.permission || hasPermission(item.permission);
    return hasRole && hasPerm;
  });

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const roleLabel = role ? role.charAt(0).toUpperCase() + role.slice(1) : '';

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 gradient-sidebar transform transition-transform duration-300 lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
            <img src="/logo.png" alt="Logo" className="h-10 w-10 object-contain" />
            <div>
              <h1 className="text-lg font-bold font-heading text-sidebar-foreground">SAMS</h1>
              <p className="text-xs text-sidebar-muted">Academic Management</p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="ml-auto lg:hidden text-sidebar-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2 custom-scrollbar">
            {filteredNav.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-300 group hover-lift ${isActive
                    ? 'bg-primary text-white shadow-lg shadow-primary/30'
                    : 'text-sidebar-foreground/60 hover:bg-white/5 hover:text-sidebar-foreground'
                    }`}
                >
                  <item.icon className={`h-5 w-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-white' : 'text-primary/70 group-hover:text-primary'}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="border-t border-sidebar-border p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="gradient-primary text-primary-foreground text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {profile?.full_name || 'User'}
                </p>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-sidebar-accent text-sidebar-primary">
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
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[100px] rounded-full -z-10 pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-violet-400/5 blur-[80px] rounded-full -z-10 pointer-events-none"></div>

        {/* Topbar */}
        <header className="flex items-center justify-between border-b border-white/10 glass px-4 py-4 lg:px-8 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-foreground"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="hidden lg:block">
            <h2 className="text-lg font-semibold font-heading text-foreground">
              {filteredNav.find(i => i.path === location.pathname)?.label || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <NotificationCenter />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="gradient-primary text-primary-foreground text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <UserCircle className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
