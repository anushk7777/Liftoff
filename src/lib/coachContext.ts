import { startOfDay } from 'date-fns';
import { buildProfile, getBriefing, formatHour, type CoachState } from './coach';
import { countRoadmap } from './roadmap';
import { dayKey } from './streak';

// Builds the system prompt that grounds the conversational coach in the user's
// real, current data — so its advice is specific, not generic.
export function buildCoachSystemPrompt(state: CoachState, now = new Date()): string {
  const profile = buildProfile(state, now);
  const briefing = getBriefing(state, now);
  const roadmap = countRoadmap(state.phases);
  const todayStr = startOfDay(now).toISOString();
  const todayKey = dayKey(now);

  const openTasks = state.tasks.filter((t) => t.status !== 'done');
  const overdue = openTasks.filter((t) => t.dueDate && t.dueDate < todayStr).slice(0, 8);
  const dueToday = openTasks.filter((t) => !t.dueDate || t.dueDate === todayStr).slice(0, 8);
  const doing = openTasks.filter((t) => t.status === 'doing').slice(0, 5);

  const doneHabitIds = new Set(state.habitLog.filter((l) => l.date === todayKey).map((l) => l.habitId));
  const habitsLeft = state.habits
    .filter((h) => !h.archived && !doneHabitIds.has(h.id))
    .map((h) => h.name)
    .slice(0, 10);

  const nextItems: string[] = [];
  outer: for (const p of state.phases)
    for (const w of p.weeks)
      for (const t of w.tasks)
        if (!t.completed) {
          nextItems.push(`${t.title} (${t.type})`);
          if (nextItems.length >= 5) break outer;
        }

  const line = (label: string, value: string) => `- ${label}: ${value}`;

  return [
    `You are Liftoff Coach — a sharp, supportive productivity and career coach living inside the user's "Liftoff" app. The user is on a focused multi-month sprint to become a developer and land a role.`,
    ``,
    `How to respond:`,
    `- Be concise and human — a few sentences, not an essay. This is a chat.`,
    `- Ground every answer in the user's ACTUAL data below. Reference their real tasks, streak, and pace.`,
    `- Give 1–3 concrete next actions. Make a recommendation rather than asking permission for minor choices.`,
    `- Be encouraging but honest: if they're drifting from their goal, say so kindly and give a way back.`,
    `- Never invent tasks, numbers, or facts not present below. If you don't have the data, say so.`,
    `- You advise only — you can't perform actions in the app. Point them to the right screen (Tasks, Focus, Roadmap, Habits) when useful.`,
    ``,
    `## The user's current state (as of ${now.toLocaleString()})`,
    line('Target date', `${state.targetDate} (${briefing.daysLeft} days left)`),
    line(
      'Pace',
      `${briefing.status} — roadmap ${roadmap.percent}% done vs ~${Math.round(briefing.expectedPct)}% expected${
        briefing.weeksBehind ? `, ~${briefing.weeksBehind.toFixed(1)} weeks behind` : ''
      }`,
    ),
    line('Current streak', `${state.streak} day(s)`),
    line(
      'Focus pattern',
      `${profile.totalFocusMin} total focus min; peak hours ${
        profile.peakHours.map(formatHour).join(', ') || 'unknown'
      }; ~${profile.tasksPerDay.toFixed(1)} tasks/day`,
    ),
    line('Strongest areas', profile.topCategories.map((c) => c.name).join(', ') || 'not enough data yet'),
    line('Overdue tasks', overdue.length ? overdue.map((t) => t.title).join('; ') : 'none'),
    line('In progress', doing.length ? doing.map((t) => t.title).join('; ') : 'none'),
    line('Open today', dueToday.length ? dueToday.map((t) => t.title).join('; ') : 'nothing scheduled'),
    line('Habits left today', habitsLeft.length ? habitsLeft.join(', ') : 'all done or none set'),
    line('Next roadmap items', nextItems.length ? nextItems.join('; ') : 'roadmap empty or complete'),
  ].join('\n');
}
