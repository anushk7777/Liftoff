import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { useStore } from './store/useStore';
import { LayoutDashboard, CheckSquare, BarChart2, Settings } from 'lucide-react';
import { cn } from './lib/utils';
import PWAPrompt from './components/PWAPrompt';

import Today from './pages/Today';
import Stats from './pages/Stats';
import SettingsPage from './pages/Settings';

function NavItem({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) {
  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
        isActive 
          ? "bg-[rgba(255,255,255,0.06)] text-[var(--text)]" 
          : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[rgba(255,255,255,0.03)]"
      )}
    >
      <div className="w-4 h-4">{icon}</div>
      <span className="hidden sm:inline">{label}</span>
    </NavLink>
  );
}

function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-deep)] text-[var(--text)] font-sans">
      <header className="border-b border-[var(--border)] bg-[var(--surface)] sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-base font-semibold tracking-tight text-[var(--text)] flex items-center gap-2">
              <div className="w-5 h-5 bg-[var(--accent)] rounded-sm flex items-center justify-center">
                <CheckSquare className="w-3 h-3 text-white" />
              </div>
              Liftoff
            </h1>
            <nav className="flex items-center gap-1">
              <NavItem to="/" icon={<LayoutDashboard />} label="Today" />
              <NavItem to="/stats" icon={<BarChart2 />} label="Stats" />
            </nav>
          </div>
          <div className="flex items-center gap-2">
             <NavLink to="/settings" className="text-[var(--text-muted)] hover:text-[var(--text)] p-2 rounded-md hover:bg-[rgba(255,255,255,0.03)] transition-colors">
               <Settings className="w-4 h-4" />
             </NavLink>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        <Routes>
          <Route path="/" element={<Today />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/roadmap" element={<div className="p-4 text-[var(--text-muted)] text-center mt-10">Roadmap moved to background.</div>} />
          <Route path="/resources" element={<div className="p-4 text-[var(--text-muted)] text-center mt-10">Resources moved to background.</div>} />
        </Routes>
      </main>
      
      <PWAPrompt />
    </div>
  );
}

function App() {
  const { loadFromDB } = useStore();

  useEffect(() => {
    document.documentElement.classList.add('dark');
    loadFromDB();
  }, [loadFromDB]);

  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;
