'use client';

import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/Badge';
import { CopyButton } from '@/components/ui/CopyButton';
import { cn } from '@/lib/utils';

interface Match {
  index: number;
  length: number;
  value: string;
  groups: Record<string, string | undefined>;
}

export default function RegexTesterTool() {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('gm');
  const [testString, setTestString] = useState('');
  const [error, setError] = useState('');

  const ALL_FLAGS = ['g', 'i', 'm', 's', 'u'];

  function toggleFlag(f: string) {
    if (flags.includes(f)) {
      setFlags(flags.replace(f, ''));
    } else {
      setFlags(flags + f);
    }
  }

  const { matches, highlighted } = useMemo(() => {
    if (!pattern || !testString) return { matches: [] as Match[], highlighted: testString };
    try {
      setError('');
      const found: Match[] = [];
      const allMatch = testString.matchAll(new RegExp(pattern, flags.includes('g') ? flags : flags + 'g'));
      for (const match of allMatch) {
        found.push({
          index: match.index ?? 0,
          length: match[0].length,
          value: match[0],
          groups: (match.groups as Record<string, string | undefined>) ?? {},
        });
      }

      // Build highlighted HTML
      let result = '';
      let lastIndex = 0;
      for (const match of found) {
        result += testString.slice(lastIndex, match.index).replace(/&/g, '&amp;').replace(/</g, '&lt;');
        result += `<mark class="bg-primary/25 text-primary rounded px-0.5">${match.value.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</mark>`;
        lastIndex = match.index + match.length;
      }
      result += testString.slice(lastIndex).replace(/&/g, '&amp;').replace(/</g, '&lt;');

      return { matches: found, highlighted: result };
    } catch (e) {
      setError((e as Error).message);
      return { matches: [] as Match[], highlighted: testString.replace(/&/g, '&amp;').replace(/</g, '&lt;') };
    }
  }, [pattern, flags, testString]);

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Regex input */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 p-2 rounded-lg border border-border bg-surface-elevated">
          <span className="text-foreground-subtle font-mono text-sm px-1">/</span>
          <input
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="Enter regex pattern…"
            className="flex-1 bg-transparent font-mono text-sm text-foreground focus:outline-none"
            aria-label="Regex pattern"
            spellCheck={false}
          />
          <span className="text-foreground-subtle font-mono text-sm px-1">/</span>
          <div className="flex gap-1">
            {ALL_FLAGS.map((f) => (
              <button key={f} onClick={() => toggleFlag(f)} aria-pressed={flags.includes(f)}
                className={cn('w-7 h-7 rounded-md text-xs font-mono font-bold transition-all duration-150',
                  flags.includes(f) ? 'bg-primary text-primary-foreground' : 'text-foreground-muted hover:bg-border')}>
                {f}
              </button>
            ))}
          </div>
        </div>
        {error && (
          <div role="alert" className="text-xs text-error px-2 font-mono">{error}</div>
        )}
      </div>

      {/* Status bar */}
      <div className="flex items-center gap-2">
        {matches.length > 0 && <Badge variant="success">{matches.length} match{matches.length !== 1 ? 'es' : ''}</Badge>}
        {pattern && !error && matches.length === 0 && <Badge variant="warning">No matches</Badge>}
        {error && <Badge variant="error">Invalid pattern</Badge>}
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Test string */}
        <div className="tool-panel lg:col-span-2">
          <div className="tool-panel-header">
            <span className="tool-panel-label">Test String</span>
          </div>
          <div className="tool-panel-body relative">
            {/* Highlighted overlay */}
            {pattern && !error && (
              <div
                className="absolute inset-0 p-4 font-mono text-sm whitespace-pre-wrap break-words pointer-events-none text-transparent"
                dangerouslySetInnerHTML={{ __html: highlighted }}
                aria-hidden="true"
              />
            )}
            <textarea
              className="tool-textarea relative"
              style={{ background: 'transparent' }}
              value={testString}
              onChange={(e) => setTestString(e.target.value)}
              placeholder="Enter test string here…"
              spellCheck={false}
              aria-label="Test string"
            />
          </div>
        </div>

        {/* Match details */}
        <div className="tool-panel">
          <div className="tool-panel-header">
            <span className="tool-panel-label">Matches</span>
          </div>
          <div className="tool-panel-body p-2 space-y-1 overflow-auto">
            {matches.length === 0 && (
              <div className="flex items-center justify-center h-full text-sm text-foreground-subtle py-8">
                {pattern ? 'No matches' : 'Enter a pattern'}
              </div>
            )}
            {matches.map((m, i) => (
              <div key={i} className="p-2 rounded-lg bg-surface-elevated border border-border text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-primary">Match {i + 1}</span>
                  <span className="text-foreground-subtle">@ {m.index}</span>
                  <CopyButton value={m.value} size="sm" />
                </div>
                <code className="font-mono text-foreground break-all">{m.value}</code>
                {Object.keys(m.groups).length > 0 && (
                  <div className="mt-1.5 space-y-0.5">
                    {Object.entries(m.groups).map(([k, v]) => (
                      <div key={k} className="flex gap-1">
                        <span className="text-accent font-mono">{k}:</span>
                        <code className="text-foreground-muted font-mono">{v ?? 'undefined'}</code>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
