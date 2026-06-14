import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { subDays, format, startOfDay } from 'date-fns';
import { Plus, Flame, Trophy, Code, BookOpen } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Stats() {
  const { 
    streak, activityHistory, 
    problemsSolved, incrementProblems, 
    sectionsCompleted, incrementSections,
    projectsShipped
  } = useStore();

  const chartData = useMemo(() => {
    const data = [];
    let cumulative = 0;
    for (let i = 29; i >= 0; i--) {
      const dateStr = startOfDay(subDays(new Date(), i)).toISOString();
      const log = activityHistory.find(l => l.date === dateStr);
      let value = 0;
      if (log) {
        value = log.type === 'full' ? 1 : 0.5;
        cumulative += value;
      }
      data.push({
        day: format(subDays(new Date(), i), 'MMM dd'),
        score: cumulative
      });
    }
    return data;
  }, [activityHistory]);

  const heatmapData = useMemo(() => {
    const data = [];
    for (let i = 181; i >= 0; i--) {
      const dateStr = startOfDay(subDays(new Date(), i)).toISOString();
      const log = activityHistory.find(l => l.date === dateStr);
      data.push({
        date: dateStr,
        type: log ? log.type : null
      });
    }
    return data;
  }, [activityHistory]);

  return (
    <div className="max-w-3xl animate-in fade-in duration-300">
      <header className="mb-8 border-b border-[var(--color-border)] pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--color-foreground)] mb-1">Stats</h1>
        <p className="text-[var(--color-muted)] text-sm">Measure your progress.</p>
      </header>

      {/* Manual Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="border border-[var(--color-border)] p-4 rounded-md bg-[var(--color-background)] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
             <div className="text-[var(--color-muted)]">
               <Code className="w-5 h-5" />
             </div>
             <button onClick={incrementProblems} className="text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-hover)] p-1 rounded transition-colors border border-transparent hover:border-[var(--color-border)]">
               <Plus className="w-4 h-4" />
             </button>
          </div>
          <div>
            <span className="text-2xl font-bold text-[var(--color-foreground)]">{problemsSolved}</span>
            <p className="text-xs uppercase tracking-wider text-[var(--color-muted)] mt-1">Problems Solved</p>
          </div>
        </div>

        <div className="border border-[var(--color-border)] p-4 rounded-md bg-[var(--color-background)] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
             <div className="text-[var(--color-muted)]">
               <BookOpen className="w-5 h-5" />
             </div>
             <button onClick={incrementSections} className="text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-hover)] p-1 rounded transition-colors border border-transparent hover:border-[var(--color-border)]">
               <Plus className="w-4 h-4" />
             </button>
          </div>
          <div>
            <span className="text-2xl font-bold text-[var(--color-foreground)]">{sectionsCompleted}</span>
            <p className="text-xs uppercase tracking-wider text-[var(--color-muted)] mt-1">Sections Completed</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="border border-[var(--color-border)] p-3 rounded-md bg-[var(--color-background)] flex items-center gap-3">
           <div className="text-[var(--color-muted)] p-2">
             <Flame className="w-5 h-5" />
           </div>
           <div>
             <span className="text-xl font-bold text-[var(--color-foreground)]">{streak}</span>
             <p className="text-[10px] uppercase tracking-wider text-[var(--color-muted)]">Current Streak</p>
           </div>
        </div>
        <div className="border border-[var(--color-border)] p-3 rounded-md bg-[var(--color-background)] flex items-center gap-3">
           <div className="text-[var(--color-muted)] p-2">
             <Trophy className="w-5 h-5" />
           </div>
           <div>
             <span className="text-xl font-bold text-[var(--color-foreground)]">{projectsShipped}</span>
             <p className="text-[10px] uppercase tracking-wider text-[var(--color-muted)]">Projects Shipped</p>
           </div>
        </div>
      </div>

      {/* Chart */}
      <div className="border border-[var(--color-border)] p-5 rounded-md bg-[var(--color-background)] mb-4">
        <h3 className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-4 border-b border-[var(--color-border)] pb-2">30-Day Momentum</h3>
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: '4px', color: 'var(--color-foreground)', fontSize: '12px' }}
                itemStyle={{ color: 'var(--color-primary)' }}
              />
              <Area type="monotone" dataKey="score" stroke="var(--color-primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorScore)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Heatmap */}
      <div className="border border-[var(--color-border)] p-5 rounded-md bg-[var(--color-background)] overflow-hidden">
         <h3 className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-4 border-b border-[var(--color-border)] pb-2">Consistency (Last 6 Months)</h3>
         <div className="flex gap-1 overflow-x-auto pb-2" dir="rtl">
           {Array.from({ length: 26 }).map((_, colIndex) => (
             <div key={colIndex} className="flex flex-col gap-1">
               {Array.from({ length: 7 }).map((_, rowIndex) => {
                 const index = colIndex * 7 + rowIndex;
                 if (index >= heatmapData.length) return null;
                 const dayData = heatmapData[heatmapData.length - 1 - index];
                 
                 return (
                   <div 
                     key={rowIndex} 
                     title={format(new Date(dayData.date), 'MMM dd, yyyy')}
                     className={cn(
                       "w-3 h-3 rounded-[2px] transition-colors",
                       dayData.type === 'full' ? "bg-[var(--color-primary)]" :
                       dayData.type === 'minimum' ? "bg-orange-400" :
                       "bg-[var(--color-hover)]"
                     )}
                   />
                 );
               })}
             </div>
           ))}
         </div>
      </div>
    </div>
  );
}
