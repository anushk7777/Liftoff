import { useEffect } from 'react';
import { useStore } from '../store/useStore';

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

// Allow a snoozed/edited task to fire again.
export function clearNotified(id: string) {
  const s = getNotified();
  if (s.delete(id)) saveNotified(s);
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

// Watches scheduled tasks and, when one comes due, raises an in-app alarm
// (handled by AlarmOverlay) plus an OS notification if permission was granted.
// The in-app alarm needs no permission, so reminders work out of the box.
export function useReminders() {
  const tasks = useStore((s) => s.tasks);
  useEffect(() => {
    const check = () => {
      const now = Date.now();
      const notified = getNotified();
      let changed = false;
      for (const t of tasks) {
        if (t.status === 'done' || !t.scheduledAt) continue;
        const ts = new Date(t.scheduledAt).getTime();
        // Fire for any task that's now due and hasn't been alerted yet. The 24h
        // surfacing window means reopening the app the same day still shows a
        // missed reminder, without flooding alarms from very old tasks.
        if (ts <= now && now - ts < 24 * 60 * 60000 && !notified.has(t.id)) {
          // In-app alarm (always)
          window.dispatchEvent(
            new CustomEvent('liftoff:alarm', { detail: { id: t.id, title: t.title } }),
          );
          // OS notification (best-effort)
          if (notificationsSupported() && Notification.permission === 'granted') {
            try {
              new Notification('Liftoff reminder', { body: t.title, tag: t.id });
            } catch {
              /* ignore */
            }
          }
          notified.add(t.id);
          changed = true;
        }
      }
      if (changed) saveNotified(notified);
    };
    check();
    const id = setInterval(check, 15000);
    return () => clearInterval(id);
  }, [tasks]);
}
