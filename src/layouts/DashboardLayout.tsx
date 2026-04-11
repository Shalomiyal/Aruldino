import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard, BookOpen, ClipboardCheck, FileText,
  Calendar as CalendarIcon, BarChart3, Bell, LogOut,
  Settings, ChevronDown, UserCircle, Layers, BookOpenCheck,
  Award, Calculator, Shield, ShieldCheck, UserPlus, MessageSquare,
  ChevronLeft, Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import NotificationCenter from '@/components/NotificationCenter';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  roles?: string[];
  permission?: string;
}

/** Sidebar: admin = structure + oversight; lecturer/student = teaching & learning workflows. */
const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'lecturer', 'student'] },

  { label: 'Subjects', path: '/subjects', icon: BookOpen, roles: ['admin', 'lecturer', 'student'] },
  { label: 'Timetable', path: '/timetable', icon: CalendarIcon, roles: ['admin', 'lecturer', 'student'] },
  { label: 'Academy Events', path: '/events', icon: CalendarIcon, roles: ['admin', 'lecturer', 'student'] },

  { label: 'Attendance', path: '/attendance', icon: ClipboardCheck, roles: ['lecturer', 'student'] },
  { label: 'Assignments', path: '/assignments', icon: FileText, roles: ['lecturer', 'student'] },
  { label: 'Grading', path: '/grading', icon: Calculator, roles: ['lecturer'] },
  { label: 'My Results', path: '/results', icon: Award, roles: ['student'] },

  { label: 'Common Room', path: '/communication', icon: Bell, roles: ['admin', 'lecturer', 'student'] },
  { label: 'Social Hub', path: '/groups', icon: MessageSquare, roles: ['admin', 'lecturer', 'student'] },

  { label: 'Departments', path: '/admin/departments', icon: BookOpenCheck, roles: ['admin', 'lecturer'] },
  { label: 'Manage Batches', path: '/admin/batches', icon: Layers, roles: ['admin', 'lecturer'] },
  { label: 'Enrollments', path: '/admin/enrollments', icon: UserPlus, roles: ['admin', 'lecturer'] },
  { label: 'Users', path: '/admin/users', icon: Settings, roles: ['admin', 'lecturer'], permission: 'manage:users' },
  { label: 'Security', path: '/admin/security', icon: ShieldCheck, roles: ['admin', 'lecturer'], permission: 'manage:security' },
  { label: 'Reports', path: '/analytics', icon: BarChart3, roles: ['admin', 'lecturer'], permission: 'view:reports' },
];

const mobileNavItems: { path: string; icon: React.ElementType; label: string }[] = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { path: '/subjects', icon: BookOpen, label: 'Subjects' },
  { path: '/groups', icon: MessageSquare, label: 'Social' },
  { path: '/profile', icon: UserCircle, label: 'Profile' },
];

