'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { CopyButton } from '@/components/ui/CopyButton';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { generateHash, hashBuffer, type Algorithm } from './hashGenerator.logic';

export default function HashGeneratorTool() {
  const [input, setInput] = useState('');
  const [algorithm, setAlgorithm] = useState<Algorithm>('SHA-256');
  const [hash, setHash] = useState('');
  const [loading, setLoading] = useState(false);

  async function generateHashHandler() {
    if (!input.trim()) return;
    setLoading(true);
    try {
      setHash(await generateHash(input, algorithm));
    } catch (e) {
      console.error('Hash generation failed', e);
    } finally {
      setLoading(false);
    }
  }

  async function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setHash('');
    try {
      const buffer = await file.arrayBuffer();
      setHash(await hashBuffer(buffer, algorithm));
      setInput(`[File: ${file.name} — ${(file.size / 1024).toFixed(1)} KB]`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* Algorithm selector */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-foreground-muted">Algorithm</label>
        <div className="flex p-1 rounded-lg bg-surface-elevated border border-border w-fit">
          {(['SHA-256', 'SHA-512', 'SHA-1'] as Algorithm[]).map((alg) => (
            <button key={alg} onClick={() => { setAlgorithm(alg); setHash(''); }} aria-pressed={algorithm === alg}
              className={cn('px-3 py-1.5 rounded-md text-sm font-mono font-medium transition-all duration-150',
                algorithm === alg ? 'bg-primary text-primary-foreground shadow-sm' : 'text-foreground-muted hover:text-foreground')}>
              {alg}
            </button>
          ))}
        </div>
        {algorithm === 'SHA-1' && (
          <p className="text-xs text-warning flex items-center gap-1.5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            SHA-1 is cryptographically weak — use SHA-256 or SHA-512 for security purposes
          </p>
        )}
      </div>

      {/* Text input */}
      <div className="tool-panel">
        <div className="tool-panel-header">
          <span className="tool-panel-label">Input Text</span>
        </div>
        <div className="tool-panel-body">
          <textarea className="tool-textarea" style={{ minHeight: 120 }} value={input}
            onChange={(e) => { setInput(e.target.value); setHash(''); }}
            placeholder="Enter text to hash…" spellCheck={false} aria-label="Hash input" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="primary" loading={loading} onClick={generateHashHandler} disabled={!input.trim()}>
          Generate Hash
        </Button>
        <span className="text-xs text-foreground-subtle">— or —</span>
        <label className="cursor-pointer">
          <input type="file" className="sr-only" onChange={handleFileInput} aria-label="Hash a file" />
          <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-surface-elevated text-sm text-foreground-muted hover:text-foreground hover:border-primary/40 transition-all duration-150">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
            Hash a File
          </span>
        </label>
      </div>

      {/* Output */}
      {hash && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="success">✓ Hash generated</Badge>
            <Badge variant="primary">{algorithm}</Badge>
            <Badge variant="default">{hash.length * 4} bits</Badge>
          </div>
          <div className="tool-panel">
            <div className="tool-panel-header">
              <span className="tool-panel-label">{algorithm} Hash</span>
              <CopyButton value={hash} />
            </div>
            <div className="p-4">
              <code className="text-sm font-mono text-foreground break-all leading-relaxed">
                {hash}
              </code>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-foreground-subtle flex items-center gap-1.5">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-success" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        Hashing is performed using the browser&apos;s WebCrypto API. No data is sent anywhere.
      </p>
    </div>
  );
}
