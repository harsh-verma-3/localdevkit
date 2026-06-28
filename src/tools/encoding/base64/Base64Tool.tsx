'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { CopyButton } from '@/components/ui/CopyButton';
import { cn, saveToolInput, loadToolInput } from '@/lib/utils';
import { encodeBase64, decodeBase64 } from './base64.logic';

type Mode = 'encode' | 'decode';

export default function Base64Tool() {
  const [input, setInput] = useState(() => loadToolInput('base64'));
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState<Mode>('encode');

  function process(value: string, m: Mode) {
    if (!value.trim()) { setOutput(''); setError(''); return; }
    try {
      setOutput(m === 'encode' ? encodeBase64(value) : decodeBase64(value));
      setError('');
    } catch {
      setError(m === 'decode' ? 'Invalid Base64 input' : 'Cannot encode this input');
      setOutput('');
    }
  }

  function handleInputChange(value: string) {
    setInput(value);
    saveToolInput('base64', value);
    process(value, mode);
  }

  function handleModeChange(m: Mode) {
    setMode(m);
    process(input, m);
  }

  async function handlePaste() {
    const text = await navigator.clipboard.readText().catch(() => null);
    if (text) handleInputChange(text);
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Mode toggle */}
      <div className="flex items-center gap-2">
        <div className="flex p-1 rounded-lg bg-surface-elevated border border-border">
          {(['encode', 'decode'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => handleModeChange(m)}
              aria-pressed={mode === m}
              className={cn(
                'px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-150 capitalize',
                mode === m
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-foreground-muted hover:text-foreground'
              )}
            >
              {m}
            </button>
          ))}
        </div>
        <span className="text-xs text-foreground-subtle">
          {mode === 'encode' ? 'Text → Base64' : 'Base64 → Text'}
        </span>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="tool-panel">
          <div className="tool-panel-header">
            <span className="tool-panel-label">{mode === 'encode' ? 'Plain Text' : 'Base64'}</span>
            <Button size="xs" variant="ghost" onClick={handlePaste}>Paste</Button>
          </div>
          <div className="tool-panel-body">
            <textarea
              className="tool-textarea"
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={mode === 'encode' ? 'Enter text to encode…' : 'Paste Base64 to decode…'}
              spellCheck={false}
              aria-label={`${mode === 'encode' ? 'Plain text' : 'Base64'} input`}
            />
          </div>
        </div>

        <div className="tool-panel">
          <div className="tool-panel-header">
            <span className="tool-panel-label">{mode === 'encode' ? 'Base64' : 'Plain Text'}</span>
            {output && <CopyButton value={output} />}
          </div>
          <div className="tool-panel-body">
            {error ? (
              <div role="alert" className="p-4">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-error/10 border border-error/25 text-error text-sm">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 shrink-0" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                  {error}
                </div>
              </div>
            ) : output ? (
              <pre className="tool-textarea whitespace-pre-wrap break-all" aria-label="Output">{output}</pre>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-foreground-subtle">
                Output will appear here
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
