import { useState } from 'react';
import { LifeBuoy, X, Heart } from 'lucide-react';
import { useStore } from '../store/useStore';

const MOTIVATION_LINES = [
  "A short day beats a zero day. Just 10 minutes is enough.",
  "You're building the foundation. It takes time. Don't rush.",
  "Remember your 'why'. December 2026 isn't that far away.",
  "The streak is just a number, but the habit is forever.",
  "Tired? Do the minimum. Keep the muscle memory alive.",
  "It's okay to struggle. Every senior dev was once here.",
  "Rest if you must, but don't quit.",
  "You are doing this for future you. Show up for them."
];

export default function PanicButton() {
  const [open, setOpen] = useState(false);
  const { streak } = useStore();
  const line = MOTIVATION_LINES[Math.floor(Math.random() * MOTIVATION_LINES.length)];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-40 bg-[var(--color-background)] border border-[var(--color-border)] p-2.5 rounded shadow-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors"
        aria-label="Feeling like quitting?"
      >
        <LifeBuoy className="w-5 h-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-[var(--color-background)] border border-[var(--color-border)] rounded-md shadow-lg w-full max-w-sm p-6 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-6 mt-4">
              <div className="flex justify-center">
                <Heart className="w-8 h-8 text-[var(--color-muted)]" />
              </div>

              <div className="space-y-3">
                <h2 className="text-xl font-bold text-[var(--color-foreground)]">Take a deep breath.</h2>
                <p className="text-sm text-[var(--color-muted)] leading-relaxed">
                  {line}
                </p>
              </div>

              {streak > 0 && (
                <div className="border border-[var(--color-border)] p-4 rounded bg-[var(--color-background)]">
                  <p className="text-xs text-[var(--color-muted)] uppercase tracking-wider mb-1">Current Streak</p>
                  <p className="text-2xl font-bold text-[var(--color-foreground)]">{streak} Days</p>
                </div>
              )}

              <button
                onClick={() => setOpen(false)}
                className="w-full bg-[var(--color-foreground)] text-[var(--color-background)] font-medium text-sm py-2 rounded transition-colors hover:opacity-90"
              >
                I'm staying.
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
