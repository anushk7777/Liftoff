import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type {
  Phase,
  TodoTask,
  Idea,
  Note,
  FocusSession,
  PomodoroSettings,
  Priority,
  Status,
} from './data';
import { initialRoadmap, defaultPomodoro } from './data';
import { startOfDay, format } from 'date-fns';

export interface ActivityLog {
  date: string; // ISO start-of-day
  type: 'full' | 'minimum';
}

const uid = () =>
  crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);

const nowISO = () => new Date().toISOString();

interface AppState {
  _initialized: boolean;
  deviceId: string;
  setInitialized: (val: boolean) => void;
  loadFromDB: () => Promise<void>;

  // Settings
  targetDate: string;
  theme: 'light' | 'dark';
  reduceMotion: boolean;
  setTargetDate: (date: string) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  setReduceMotion: (reduce: boolean) => void;

  // Roadmap
  phases: Phase[];
  toggleRoadmapTask: (phaseId: string, weekId: string, taskId: string) => void;
  replaceRoadmap: (phases: Phase[]) => void;
  appendRoadmap: (phases: Phase[]) => void;
  resetRoadmap: () => void;

  // Full task manager
  tasks: TodoTask[];
  addTask: (task: Partial<TodoTask> & { title: string }) => void;
  updateTask: (id: string, updates: Partial<TodoTask>) => void;
  deleteTask: (id: string) => void;
  cycleTaskStatus: (id: string) => void;
  setTaskStatus: (id: string, status: Status) => void;
  addTaskFromRoadmap: (phaseId: string, weekId: string, taskId: string) => void;

  // Brain dump (quick capture)
  ideas: Idea[];
  addIdea: (text: string) => void;
  updateIdea: (id: string, text: string) => void;
  deleteIdea: (id: string) => void;
  archiveIdea: (id: string, archived: boolean) => void;
  convertIdeaToTask: (id: string) => void;

  // Notes
  notes: Note[];
  addNote: () => string;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  togglePinNote: (id: string) => void;

  // Focus / Pomodoro
  pomodoro: PomodoroSettings;
  setPomodoro: (updates: Partial<PomodoroSettings>) => void;
  focusSessions: FocusSession[];
  logFocusSession: (durationMins: number, kind: 'focus' | 'break', taskTitle?: string) => void;

  // Gamification & Stats
  streak: number;
  longestStreak: number;
  freezeAvailable: boolean;
  activityHistory: ActivityLog[];
  problemsSolved: number;
  sectionsCompleted: number;
  incrementProblems: (delta?: number) => void;
  incrementSections: (delta?: number) => void;

  toggleLogDay: (type: 'full' | 'minimum') => void;
  recalculateStreak: () => void;

  // Backup
  exportData: () => string;
  importData: (jsonStr: string) => void;
}

const getDeviceId = () => {
  let id = localStorage.getItem('liftoff_device_id');
  if (!id) {
    id = uid();
    localStorage.setItem('liftoff_device_id', id);
  }
  return id;
};

