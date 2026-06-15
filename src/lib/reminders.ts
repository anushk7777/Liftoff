import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { beep } from './sound';

const NOTIFIED_KEY = 'liftoff_notified';

function getNotified(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(NOTIFIED_KEY) || '[]'));
  } catch {
    return new Set();
  }
}
function saveNotified(s: Set<string>) {
  try {
    localStorage.setItem(NOTIFIED_KEY, JSON.stringify([...s].slice(-200)));
  } catch {
    /* storage best-effort */
  }
}

export function notificationsSupported() {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function notificationPermission(): NotificationPermission | 'unsupported' {
  return notificationsSupported() ? Notification.permission : 'unsupported';
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!notificationsSupported()) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const p = await Notification.requestPermission();
  return p === 'granted';
}

// Fires a desktop notification + chime when a scheduled task's time arrives,
// while the app is open. (Closed-app coverage is the calendar .ics route.)
export function useReminders() {
  const tasks = useStore((s) => s.tasks);
  useEffect(() => {
    if (!notificationsSupported()) return;
    const check = () => {
      if (Notification.permission !== 'granted') return;
      const now = Date.now();
      const notified = getNotified();
      let changed = false;
      for (const t of tasks) {
        if (t.status === 'done' || !t.scheduledAt) continue;
        const ts = new Date(t.scheduledAt).getTime();
        if (ts <= now && now - ts < 2 * 60000 && !notified.has(t.id)) {
          try {
            new Notification('Liftoff reminder', { body: t.title, tag: t.id });
            beep();
          } catch {
            /* ignore */
          }
          notified.add(t.id);
          changed = true;
        }
      }
      if (changed) saveNotified(notified);
    };
    check();
    const id = setInterval(check, 20000);
    return () => clearInterval(id);
  }, [tasks]);
}
