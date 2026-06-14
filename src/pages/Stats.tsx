import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from 'recharts';
import { subDays, format, startOfDay, isToday, isThisWeek } from 'date-fns';
import {
  BarChart3,
  Plus,
  Minus,
  Flame,
  Trophy,
  Code,
  BookOpen,
  Timer,
  Target,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';
import { countRoadmap } from '../lib/roadmap';
import { PageHeader, StatCard } from '../components/ui';

export default function Stats() {
  const {
    streak,
    longestStreak,
    activityHistory,
    problemsSolved,
    incrementProblems,
    sectionsCompleted,
    incrementSections,
    projectsShipped,
    tasks,
    phases,
    focusSessions,
  } = useStore();

  const roadmap = useMemo(() => countRoadmap(phases), [phases]);
  const tasksDone = tasks.filter((t) => t.status === 'done').length;

  const focusTotal = useMemo(
    () =>
      focusSessions.filter((s) => s.kind === 'focus').reduce((a, s) => a + s.durationMins, 0),
    [focusSessions],
  );
  const focusWeek = useMemo(
    () =>
      focusSessions
        .filter((s) => s.kind === 'focus' && isThisWeek(new Date(s.date), { weekStartsOn: 1 }))
        .reduce((a, s) => a + s.durationMins, 0),
    [focusSessions],
  );

  const momentum = useMemo(() => {
    const data = [];
    let cumulative = 0;
    for (let i = 29; i >= 0; i--) {
      const dateStr = startOfDay(subDays(new Date(), i)).toISOString();
      const log = activityHistory.find((l) => l.date === dateStr);
      if (log) cumulative += log.type === 'full' ? 1 : 0.5;
      data.push({ day: format(subDays(new Date(), i), 'MMM d'), score: cumulative });
    }
    return data;
  }, [activityHistory]);

  const focusByDay = useMemo(() => {
    const data = [];
    for (let i = 13; i >= 0; i--) {
      const day = subDays(new Date(), i);
      const mins = focusSessions
        .filter((s) => s.kind === 'focus' && format(new Date(s.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'))
        .reduce((a, s) => a + s.durationMins, 0);
      data.push({ day: format(day, 'EEE'), mins });
    }
    return data;
  }, [focusSessions]);

  const heatmap = useMemo(() => {
    const data = [];
    for (let i = 181; i >= 0; i--) {
      const dateStr = startOfDay(subDays(new Date(), i)).toISOString();
      const log = activityHistory.find((l) => l.date === dateStr);
      data.push({ date: dateStr, type: log ? log.type : null });
    }
    return data;
  }, [activityHistory]);

  return (
    <div className="animate-rise">
      <PageHeader
        title="Stats"
        subtitle="Proof you're showing up. Measure the climb."
        icon={<BarChart3 className="w-5 h-5" />}
      />

      {/* Headline stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        <StatCard label="Current streak" value={`${streak}d`} icon={<Flame className="w-4 h-4" />} accent />
        <StatCard label="Longest streak" value={`${longestStreak}d`} icon={<Trophy className="w-4 h-4" />} />
        <StatCard label="Roadmap" value={`${roadmap.percent}%`} icon={<Target className="w-4 h-4" />} />
        <StatCard
          label="Total focus"
          value={`${Math.floor(focusTotal / 60)}h ${focusTotal % 60}m`}
          icon={<Timer className="w-4 h-4" />}
        />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <StatCard label="Tasks done" value={tasksDone} icon={<Code className="w-4 h-4" />} />
        <StatCard label="Projects shipped" value={projectsShipped} icon={<Trophy className="w-4 h-4" />} />
        <StatCard label="Days active" value={activityHistory.length} icon={<Flame className="w-4 h-4" />} />
        <StatCard label="Focus this week" value={`${focusWeek}m`} icon={<Timer className="w-4 h-4" />} />
      </div>

      {/* Manual counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
        <Counter
          icon={<Code className="w-5 h-5" />}
          label="Problems solved"
          value={problemsSolved}
          onInc={() => incrementProblems(1)}
          onDec={() => incrementProblems(-1)}
        />
        <Counter
          icon={<BookOpen className="w-5 h-5" />}
          label="Sections completed"
          value={sectionsCompleted}
          onInc={() => incrementSections(1)}
          onDec={() => incrementSections(-1)}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="card p-5">
          <h3 className="section-label mb-4">30-day momentum</h3>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={momentum}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Tooltip
                  contentStyle={tooltipStyle}
                  itemStyle={{ color: 'var(--accent)' }}
                  labelStyle={{ color: 'var(--text-muted)' }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="var(--accent)"
                  strokeWidth={2}
                  fill="url(#grad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="section-label mb-4">Focus — last 14 days (min)</h3>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={focusByDay}>
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 10, fill: 'var(--text-subtle)' }}
                  axisLine={false}
                  tickLine={false}
                  interval={1}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  itemStyle={{ color: 'var(--accent)' }}
                  labelStyle={{ color: 'var(--text-muted)' }}
                  cursor={{ fill: 'var(--hover)' }}
                />
                <Bar dataKey="mins" fill="var(--accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="card p-5 overflow-hidden">
        <h3 className="section-label mb-4">Consistency — last 6 months</h3>
        <div className="flex gap-1 overflow-x-auto pb-2" dir="rtl">
          {Array.from({ length: 26 }).map((_, col) => (
            <div key={col} className="flex flex-col gap-1">
              {Array.from({ length: 7 }).map((_, row) => {
                const index = col * 7 + row;
                if (index >= heatmap.length) return <div key={row} className="w-3 h-3" />;
                const d = heatmap[heatmap.length - 1 - index];
                return (
                  <div
                    key={row}
                    title={format(new Date(d.date), 'MMM d, yyyy')}
                    className={cn(
                      'w-3 h-3 rounded-[3px] transition-colors',
                      d.type === 'full'
                        ? 'bg-accent'
                        : d.type === 'minimum'
                          ? 'bg-warning'
                          : isToday(new Date(d.date))
                            ? 'bg-elevated ring-1 ring-accent'
                            : 'bg-elevated',
                    )}
                  />
                );
              })}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-3 text-[11px] text-ink-subtle">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-[3px] bg-accent" /> Full day
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-[3px] bg-warning" /> Minimum
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-[3px] bg-elevated" /> No activity
          </span>
        </div>
      </div>
    </div>
  );
}

const tooltipStyle = {
  backgroundColor: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  fontSize: '12px',
};

function Counter({
  icon,
  label,
  value,
  onInc,
  onDec,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  onInc: () => void;
  onDec: () => void;
}) {
  return (
    <div className="card p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-elevated border border-border flex items-center justify-center text-ink-muted">
          {icon}
        </div>
        <div>
          <p className="font-display text-2xl font-bold text-ink">{value}</p>
          <p className="text-[11px] uppercase tracking-wider text-ink-subtle">{label}</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={onDec} className="btn btn-secondary p-2">
          <Minus className="w-4 h-4" />
        </button>
        <button onClick={onInc} className="btn btn-primary p-2">
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
