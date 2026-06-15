import { useState } from 'react';
import { motion } from 'framer-motion';
import { startOfDay } from 'date-fns';
import { Plus, Clock, CalendarPlus, Bell, Zap, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';
import { pop, useReducedMotion } from '../lib/motion';
import { buildICS, downloadICS } from '../lib/ics';
import { requestNotificationPermission } from '../lib/reminders';

// datetime-local helpers (work in the user's local timezone)
const toLocalInput = (d: Date) => {
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'task';

export default function QuickAdd({ onClose }: { onClose: () => void }) {
  const addTask = useStore((s) => s.addTask);
  const rm = useReducedMotion();

  const [title, setTitle] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [remind, setRemind] = useState(false);
  const [addToCalendar, setAddToCalendar] = useState(false);

  const setChip = (d: Date) => setScheduledAt(toLocalInput(d));
  const now = () => setChip(new Date());
  const plusHour = () => setChip(new Date(Date.now() + 60 * 60000));
  const tonight = () => {
    const d = new Date();
    d.setHours(20, 0, 0, 0);
    setChip(d);
  };
  const tomorrow9 = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(9, 0, 0, 0);
    setChip(d);
  };

  const toggleRemind = async () => {
    const next = !remind;
    setRemind(next);
    if (next) await requestNotificationPermission();
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const sched = scheduledAt ? new Date(scheduledAt) : null;
    addTask({
      title: title.trim(),
      scheduledAt: sched ? sched.toISOString() : undefined,
      dueDate: sched ? startOfDay(sched).toISOString() : undefined,
      priority: 'medium',
      status: 'todo',
    });
    if (sched && addToCalendar) {
      downloadICS(
        `${slug(title)}.ics`,
        buildICS({ title: title.trim(), start: sched, description: 'Scheduled in Liftoff' }),
      );
    }
    onClose();
  };

  return (
    <motion.div
      className="fixed inset-0 z-[80] flex items-start justify-center p-4 pt-[14vh]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: rm ? 0 : 0.18 }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.form
        onSubmit={submit}
        className="relative w-full max-w-lg card shadow-lg p-4"
        initial={{ opacity: 0, scale: rm ? 1 : 0.94, y: rm ? 0 : 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: rm ? 1 : 0.96, y: rm ? 0 : 8 }}
        transition={rm ? { duration: 0 } : pop}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent-soft flex items-center justify-center shrink-0">
            <Plus className="w-4 h-4 text-accent" />
          </div>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add a task…"
            className="flex-1 bg-transparent text-base text-ink placeholder:text-ink-subtle focus:outline-none py-1.5"
          />
          <button type="button" onClick={onClose} className="p-1.5 rounded-md text-ink-subtle hover:text-ink hover:bg-hover">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Schedule chips */}
        <div className="flex flex-wrap items-center gap-1.5 mt-3 pl-10">
          <Chip onClick={now} icon={<Clock className="w-3.5 h-3.5" />}>Now</Chip>
          <Chip onClick={plusHour}>+1h</Chip>
          <Chip onClick={tonight}>Tonight</Chip>
          <Chip onClick={tomorrow9}>Tomorrow 9am</Chip>
        </div>

        {/* Datetime + toggles */}
        <div className="mt-3 pl-10 space-y-2">
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="input w-auto"
          />
          {scheduledAt && (
            <div className="flex flex-wrap items-center gap-2">
              <Toggle active={remind} onClick={toggleRemind} icon={<Bell className="w-3.5 h-3.5" />}>
                Remind me
              </Toggle>
              <Toggle
                active={addToCalendar}
                onClick={() => setAddToCalendar((v) => !v)}
                icon={<CalendarPlus className="w-3.5 h-3.5" />}
              >
                Add to calendar
              </Toggle>
              {scheduledAt && (
                <button
                  type="button"
                  onClick={() => setScheduledAt('')}
                  className="text-xs text-ink-subtle hover:text-ink ml-auto"
                >
                  Clear
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-4 pl-10">
          <span className="text-[11px] text-ink-subtle flex items-center gap-1">
            <Zap className="w-3 h-3" /> Enter to add
          </span>
          <button type="submit" disabled={!title.trim()} className="btn btn-primary disabled:opacity-40">
            <Plus className="w-4 h-4" /> Add task
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
}

function Chip({
  onClick,
  icon,
  children,
}: {
  onClick: () => void;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border border-border text-ink-muted hover:text-ink hover:border-border-strong hover:bg-hover transition-colors active:scale-95"
    >
      {icon}
      {children}
    </button>
  );
}

function Toggle({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-colors active:scale-95',
        active
          ? 'border-accent/40 bg-accent-soft text-accent'
          : 'border-border text-ink-muted hover:text-ink hover:bg-hover',
      )}
    >
      {icon}
      {children}
    </button>
  );
}
