import type { Phase, Week, Task, TaskType } from '../store/data';

const uid = () =>
  crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);

const TYPE_WORDS: Record<string, TaskType> = {
  dsa: 'dsa',
  course: 'course',
  learn: 'course',
  milestone: 'milestone',
  goal: 'milestone',
  project: 'project',
  build: 'project',
  apply: 'apply',
  job: 'apply',
};

function detectType(raw: string): { type: TaskType; text: string } {
  // Explicit tag like "[dsa]" or "(course)"
  const tag = raw.match(/^[\s]*[[(]([a-zA-Z]+)[\])]\s*/);
  if (tag) {
    const word = tag[1].toLowerCase();
    if (TYPE_WORDS[word]) {
      return { type: TYPE_WORDS[word], text: raw.slice(tag[0].length).trim() };
    }
  }
  // Heuristics on keywords when no explicit tag was given.
  const lower = raw.toLowerCase();
  if (/\b(milestone|deploy|ship|portfolio|offer)\b/.test(lower)) {
    return { type: 'milestone', text: raw.trim() };
  }
  if (/\b(build|project|app)\b/.test(lower)) {
    return { type: 'project', text: raw.trim() };
  }
  if (/\b(leetcode|dsa|array|tree|graph|dp|sorting|recursion|problem)\b/.test(lower)) {
    return { type: 'dsa', text: raw.trim() };
  }
  return { type: 'course', text: raw.trim() };
}

function extractLink(text: string): { title: string; link?: string } {
  // "Title | https://..." or trailing bare URL
  const pipe = text.split('|');
  if (pipe.length > 1) {
    const maybe = pipe[pipe.length - 1].trim();
    if (/^https?:\/\//.test(maybe)) {
      return { title: pipe.slice(0, -1).join('|').trim(), link: maybe };
    }
  }
  const urlMatch = text.match(/(https?:\/\/\S+)/);
  if (urlMatch) {
    return { title: text.replace(urlMatch[1], '').replace(/[-–|]\s*$/, '').trim(), link: urlMatch[1] };
  }
  return { title: text.trim() };
}

/**
 * Forgiving roadmap parser. Understands a loose, human-written outline:
 *
 *   PHASE A — Foundations | Weeks 1-4
 *   Week 1
 *   - [course] Learn HTML | https://example.com
 *   - [dsa] Arrays
 *   Milestone: deploy a page
 *
 * Lines that look like phases, weeks, or tasks are bucketed accordingly.
 * Anything before the first phase/week falls into sensible defaults.
 */
export function parseRoadmap(input: string): Phase[] {
  const lines = input
    .split('\n')
    .map((l) => l.replace(/\t/g, ' ').trimEnd())
    .filter((l) => l.trim().length > 0);

  const phases: Phase[] = [];
  let currentPhase: Phase | null = null;
  let currentWeek: Week | null = null;

  const ensurePhase = () => {
    if (!currentPhase) {
      currentPhase = { id: uid(), title: 'Roadmap', duration: '', weeks: [] };
      phases.push(currentPhase);
    }
    return currentPhase;
  };
  const ensureWeek = () => {
    ensurePhase();
    if (!currentWeek) {
      currentWeek = { id: uid(), title: 'Tasks', tasks: [] };
      currentPhase!.weeks.push(currentWeek);
    }
    return currentWeek;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    // --- Phase heading ---
    const phaseMatch = line.match(/^#{0,3}\s*phase\b[:\-\s]*(.*)$/i);
    if (phaseMatch || /^#{1,2}\s+\S/.test(line)) {
      let title = phaseMatch ? line.replace(/^#{0,3}\s*/, '') : line.replace(/^#{1,2}\s+/, '');
      let duration = '';
      // split off "| Weeks 1-4" or "(Weeks 1-4)"
      const dur = title.match(/[|(]\s*(.*?weeks?.*?)\s*[)]?$/i);
      if (dur) {
        duration = dur[1].trim();
        title = title.slice(0, dur.index).replace(/[|(]\s*$/, '').trim();
      }
      currentPhase = { id: uid(), title: title.trim() || 'Phase', duration, weeks: [] };
      phases.push(currentPhase);
      currentWeek = null;
      continue;
    }

    // --- Week heading ---
    const weekMatch = line.match(/^#{0,3}\s*(week\s*\d+.*|day\s*\d+.*|sprint\s*\d+.*)$/i);
    if (weekMatch && !/^[-*•]/.test(line)) {
      ensurePhase();
      currentWeek = { id: uid(), title: weekMatch[1].trim(), tasks: [] };
      currentPhase!.weeks.push(currentWeek);
      continue;
    }

    // --- Task line ---
    const bulletMatch = line.match(/^[-*•]\s*(\[[ xX]?\]\s*)?(.+)$/);
    const milestoneMatch = line.match(/^milestone[:-]\s*(.+)$/i);
    if (bulletMatch || milestoneMatch) {
      const week = ensureWeek();
      const body = milestoneMatch ? milestoneMatch[1] : bulletMatch![2];
      const checked = bulletMatch?.[1]?.toLowerCase().includes('x') ?? false;
      const { type, text } = milestoneMatch
        ? { type: 'milestone' as TaskType, text: body }
        : detectType(body);
      const { title, link } = extractLink(text);
      const task: Task = {
        id: uid(),
        title: title || text,
        type,
        completed: checked,
        link,
      };
      week.tasks.push(task);
      continue;
    }

    // --- Bare line: treat as a task under current/default week ---
    const week = ensureWeek();
    const { type, text } = detectType(line);
    const { title, link } = extractLink(text);
    week.tasks.push({ id: uid(), title: title || line, type, completed: false, link });
  }

  return phases.filter((p) => p.weeks.some((w) => w.tasks.length > 0));
}

export function countRoadmap(phases: Phase[]) {
  let total = 0;
  let done = 0;
  for (const p of phases)
    for (const w of p.weeks)
      for (const t of w.tasks) {
        total++;
        if (t.completed) done++;
      }
  return { total, done, percent: total ? Math.round((done / total) * 100) : 0 };
}
