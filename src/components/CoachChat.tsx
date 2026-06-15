import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, Sparkles, KeyRound, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';
import { streamCoach, hasKey, type ChatMsg } from '../lib/claudeChat';
import { buildCoachSystemPrompt } from '../lib/coachContext';
import type { CoachState } from '../lib/coach';

const STARTERS = [
  'What should I focus on right now?',
  'Am I on track for my goal?',
  'I feel behind — help me catch up.',
  'Plan my next 3 days.',
];

export default function CoachChat() {
  const phases = useStore((s) => s.phases);
  const tasks = useStore((s) => s.tasks);
  const focusSessions = useStore((s) => s.focusSessions);
  const ideas = useStore((s) => s.ideas);
  const activityHistory = useStore((s) => s.activityHistory);
  const streak = useStore((s) => s.streak);
  const pomodoro = useStore((s) => s.pomodoro);
  const habits = useStore((s) => s.habits);
  const habitLog = useStore((s) => s.habitLog);
  const targetDate = useStore((s) => s.targetDate);

  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  if (!hasKey()) return <ConnectPrompt />;

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;
    setInput('');
    setError('');
    const history: ChatMsg[] = [...messages, { role: 'user', content: trimmed }];
    setMessages([...history, { role: 'assistant', content: '' }]);
    setStreaming(true);

    const state: CoachState = {
      phases,
      tasks,
      focusSessions,
      ideas,
      activityHistory,
      streak,
      pomodoro,
      habits,
      habitLog,
      targetDate,
    };

    try {
      await streamCoach({
        system: buildCoachSystemPrompt(state),
        messages: history,
        onText: (delta) =>
          setMessages((prev) => {
            const copy = [...prev];
            const last = copy[copy.length - 1];
            copy[copy.length - 1] = { role: 'assistant', content: last.content + delta };
            return copy;
          }),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
      setMessages((prev) => prev.slice(0, -1)); // drop the empty assistant turn
    } finally {
      setStreaming(false);
    }
  };

  return (
    <section className="card overflow-hidden flex flex-col" style={{ maxHeight: 520 }}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-accent-soft/40">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent" />
          <h2 className="font-display font-semibold text-sm text-ink">Ask your coach</h2>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="text-xs text-ink-subtle hover:text-ink flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear
          </button>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[180px]">
        {messages.length === 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-ink-muted">
              I can see your tasks, streak, roadmap pace, and habits. Ask me anything.
            </p>
            <div className="flex flex-wrap gap-2">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-xs px-2.5 py-1.5 rounded-full border border-border text-ink-muted hover:text-ink hover:bg-hover transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
              <div
                className={cn(
                  'max-w-[85%] rounded-2xl px-3.5 py-2 text-sm whitespace-pre-wrap leading-relaxed',
                  m.role === 'user'
                    ? 'bg-accent text-[var(--accent-text)] rounded-br-sm'
                    : 'bg-elevated text-ink rounded-bl-sm',
                )}
              >
                {m.content || (streaming && i === messages.length - 1 ? (
                  <Loader2 className="w-4 h-4 animate-spin text-ink-subtle" />
                ) : (
                  ''
                ))}
              </div>
            </div>
          ))
        )}
        {error && (
          <div className="flex items-center gap-2 text-xs text-danger">
            <AlertTriangle className="w-3.5 h-3.5" /> {error}
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-end gap-2 p-3 border-t border-border"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
          placeholder="Ask your coach…"
          rows={1}
          className="input resize-none max-h-28 flex-1"
        />
        <button
          type="submit"
          disabled={!input.trim() || streaming}
          className="btn btn-primary p-2.5 disabled:opacity-40"
          aria-label="Send"
        >
          {streaming ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </form>
    </section>
  );
}

function ConnectPrompt() {
  return (
    <section className="card p-5 flex items-start gap-3">
      <div className="w-9 h-9 rounded-lg bg-accent-soft flex items-center justify-center shrink-0">
        <KeyRound className="w-4 h-4 text-accent" />
      </div>
      <div>
        <h2 className="font-display font-semibold text-ink">Talk to your coach</h2>
        <p className="text-sm text-ink-muted mt-1">
          Connect your Anthropic API key to chat with a Claude-powered coach that knows your
          progress. Your key is stored only on this device.
        </p>
        <Link to="/settings" className="btn btn-primary mt-3">
          Connect Claude
        </Link>
      </div>
    </section>
  );
}