const NON_PERSISTED = new Set(['_initialized', 'deviceId']);

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      _initialized: false,
      deviceId: getDeviceId(),
      setInitialized: (val) => set({ _initialized: val }),

      loadFromDB: async () => {
        // Local persistence is the source of truth. Only pull from the cloud
        // when Supabase is actually configured.
        if (!isSupabaseConfigured) {
          set({ _initialized: true });
          get().recalculateStreak();
          return;
        }
        const state = get();
        try {
          const { data } = await supabase
            .from('user_data')
            .select('data')
            .eq('id', state.deviceId)
            .single();

          if (data && data.data) {
            const loaded = migrate(data.data);
            set({ ...loaded, _initialized: true, deviceId: state.deviceId });
          } else {
            set({ _initialized: true });
          }
        } catch (err) {
          console.error('Failed to load from Supabase:', err);
          set({ _initialized: true });
        }
        get().recalculateStreak();
      },

  // ---- Settings ----
  targetDate: '2026-12-01',
  theme: 'dark',
  reduceMotion: false,
  setTargetDate: (date) => set({ targetDate: date }),
  setTheme: (theme) => set({ theme }),
  toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
  setReduceMotion: (reduceMotion) => set({ reduceMotion }),

  // ---- Roadmap ----
  phases: initialRoadmap,
  toggleRoadmapTask: (phaseId, weekId, taskId) =>
    set((state) => {
      const newPhases = JSON.parse(JSON.stringify(state.phases)) as Phase[];
      let nowCompleted = false;
      for (const p of newPhases) {
        if (p.id !== phaseId) continue;
        for (const w of p.weeks) {
          if (w.id !== weekId) continue;
          for (const t of w.tasks) {
            if (t.id !== taskId) continue;
            t.completed = !t.completed;
            nowCompleted = t.completed;
          }
        }
      }
      // Keep any linked daily task in sync with the roadmap.
      const tasks = state.tasks.map((t) =>
        t.sourceRoadmap &&
        t.sourceRoadmap.phaseId === phaseId &&
        t.sourceRoadmap.weekId === weekId &&
        t.sourceRoadmap.taskId === taskId
          ? {
              ...t,
              status: (nowCompleted ? 'done' : 'todo') as Status,
              completedAt: nowCompleted ? nowISO() : undefined,
            }
          : t,
      );
      return { phases: newPhases, tasks };
    }),
  replaceRoadmap: (phases) => set({ phases }),
  appendRoadmap: (phases) => set((s) => ({ phases: [...s.phases, ...phases] })),
  resetRoadmap: () => set({ phases: initialRoadmap }),

  // ---- Tasks ----
  tasks: [],
  addTask: (task) =>
    set((state) => ({
      tasks: [
        {
          id: uid(),
          title: task.title,
          notes: task.notes,
          priority: (task.priority as Priority) || 'medium',
          status: (task.status as Status) || 'todo',
          category: task.category,
          estimate: task.estimate,
          dueDate: task.dueDate,
          createdAt: nowISO(),
          completedAt: task.status === 'done' ? nowISO() : undefined,
          sourceRoadmap: task.sourceRoadmap,
        },
        ...state.tasks,
      ],
    })),
  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),
  deleteTask: (id) => set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),
  setTaskStatus: (id, status) =>
    set((state) => {
      const task = state.tasks.find((t) => t.id === id);
      const tasks = state.tasks.map((t) =>
        t.id === id
          ? { ...t, status, completedAt: status === 'done' ? nowISO() : undefined }
          : t,
      );
      // Daily work flows into the roadmap: completing a linked task advances it.
      let phases = state.phases;
      if (task?.sourceRoadmap) {
        phases = syncRoadmapCompletion(state.phases, task.sourceRoadmap, status === 'done');
      }
      return { tasks, phases };
    }),
  cycleTaskStatus: (id) => {
    const order: Status[] = ['todo', 'doing', 'done'];
    const t = get().tasks.find((x) => x.id === id);
    if (!t) return;
    const next = order[(order.indexOf(t.status) + 1) % order.length];
    get().setTaskStatus(id, next);
  },
  addTaskFromRoadmap: (phaseId, weekId, taskId) => {
    const state = get();
    // Avoid duplicates: if a task already links to this roadmap item, do nothing.
    const exists = state.tasks.some(
      (t) =>
        t.sourceRoadmap &&
        t.sourceRoadmap.phaseId === phaseId &&
        t.sourceRoadmap.weekId === weekId &&
        t.sourceRoadmap.taskId === taskId,
    );
    if (exists) return;
    let found: { title: string; type: string } | null = null;
    for (const p of state.phases) {
      if (p.id !== phaseId) continue;
      for (const w of p.weeks) {
        if (w.id !== weekId) continue;
        const rt = w.tasks.find((t) => t.id === taskId);
        if (rt) found = { title: rt.title, type: rt.type };
      }
    }
    if (!found) return;
    get().addTask({
      title: found.title,
      category: found.type.toUpperCase(),
      priority: found.type === 'milestone' ? 'high' : 'medium',
      status: 'todo',
      dueDate: startOfDay(new Date()).toISOString(),
      sourceRoadmap: { phaseId, weekId, taskId },
    });
  },

  // ---- Brain dump ----
  ideas: [],
  addIdea: (text) =>
    set((state) => ({
      ideas: [{ id: uid(), text, createdAt: nowISO(), archived: false }, ...state.ideas],
    })),
  updateIdea: (id, text) =>
    set((state) => ({
      ideas: state.ideas.map((i) => (i.id === id ? { ...i, text } : i)),
    })),
  deleteIdea: (id) => set((state) => ({ ideas: state.ideas.filter((i) => i.id !== id) })),
  archiveIdea: (id, archived) =>
    set((state) => ({
      ideas: state.ideas.map((i) => (i.id === id ? { ...i, archived } : i)),
    })),
  convertIdeaToTask: (id) => {
    const idea = get().ideas.find((i) => i.id === id);
    if (!idea) return;
    get().addTask({ title: idea.text, priority: 'medium', status: 'todo' });
    get().archiveIdea(id, true);
  },

  // ---- Notes ----
  notes: [],
  addNote: () => {
    const id = uid();
    set((state) => ({
      notes: [
        { id, title: '', content: '', createdAt: nowISO(), updatedAt: nowISO(), pinned: false },
        ...state.notes,
      ],
    }));
    return id;
  },
  updateNote: (id, updates) =>
    set((state) => ({
      notes: state.notes.map((n) =>
        n.id === id ? { ...n, ...updates, updatedAt: nowISO() } : n,
      ),
    })),
  deleteNote: (id) => set((state) => ({ notes: state.notes.filter((n) => n.id !== id) })),
  togglePinNote: (id) =>
    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)),
    })),

  // ---- Focus / Pomodoro ----
  pomodoro: defaultPomodoro,
  setPomodoro: (updates) => set((s) => ({ pomodoro: { ...s.pomodoro, ...updates } })),
  focusSessions: [],
  logFocusSession: (durationMins, kind, taskTitle) =>
    set((state) => ({
      focusSessions: [
        { id: uid(), date: nowISO(), durationMins, kind, taskTitle },
        ...state.focusSessions,
      ].slice(0, 1000),
    })),

  // ---- Gamification ----
  streak: 0,
  longestStreak: 0,
  freezeAvailable: true,
  activityHistory: [],
  problemsSolved: 0,
  sectionsCompleted: 0,
  incrementProblems: (delta = 1) =>
    set((s) => ({ problemsSolved: Math.max(0, s.problemsSolved + delta) })),
  incrementSections: (delta = 1) =>
    set((s) => ({ sectionsCompleted: Math.max(0, s.sectionsCompleted + delta) })),

  toggleLogDay: (type) => {
    const state = get();
    const today = startOfDay(new Date()).toISOString();
    const idx = state.activityHistory.findIndex((l) => l.date === today);
    const newHistory = [...state.activityHistory];
    if (idx >= 0) {
      if (newHistory[idx].type === type) newHistory.splice(idx, 1);
      else newHistory[idx].type = type;
    } else {
      newHistory.push({ date: today, type });
    }
    set({ activityHistory: newHistory });
    get().recalculateStreak();
  },

  recalculateStreak: () => {
    const { activityHistory, longestStreak } = get();
    // Compare by local calendar-day key so timezone/DST shifts can't break it.
    const dayKey = (d: string | Date) => format(new Date(d), 'yyyy-MM-dd');
    const days = new Set(activityHistory.map((l) => dayKey(l.date)));
    if (days.size === 0) {
      set({ streak: 0, freezeAvailable: true });
      return;
    }

    let streak = 0;
    let freeze = true; // one allowed gap, spent (not counted)
    const cursor = startOfDay(new Date());
    // Don't punish today before it's been logged.
    if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);

    // Walk backwards from the most recent eligible day.
    for (;;) {
      if (days.has(dayKey(cursor))) {
        streak++;
      } else if (freeze) {
        freeze = false; // spend the grace day without counting it
      } else {
        break;
      }
      cursor.setDate(cursor.getDate() - 1);
    }

    set({ streak, longestStreak: Math.max(longestStreak, streak), freezeAvailable: freeze });
  },

  exportData: () => {
    const state = get();
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(state)) {
      if (typeof v === 'function' || NON_PERSISTED.has(k)) continue;
      out[k] = v;
    }
    return JSON.stringify(out, null, 2);
  },

  importData: (jsonStr) => {
    try {
      const parsed = migrate(JSON.parse(jsonStr));
      set(parsed);
      get().recalculateStreak();
    } catch (e) {
      console.error('Failed to parse import string', e);
    }
  },
    }),
    {
      name: 'liftoff',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // Persist everything except runtime-only fields and functions.
      partialize: (s) =>
        Object.fromEntries(
          Object.entries(s).filter(([k, v]) => typeof v !== 'function' && !NON_PERSISTED.has(k)),
        ) as unknown as AppState,
      migrate: (persisted) => migrate(persisted as Record<string, unknown>) as unknown as AppState,
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setInitialized(true);
          state.recalculateStreak();
        }
      },
    },
  ),
);

