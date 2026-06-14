// =========================================================================
// LIFTOFF — Data types & seed content
// =========================================================================

export type TaskType = 'dsa' | 'course' | 'milestone' | 'project' | 'apply';

// ---- Roadmap (long-horizon plan) ----------------------------------------
export interface Task {
  id: string;
  title: string;
  type: TaskType;
  completed: boolean;
  link?: string;
}

export interface Week {
  id: string;
  title: string;
  tasks: Task[];
}

export interface Phase {
  id: string;
  title: string;
  duration: string;
  weeks: Week[];
}

// ---- Full task manager --------------------------------------------------
export type Priority = 'low' | 'medium' | 'high';
export type Status = 'todo' | 'doing' | 'done';

export interface TodoTask {
  id: string;
  title: string;
  notes?: string;
  priority: Priority;
  status: Status;
  category?: string;
  estimate?: string; // e.g. "30m", "2h"
  dueDate?: string; // ISO start-of-day, optional
  createdAt: string;
  completedAt?: string;
  // Link back to a roadmap item, so completing the task advances the roadmap.
  sourceRoadmap?: { phaseId: string; weekId: string; taskId: string };
}

// ---- Brain dump (quick capture) -----------------------------------------
export interface Idea {
  id: string;
  text: string;
  createdAt: string;
  archived: boolean;
}

// ---- Notes (longer documents) -------------------------------------------
export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  pinned: boolean;
}

// ---- Focus / Pomodoro ---------------------------------------------------
export interface FocusSession {
  id: string;
  date: string; // ISO datetime
  durationMins: number;
  kind: 'focus' | 'break';
  taskTitle?: string;
}

export interface PomodoroSettings {
  focusMins: number;
  shortBreakMins: number;
  longBreakMins: number;
  roundsBeforeLong: number;
}

export const defaultPomodoro: PomodoroSettings = {
  focusMins: 25,
  shortBreakMins: 5,
  longBreakMins: 15,
  roundsBeforeLong: 4,
};

