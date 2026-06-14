import { useMemo, useState } from 'react';
import {
  Map,
  ChevronDown,
  ChevronRight,
  Check,
  Upload,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';
import type { Phase, TaskType } from '../store/data';
import { parseRoadmap, countRoadmap } from '../lib/roadmap';
import { PageHeader, ProgressBar, Modal } from '../components/ui';

const TYPE_COLOR: Record<TaskType, string> = {
  dsa: 'text-accent',
  course: 'text-success',
  milestone: 'text-warning',
  project: 'text-accent',
  apply: 'text-danger',
};

const SAMPLE = `PHASE A — Foundations | Weeks 1-4
Week 1
- [course] Learn HTML basics | https://example.com
- [dsa] Arrays & strings
Week 2
- [course] CSS & Flexbox
- [dsa] Sorting
Milestone: deploy a static page

PHASE B — JavaScript | Weeks 5-8
Week 5
- [course] JS fundamentals
- [dsa] Recursion`;

export default function Roadmap() {
  const { phases, toggleRoadmapTask, replaceRoadmap, appendRoadmap, resetRoadmap } = useStore();
  const [importOpen, setImportOpen] = useState(false);

  const overall = useMemo(() => countRoadmap(phases), [phases]);

  return (
    <div className="animate-rise">
      <PageHeader
        title="Roadmap"
        subtitle="Your 6-month flight plan, integrated with your daily work."
        icon={<Map className="w-5 h-5" />}
        actions={
          <button onClick={() => setImportOpen(true)} className="btn btn-primary">
            <Upload className="w-4 h-4" /> Import roadmap
          </button>
        }
      />

      <div className="card p-5 mb-6">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="font-medium text-ink-muted">Overall progress</span>
          <span className="font-display font-bold text-ink">
            {overall.percent}%
            <span className="text-ink-subtle font-normal ml-2 text-xs">
              {overall.done}/{overall.total} done
            </span>
          </span>
        </div>
        <ProgressBar value={overall.percent} />
      </div>

      <div className="space-y-3">
        {phases.map((phase, i) => (
          <PhaseCard
            key={phase.id}
            phase={phase}
            defaultOpen={i === 0}
            onToggle={toggleRoadmapTask}
          />
        ))}
      </div>

      <ImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onReplace={(p) => {
          replaceRoadmap(p);
          setImportOpen(false);
        }}
        onAppend={(p) => {
          appendRoadmap(p);
          setImportOpen(false);
        }}
        onReset={() => {
          if (window.confirm('Reset to the default Liftoff roadmap? Your progress will be lost.')) {
            resetRoadmap();
            setImportOpen(false);
          }
        }}
      />
    </div>
  );
}

function PhaseCard({
  phase,
  defaultOpen,
  onToggle,
}: {
  phase: Phase;
  defaultOpen: boolean;
  onToggle: (p: string, w: string, t: string) => void;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const stats = useMemo(() => countRoadmap([phase]), [phase]);
  const done = stats.percent === 100 && stats.total > 0;

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-hover transition-colors"
      >
        <span className="text-ink-subtle">
          {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </span>
        <div className="flex-1 min-w-0">
          <h3
            className={cn(
              'font-display font-semibold text-[15px]',
              done ? 'text-ink-subtle line-through' : 'text-ink',
            )}
          >
            {phase.title}
          </h3>
          {phase.duration && <p className="text-xs text-ink-subtle mt-0.5">{phase.duration}</p>}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs font-medium text-ink-muted tabular-nums">{stats.percent}%</span>
          <div className="w-20 hidden sm:block">
            <ProgressBar value={stats.percent} className="h-1.5" />
          </div>
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-border space-y-5">
          {phase.weeks.map((week) => (
            <div key={week.id} className="pt-3">
              <h4 className="section-label mb-2">{week.title}</h4>
              <div className="space-y-0.5">
                {week.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="group flex items-start gap-3 p-2 rounded-lg hover:bg-hover transition-colors"
                  >
                    <button
                      onClick={() => onToggle(phase.id, week.id, task.id)}
                      className={cn(
                        'mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0',
                        task.completed
                          ? 'bg-accent border-accent text-white'
                          : 'border-ink-subtle hover:border-ink text-transparent',
                      )}
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          'text-sm',
                          task.completed ? 'text-ink-subtle line-through' : 'text-ink',
                        )}
                      >
                        {task.title}
                      </p>
                    </div>
                    <span
                      className={cn(
                        'text-[10px] font-semibold uppercase tracking-wider shrink-0',
                        TYPE_COLOR[task.type] || 'text-ink-subtle',
                      )}
                    >
                      {task.type}
                    </span>
                    {task.link && (
                      <a
                        href={task.link}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="opacity-0 group-hover:opacity-100 text-ink-subtle hover:text-accent"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ImportModal({
  open,
  onClose,
  onReplace,
  onAppend,
  onReset,
}: {
  open: boolean;
  onClose: () => void;
  onReplace: (p: Phase[]) => void;
  onAppend: (p: Phase[]) => void;
  onReset: () => void;
}) {
  const [text, setText] = useState('');
  const parsed = useMemo(() => (text.trim() ? parseRoadmap(text) : []), [text]);
  const stats = useMemo(() => countRoadmap(parsed), [parsed]);

  return (
    <Modal open={open} onClose={onClose} title="Import a roadmap" maxWidth="max-w-2xl">
      <div className="space-y-4">
        <p className="text-sm text-ink-muted">
          Paste any plan — phases, weeks, and tasks. Liftoff parses it into your roadmap so it
          integrates with your daily work and stats.
        </p>
        <textarea
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={SAMPLE}
          rows={12}
          className="input font-mono text-xs leading-relaxed resize-none"
        />
        <div className="flex items-center justify-between">
          <button
            onClick={() => setText(SAMPLE)}
            className="text-xs font-medium text-ink-muted hover:text-accent flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" /> Use sample format
          </button>
          {parsed.length > 0 && (
            <span className="text-xs text-ink-subtle">
              Detected {parsed.length} phase{parsed.length > 1 ? 's' : ''}, {stats.total} tasks
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border">
          <button onClick={onReset} className="btn btn-ghost text-xs text-danger">
            Reset to default
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => onAppend(parsed)}
              disabled={parsed.length === 0}
              className="btn btn-secondary disabled:opacity-40"
            >
              Append
            </button>
            <button
              onClick={() => onReplace(parsed)}
              disabled={parsed.length === 0}
              className="btn btn-primary disabled:opacity-40"
            >
              Replace roadmap
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
