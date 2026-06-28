'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { CopyButton } from '@/components/ui/CopyButton';
import { cn } from '@/lib/utils';
import { CHARS, getStrength, generatePasswords, type CharsetOptions } from './passwordGenerator.logic';

export default function PasswordGeneratorTool() {
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState<CharsetOptions>({ upper: true, lower: true, numbers: true, symbols: true });
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [passwords, setPasswords] = useState<string[]>([]);

  const generate = useCallback(() => {
    setPasswords(generatePasswords(options, length, excludeAmbiguous));
  }, [length, options, excludeAmbiguous]);

  const strength = passwords[0] ? getStrength(passwords[0]) : null;

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* Length slider */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label htmlFor="pw-length" className="text-sm font-medium text-foreground-muted">Length</label>
          <span className="text-sm font-mono font-bold text-primary">{length}</span>
        </div>
        <input id="pw-length" type="range" min={8} max={128} value={length}
          onChange={(e) => setLength(Number(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none bg-border
                     [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                     [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer" />
        <div className="flex justify-between text-xs text-foreground-subtle">
          <span>8</span><span>128</span>
        </div>
      </div>

      {/* Character options */}
      <div className="grid grid-cols-2 gap-2">
        {(Object.keys(CHARS) as (keyof typeof CHARS)[]).map((key) => (
          <button key={key} onClick={() => setOptions((o) => ({ ...o, [key]: !o[key] }))}
            aria-pressed={options[key]}
            className={cn('flex items-center gap-2 p-3 rounded-lg border text-left transition-all duration-150 text-sm',
              options[key] ? 'bg-primary/10 border-primary/40 text-primary' : 'bg-surface-elevated border-border text-foreground-muted hover:border-border')}>
            <div className={cn('w-4 h-4 rounded border-2 flex items-center justify-center transition-colors',
              options[key] ? 'bg-primary border-primary' : 'border-border')}>
              {options[key] && <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-2.5 h-2.5"><polyline points="20 6 9 17 4 12"/></svg>}
            </div>
            <span className="capitalize">{key}</span>
            <code className="text-xs text-foreground-subtle ml-auto hidden sm:block">
              {CHARS[key].slice(0, 6)}…
            </code>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button role="switch" aria-checked={excludeAmbiguous} onClick={() => setExcludeAmbiguous(!excludeAmbiguous)}
          className={cn('relative inline-flex h-5 w-9 rounded-full transition-colors duration-200',
            excludeAmbiguous ? 'bg-primary' : 'bg-border')}>
          <span className={cn('inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 mt-0.5',
            excludeAmbiguous ? 'translate-x-4' : 'translate-x-0.5')} />
        </button>
        <span className="text-sm text-foreground-muted">Exclude ambiguous characters (I, l, 1, O, 0)</span>
      </div>

      <Button variant="primary" size="lg" onClick={generate}>Generate Passwords</Button>

      {/* Results */}
      {passwords.length > 0 && (
        <div className="tool-panel">
          <div className="tool-panel-header">
            <span className="tool-panel-label">Generated Passwords</span>
            {strength && (
              <div className="flex items-center gap-2">
                <div className="w-20 h-1.5 rounded-full bg-border overflow-hidden">
                  <div className={cn('h-full rounded-full transition-all duration-300', strength.color)} style={{ width: strength.width }} />
                </div>
                <span className="text-xs font-medium text-foreground-muted">{strength.label}</span>
              </div>
            )}
          </div>
          <div className="tool-panel-body p-2 space-y-1">
            {passwords.map((pw, i) => (
              <div key={i} className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg hover:bg-surface-elevated transition-colors group">
                <code className="text-sm font-mono text-foreground break-all flex-1">{pw}</code>
                <CopyButton value={pw} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
