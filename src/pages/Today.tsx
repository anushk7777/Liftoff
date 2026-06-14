import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Target, ChevronRight, CheckCircle2, Rocket, Flame } from 'lucide-react';
import { differenceInDays, startOfDay } from 'date-fns';
import { cn } from '../lib/utils';
import type { Task } from '../store/data';
import { motion } from 'framer-motion';

export default function Today() {
  const { phases, targetDate, toggleLogDay, activityHistory, reduceMotion, streak } = useStore();

  const todayStr = startOfDay(new Date()).toISOString();
  const todayLog = activityHistory.find(l => l.date === todayStr);
  const loggedType = todayLog ? todayLog.type : null;

  const { nextDsa, nextCourse } = useMemo(() => {
    let dsa: Task | null = null;
    let course: Task | null = null;
    for (const phase of phases) {
      for (const week of phase.weeks) {
        for (const task of week.tasks) {
          if (!task.completed) {
            if (!dsa && task.type === 'dsa') dsa = task;
            if (!course && task.type === 'course') course = task;
            if (dsa && course) break;
          }
        }
        if (dsa && course) break;
      }
      if (dsa && course) break;
    }
    return { nextDsa: dsa, nextCourse: course };
  }, [phases]);

  const daysUntilTarget = differenceInDays(new Date(targetDate), new Date());

  const handleLog = (type: 'full' | 'minimum') => {
    toggleLogDay(type);
  };

  const getPet = () => {
    if (streak < 3) return '🥚';
    if (streak < 7) return '🐣';
    if (streak < 14) return '🦎';
    if (streak < 30) return '🦖';
    return '🐉';
  };

  // Stagger variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  const fuelWidth = loggedType === 'full' ? '100%' : loggedType === 'minimum' ? '50%' : '5%';

  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial={reduceMotion ? "visible" : "hidden"}
      animate="visible"
    >
      {/* Header */}
      <motion.header variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-2">
        <div>
          <h2 className="text-3xl font-display font-bold text-[var(--text)] tracking-tight uppercase">
            Today's Quest
          </h2>
        </div>
        
        {/* Countdown Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] relative overflow-hidden group">
          <div className="absolute inset-0 border border-[var(--accent)] rounded-full opacity-30 animate-pulse pointer-events-none"></div>
          <Target className="w-4 h-4 text-[var(--accent)]" />
          <span className="font-mono text-sm tracking-widest text-[var(--text-muted)]"><span className="text-[var(--text)] font-bold">{daysUntilTarget}</span> DAYS TO LIFTOFF</span>
        </div>
      </motion.header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column (Missions) */}
        <motion.div variants={itemVariants} className="md:col-span-2 space-y-6">
          <div className="premium-card p-6 min-h-[340px] flex flex-col">
            <h3 className="font-display text-sm font-bold uppercase tracking-widest text-[var(--text-muted)] mb-5">
              Active Missions
            </h3>
            
            <div className="space-y-4 flex-1">
              {/* DSA Task */}
              <motion.div 
                whileHover={{ y: -2 }}
                className={cn(
                  "relative premium-card-raised p-4 flex justify-between items-center group cursor-pointer overflow-hidden",
                  loggedType ? "opacity-60" : ""
                )}
              >
                {/* Thin progress line */}
                <div className="absolute left-0 bottom-0 h-0.5 bg-[rgba(255,255,255,0.05)] w-full">
                   <div className={cn("h-full transition-all duration-1000", loggedType ? "w-full bg-[var(--success)]" : "w-1/3 bg-[var(--accent)]")}></div>
                </div>

                <div className="flex gap-4 items-center">
                  <div className="w-6 h-6 flex items-center justify-center">
                    {loggedType ? (
                      <CheckCircle2 className="w-6 h-6 text-[var(--success)]" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-[var(--text-muted)] border-dashed"></div>
                    )}
                  </div>
                  <div>
                    <p className={cn("font-bold text-[16px] leading-tight transition-colors", loggedType ? "text-[var(--text-muted)] line-through" : "text-[var(--text)]")}>
                      {nextDsa?.title || 'All DSA completed!'}
                    </p>
                    <span className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-wider mt-0.5 inline-block">DSA Block • 45m</span>
                  </div>
                </div>
                {nextDsa?.link && (
                  <div className="w-8 h-8 rounded-full bg-[rgba(255,255,255,0.03)] flex items-center justify-center group-hover:bg-[rgba(255,255,255,0.08)] transition-colors">
                    <ChevronRight className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--text)] transition-colors" />
                  </div>
                )}
              </motion.div>

              {/* Course Task */}
              <motion.div 
                whileHover={{ y: -2 }}
                className={cn(
                  "relative premium-card-raised p-4 flex justify-between items-center group cursor-pointer overflow-hidden",
                  loggedType ? "opacity-60" : ""
                )}
              >
                <div className="absolute left-0 bottom-0 h-0.5 bg-[rgba(255,255,255,0.05)] w-full">
                   <div className={cn("h-full transition-all duration-1000", loggedType ? "w-full bg-[var(--success)]" : "w-1/4 bg-[var(--accent)]")}></div>
                </div>

                <div className="flex gap-4 items-center">
                  <div className="w-6 h-6 flex items-center justify-center">
                    {loggedType ? (
                      <CheckCircle2 className="w-6 h-6 text-[var(--success)]" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-[var(--text-muted)] border-dashed"></div>
                    )}
                  </div>
                  <div>
                    <p className={cn("font-bold text-[16px] leading-tight transition-colors", loggedType ? "text-[var(--text-muted)] line-through" : "text-[var(--text)]")}>
                      {nextCourse?.title || 'All course modules completed!'}
                    </p>
                    <span className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-wider mt-0.5 inline-block">Course Block • 1.5h</span>
                  </div>
                </div>
                {nextCourse?.link && (
                  <div className="w-8 h-8 rounded-full bg-[rgba(255,255,255,0.03)] flex items-center justify-center group-hover:bg-[rgba(255,255,255,0.08)] transition-colors">
                    <ChevronRight className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--text)] transition-colors" />
                  </div>
                )}
              </motion.div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => handleLog('full')}
                className={cn(
                  "flex-1 py-3.5 text-sm",
                  loggedType === 'full' ? "btn-secondary text-[var(--accent)] border-[var(--accent)]" : "btn-primary"
                )}
              >
                {loggedType === 'full' ? "Undo Full Day" : "Log Full Day!"}
              </button>

              <button
                onClick={() => handleLog('minimum')}
                className={cn(
                  "flex-1 py-3.5 text-sm",
                  loggedType === 'minimum' ? "btn-secondary border-[var(--text)] text-[var(--text)]" : "btn-secondary"
                )}
              >
                {loggedType === 'minimum' ? "Undo Min Day" : "Log Minimum Day"}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Right Column (Widgets) */}
        <div className="space-y-6 flex flex-col">
          
          {/* Streak Pet Panel */}
          <motion.div variants={itemVariants} className="premium-card p-6 flex-1 flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[220px]">
            {/* Halo Glow */}
            <motion.div 
              animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full blur-[40px] bg-[var(--accent)] pointer-events-none"
            />
            
            <motion.div 
              animate={{ y: [-3, 3, -3] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10 flex flex-col items-center"
            >
              <div className="text-6xl mb-2 filter drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
                {getPet()}
              </div>
              <div className="flex items-center gap-1.5 mb-1 bg-[rgba(0,0,0,0.3)] px-3 py-1 rounded-full border border-[rgba(255,255,255,0.05)] backdrop-blur-md">
                <motion.div
                   animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
                   transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Flame className={cn("w-4 h-4", streak > 0 ? "text-[var(--accent)]" : "text-[var(--text-muted)] fill-[var(--text-muted)]")} />
                </motion.div>
                <span className="text-xl font-display font-bold text-[var(--text)]">{streak}</span>
              </div>
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-2">Streak Pet {getPet()}</p>
            </motion.div>
          </motion.div>

          {/* Rocket Fuel Progress */}
          <motion.div variants={itemVariants} className="premium-card p-5">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-1">
                <Rocket className="w-3 h-3" /> Rocket Fuel
              </span>
              <span className="text-[11px] font-bold text-[var(--accent)] font-mono">{loggedType === 'full' ? '100%' : loggedType === 'minimum' ? '50%' : '5%'}</span>
            </div>
            <div className="w-full bg-[var(--bg-deep)] rounded-full h-3 relative shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] overflow-hidden">
              <motion.div 
                className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-[var(--accent-2)] to-[var(--accent)] shadow-[0_0_10px_var(--accent)]"
                initial={{ width: '0%' }}
                animate={{ width: fuelWidth }}
                transition={{ type: 'spring', damping: 20, stiffness: 100 }}
              />
              {/* Inner glow on the track */}
              <div className="absolute inset-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] rounded-full pointer-events-none"></div>
            </div>
          </motion.div>

        </div>
      </div>
      
    </motion.div>
  );
}
