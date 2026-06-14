import { useNavigate } from 'react-router-dom';
import {
  Flame,
  Clock,
  Timer,
  Target,
  Play,
  CalendarDays,
  Lightbulb,
  Zap,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { cn } from '../lib/utils';
import type { CoachAction, Suggestion } from '../lib/coach';
import { useCoachActions } from './useCoachActions';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  flame: Flame,
  clock: Clock,
  timer: Timer,
  target: Target,
  play: Play,
  calendar: CalendarDays,
  idea: Lightbulb,
  zap: Zap,
};

const TONE: Record<Suggestion['tone'], string> = {
  urgent: 'text-danger bg-danger/10',
  focus: 'text-accent bg-accent-soft',
  plan: 'text-warning bg-warning/10',
  win: 'text-success bg-success/10',
  idea: 'text-accent bg-accent-soft',
};

export function SuggestionRow({
  suggestion,
  onAct,
}: {
  suggestion: Suggestion;
  onAct: (a: CoachAction) => void;
}) {
  const Icon = ICONS[suggestion.icon] || Sparkles;
  return (
    <div className="group flex items-start gap-3 p-3 rounded-lg hover:bg-hover transition-colors">
      <div className={cn('mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0', TONE[suggestion.tone])}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink leading-snug">{suggestion.title}</p>
        <p className="text-xs text-ink-muted mt-0.5">{suggestion.reason}</p>
      </div>
      <button
        onClick={() => onAct(suggestion.action)}
        className="btn btn-secondary text-xs py-1.5 px-2.5 shrink-0 self-center"
      >
        {suggestion.actionLabel}
        <ArrowRight className="w-3 h-3" />
      </button>
    </div>
  );
}

export function CoachCard({ suggestions }: { suggestions: Suggestion[] }) {
  const navigate = useNavigate();
  const onAct = useCoachActions();

  return (
    <section className="card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-accent-soft/40">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent" />
          <h2 className="font-display font-semibold text-sm text-ink">Coach</h2>
          <span className="text-[11px] text-ink-subtle">· what to do next</span>
        </div>
        <button
          onClick={() => navigate('/coach')}
          className="text-xs font-medium text-ink-muted hover:text-accent flex items-center gap-1"
        >
          More <ArrowRight className="w-3 h-3" />
        </button>
      </div>
      <div className="p-1.5">
        {suggestions.slice(0, 3).map((s) => (
          <SuggestionRow key={s.id} suggestion={s} onAct={onAct} />
        ))}
      </div>
    </section>
  );
}
