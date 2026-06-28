'use client';

import { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { CopyButton } from '@/components/ui/CopyButton';
import { Badge } from '@/components/ui/Badge';
import { cn, downloadText, loadToolInput, saveToolInput } from '@/lib/utils';
import { convertGuids, type GuidFormat, type GuidCase } from './guidConverter.logic';

export default function GuidConverterTool() {
  const [input, setInput] = useState(() => loadToolInput('guid-converter'));
  const [format, setFormat] = useState<GuidFormat>('36');
  const [casing, setCasing] = useState<GuidCase>('lower');

  const { output, error } = useMemo(() => {
    return convertGuids(input, { format, casing });
  }, [input, format, casing]);

  const handleInputChange = useCallback((val: string) => {
    setInput(val);
    saveToolInput('guid-converter', val);
  }, []);

  const handleClear = useCallback(() => {
    handleInputChange('');
  }, [handleInputChange]);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      handleInputChange(text);
    } catch {
      /* clipboard access denied */
    }
  }, [handleInputChange]);

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Format selector */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold text-foreground-muted uppercase tracking-wider">Format</span>
          <div className="flex p-0.5 rounded-lg bg-surface-elevated border border-border">
            {(['36', '32'] as GuidFormat[]).map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                aria-pressed={format === f}
                className={cn(
                  'px-3 py-1 rounded-md text-xs font-medium transition-all duration-150',
                  format === f
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-foreground-muted hover:text-foreground'
                )}
              >
                {f === '36' ? '36-char (Hyphenated)' : '32-char (Compact)'}
              </button>
            ))}
          </div>
        </div>

        {/* Case selector */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold text-foreground-muted uppercase tracking-wider">Casing</span>
          <div className="flex p-0.5 rounded-lg bg-surface-elevated border border-border">
            {(['lower', 'upper'] as GuidCase[]).map((c) => (
              <button
                key={c}
                onClick={() => setCasing(c)}
                aria-pressed={casing === c}
                className={cn(
                  'px-3 py-1 rounded-md text-xs font-medium transition-all duration-150',
                  casing === c
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-foreground-muted hover:text-foreground'
                )}
              >
                {c === 'lower' ? 'Lowercase' : 'Uppercase'}
              </button>
            ))}
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2 self-end">
          {error && (
            <Badge variant="warning">
              {error}
            </Badge>
          )}
          {input.trim() && !error && (
            <Badge variant="success">
              ✓ All GUIDs Valid
            </Badge>
          )}
          <Button size="sm" variant="ghost" onClick={handleClear}>
            Clear
          </Button>
        </div>
      </div>

      {/* Panels */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input */}
        <div className="tool-panel">
          <div className="tool-panel-header">
            <span className="tool-panel-label">Input GUIDs</span>
            <Button
              size="xs"
              variant="ghost"
              onClick={handlePaste}
              leftIcon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5" aria-hidden="true">
                  <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                </svg>
              }
            >
              Paste
            </Button>
          </div>
          <div className="tool-panel-body">
            <textarea
              id="guid-input"
              className="tool-textarea"
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Paste one or more GUIDs here (one per line)&#10;e02fd0e4-00fd-4b98-a003-3c4f74d0e6df&#10;{0xe02fd0e400fd4b98a0033c4f74d0e6df}"
              spellCheck={false}
              aria-label="GUID Input"
            />
          </div>
        </div>

        {/* Output */}
        <div className="tool-panel">
          <div className="tool-panel-header">
            <span className="tool-panel-label">Output</span>
            <div className="flex items-center gap-1">
              {output && (
                <>
                  <CopyButton value={output} />
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => downloadText(output, 'converted_guids.txt', 'text/plain')}
                    leftIcon={
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5" aria-hidden="true">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" x2="12" y1="15" y2="3" />
                      </svg>
                    }
                  >
                    Download
                  </Button>
                </>
              )}
            </div>
          </div>
          <div className="tool-panel-body">
            {output ? (
              <textarea
                readOnly
                className="tool-textarea bg-transparent resize-none font-mono"
                value={output}
                aria-label="Converted GUIDs Output"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-foreground-subtle">
                Converted GUIDs will appear here
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
