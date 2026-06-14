import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Phase, DailyTask } from './data';
import { initialRoadmap } from './data';
import { startOfDay, differenceInCalendarDays } from 'date-fns';

export interface ActivityLog {
  date: string; // ISO string
  type: 'full' | 'minimum';
}

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
  setReduceMotion: (reduce: boolean) => void;

  // Roadmap
  phases: Phase[];
  toggleTask: (phaseId: string, weekId: string, taskId: string) => void;
  resetRoadmap: () => void;

  // Gamification & Stats
  streak: number;
  longestStreak: number;
  freezeAvailable: boolean;
  activityHistory: ActivityLog[];
  
  // Manual counters
  problemsSolved: number;
  sectionsCompleted: number;
  projectsShipped: number;
  
  incrementProblems: () => void;
  incrementSections: () => void;
  
  // Actions
  toggleLogDay: (type: 'full' | 'minimum') => void;
  recalculateStreak: () => void;
  
  // Backup
  exportData: () => string;
  importData: (jsonStr: string) => void;

  // Daily Tasks
  dailyTasks: DailyTask[];
  addDailyTask: (task: Omit<DailyTask, 'id' | 'createdAt'>) => void;
  editDailyTask: (id: string, updates: Partial<DailyTask>) => void;
  deleteDailyTask: (id: string) => void;
  toggleDailyTask: (id: string) => void;
}

// Generate or retrieve a device ID (simple pseudonymous auth)
const getDeviceId = () => {
  let id = localStorage.getItem('liftoff_device_id');
  if (!id) {
    id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
    localStorage.setItem('liftoff_device_id', id);
  }
  return id;
};

