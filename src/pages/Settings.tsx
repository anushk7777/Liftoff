import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Moon, Sun, Download, Upload, MonitorOff } from 'lucide-react';
import { format } from 'date-fns';

export default function Settings() {
  const { 
    theme, setTheme, 
    targetDate, setTargetDate,
    reduceMotion, setReduceMotion,
    exportData, importData,
    resetRoadmap
  } = useStore();
  
  const [importStatus, setImportStatus] = useState('');

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      importData(content);
      setImportStatus('Data imported successfully!');
      setTimeout(() => setImportStatus(''), 3000);
    };
    reader.readAsText(file);
  };

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `liftoff-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-2xl animate-in fade-in duration-300">
      <header className="mb-8 border-b border-[var(--color-border)] pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--color-foreground)] mb-1">Settings</h1>
        <p className="text-[var(--color-muted)] text-sm">Configure your workspace.</p>
      </header>

      <div className="space-y-6">
        {/* Appearance */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] border-b border-[var(--color-border)] pb-2">Appearance</h2>
          
          <div className="flex items-center justify-between py-2">
            <span className="text-sm font-medium text-[var(--color-foreground)]">Theme</span>
            <div className="flex bg-[var(--color-hover)] p-0.5 rounded border border-[var(--color-border)]">
              <button 
                onClick={() => setTheme('light')}
                className={`p-1.5 rounded transition-colors flex items-center justify-center ${theme === 'light' ? 'bg-[var(--color-background)] shadow-sm text-[var(--color-foreground)] border border-[var(--color-border)]' : 'text-[var(--color-muted)] hover:text-[var(--color-foreground)]'}`}
              >
                <Sun className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setTheme('dark')}
                className={`p-1.5 rounded transition-colors flex items-center justify-center ${theme === 'dark' ? 'bg-[var(--color-background)] shadow-sm text-[var(--color-foreground)] border border-[var(--color-border)]' : 'text-[var(--color-muted)] hover:text-[var(--color-foreground)]'}`}
              >
                <Moon className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <MonitorOff className="w-4 h-4 text-[var(--color-muted)]" />
              <span className="text-sm font-medium text-[var(--color-foreground)]">Reduce Motion</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={reduceMotion} onChange={(e) => setReduceMotion(e.target.checked)} />
              <div className="w-9 h-5 bg-[var(--color-border)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--color-primary)]"></div>
            </label>
          </div>
        </section>

        {/* Preferences */}
        <section className="space-y-3 pt-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] border-b border-[var(--color-border)] pb-2">Target Goal</h2>
          
          <div className="flex items-center justify-between py-2">
            <span className="text-sm font-medium text-[var(--color-foreground)]">Target Date</span>
            <input 
              type="date" 
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="bg-[var(--color-background)] border border-[var(--color-border)] rounded px-2 py-1 text-sm focus:outline-none focus:border-[var(--color-primary)] text-[var(--color-foreground)]"
            />
          </div>
        </section>

        {/* Data */}
        <section className="space-y-3 pt-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] border-b border-[var(--color-border)] pb-2">Data Management</h2>
          
          <div className="flex flex-col sm:flex-row gap-3 py-2">
            <button 
              onClick={handleExport}
              className="flex-1 flex items-center justify-center gap-2 bg-[var(--color-background)] hover:bg-[var(--color-hover)] border border-[var(--color-border)] py-2 rounded transition-colors text-sm font-medium text-[var(--color-foreground)]"
            >
              <Download className="w-4 h-4" /> Export Backup
            </button>
            <label className="flex-1 flex items-center justify-center gap-2 bg-[var(--color-background)] hover:bg-[var(--color-hover)] border border-[var(--color-border)] py-2 rounded transition-colors text-sm font-medium cursor-pointer text-[var(--color-foreground)]">
              <Upload className="w-4 h-4" /> Import Backup
              <input type="file" accept=".json" className="hidden" onChange={handleImport} />
            </label>
          </div>
          {importStatus && <p className="text-xs text-green-600 font-medium">{importStatus}</p>}

          <div className="pt-2">
            <button 
              onClick={() => {
                if (window.confirm("Are you sure? This resets all roadmap checkboxes.")) {
                  resetRoadmap();
                }
              }}
              className="w-full py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded transition-colors text-sm font-medium"
            >
              Reset Roadmap Progress
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
