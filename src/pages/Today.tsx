import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Check, Plus, Trash2 } from 'lucide-react';
import { format, differenceInDays, startOfDay } from 'date-fns';
import { cn } from '../lib/utils';

export default function Today() {
  const { targetDate, dailyTasks, addDailyTask, toggleDailyTask, deleteDailyTask, streak, activityHistory, toggleLogDay } = useStore();
  
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('');
  const [newTaskDuration, setNewTaskDuration] = useState('');

  const todayStr = startOfDay(new Date()).toISOString();
  
  // Filter tasks for today only
  const todaysTasks = dailyTasks.filter(t => t.date === todayStr);
  const completedTasks = todaysTasks.filter(t => t.completed).length;
  const totalTasks = todaysTasks.length;
  const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const daysUntilTarget = differenceInDays(new Date(targetDate), new Date());
  
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    addDailyTask({
      title: newTaskTitle.trim(),
      category: newTaskCategory.trim() || 'Task',
      duration: newTaskDuration.trim() || '30m',
      completed: false,
      date: todayStr
    });
    
    setNewTaskTitle('');
    setNewTaskCategory('');
    setNewTaskDuration('');
  };

  const todayLog = activityHistory.find(l => l.date === todayStr);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <header className="flex items-end justify-between border-b border-[var(--border)] pb-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text)] tracking-tight">Today</h2>
          <p className="text-[13px] text-[var(--text-muted)] font-medium mt-1">
            {format(new Date(), 'EEEE, MMMM d')}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[13px] text-[var(--text-subtle)] font-mono uppercase tracking-wider">
            Goal · {daysUntilTarget} days left
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column (Tasks) */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[13px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              Today's Focus
            </h3>
            <span className="text-[13px] text-[var(--text-muted)] font-medium">{completedTasks} / {totalTasks}</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-[3px] bg-[var(--surface)] rounded-full overflow-hidden mb-6">
             <div 
               className="h-full bg-[var(--accent)] transition-all duration-500 ease-out" 
               style={{ width: `${progressPercent}%` }}
             />
          </div>

          <div className="space-y-2">
            {todaysTasks.length === 0 ? (
              <div className="p-8 text-center text-[var(--text-subtle)] text-sm border border-dashed border-[var(--border)] rounded-xl">
                No tasks for today. Add one below to get started.
              </div>
            ) : (
              todaysTasks.map(task => (
                <div 
                  key={task.id}
                  className={cn(
                    "group flex items-center justify-between p-3 rounded-xl border transition-colors",
                    task.completed ? "bg-[rgba(255,255,255,0.02)] border-transparent" : "bg-[var(--surface)] border-[var(--border)] hover:border-[var(--text-subtle)]"
                  )}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <button 
                      onClick={() => toggleDailyTask(task.id)}
                      className={cn(
                        "flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--bg-deep)]",
                        task.completed ? "bg-[var(--accent)] border-[var(--accent)] text-white" : "border-[var(--text-muted)] hover:border-[var(--text)] text-transparent"
                      )}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <div className="truncate">
                      <p className={cn(
                        "text-[15px] font-medium transition-colors truncate",
                        task.completed ? "text-[var(--text-muted)] line-through" : "text-[var(--text)]"
                      )}>
                        {task.title}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                    <div className="flex items-center gap-1.5 opacity-80">
                      <span className="text-[11px] px-1.5 py-0.5 rounded bg-[var(--bg-deep)] border border-[var(--border)] text-[var(--text-muted)] font-medium uppercase tracking-wider">
                        {task.category}
                      </span>
                      <span className="text-[11px] text-[var(--text-subtle)] font-medium">
                        · {task.duration}
                      </span>
                    </div>
                    <button 
                      onClick={() => deleteDailyTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-[var(--text-subtle)] hover:text-red-400 transition-colors rounded-md hover:bg-[rgba(255,0,0,0.1)] focus:outline-none focus:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add Task Form */}
          <form onSubmit={handleAddTask} className="mt-4 p-1 flex flex-col sm:flex-row sm:items-center gap-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl focus-within:border-[var(--text-subtle)] transition-colors">
             <div className="flex items-center flex-1 w-full">
               <button type="submit" className="p-2 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
                 <Plus className="w-5 h-5" />
               </button>
               <input 
                 type="text" 
                 placeholder="Add a new task..." 
                 value={newTaskTitle}
                 onChange={e => setNewTaskTitle(e.target.value)}
                 className="flex-1 bg-transparent border-none text-[14px] text-[var(--text)] placeholder-[var(--text-subtle)] focus:outline-none focus:ring-0 py-2 min-w-0"
               />
             </div>
             <div className="flex items-center gap-2 pr-2 pl-2 pb-2 sm:pb-0 sm:pl-0">
               <input 
                 type="text" 
                 placeholder="Cat (e.g. DSA)"
                 value={newTaskCategory}
                 onChange={e => setNewTaskCategory(e.target.value)}
                 className="w-24 bg-[var(--bg-deep)] border border-[var(--border)] text-[12px] text-[var(--text-muted)] rounded-md px-2 py-1.5 focus:outline-none focus:border-[var(--text-subtle)]"
               />
               <input 
                 type="text" 
                 placeholder="30m"
                 value={newTaskDuration}
                 onChange={e => setNewTaskDuration(e.target.value)}
                 className="w-16 bg-[var(--bg-deep)] border border-[var(--border)] text-[12px] text-[var(--text-muted)] rounded-md px-2 py-1.5 focus:outline-none focus:border-[var(--text-subtle)]"
               />
             </div>
          </form>
        </div>

        {/* Right Column (Stats) */}
        <div className="space-y-6">
          <div className="clean-card p-5 space-y-4">
             <h3 className="text-[13px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
               Stats
             </h3>
             <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[24px] font-bold text-[var(--text)]">{streak}</p>
                  <p className="text-[12px] text-[var(--text-subtle)] mt-0.5">Current Streak</p>
                </div>
                <div>
                  <p className="text-[24px] font-bold text-[var(--text)]">{activityHistory.length}</p>
                  <p className="text-[12px] text-[var(--text-subtle)] mt-0.5">Days Completed</p>
                </div>
             </div>
             
             {/* Weekly View Stub */}
             <div className="pt-4 border-t border-[var(--border)]">
               <div className="flex justify-between items-center text-[11px] font-medium text-[var(--text-subtle)] mb-1.5">
                 <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span className="text-[var(--text)]">S</span><span>S</span>
               </div>
               <div className="flex justify-between items-center">
                 {[1,2,3,4,5,6,7].map(i => (
                   <div key={i} className={cn("w-1.5 h-1.5 rounded-full", i === 6 ? "bg-[var(--accent)] shadow-[0_0_8px_rgba(99,102,241,0.4)]" : "bg-[var(--border)]")} />
                 ))}
               </div>
             </div>
          </div>

          <div className="clean-card p-5">
             <h3 className="text-[13px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-4">
               Log Day
             </h3>
             <button
               onClick={() => toggleLogDay('full')}
               className={cn(
                 "w-full py-2.5",
                 todayLog ? "btn-secondary text-[var(--text-muted)] border-[var(--border)]" : "btn-primary"
               )}
             >
               {todayLog ? "Day marked complete" : "Mark day complete"}
             </button>
             <p className="text-[11px] text-[var(--text-subtle)] text-center mt-3">
               Locks in your streak for {format(new Date(), 'MMM d')}
             </p>
          </div>
        </div>
      </div>
      
    </div>
  );
}
