import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  Timer,
  Lightbulb,
  Map,
  BarChart3,
  Settings,
  PanelLeftClose,
  PanelLeft,
  Moon,
  Sun,
  Sparkles,
  Search,
  Repeat,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { differenceInCalendarDays } from 'date-fns';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';
import { springSoft } from '../lib/motion';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/coach', label: 'Coach', icon: Sparkles },
  { to: '/tasks', label: 'Tasks', icon: CheckSquare },
  { to: '/habits', label: 'Habits', icon: Repeat },
  { to: '/focus', label: 'Focus', icon: Timer },
  { to: '/brain-dump', label: 'Brain Dump', icon: Lightbulb },
  { to: '/roadmap', label: 'Roadmap', icon: Map },
  { to: '/stats', label: 'Stats', icon: BarChart3 },
];

export default function Sidebar({
  collapsed,
  onToggle,
  onNavigate,
  onOpenSearch,
}: {
  collapsed: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
  onOpenSearch?: () => void;
}) {
  const { targetDate, theme, toggleTheme } = useStore();
  const daysLeft = Math.max(0, differenceInCalendarDays(new Date(targetDate), new Date()));

  return (
    <aside
      className={cn(
        'flex h-full flex-col bg-sidebar border-r border-border transition-[width] duration-200',
        collapsed ? 'w-[68px]' : 'w-[248px]',
      )}
    >
      {/* Brand */}
      <div className="flex items-center justify-between px-3 h-14 shrink-0">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center shrink-0 shadow-sm">
            <Moon className="w-4 h-4 text-[var(--accent-text)]" />
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <p className="font-display font-bold text-[15px] tracking-tight text-ink">Liftoff</p>
              <p className="text-[10px] text-ink-subtle font-medium">Mission control</p>
            </div>
          )}
        </div>
        <button
          onClick={onToggle}
          className="hidden md:flex p-1.5 rounded-md text-ink-subtle hover:text-ink hover:bg-hover transition-colors"
          aria-label="Toggle sidebar"
        >
          {collapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* Search / command palette */}
      <div className="px-2 mb-2">
        <button
          onClick={onOpenSearch}
          title="Search (Ctrl/⌘ K)"
          className={cn(
            'w-full flex items-center gap-2 rounded-lg border border-border bg-bg text-ink-subtle hover:text-ink hover:border-border-strong transition-colors',
            collapsed ? 'justify-center p-2' : 'px-2.5 py-2',
          )}
        >
          <Search className="w-4 h-4 shrink-0" />
          {!collapsed && (
            <>
              <span className="text-sm flex-1 text-left">Search…</span>
              <kbd className="text-[10px] border border-border rounded px-1 py-0.5">⌘K</kbd>
            </>
          )}
        </button>
      </div>

      {/* Countdown banner */}
      {!collapsed && (
        <div className="mx-3 mb-3 rounded-lg border border-border bg-accent-soft px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-accent">Countdown</p>
          <p className="font-display text-2xl font-bold text-ink leading-none mt-1">{daysLeft}</p>
          <p className="text-[11px] text-ink-muted mt-0.5">days until landing</p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 space-y-0.5 no-scrollbar">
        {!collapsed && <p className="section-label px-2 pt-2 pb-1.5">Workspace</p>}
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              cn('sidebar-item relative', isActive && 'active', collapsed && 'justify-center px-0')
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="navPill"
                    className="absolute inset-0 rounded-[7px] bg-accent-soft"
                    transition={springSoft}
                  />
                )}
                <Icon className="w-[18px] h-[18px] shrink-0 relative z-10" />
                {!collapsed && <span className="truncate relative z-10">{label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-2 py-2 border-t border-border space-y-0.5">
        <button
          onClick={toggleTheme}
          title="Toggle theme"
          className={cn('sidebar-item w-full', collapsed && 'justify-center px-0')}
        >
          {theme === 'dark' ? (
            <Sun className="w-[18px] h-[18px] shrink-0" />
          ) : (
            <Moon className="w-[18px] h-[18px] shrink-0" />
          )}
          {!collapsed && <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>}
        </button>
        <NavLink
          to="/settings"
          onClick={onNavigate}
          title={collapsed ? 'Settings' : undefined}
          className={({ isActive }) =>
            cn(
              'sidebar-item',
              isActive && 'active bg-accent-soft',
              collapsed && 'justify-center px-0',
            )
          }
        >
          <Settings className="w-[18px] h-[18px] shrink-0" />
          {!collapsed && <span>Settings</span>}
        </NavLink>
      </div>
    </aside>
  );
}
