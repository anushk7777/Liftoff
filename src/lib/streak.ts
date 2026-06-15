import { startOfDay, format } from 'date-fns';

// Local calendar-day key — timezone/DST safe.
export const dayKey = (d: string | Date) => format(new Date(d), 'yyyy-MM-dd');

// Walk backwards from today over a set of completed day-keys, allowing a single
// "grace" day (spent, not counted) so one slip doesn't reset the streak.
// Returns the current streak and whether the grace day is still available.
export function streakFromDays(days: Set<string>): { streak: number; freezeAvailable: boolean } {
  if (days.size === 0) return { streak: 0, freezeAvailable: true };

  let streak = 0;
  let freeze = true;
  const cursor = startOfDay(new Date());
  // Don't punish today before it's been logged.
  if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);

  for (;;) {
    if (days.has(dayKey(cursor))) {
      streak++;
    } else if (freeze) {
      freeze = false;
    } else {
      break;
    }
    cursor.setDate(cursor.getDate() - 1);
  }
  return { streak, freezeAvailable: freeze };
}

export const STREAK_MILESTONES = [7, 14, 30, 50, 100, 200, 365];
export const isMilestone = (n: number) => STREAK_MILESTONES.includes(n);
