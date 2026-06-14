// =========================================================================
// Evidence-based metrics — every number traces back to a real action.
// Nothing here is an arbitrary tap; counts are derived from completed tasks,
// roadmap items, focus sessions, and logged days, so they self-correct.
// =========================================================================
import type { Phase, TodoTask } from '../store/data';

export interface EvidenceStats {
  problems: number;
  sections: number;
  projects: number;
  tasksDone: number;
  focusMinutes: number;
  focusHours: number;
  activeDays: number;
}

const PROBLEM_WORDS = ['dsa', 'problem', 'leetcode', 'algo', 'neetcode', 'cp'];
const COURSE_WORDS = ['course', 'learn', 'study', 'section', 'theory', 'read', 'lecture', 'tutorial'];
const PROJECT_WORDS = ['project', 'build', 'ship', 'deploy', 'milestone'];

const matches = (value: string | undefined, words: string[]) => {
  if (!value) return false;
  const v = value.toLowerCase();
  return words.some((w) => v.includes(w));
};

function countRoadmapBy(phases: Phase[], type: string): number {
  let n = 0;
  for (const p of phases)
    for (const w of p.weeks)
      for (const t of w.tasks) if (t.completed && t.type === type) n++;
  return n;
}

export function getEvidenceStats(state: {
  phases: Phase[];
  tasks: TodoTask[];
  focusSessions: { kind: string; durationMins: number }[];
  activityHistory: unknown[];
  problemsSolved: number;
  sectionsCompleted: number;
}): EvidenceStats {
  // Only count standalone (non-roadmap-linked) tasks here; roadmap-linked tasks
  // are counted on the roadmap side to avoid double-counting.
  const standaloneDone = state.tasks.filter((t) => t.status === 'done' && !t.sourceRoadmap);

  const problems =
    countRoadmapBy(state.phases, 'dsa') +
    standaloneDone.filter((t) => matches(t.category, PROBLEM_WORDS)).length +
    Math.max(0, state.problemsSolved); // manually logged reps done outside the app

  const sections =
    countRoadmapBy(state.phases, 'course') +
    standaloneDone.filter((t) => matches(t.category, COURSE_WORDS)).length +
    Math.max(0, state.sectionsCompleted);

  const projects =
    countRoadmapBy(state.phases, 'milestone') +
    countRoadmapBy(state.phases, 'project') +
    standaloneDone.filter((t) => matches(t.category, PROJECT_WORDS)).length;

  const focusMinutes = state.focusSessions
    .filter((s) => s.kind === 'focus')
    .reduce((a, s) => a + s.durationMins, 0);

  return {
    problems,
    sections,
    projects,
    tasksDone: state.tasks.filter((t) => t.status === 'done').length,
    focusMinutes,
    focusHours: Math.round((focusMinutes / 60) * 10) / 10,
    activeDays: state.activityHistory.length,
  };
}
