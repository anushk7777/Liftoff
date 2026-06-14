import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, X } from 'lucide-react';

export default function PWAPrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r: any) {
      console.log('SW Registered: ' + r);
    },
    onRegisterError(error: any) {
      console.log('SW registration error', error);
    },
  });

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-20 md:bottom-8 left-4 z-50 bg-[var(--color-background)] border border-[var(--color-border)] p-3 rounded-md shadow-lg flex items-center gap-4 max-w-sm w-[calc(100%-2rem)] md:w-auto animate-in slide-in-from-bottom-4">
      <div className="flex items-center gap-3 flex-1">
        <RefreshCw className="w-4 h-4 text-[var(--color-muted)]" />
        <div>
          <p className="text-sm font-semibold text-[var(--color-foreground)]">Update Available</p>
          <p className="text-xs text-[var(--color-muted)]">A new version is ready.</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => updateServiceWorker(true)}
          className="bg-[var(--color-foreground)] hover:bg-[var(--color-foreground)]/90 text-[var(--color-background)] text-xs font-medium py-1.5 px-3 rounded transition-colors"
        >
          Refresh
        </button>
        <button
          onClick={() => setNeedRefresh(false)}
          className="p-1 text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
