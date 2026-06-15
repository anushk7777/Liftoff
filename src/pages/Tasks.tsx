import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Check,
  Trash2,
  Pencil,
  CheckSquare,
  Circle,
  CircleDot,
  Clock,
} from 'lucide-react';
import { format, isToday, isPast, startOfDay } from 'date-fns';
import { useStore } from '../store/useStore';
import type { TodoTask, Priority, Status } from '../store/data';
import { cn } from '../lib/utils';
import { springSoft } from '../lib/motion';
import { PageHeader, Modal, PriorityDot, PriorityBadge, EmptyState } from '../components/ui';

const toLocalInput = (d: Date) => {
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

type Filter = 'all' | 'todo' | 'doing' | 'done';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'todo', label: 'To do' },
  { key: 'doing', label: 'In progress' },
  { key: 'done', label: 'Done' },
];

export default function Tasks() {
  const { tasks, addTask, updateTask, deleteTask, cycleTaskStatus } = useStore();
  const [filter, setFilter] = useState<Filter>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TodoTask | null>(null);

  const filtered = useMemo(() => {
    const base = filter === 'all' ? tasks : tasks.filter((t) => t.status === filter);
    const prioRank = { high: 0, medium: 1, low: 2 };
    return [...base].sort((a, b) => {
      const stRank = { doing: 0, todo: 1, done: 2 };
      if (stRank[a.status] !== stRank[b.status]) return stRank[a.status] - stRank[b.status];
      return prioRank[a.priority] - prioRank[b.priority];
    });
  }, [tasks, filter]);

  const counts = useMemo(
    () => ({
      all: tasks.length,
      todo: tasks.filter((t) => t.status === 'todo').length,
      doing: tasks.filter((t) => t.status === 'doing').length,
      done: tasks.filter((t) => t.status === 'done').length,
    }),
    [tasks],
  );

  const openNew = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (t: TodoTask) => {
    setEditing(t);
    setModalOpen(true);
  };

  const handleCycle = (t: TodoTask) => {
    cycleTaskStatus(t.id);
  };

  return (
    <div className="animate-rise">
      <PageHeader
        title="Tasks"
        subtitle="Everything you need to do, in one place."
        icon={<CheckSquare className="w-5 h-5" />}
        actions={
          <button onClick={openNew} className="btn btn-primary">
            <Plus className="w-4 h-4" /> New task
          </button>
        }
      />

      {/* Filter bar */}
      <div className="flex items-center gap-1 mb-5 p-1 rounded-lg bg-elevated border border-border w-fit">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              filter === f.key ? 'bg-surface text-ink shadow-sm' : 'text-ink-muted hover:text-ink',
            )}
          >
            {f.label}
            <span className="ml-1.5 text-xs text-ink-subtle">{counts[f.key]}</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<CheckSquare className="w-7 h-7" />}
          title="No tasks here yet"
          hint="Create a task to start building momentum toward your goal."
        />
      ) : (
        <motion.div layout className="flex flex-col gap-2">
          <AnimatePresence initial={false}>
            {filtered.map((task) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={springSoft}
              >
                <TaskRow
                  task={task}
                  onCycle={() => handleCycle(task)}
                  onEdit={() => openEdit(task)}
                  onDelete={() => deleteTask(task.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <TaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editing={editing}
        onSave={(data) => {
          if (editing) updateTask(editing.id, data);
          else addTask({ title: data.title || 'Untitled', ...data });
          setModalOpen(false);
        }}
      />
    </div>
  );
}

function StatusIcon({ status }: { status: Status }) {
  if (status === 'done') return <Check className="w-3.5 h-3.5" />;
  if (status === 'doing') return <CircleDot className="w-3.5 h-3.5" />;
  return <Circle className="w-3.5 h-3.5" />;
}

function TaskRow({
  task,
  onCycle,
  onEdit,
  onDelete,
}: {
  task: TodoTask;
  onCycle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const overdue =
    task.dueDate &&
    task.status !== 'done' &&
    isPast(new Date(task.dueDate)) &&
    !isToday(new Date(task.dueDate));

  return (
    <div className="group card card-hover flex items-start gap-3 px-3.5 py-3">
      <button
        onClick={onCycle}
        title="Cycle status"
        className={cn(
          'mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center transition-colors shrink-0',
          task.status === 'done'
            ? 'bg-accent border-accent text-[var(--accent-text)]'
            : task.status === 'doing'
              ? 'border-warning text-warning'
              : 'border-ink-subtle text-ink-subtle hover:border-ink hover:text-ink',
        )}
      >
        <StatusIcon status={task.status} />
      </button>

      <div className="flex-1 min-w-0" onClick={onEdit} role="button">
        <div className="flex items-center gap-2">
          <PriorityDot priority={task.priority} />
          <p
            className={cn(
              'text-sm font-medium truncate',
              task.status === 'done' ? 'line-through text-ink-subtle' : 'text-ink',
            )}
          >
            {task.title}
          </p>
        </div>
        {(task.notes || task.category || task.dueDate || task.estimate || task.scheduledAt) && (
          <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] text-ink-subtle">
            {task.category && <span className="chip">{task.category}</span>}
            {task.estimate && <span>⏱ {task.estimate}</span>}
            {task.scheduledAt ? (
              <span className={cn('inline-flex items-center gap-1', overdue && 'text-danger font-medium')}>
                <Clock className="w-3 h-3" />
                {format(new Date(task.scheduledAt), 'MMM d, h:mm a')}
              </span>
            ) : (
              task.dueDate && (
                <span className={cn(overdue && 'text-danger font-medium')}>
                  {overdue ? 'Overdue · ' : 'Due '}
                  {format(new Date(task.dueDate), 'MMM d')}
                </span>
              )
            )}
            {task.notes && <span className="truncate max-w-[200px]">— {task.notes}</span>}
          </div>
        )}
      </div>

      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onEdit} className="p-1.5 rounded-md text-ink-subtle hover:text-ink hover:bg-hover">
          <Pencil className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 rounded-md text-ink-subtle hover:text-danger hover:bg-hover"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function TaskModal({
  open,
  onClose,
  editing,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  editing: TodoTask | null;
  onSave: (data: Partial<TodoTask>) => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit task' : 'New task'}>
      {/* Remount on open / when switching target so fields initialise from props */}
      {open && (
        <TaskForm
          key={editing?.id ?? 'new'}
          editing={editing}
          onClose={onClose}
          onSave={onSave}
        />
      )}
    </Modal>
  );
}

function TaskForm({
  editing,
  onClose,
  onSave,
}: {
  editing: TodoTask | null;
  onClose: () => void;
  onSave: (data: Partial<TodoTask>) => void;
}) {
  const [title, setTitle] = useState(editing?.title ?? '');
  const [notes, setNotes] = useState(editing?.notes ?? '');
  const [priority, setPriority] = useState<Priority>(editing?.priority ?? 'medium');
  const [status, setStatus] = useState<Status>(editing?.status ?? 'todo');
  const [category, setCategory] = useState(editing?.category ?? '');
  const [estimate, setEstimate] = useState(editing?.estimate ?? '');
  const [dueDate, setDueDate] = useState(editing?.dueDate ? editing.dueDate.slice(0, 10) : '');
  const [scheduledAt, setScheduledAt] = useState(
    editing?.scheduledAt ? toLocalInput(new Date(editing.scheduledAt)) : '',
  );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const sched = scheduledAt ? new Date(scheduledAt) : null;
    onSave({
      title: title.trim(),
      notes: notes.trim() || undefined,
      priority,
      status,
      category: category.trim() || undefined,
      estimate: estimate.trim() || undefined,
      scheduledAt: sched ? sched.toISOString() : undefined,
      dueDate: sched
        ? startOfDay(sched).toISOString()
        : dueDate
          ? startOfDay(new Date(dueDate)).toISOString()
          : undefined,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to get done?"
          className="input text-base"
        />
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes (optional)"
          rows={2}
          className="input resize-none"
        />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Priority">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="input"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </Field>
          <Field label="Status">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Status)}
              className="input"
            >
              <option value="todo">To do</option>
              <option value="doing">In progress</option>
              <option value="done">Done</option>
            </select>
          </Field>
          <Field label="Category">
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. DSA"
              className="input"
            />
          </Field>
          <Field label="Estimate">
            <input
              value={estimate}
              onChange={(e) => setEstimate(e.target.value)}
              placeholder="e.g. 45m"
              className="input"
            />
          </Field>
          <Field label="Due date">
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Schedule (time)">
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="input"
            />
          </Field>
        </div>
        <div className="flex items-center justify-between gap-2 pt-1">
          {editing ? <PriorityBadge priority={priority} /> : <span />}
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editing ? 'Save changes' : 'Add task'}
            </button>
          </div>
        </div>
    </form>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn('block', className)}>
      <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-subtle mb-1.5 block">
        {label}
      </span>
      {children}
    </label>
  );
}
