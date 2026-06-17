import { useState } from 'react';
import { CalendarDays, Clock, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

// A clean, themed date+time control. Quick chips for common choices + compact
// native date/time fields (styled), replacing the raw ugly browser pickers.
// `value` is an ISO datetime string (or '' for none).
export default function DateTimePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (iso: string) => void;
}) {
  const selected = value ? new Date(value) : null;
  // Default time used when a day chip is tapped without an explicit time.
  const [time, setTime] = useState(selected ? format(selected, 'HH:mm') : '09:00');

  const applyDate = (d: Date) => {
    const [h, m] = (time || '09:00').split(':').map(Number);
    d.setHours(h || 9, m || 0, 0, 0);
    onChange(d.toISOString());
  };

  const chip = (label: string, build: () => Date) => (
    <button
      type="button"
      onClick={() => applyDate(build())}
      className="px-2.5 py-1.5 rounded-full border border-border text-xs font-medium text-ink-muted hover:text-ink hover:border-border-strong hover:bg-hover transition-colors active:scale-95"
    >
      {label}
    </button>
  );

  const today = () => new Date();
  const tomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  };
  const weekend = () => {
    const d = new Date();
    d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7)); // next Saturday
    return d;
  };
  const nextWeek = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d;
  };

  const dateValue = selected ? format(selected, 'yyyy-MM-dd') : '';

  const onDateInput = (v: string) => {
    if (!v) {
      onChange('');
      return;
    }
    const [y, mo, da] = v.split('-').map(Number);
    const d = selected ? new Date(selected) : new Date();
    d.setFullYear(y, mo - 1, da);
    const [h, m] = (time || '09:00').split(':').map(Number);
    if (!selected) d.setHours(h || 9, m || 0, 0, 0);
    onChange(d.toISOString());
  };

  const onTimeInput = (v: string) => {
    setTime(v || '09:00');
    const base = selected ? new Date(selected) : new Date();
    const [h, m] = (v || '09:00').split(':').map(Number);
    base.setHours(h || 0, m || 0, 0, 0);
    onChange(base.toISOString());
  };

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap gap-1.5">
        {chip('Today', today)}
        {chip('Tomorrow', tomorrow)}
        {chip('This weekend', weekend)}
        {chip('Next week', nextWeek)}
        {selected && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="px-2.5 py-1.5 rounded-full border border-border text-xs font-medium text-ink-subtle hover:text-danger hover:border-danger/40 transition-colors inline-flex items-center gap-1"
          >
            <X className="w-3 h-3" /> Clear
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label className={cn('relative flex items-center gap-2 input !w-auto cursor-pointer')}>
          <CalendarDays className="w-4 h-4 text-ink-subtle shrink-0" />
          <input
            type="date"
            value={dateValue}
            onChange={(e) => onDateInput(e.target.value)}
            className="bg-transparent border-0 p-0 text-sm text-ink focus:outline-none focus:ring-0"
          />
        </label>
        <label className={cn('relative flex items-center gap-2 input !w-auto cursor-pointer')}>
          <Clock className="w-4 h-4 text-ink-subtle shrink-0" />
          <input
            type="time"
            value={time}
            onChange={(e) => onTimeInput(e.target.value)}
            className="bg-transparent border-0 p-0 text-sm text-ink focus:outline-none focus:ring-0"
          />
        </label>
      </div>

      {selected && (
        <p className="text-[11px] text-accent inline-flex items-center gap-1">
          <Clock className="w-3 h-3" /> Scheduled for {format(selected, 'EEE, MMM d')} at{' '}
          {format(selected, 'h:mm a')}
        </p>
      )}
    </div>
  );
}
