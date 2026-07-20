import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Cpu, Bell, Zap, LogOut, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const nav = [
  { to: '/', icon: LayoutDashboard, label: 'Command Center' },
  { to: '/assets', icon: Cpu, label: 'Assets' },
  { to: '/alerts', icon: Bell, label: 'Alerts' },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen">
      <aside className="fixed left-0 top-0 flex h-full w-64 flex-col border-r border-white/10 bg-black/20 backdrop-blur-glass">
        <div className="flex items-center gap-3 border-b border-white/10 px-6 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-griddna-primary/20">
            <Zap className="h-5 w-5 text-griddna-primary" />
          </div>
          <div>
            <p className="text-sm font-bold tracking-wide">GridDNA AI</p>
            <p className="text-xs text-griddna-muted">Energy Intelligence</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => (isActive ? 'nav-link-active' : 'nav-link')}
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="mb-3 rounded-lg bg-white/5 px-3 py-2">
            <p className="truncate text-xs font-medium">{user?.email}</p>
            <p className="text-xs capitalize text-griddna-muted">{user?.role}</p>
          </div>
          <button
            onClick={logout}
            className="nav-link w-full text-left text-griddna-critical hover:text-griddna-critical"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      <main className="ml-64 flex-1">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-griddna-bg/80 px-8 py-4 backdrop-blur-glass">
          <div className="flex items-center gap-2 text-sm text-griddna-muted">
            <Activity className="h-4 w-4 text-griddna-success" />
            <span>System operational</span>
            <span className="mx-2">·</span>
            <span>Tunis Industrial Plant</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-griddna-success opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-griddna-success" />
            </span>
            <span className="text-xs text-griddna-muted">Live</span>
          </div>
        </header>
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
