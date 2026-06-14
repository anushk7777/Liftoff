import { useCallback, useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Timer, Coffee, Brain } from 'lucide-react';
import { isToday } from 'date-fns';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';
import { PageHeader, StatCard } from '../components/ui';

type Mode = 'focus' | 'shortBreak' | 'longBreak';

const MODE_META: Record<Mode, { label: string; icon: React.ReactNode }> = {
  focus: { label: 'Focus', icon: <Brain className="w-4 h-4" /> },
  shortBreak: { label: 'Short break', icon: <Coffee className="w-4 h-4" /> },
  longBreak: { label: 'Long break', icon: <Coffee className="w-4 h-4" /> },
};

function beep() {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 660;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  } catch {
    /* ignore */
  }
}

export default function Focus() {
  const { pomodoro, focusSessions, logFocusSession } = useStore();

  const [mode, setMode] = useState<Mode>('focus');
  const [secondsLeft, setSecondsLeft] = useState(pomodoro.focusMins * 60);
  const [running, setRunning] = useState(false);
  const [round, setRound] = useState(1);
  const [taskLabel, setTaskLabel] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const modeMinutes = useCallback(
    (m: Mode) =>
      m === 'focus'
        ? pomodoro.focusMins
        : m === 'shortBreak'
          ? pomodoro.shortBreakMins
          : pomodoro.longBreakMins,
    [pomodoro],
  );

  const total = modeMinutes(mode) * 60;
  const progress = total > 0 ? 1 - secondsLeft / total : 0;

  const switchMode = useCallback(
    (next: Mode, nextRound: number) => {
      setMode(next);
      setRound(nextRound);
      setSecondsLeft(modeMinutes(next) * 60);
    },
    [modeMinutes],
  );

  const handleComplete = useCallback(() => {
    beep();
    if (mode === 'focus') {
      logFocusSession(pomodoro.focusMins, 'focus', taskLabel.trim() || undefined);
      const isLong = round % pomodoro.roundsBeforeLong === 0;
      switchMode(isLong ? 'longBreak' : 'shortBreak', round);
    } else {
      logFocusSession(modeMinutes(mode), 'break');
      switchMode('focus', mode === 'longBreak' ? round + 1 : round + 1);
    }
    setRunning(false);
  }, [mode, round, pomodoro, taskLabel, logFocusSession, switchMode, modeMinutes]);

  // Keep live values available to the interval callback without re-subscribing
  const secsRef = useRef(secondsLeft);
  const completeRef = useRef(handleComplete);
  useEffect(() => {
    secsRef.current = secondsLeft;
    completeRef.current = handleComplete;
  });

  // Ticking — state updates happen inside the async interval callback, never
  // synchronously in the effect body.
  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      if (secsRef.current <= 0) {
        completeRef.current();
      } else {
        setSecondsLeft((s) => s - 1);
      }
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  // Document title countdown
  useEffect(() => {
    const mm = Math.floor(secondsLeft / 60);
    const ss = (secondsLeft % 60).toString().padStart(2, '0');
    document.title = running ? `${mm}:${ss} · ${MODE_META[mode].label} — Liftoff` : 'Liftoff';
    return () => {
      document.title = 'Liftoff';
    };
  }, [secondsLeft, running, mode]);

  const reset = () => {
    setRunning(false);
    setSecondsLeft(modeMinutes(mode) * 60);
  };
  const skip = () => {
    setRunning(false);
    if (mode === 'focus') {
      const isLong = round % pomodoro.roundsBeforeLong === 0;
      switchMode(isLong ? 'longBreak' : 'shortBreak', round);
    } else {
      switchMode('focus', round + 1);
    }
  };

  const mm = Math.floor(secondsLeft / 60).toString().padStart(2, '0');
  const ss = (secondsLeft % 60).toString().padStart(2, '0');

  // Stats
  const focusToday = focusSessions
    .filter((s) => s.kind === 'focus' && isToday(new Date(s.date)))
    .reduce((acc, s) => acc + s.durationMins, 0);
  const sessionsToday = focusSessions.filter(
    (s) => s.kind === 'focus' && isToday(new Date(s.date)),
  ).length;
  const totalFocus = focusSessions
    .filter((s) => s.kind === 'focus')
    .reduce((acc, s) => acc + s.durationMins, 0);

  // Ring geometry
  const R = 130;
  const C = 2 * Math.PI * R;

  return (
    <div className="animate-rise">
      <PageHeader
        title="Focus"
        subtitle="Deep work in focused intervals. No distractions."
        icon={<Timer className="w-5 h-5" />}
      />

      {/* Mode switch */}
      <div className="flex items-center justify-center gap-1 mb-8 p-1 rounded-lg bg-elevated border border-border w-fit mx-auto">
        {(Object.keys(MODE_META) as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => {
              setRunning(false);
              setMode(m);
              setSecondsLeft(modeMinutes(m) * 60);
            }}
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors',
              mode === m ? 'bg-surface text-ink shadow-sm' : 'text-ink-muted hover:text-ink',
            )}
          >
            {MODE_META[m].icon}
            {MODE_META[m].label}
          </button>
        ))}
      </div>

      {/* Timer ring */}
      <div className="flex flex-col items-center">
        <div className="relative w-[300px] h-[300px]">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 300 300">
            <circle cx="150" cy="150" r={R} fill="none" stroke="var(--border)" strokeWidth="10" />
            <circle
              cx="150"
              cy="150"
              r={R}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={C * (1 - progress)}
              style={{ transition: 'stroke-dashoffset 0.5s linear' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="font-display text-6xl font-bold tabular-nums text-ink tracking-tight">
              {mm}:{ss}
            </p>
            <p className="text-sm text-ink-muted mt-2 flex items-center gap-1.5">
              {MODE_META[mode].icon}
              {MODE_META[mode].label} · Round {round}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 mt-8">
          <button onClick={reset} className="btn btn-secondary p-3" aria-label="Reset">
            <RotateCcw className="w-5 h-5" />
          </button>
          <button
            onClick={() => setRunning((r) => !r)}
            className="btn btn-primary px-8 py-3.5 text-base"
          >
            {running ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            {running ? 'Pause' : 'Start'}
          </button>
          <button onClick={skip} className="btn btn-secondary p-3" aria-label="Skip">
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {mode === 'focus' && (
          <input
            value={taskLabel}
            onChange={(e) => setTaskLabel(e.target.value)}
            placeholder="What are you working on?"
            className="input max-w-sm mt-6 text-center"
          />
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mt-12 max-w-2xl mx-auto">
        <StatCard label="Focus today" value={`${focusToday}m`} icon={<Timer className="w-4 h-4" />} />
        <StatCard label="Sessions today" value={sessionsToday} icon={<Brain className="w-4 h-4" />} />
        <StatCard
          label="Total focus"
          value={`${Math.floor(totalFocus / 60)}h ${totalFocus % 60}m`}
          icon={<Timer className="w-4 h-4" />}
        />
      </div>
    </div>
  );
}
