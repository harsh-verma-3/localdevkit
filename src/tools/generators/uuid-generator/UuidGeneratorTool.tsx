'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { CopyButton } from '@/components/ui/CopyButton';
import { cn } from '@/lib/utils';
import { generateUuidV4, generateUuidV7 } from './uuidGenerator.logic';

type UuidVersion = 'v4' | 'v7';

export default function UuidGeneratorTool() {
  const [version, setVersion] = useState<UuidVersion>('v4');
  const [count, setCount] = useState(5);
  const [uppercase, setUppercase] = useState(false);
  const [uuids, setUuids] = useState<string[]>([]);

  const generate = useCallback(() => {
    const gen = version === 'v4' ? generateUuidV4 : generateUuidV7;
    const result = Array.from({ length: count }, () => {
      const id = gen();
      return uppercase ? id.toUpperCase() : id;
    });
    setUuids(result);
  }, [version, count, uppercase]);

  const allUuids = uuids.join('\n');

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* Controls */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-foreground-muted">Version</label>
          <div className="flex p-1 rounded-lg bg-surface-elevated border border-border">
            {(['v4', 'v7'] as UuidVersion[]).map((v) => (
              <button key={v} onClick={() => setVersion(v)} aria-pressed={version === v}
                className={cn('px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-150',
                  version === v ? 'bg-primary text-primary-foreground shadow-sm' : 'text-foreground-muted hover:text-foreground')}>
                UUID {v.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="uuid-count" className="text-xs font-medium text-foreground-muted">Count</label>
          <input id="uuid-count" type="number" min={1} max={100} value={count}
            onChange={(e) => setCount(Math.min(100, Math.max(1, Number(e.target.value))))}
            className="w-20 h-9 px-3 rounded-lg border border-border bg-surface-elevated text-sm font-mono text-foreground
                       focus:outline-none focus:ring-2 focus:ring-primary/40" />
        </div>

        <div className="flex items-center gap-2">
          <button
            id="uuid-uppercase"
            role="switch"
            aria-checked={uppercase}
            onClick={() => setUppercase(!uppercase)}
            className={cn('relative inline-flex h-5 w-9 rounded-full transition-colors duration-200',
              uppercase ? 'bg-primary' : 'bg-border')}
          >
            <span className={cn('inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 mt-0.5',
              uppercase ? 'translate-x-4' : 'translate-x-0.5')} />
            <span className="sr-only">Uppercase</span>
          </button>
          <label htmlFor="uuid-uppercase" className="text-sm text-foreground-muted cursor-pointer select-none">Uppercase</label>
        </div>

        <Button variant="primary" onClick={generate}>
          Generate
        </Button>
      </div>

      {/* Output */}
      {uuids.length > 0 && (
        <div className="tool-panel">
          <div className="tool-panel-header">
            <span className="tool-panel-label">{uuids.length} UUID{uuids.length !== 1 ? 's' : ''}</span>
            <CopyButton value={allUuids} />
          </div>
          <div className="tool-panel-body p-4 space-y-1">
            {uuids.map((id, i) => (
              <div key={i} className="group flex items-center justify-between gap-2 py-1 px-2 rounded-lg hover:bg-surface-elevated transition-colors">
                <code className="text-sm font-mono text-foreground">{id}</code>
                <CopyButton value={id} size="sm" />
              </div>
            ))}
          </div>
        </div>
      )}

      {uuids.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6 text-primary" aria-hidden="true">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
            </svg>
          </div>
          <p className="text-sm text-foreground-muted">Click Generate to create UUIDs</p>
          <p className="text-xs text-foreground-subtle">Uses the browser&apos;s cryptographically secure random number generator</p>
        </div>
      )}
    </div>
  );
}
