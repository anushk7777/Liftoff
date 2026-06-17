// Build a calendar (.ics) event with an alarm. Importing it into Google/Apple
// Calendar gives cross-device notifications, email reminders, and an alarm even
// when Liftoff is closed — without any backend.

const pad = (n: number) => String(n).padStart(2, '0');

function toICSDate(d: Date): string {
  return (
    d.getUTCFullYear() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    'T' +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    'Z'
  );
}

const escapeICS = (s: string) =>
  s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

const uid = () =>
  (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)) + '@liftoff';

export function buildICS({
  title,
  start,
  durationMins = 30,
  description,
}: {
  title: string;
  start: string | Date;
  durationMins?: number;
  description?: string;
}): string {
  const dtStart = new Date(start);
  const dtEnd = new Date(dtStart.getTime() + durationMins * 60000);
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Liftoff//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid()}`,
    `DTSTAMP:${toICSDate(new Date())}`,
    `DTSTART:${toICSDate(dtStart)}`,
    `DTEND:${toICSDate(dtEnd)}`,
    `SUMMARY:${escapeICS(title)}`,
    description ? `DESCRIPTION:${escapeICS(description)}` : '',
    'BEGIN:VALARM',
    'TRIGGER:-PT0M',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeICS(title)}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter(Boolean)
    .join('\r\n');
}

export function downloadICS(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'task';

// One-click .ics download for a scheduled item (calendar app handles the alarm).
export function downloadTaskIcs(title: string, start: string | Date, durationMins = 30) {
  downloadICS(`${slugify(title)}.ics`, buildICS({ title, start, durationMins, description: 'Scheduled in Liftoff' }));
}

// A Google Calendar "add event" link. Google then sends its own email + push
// reminders — the no-backend way to get email reminders.
export function googleCalendarUrl(title: string, start: string | Date, durationMins = 30): string {
  const s = new Date(start);
  const e = new Date(s.getTime() + durationMins * 60000);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${fmt(s)}/${fmt(e)}`,
    details: 'Scheduled in Liftoff',
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
