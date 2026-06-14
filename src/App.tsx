import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Menu, Rocket } from 'lucide-react';
import { useStore } from './store/useStore';
import { cn } from './lib/utils';
import Sidebar from './components/Sidebar';
import PWAPrompt from './components/PWAPrompt';
import PanicButton from './components/PanicButton';

import Dashboard from './pages/Dashboard';
import Coach from './pages/Coach';
import Tasks from './pages/Tasks';
import Focus from './pages/Focus';
import BrainDump from './pages/BrainDump';
import Roadmap from './pages/Roadmap';
import Stats from './pages/Stats';
import SettingsPage from './pages/Settings';

function Shell() {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('liftoff_sidebar_collapsed') === '1',
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleCollapsed = () => {
    setCollapsed((c) => {
      localStorage.setItem('liftoff_sidebar_collapsed', !c ? '1' : '0');
      return !c;
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-bg text-ink">
      {/* Desktop sidebar */}
      <div className="hidden md:block shrink-0">
        <Sidebar collapsed={collapsed} onToggle={toggleCollapsed} />
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
          <div className="w-9" />
        </header>

        <main className={cn('flex-1 overflow-y-auto')}>
          <div className="mx-auto w-full max-w-5xl px-5 py-7 sm:px-8 sm:py-10">
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
          </div>
        </main>
      </div>

      <PanicButton />
      <PWAPrompt />
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
