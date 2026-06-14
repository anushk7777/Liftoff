import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import {
  Menu,
  Rocket,
  Search,
  LayoutDashboard,
  Sparkles,
  CheckSquare,
  Timer,
  Map,
} from 'lucide-react';
import { useStore } from './store/useStore';
import { cn } from './lib/utils';
import Sidebar from './components/Sidebar';
import PWAPrompt from './components/PWAPrompt';
import PanicButton from './components/PanicButton';
import CommandPalette from './components/CommandPalette';
import ErrorBoundary from './components/ErrorBoundary';

import Dashboard from './pages/Dashboard';
import Coach from './pages/Coach';
import Tasks from './pages/Tasks';
import Focus from './pages/Focus';
import BrainDump from './pages/BrainDump';
import Roadmap from './pages/Roadmap';
import Stats from './pages/Stats';
import SettingsPage from './pages/Settings';

// Compact set for the mobile bottom bar — the moves you reach for most.
const MOBILE_NAV = [
  { to: '/', label: 'Today', icon: LayoutDashboard, end: true },
  { to: '/coach', label: 'Coach', icon: Sparkles },
  { to: '/tasks', label: 'Tasks', icon: CheckSquare },
  { to: '/focus', label: 'Focus', icon: Timer },
  { to: '/roadmap', label: 'Roadmap', icon: Map },
];

function Shell() {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('liftoff_sidebar_collapsed') === '1',
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const toggleCollapsed = () => {
    setCollapsed((c) => {
      localStorage.setItem('liftoff_sidebar_collapsed', !c ? '1' : '0');
      return !c;
    });
  };

  // ⌘K / Ctrl+K opens the command palette anywhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-bg text-ink">
      {/* Desktop sidebar */}
      <div className="hidden md:block shrink-0">
        <Sidebar collapsed={collapsed} onToggle={toggleCollapsed} onOpenSearch={() => setPaletteOpen(true)} />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full shadow-lg animate-rise">
            <Sidebar
              collapsed={false}
              onToggle={() => setMobileOpen(false)}
              onNavigate={() => setMobileOpen(false)}
              onOpenSearch={() => {
                setMobileOpen(false);
                setPaletteOpen(true);
              }}
            />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center justify-between h-14 px-4 border-b border-border bg-sidebar shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-2 rounded-md text-ink-muted hover:text-ink hover:bg-hover"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-accent flex items-center justify-center">
              <Rocket className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-display font-bold text-sm">Liftoff</span>
          </div>
          <button
            onClick={() => setPaletteOpen(true)}
            className="p-2 -mr-2 rounded-md text-ink-muted hover:text-ink hover:bg-hover"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-5xl px-5 py-7 pb-24 sm:px-8 sm:py-10 md:pb-10">
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/coach" element={<Coach />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/focus" element={<Focus />} />
                <Route path="/brain-dump" element={<BrainDump />} />
                <Route path="/roadmap" element={<Roadmap />} />
                <Route path="/stats" element={<Stats />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
            </ErrorBoundary>
          </div>
        </main>

        {/* Mobile bottom navigation */}
        <nav className="md:hidden flex items-center justify-around border-t border-border bg-sidebar shrink-0 pb-[env(safe-area-inset-bottom)]">
          {MOBILE_NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-0.5 py-2 px-3 text-[10px] font-medium transition-colors',
                  isActive ? 'text-accent' : 'text-ink-subtle',
                )
              }
            >
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      <PanicButton />
      <PWAPrompt />
      {paletteOpen && <CommandPalette onClose={() => setPaletteOpen(false)} />}
    </div>
  );
}

function App() {
  const { loadFromDB, theme, reduceMotion } = useStore();

  useEffect(() => {
    loadFromDB();
  }, [loadFromDB]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', reduceMotion);
  }, [reduceMotion]);

  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  );
}

export default App;
