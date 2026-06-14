import { useState } from 'react';
import { useStore } from '../store/useStore';
import { ChevronDown, ChevronRight, Check } from 'lucide-react';
import { cn } from '../lib/utils';
import type { Phase } from '../store/data';

export default function Roadmap() {
  const { phases, toggleTask } = useStore();

  const totalTasks = phases.reduce((acc, p) => acc + p.weeks.reduce((wAcc, w) => wAcc + w.tasks.length, 0), 0);
  const completedTasks = phases.reduce((acc, p) => acc + p.weeks.reduce((wAcc, w) => wAcc + w.tasks.filter(t => t.completed).length, 0), 0);
  const overallProgress = Math.round((completedTasks / totalTasks) * 100) || 0;

  return (
    <div className="max-w-3xl animate-in fade-in duration-300">
      <header className="mb-8 border-b border-[var(--color-border)] pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--color-foreground)] mb-4">Roadmap</h1>
        
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="font-medium text-[var(--color-muted)]">Overall Progress</span>
          <span className="font-semibold">{overallProgress}%</span>
        </div>
        <div className="h-1.5 w-full bg-[var(--color-border)] rounded-full overflow-hidden">
           <div 
             className="h-full bg-[var(--color-foreground)] rounded-full transition-all duration-500"
             style={{ width: `${overallProgress}%` }}
           />
        </div>
      </header>

      <div className="space-y-4">
        {phases.map((phase, i) => (
          <PhaseCard key={phase.id} phase={phase} index={i} toggleTask={toggleTask} />
        ))}
      </div>
    </div>
  );
}

function PhaseCard({ phase, index, toggleTask }: { phase: Phase, index: number, toggleTask: any }) {
  const [isOpen, setIsOpen] = useState(index === 0);
  
  const phaseTasks = phase.weeks.reduce((acc, w) => acc + w.tasks.length, 0);
  const phaseCompleted = phase.weeks.reduce((acc, w) => acc + w.tasks.filter(t => t.completed).length, 0);
  const progress = Math.round((phaseCompleted / phaseTasks) * 100) || 0;
  const isDone = progress === 100;

  return (
    <div className="border border-[var(--color-border)] rounded-md bg-[var(--color-background)]">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-[var(--color-hover)] transition-colors rounded-md"
      >
        <div className="flex items-center gap-3">
          <div className="text-[var(--color-muted)]">
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </div>
          <div>
             <h3 className={cn("text-base font-semibold", isDone ? "text-[var(--color-muted)] line-through" : "text-[var(--color-foreground)]")}>
               {phase.title}
             </h3>
             <span className="text-xs text-[var(--color-muted)]">{phase.duration} • {progress}%</span>
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 pt-2 border-t border-[var(--color-border)]">
          <div className="space-y-6 mt-4">
            {phase.weeks.map(week => (
              <div key={week.id} className="space-y-2">
                <h4 className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-3">
                  {week.title}
                </h4>
                <div className="space-y-1">
                  {week.tasks.map(task => (
                    <button
                      key={task.id}
                      onClick={() => toggleTask(phase.id, week.id, task.id)}
                      className="w-full flex items-start gap-3 p-2 rounded hover:bg-[var(--color-hover)] transition-colors text-left group"
                    >
                      <div className="mt-0.5 flex-shrink-0">
                        <div className={cn(
                          "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                          task.completed 
                            ? "bg-primary-500 border-primary-500 text-white" 
                            : "border-[var(--color-border)] group-hover:border-[var(--color-muted)]"
                        )}>
                          {task.completed && <Check className="w-3 h-3" />}
                        </div>
                      </div>
                      <div>
                        <p className={cn("text-sm transition-all", task.completed ? "text-[var(--color-muted)] line-through" : "text-[var(--color-foreground)]")}>
                          {task.title}
                        </p>
                        <span className="text-[10px] uppercase text-[var(--color-muted)] tracking-wider">
                          {task.type}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
