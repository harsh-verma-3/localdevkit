'use client';

import { useState } from 'react';
import { CopyButton } from '@/components/ui/CopyButton';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

type InputType = 'unix' | 'iso' | 'human';

const TIMEZONES = [
  'UTC', 'America/New_York', 'America/Los_Angeles', 'America/Chicago',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Tokyo',
  'Asia/Shanghai', 'Asia/Kolkata', 'Australia/Sydney',
];

function parseInput(value: string, type: InputType): Date | null {
  try {
    if (!value.trim()) return null;
    if (type === 'unix') {
      const n = Number(value.trim());
      if (isNaN(n)) return null;
      // Handle seconds or milliseconds
      return new Date(String(n).length <= 10 ? n * 1000 : n);
    }
    const d = new Date(value.trim());
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

export default function TimestampConverterTool() {
  const [input, setInput] = useState('');
  const [inputType, setInputType] = useState<InputType>('unix');
  const [timezone, setTimezone] = useState('UTC');

  function useNow() {
    const now = Date.now();
    setInput(inputType === 'unix' ? String(Math.floor(now / 1000)) : new Date(now).toISOString());
  }

  const date = parseInput(input, inputType);

  const formats = date
    ? [
        { label: 'Unix (seconds)', value: String(Math.floor(date.getTime() / 1000)) },
        { label: 'Unix (ms)', value: String(date.getTime()) },
        { label: 'ISO 8601', value: date.toISOString() },
        { label: 'UTC', value: date.toUTCString() },
        { label: `Local (${timezone})`, value: date.toLocaleString('en-US', { timeZone: timezone, dateStyle: 'full', timeStyle: 'long' }) },
        { label: 'Date only', value: date.toLocaleDateString('en-US', { timeZone: timezone, dateStyle: 'long' }) },
        { label: 'Time only', value: date.toLocaleTimeString('en-US', { timeZone: timezone, timeStyle: 'medium' }) },
        { label: 'Relative', value: getRelative(date) },
      ]
    : [];

  function getRelative(d: Date): string {
    const diff = Date.now() - d.getTime();
    const abs = Math.abs(diff);
    const future = diff < 0;
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    if (abs < 60000) return rtf.format(future ? Math.ceil(abs / 1000) : -Math.floor(abs / 1000), 'second');
    if (abs < 3600000) return rtf.format(future ? Math.ceil(abs / 60000) : -Math.floor(abs / 60000), 'minute');
    if (abs < 86400000) return rtf.format(future ? Math.ceil(abs / 3600000) : -Math.floor(abs / 3600000), 'hour');
    return rtf.format(future ? Math.ceil(abs / 86400000) : -Math.floor(abs / 86400000), 'day');
  }

  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      {/* Input */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="flex p-1 rounded-lg bg-surface-elevated border border-border">
            {(['unix', 'iso', 'human'] as InputType[]).map((t) => (
              <button key={t} onClick={() => { setInputType(t); setInput(''); }} aria-pressed={inputType === t}
                className={cn('px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150 uppercase',
                  inputType === t ? 'bg-primary text-primary-foreground shadow-sm' : 'text-foreground-muted hover:text-foreground')}>
                {t}
              </button>
            ))}
          </div>
          <button onClick={useNow} className="px-3 py-1.5 rounded-lg border border-border bg-surface-elevated
            text-sm text-foreground-muted hover:text-foreground hover:border-primary/40 transition-all">
            Use Now
          </button>
        </div>
        <div className="flex items-center gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)}
            placeholder={inputType === 'unix' ? '1700000000 or 1700000000000' : inputType === 'iso' ? '2024-01-15T12:00:00Z' : 'January 15, 2024 12:00 PM'}
            className="flex-1 h-10 px-3 rounded-lg border border-border bg-surface-elevated font-mono text-sm text-foreground
                       focus:outline-none focus:ring-2 focus:ring-primary/40"
            aria-label="Timestamp input" />
          {date && <Badge variant="success">✓ Valid</Badge>}
          {input && !date && <Badge variant="error">Invalid</Badge>}
        </div>
      </div>

      {/* Timezone selector */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="tz-select" className="text-xs font-medium text-foreground-muted">Timezone for local formats</label>
        <select id="tz-select" value={timezone} onChange={(e) => setTimezone(e.target.value)}
          className="h-9 px-3 rounded-lg border border-border bg-surface-elevated text-sm text-foreground
                     focus:outline-none focus:ring-2 focus:ring-primary/40">
          {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
        </select>
      </div>

      {/* Outputs */}
      {formats.length > 0 && (
        <div className="grid grid-cols-1 gap-2">
          {formats.map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between gap-3 p-3 rounded-lg
              bg-surface border border-border hover:border-primary/30 transition-colors group">
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-xs text-foreground-subtle">{label}</span>
                <code className="text-sm font-mono text-foreground">{value}</code>
              </div>
              <CopyButton value={value} />
            </div>
          ))}
        </div>
      )}

      {!date && (
        <div className="flex items-center justify-center py-10 text-sm text-foreground-subtle">
          Enter a timestamp above to see all formats
        </div>
      )}
    </div>
  );
}
