import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { useStore } from './store/useStore';
import { Home, Map, BookOpen, BarChart2, Settings, Rocket } from 'lucide-react';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

import Today from './pages/Today';
import Roadmap from './pages/Roadmap';
import Resources from './pages/Resources';
import Stats from './pages/Stats';
import SettingsPage from './pages/Settings';
import PWAPrompt from './components/PWAPrompt';

function NavItem({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) {
  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => cn(
        "relative flex flex-col items-center justify-center w-16 h-14 transition-all duration-300",
        isActive ? "text-[var(--accent)]" : "text-[var(--text-muted)] hover:text-[var(--text)]"
      )}
    >
      {({ isActive }) => (
        <>
          <div className="z-10 flex flex-col items-center gap-1">
            <motion.div 
              animate={{ y: isActive ? -4 : 0, scale: isActive ? 1.1 : 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="[&>svg]:w-5 [&>svg]:h-5"
            >
              {icon}
            </motion.div>
            <AnimatePresence>
              {isActive && (
                <motion.span 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="text-[10px] font-bold uppercase tracking-wider absolute -bottom-1"
                >
                  {label}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          {/* Subtle indicator dot */}
          {isActive && (
            <motion.div 
              layoutId="nav-indicator"
              className="absolute -top-1 w-1 h-1 bg-[var(--accent)] rounded-full"
              style={{ boxShadow: '0 0 8px var(--accent)' }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            />
          )}
        </>
      )}
    </NavLink>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  const { reduceMotion } = useStore();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="h-full"
      >
        <Routes location={location}>
          <Route path="/" element={<Today />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function Layout() {
  return (
    <div className="flex flex-col h-screen overflow-hidden text-[var(--text)] relative">
      <div className="space-bg" />
      <div className="starfield-noise" />
      
      {/* Top Bar - Minimal Header */}
      <header className="flex justify-between items-center p-6 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] flex items-center justify-center shadow-[0_0_15px_rgba(255,122,89,0.3)]">
            <Rocket className="w-5 h-5 text-[#0E0A14] stroke-[2.5px]" />
          </div>
          <h1 className="text-xl font-display font-bold tracking-widest uppercase text-[var(--text)]">
            Liftoff
          </h1>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-24 px-4 sm:px-6 lg:px-8 z-10 scroll-smooth">
        <div className="max-w-4xl mx-auto w-full h-full">
           <AnimatedRoutes />
        </div>
      </main>
      
      {/* Premium Floating Bottom Navigation */}
      <div className="fixed bottom-6 left-0 right-0 z-40 px-4 pointer-events-none">
        <nav className="max-w-[320px] mx-auto premium-card bg-[#1C1622]/80 backdrop-blur-xl p-2 flex justify-around items-center pointer-events-auto rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.02)]">
          <NavItem to="/" icon={<Home />} label="Today" />
          <NavItem to="/roadmap" icon={<Map />} label="Map" />
          <NavItem to="/resources" icon={<BookOpen />} label="Hub" />
          <NavItem to="/stats" icon={<BarChart2 />} label="Stats" />
          <NavItem to="/settings" icon={<Settings />} label="Gear" />
        </nav>
      </div>
      
      <PWAPrompt />
    </div>
  );
}

function App() {
  const { loadFromDB } = useStore();

  useEffect(() => {
    // App is always in the dark "space" theme as per user spec
    document.documentElement.classList.add('dark');
    loadFromDB();
  }, [loadFromDB]);

  return (
    <BrowserRouter>
      <Layout>
        {/* Routing is handled inside Layout's AnimatedRoutes */}
      </Layout>
    </BrowserRouter>
  );
}

export default App;