// Set a specific roadmap task's completed flag (used when a linked daily task
// is completed). Returns a new phases array; does nothing if not found.
function syncRoadmapCompletion(
  phases: Phase[],
  ref: { phaseId: string; weekId: string; taskId: string },
  completed: boolean,
): Phase[] {
  let changed = false;
  const next = phases.map((p) => {
    if (p.id !== ref.phaseId) return p;
    return {
      ...p,
      weeks: p.weeks.map((w) => {
        if (w.id !== ref.weekId) return w;
        return {
          ...w,
          tasks: w.tasks.map((t) => {
            if (t.id !== ref.taskId || t.completed === completed) return t;
            changed = true;
            return { ...t, completed };
          }),
        };
      }),
    };
  });
  return changed ? next : phases;
}

interface LegacyDailyTask {
  id?: string;
  title?: string;
  completed?: boolean;
  category?: string;
  duration?: string;
  date?: string;
  createdAt?: string;
}

// Migrate older saved shapes (e.g. dailyTasks) into the new model.
function migrate(data: Record<string, unknown>): Record<string, unknown> {
  const out = { ...data };

  // dailyTasks -> tasks
  if (Array.isArray(out.dailyTasks) && !Array.isArray(out.tasks)) {
    out.tasks = (out.dailyTasks as LegacyDailyTask[]).map((d) => ({
      id: d.id || uid(),
      title: d.title || 'Untitled',
      priority: 'medium' as Priority,
      status: (d.completed ? 'done' : 'todo') as Status,
      category: d.category,
      estimate: d.duration,
      dueDate: d.date,
      createdAt: d.createdAt || nowISO(),
      completedAt: d.completed ? d.createdAt || nowISO() : undefined,
    }));
  }
  delete out.dailyTasks;

  // Ensure new collections exist
  if (!Array.isArray(out.tasks)) out.tasks = [];
  if (!Array.isArray(out.ideas)) out.ideas = [];
  if (!Array.isArray(out.notes)) out.notes = [];
  if (!Array.isArray(out.focusSessions)) out.focusSessions = [];
  if (!out.pomodoro) out.pomodoro = defaultPomodoro;

  return out;
}

// Debounced cloud sync — only when Supabase is configured. Local persistence
// (zustand persist) handles offline-first saving on its own.
let syncTimeout: ReturnType<typeof setTimeout>;
useStore.subscribe((state) => {
  if (!isSupabaseConfigured || !state._initialized) return;
  clearTimeout(syncTimeout);
  syncTimeout = setTimeout(async () => {
    try {
      const dataToSync: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(state)) {
        if (typeof v === 'function' || NON_PERSISTED.has(k)) continue;
        dataToSync[k] = v;
      }
      await supabase
        .from('user_data')
        .upsert(
          { id: state.deviceId, data: dataToSync, updated_at: nowISO() },
          { onConflict: 'id' },
        );
    } catch (e) {
      console.error('Background sync failed', e);
    }
  }, 1000);
});