// ---- Seed roadmap -------------------------------------------------------
export const initialRoadmap: Phase[] = [
  {
    id: 'phase-a',
    title: 'PHASE A — Foundations',
    duration: 'Weeks 1–4',
    weeks: [
      {
        id: 'w1',
        title: 'Week 1',
        tasks: [
          { id: 't1', title: 'Before web dev journey', type: 'course', completed: false, link: 'https://www.udemy.com/course/web-dev-master/' },
          { id: 't2', title: 'Arrays basics', type: 'dsa', completed: false, link: 'https://takeuforward.org/plus' },
        ],
      },
      {
        id: 'w2',
        title: 'Week 2',
        tasks: [
          { id: 't3', title: 'Basics of web development & HTML', type: 'course', completed: false, link: 'https://www.udemy.com/course/web-dev-master/' },
          { id: 't4', title: 'Sorting', type: 'dsa', completed: false, link: 'https://takeuforward.org/plus' },
        ],
      },
      {
        id: 'w3',
        title: 'Week 3',
        tasks: [
          { id: 't5', title: 'Learn about CSS', type: 'course', completed: false, link: 'https://www.udemy.com/course/web-dev-master/' },
          { id: 't6', title: 'Hashing', type: 'dsa', completed: false, link: 'https://takeuforward.org/plus' },
        ],
      },
      {
        id: 'w4',
        title: 'Week 4',
        tasks: [
          { id: 't7', title: 'Learn Tailwind CSS', type: 'course', completed: false, link: 'https://www.udemy.com/course/web-dev-master/' },
          { id: 't8', title: 'Two-pointer & Sliding Window', type: 'dsa', completed: false, link: 'https://takeuforward.org/plus' },
          { id: 'm1', title: 'Build & deploy 1 static responsive page to Vercel', type: 'milestone', completed: false },
        ],
      },
    ],
  },
  {
    id: 'phase-b',
    title: 'PHASE B — JavaScript',
    duration: 'Weeks 5–8',
    weeks: [
      {
        id: 'w5',
        title: 'Week 5',
        tasks: [
          { id: 't9', title: 'Learn JS Foundation (deep)', type: 'course', completed: false, link: 'https://www.udemy.com/course/web-dev-master/' },
          { id: 't10', title: 'Recursion', type: 'dsa', completed: false, link: 'https://takeuforward.org/plus' },
        ],
      },
      {
        id: 'w6',
        title: 'Week 6',
        tasks: [
          { id: 't11', title: 'DOM manipulation & Events', type: 'course', completed: false, link: 'https://www.udemy.com/course/web-dev-master/' },
          { id: 't12', title: 'Binary Search', type: 'dsa', completed: false, link: 'https://takeuforward.org/plus' },
        ],
      },
      {
        id: 'w7',
        title: 'Week 7',
        tasks: [
          { id: 't13', title: 'Asynchronous JS (Promises)', type: 'course', completed: false, link: 'https://www.udemy.com/course/web-dev-master/' },
          { id: 't14', title: 'Linked Lists', type: 'dsa', completed: false, link: 'https://takeuforward.org/plus' },
        ],
      },
      {
        id: 'w8',
        title: 'Week 8',
        tasks: [
          { id: 't15', title: 'Async/Await & Fetch API', type: 'course', completed: false, link: 'https://www.udemy.com/course/web-dev-master/' },
          { id: 't16', title: 'Stacks & Queues', type: 'dsa', completed: false, link: 'https://takeuforward.org/plus' },
          { id: 'm2', title: 'Build a vanilla-JS interactive app & push to GitHub', type: 'milestone', completed: false },
        ],
      },
    ],
  },
  {
    id: 'phase-c',
    title: 'PHASE C — React',
    duration: 'Weeks 9–12',
    weeks: [
      {
        id: 'w9',
        title: 'Week 9',
        tasks: [
          { id: 't17', title: 'React components & JSX', type: 'course', completed: false, link: 'https://www.udemy.com/course/web-dev-master/' },
          { id: 't18', title: 'Trees (Traversals)', type: 'dsa', completed: false, link: 'https://takeuforward.org/plus' },
        ],
      },
      {
        id: 'w10',
        title: 'Week 10',
        tasks: [
          { id: 't19', title: 'Props, State & Hooks', type: 'course', completed: false, link: 'https://www.udemy.com/course/web-dev-master/' },
          { id: 't20', title: 'Trees (BST)', type: 'dsa', completed: false, link: 'https://takeuforward.org/plus' },
        ],
      },
      {
        id: 'w11',
        title: 'Week 11',
        tasks: [
          { id: 't21', title: 'useEffect in depth', type: 'course', completed: false, link: 'https://www.udemy.com/course/web-dev-master/' },
          { id: 't22', title: 'Basic problem patterns revision', type: 'dsa', completed: false, link: 'https://takeuforward.org/plus' },
        ],
      },
      {
        id: 'w12',
        title: 'Week 12',
        tasks: [
          { id: 't23', title: 'React Routing', type: 'course', completed: false, link: 'https://www.udemy.com/course/web-dev-master/' },
          { id: 't24', title: 'More problem patterns', type: 'dsa', completed: false, link: 'https://takeuforward.org/plus' },
          { id: 'm3', title: 'Build React frontend project (multi-component, API) + deploy', type: 'milestone', completed: false },
        ],
      },
    ],
  },
  {
    id: 'phase-d',
    title: 'PHASE D — Backend',
    duration: 'Weeks 13–17',
    weeks: [
      {
        id: 'w13',
        title: 'Week 13',
        tasks: [
          { id: 't25', title: 'Node.js & Express basics', type: 'course', completed: false, link: 'https://www.udemy.com/course/web-dev-master/' },
          { id: 't26', title: 'Trees (Advanced)', type: 'dsa', completed: false, link: 'https://takeuforward.org/plus' },
        ],
      },
      {
        id: 'w14',
        title: 'Week 14',
        tasks: [
          { id: 't27', title: 'REST APIs', type: 'course', completed: false, link: 'https://www.udemy.com/course/web-dev-master/' },
          { id: 't28', title: 'Graphs (BFS/DFS)', type: 'dsa', completed: false, link: 'https://takeuforward.org/plus' },
        ],
      },
      {
        id: 'w15',
        title: 'Week 15',
        tasks: [
          { id: 't29', title: 'MongoDB & Mongoose', type: 'course', completed: false, link: 'https://www.udemy.com/course/web-dev-master/' },
          { id: 't30', title: 'Intro Dynamic Programming', type: 'dsa', completed: false, link: 'https://takeuforward.org/plus' },
        ],
      },
      {
        id: 'w16',
        title: 'Week 16',
        tasks: [
          { id: 't31', title: 'Authentication & JWT', type: 'course', completed: false, link: 'https://www.udemy.com/course/web-dev-master/' },
          { id: 't32', title: '1D DP Problems', type: 'dsa', completed: false, link: 'https://takeuforward.org/plus' },
        ],
      },
      {
        id: 'w17',
        title: 'Week 17',
        tasks: [
          { id: 't33', title: 'Git/GitHub Workflow', type: 'course', completed: false, link: 'https://www.udemy.com/course/web-dev-master/' },
          { id: 't34', title: '2D DP Problems', type: 'dsa', completed: false, link: 'https://takeuforward.org/plus' },
          { id: 'm4', title: 'Build ONE complete full-stack MERN app with auth + DB + deploy', type: 'milestone', completed: false },
        ],
      },
    ],
  },
  {
    id: 'phase-e',
    title: 'PHASE E — Polish & TypeScript',
    duration: 'Weeks 18–20',
    weeks: [
      {
        id: 'w18',
        title: 'Week 18',
        tasks: [
          { id: 't35', title: 'TypeScript Handbook basics', type: 'course', completed: false, link: 'https://www.typescriptlang.org/docs/handbook/' },
          { id: 't36', title: 'Dynamic Programming continued', type: 'dsa', completed: false, link: 'https://takeuforward.org/plus' },
        ],
      },
      {
        id: 'w19',
        title: 'Week 19',
        tasks: [
          { id: 't37', title: 'Convert a small project to TS', type: 'course', completed: false, link: 'https://www.typescriptlang.org/docs/handbook/' },
          { id: 't38', title: 'Revise weak topics (Graphs/Trees)', type: 'dsa', completed: false, link: 'https://takeuforward.org/plus' },
        ],
      },
      {
        id: 'w20',
        title: 'Week 20',
        tasks: [
          { id: 't39', title: 'Write clean READMEs & polish GitHub', type: 'course', completed: false, link: 'https://github.com/' },
          { id: 't40', title: 'Write a 1-page projects-first resume', type: 'course', completed: false },
          { id: 't41', title: 'Set up LinkedIn profile', type: 'course', completed: false, link: 'https://www.linkedin.com/' },
          { id: 'm5', title: 'Portfolio + resume + 2 deployed projects ready', type: 'milestone', completed: false },
        ],
      },
    ],
  },
  {
    id: 'phase-f',
    title: 'PHASE F — Apply & Interview',
    duration: 'Weeks 21–28 (~Oct–Dec)',
    weeks: [
      {
        id: 'w21',
        title: 'Daily Habits',
        tasks: [
          { id: 't42', title: 'Apply to 5–10 roles daily', type: 'apply', completed: false },
          { id: 't43', title: 'Send referral messages', type: 'apply', completed: false },
          { id: 't44', title: 'Daily revision + timed medium problems', type: 'dsa', completed: false, link: 'https://leetcode.com/' },
          { id: 't45', title: 'Basic system design + mock interviews', type: 'course', completed: false },
          { id: 'm6', title: 'Interviews → Offer', type: 'milestone', completed: false },
        ],
      },
    ],
  },
];