export const useStore = create<AppState>()(
  (set, get) => ({
    _initialized: false,
    deviceId: getDeviceId(),
    setInitialized: (val) => set({ _initialized: val }),

    loadFromDB: async () => {
      const state = get();
      try {
        const { data } = await supabase
          .from('user_data')
          .select('data')
          .eq('id', state.deviceId)
          .single();
          
        if (data && data.data) {
          // Merge loaded data
          set({ ...data.data, _initialized: true, deviceId: state.deviceId });
        } else {
          set({ _initialized: true });
        }
      } catch (err) {
        console.error("Failed to load from Supabase:", err);
        set({ _initialized: true });
      }
      get().recalculateStreak();
    },

    // Settings
    targetDate: '2026-10-01',
    theme: 'dark',
    reduceMotion: false,
    setTargetDate: (date) => set({ targetDate: date }),
    setTheme: (theme) => set({ theme }),
    setReduceMotion: (reduceMotion) => set({ reduceMotion }),

    // Roadmap
    phases: initialRoadmap,
    toggleTask: (phaseId, weekId, taskId) => set((state) => {
      const newPhases = JSON.parse(JSON.stringify(state.phases)) as Phase[];
      let newlyCompletedMilestone = false;
      let newlyUncompletedMilestone = false;

      newPhases.forEach(p => {
        if (p.id === phaseId) {
          p.weeks.forEach(w => {
            if (w.id === weekId) {
              w.tasks.forEach(t => {
                if (t.id === taskId) {
                  t.completed = !t.completed;
                  if (t.type === 'milestone') {
                    if (t.completed) newlyCompletedMilestone = true;
                    else newlyUncompletedMilestone = true;
                  }
                }
              });
            }
          });
        }
      });

      const updates: Partial<AppState> = { phases: newPhases };
      if (newlyCompletedMilestone) {
        updates.projectsShipped = state.projectsShipped + 1;
      } else if (newlyUncompletedMilestone) {
        updates.projectsShipped = Math.max(0, state.projectsShipped - 1);
      }

      return updates;
    }),
    resetRoadmap: () => set({ phases: initialRoadmap }),

    // Gamification
    streak: 0,
    longestStreak: 0,
    freezeAvailable: true,
    activityHistory: [],
    
    problemsSolved: 0,
    sectionsCompleted: 0,
    projectsShipped: 0,
    
    incrementProblems: () => set(s => ({ problemsSolved: s.problemsSolved + 1 })),
    incrementSections: () => set(s => ({ sectionsCompleted: s.sectionsCompleted + 1 })),

    // Flexible logging: if same type exists, unlog it. If different type, switch it. If none, log it.
    toggleLogDay: (type: 'full' | 'minimum') => {
      const state = get();
      const today = startOfDay(new Date()).toISOString();
      const existingLogIndex = state.activityHistory.findIndex(l => l.date === today);
      
      let newHistory = [...state.activityHistory];
      
      if (existingLogIndex >= 0) {
        const existing = newHistory[existingLogIndex];
        if (existing.type === type) {
          // Unlog
          newHistory.splice(existingLogIndex, 1);
        } else {
          // Switch type
          newHistory[existingLogIndex].type = type;
        }
      } else {
        // Log new
        newHistory.push({ date: today, type });
      }

      set({ activityHistory: newHistory });
      get().recalculateStreak();
    },

    recalculateStreak: () => {
      const state = get();
      if (state.activityHistory.length === 0) {
        set({ streak: 0, freezeAvailable: true });
        return;
      }

      // Sort history chronologically
      const sortedHistory = [...state.activityHistory].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      let currentStreak = 0;
      let maxStreak = state.longestStreak;
      let freeze = true;

      const firstDate = new Date(sortedHistory[0].date);
      const today = startOfDay(new Date());
      const totalDays = differenceInCalendarDays(today, firstDate);

      let historyIndex = 0;

      for (let i = 0; i <= totalDays; i++) {
        const currentDate = new Date(firstDate);
        currentDate.setDate(currentDate.getDate() + i);
        const dateStr = currentDate.toISOString();

        // Is there a log for this day?
        if (historyIndex < sortedHistory.length && sortedHistory[historyIndex].date === dateStr) {
          currentStreak++;
          historyIndex++;
        } else {
          // Missed day
          if (freeze) {
            currentStreak++; // saved by freeze
            freeze = false;
          } else {
            // Streak broken
            currentStreak = 0;
            freeze = true; // reset freeze for next streak
          }
        }

        if (currentStreak > maxStreak) {
          maxStreak = currentStreak;
        }
      }

      set({ 
        streak: currentStreak, 
        longestStreak: maxStreak,
        freezeAvailable: freeze
      });
    },

    exportData: () => {
      const state = get();
      const { _initialized, deviceId, ...dataToExport } = state;
      return JSON.stringify(dataToExport);
    },
    
    importData: (jsonStr) => {
      try {
        const parsed = JSON.parse(jsonStr);
        set(parsed);
        get().recalculateStreak();
      } catch (e) {
        console.error("Failed to parse import string", e);
      }
    },

    // Daily Tasks
    dailyTasks: [],
    addDailyTask: (task) => set((state) => ({
      dailyTasks: [...state.dailyTasks, {
        ...task,
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
        createdAt: new Date().toISOString()
      }]
    })),
    editDailyTask: (id, updates) => set((state) => ({
      dailyTasks: state.dailyTasks.map(t => t.id === id ? { ...t, ...updates } : t)
    })),
    deleteDailyTask: (id) => set((state) => ({
      dailyTasks: state.dailyTasks.filter(t => t.id !== id)
    })),
    toggleDailyTask: (id) => set((state) => ({
      dailyTasks: state.dailyTasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
    }))
  })
);

// Sync to Supabase debounced
let syncTimeout: any;
useStore.subscribe((state) => {
  // Only sync if initialized to prevent overwriting cloud with default state on load
  if (!state._initialized) return;
  
  clearTimeout(syncTimeout);
  syncTimeout = setTimeout(async () => {
    try {
      const { _initialized, deviceId, loadFromDB, setInitialized, ...dataToSync } = state;
      await supabase
        .from('user_data')
        .upsert({ 
          id: state.deviceId, 
          data: dataToSync,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
    } catch (e) {
      console.error("Background sync failed", e);
    }
  }, 1000);
});