function roleBadgeVariant(role: string | null): 'roleAdmin' | 'roleLecturer' | 'roleStudent' | 'outline' {
  if (role === 'admin') return 'roleAdmin';
  if (role === 'lecturer') return 'roleLecturer';
  if (role === 'student') return 'roleStudent';
  return 'outline';
}

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { profile, role, signOut, hasPermission } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const filteredNav = navItems.filter(item => {
    const hasRole = !item.roles || (role && item.roles.includes(role));
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
  const currentTitle = filteredNav.find(i => i.path === location.pathname)?.label || 'Dashboard';

  const sidebarWidth = sidebarCollapsed ? 'lg:w-16' : 'lg:w-[240px]';

  return (
    <div className="uni-page-shell flex min-h-screen overflow-hidden bg-[#F0FAFA]">
      <div className="uni-orb-tr" aria-hidden />
      <div className="uni-orb-bl" aria-hidden />

      {/* Desktop sidebar — 240px / collapsed 64px; hidden on mobile */}
      <aside
        className={cn(
          'relative z-20 hidden h-screen flex-col border-r border-[#E2F4F8] bg-white shadow-uni-sidebar transition-[width] duration-300 ease-out lg:flex',
          sidebarWidth,
        )}
      >
        <div className="flex h-full min-h-0 flex-col">
          <div className="flex items-center gap-2 border-b border-[#E2F4F8] px-3 py-4">
            {!sidebarCollapsed && (
              <>
                <img src="/logo.png" alt="" className="h-9 w-9 shrink-0 object-contain" />
                <div className="min-w-0 flex-1">
                  <h1 className="truncate font-heading text-base font-bold text-[#1B2B4B]">UniHub</h1>
                  <p className="truncate text-xs text-[#6B7280]">SAMS · Northern UNI</p>
                </div>
              </>
            )}
            {sidebarCollapsed && (
              <img src="/logo.png" alt="" className="mx-auto h-9 w-9 object-contain" />
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn('hidden shrink-0 rounded-xl lg:flex', sidebarCollapsed && 'mx-auto')}
              onClick={() => setSidebarCollapsed((c) => !c)}
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <ChevronLeft className={cn('h-4 w-4 transition-transform', sidebarCollapsed && 'rotate-180')} />
            </Button>
          </div>

          <nav className="custom-scrollbar flex-1 space-y-0.5 overflow-y-auto px-2 py-4">
            {filteredNav.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={cn(
                    'flex items-center gap-3 rounded-xl py-3 text-sm font-semibold transition-colors',
                    sidebarCollapsed ? 'justify-center px-0' : 'px-3',
                    isActive
                      ? 'border-l-[3px] border-l-[#0EA5C8] bg-[#E0F7FC] text-[#0EA5C8]'
                      : 'border-l-[3px] border-l-transparent text-[#374151] hover:bg-[#F0FAFA] hover:text-[#0B8BA8]',
                  )}
                >
                  <item.icon
                    className={cn(
                      'h-5 w-5 shrink-0',
                      isActive ? 'text-[#0EA5C8]' : 'text-[#6B7280]',
                    )}
                  />
                  {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-[#E2F4F8] p-3">
            <div className={cn('flex items-center gap-2', sidebarCollapsed && 'flex-col')}>
              <Avatar className="h-9 w-9 shrink-0 border border-[#E2F4F8]">
                <AvatarFallback className="bg-[#E0F7FC] text-xs font-semibold text-[#0EA5C8]">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {!sidebarCollapsed && (
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[#1B2B4B]">{profile?.full_name || 'User'}</p>
                  <Badge variant={roleBadgeVariant(role)} className="mt-0.5 text-[10px]">
                    {roleLabel}
                  </Badge>
                </div>
              )}
              {!sidebarCollapsed && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0 rounded-xl text-[#6B7280] hover:text-[#EF4444]"
                  onClick={() => void handleSignOut()}
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main column */}
      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-[#E2F4F8] bg-white px-4 py-4 lg:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-[0.6px] text-[#6B7280]">SAMS</p>
              <h2 className="truncate font-heading text-[26px] font-bold leading-tight tracking-[-0.3px] text-[#1B2B4B]">
                {currentTitle}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
              <Input
                placeholder="Search…"
                className="h-10 w-[200px] rounded-[10px] border-[#E2F4F8] bg-[#F8FFFE] pl-9 lg:w-[240px]"
              />
            </div>
            <NotificationCenter />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 rounded-2xl px-2">
                  <Avatar className="h-9 w-9 border border-[#E2F4F8]">
                    <AvatarFallback className="bg-[#E0F7FC] text-xs font-semibold text-[#0EA5C8]">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="hidden h-4 w-4 text-[#6B7280] sm:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 uni-modal-surface border-[#E2F4F8] p-1">
                <DropdownMenuItem
                  className="rounded-xl"
                  onSelect={(e) => {
                    e.preventDefault();
                    navigate('/profile');
                  }}
                >
                  <UserCircle className="mr-2 h-4 w-4 text-[#0EA5C8]" />
                  <span className="text-[#374151]">Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[#E2F4F8]" />
                <DropdownMenuItem
                  className="rounded-xl text-[#EF4444] focus:text-[#EF4444]"
                  onSelect={(e) => {
                    e.preventDefault();
                    void handleSignOut();
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="relative flex-1 overflow-y-auto px-4 py-6 pb-24 lg:px-6 lg:pb-6">
          <div className="mx-auto w-full max-w-content animate-fade-up">{children}</div>
        </main>

        {/* Mobile bottom navigation (< lg) */}
        <nav
          className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-[#E2F4F8] bg-white/95 py-2 shadow-[0_-4px_20px_rgba(14,165,200,0.08)] backdrop-blur-md lg:hidden"
          style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
        >
          {mobileNavItems.map(({ path, icon: Icon, label }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={cn(
                  'flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[11px] font-semibold transition-colors min-w-[56px]',
                  active ? 'text-[#0EA5C8]' : 'text-[#6B7280]',
                )}
              >
                <Icon className={cn('h-5 w-5', active && 'text-[#0EA5C8]')} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default DashboardLayout;
