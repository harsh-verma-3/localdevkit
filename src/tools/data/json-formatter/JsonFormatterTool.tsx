'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { CopyButton } from '@/components/ui/CopyButton';
import { Badge } from '@/components/ui/Badge';
import { cn, downloadText, loadToolInput, saveToolInput } from '@/lib/utils';
import { formatJson, type IndentSize } from './jsonFormatter.logic';
type Status = 'idle' | 'valid' | 'error';

export default function JsonFormatterTool() {
  const [input, setInput] = useState(() => loadToolInput('json-formatter'));
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [indent, setIndent] = useState<IndentSize>(2);
  const [minified, setMinified] = useState(false);

  const process = useCallback(
    (raw: string, mini: boolean, ind: IndentSize) => {
      if (!raw.trim()) {
        setOutput('');
        setError('');
        setStatus('idle');
        return;
      }
      try {
        setOutput(formatJson(raw, mini, ind));
        setError('');
        setStatus('valid');
      } catch (e) {
        setError((e as Error).message);
        setOutput('');
        setStatus('error');
      }
    },
    []
  );

  function handleInputChange(value: string) {
    setInput(value);
    saveToolInput('json-formatter', value);
    process(value, minified, indent);
  }

  function handleIndentChange(val: IndentSize) {
    setIndent(val);
    process(input, minified, val);
  }

  function handleMinifyToggle() {
    const next = !minified;
    setMinified(next);
    process(input, next, indent);
  }

  function handleClear() {
    setInput('');
    setOutput('');
    setError('');
    setStatus('idle');
    saveToolInput('json-formatter', '');
  }

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText();
      handleInputChange(text);
    } catch {
      /* clipboard denied */
    }
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 p-1 rounded-lg bg-surface-elevated border border-border">
          {([2, 4, 'tab'] as IndentSize[]).map((val) => (
            <button
              key={val}
              onClick={() => handleIndentChange(val)}
              aria-pressed={indent === val}
              className={cn(
                'px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-150',
                indent === val
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-foreground-muted hover:text-foreground'
              )}
            >
              {val === 'tab' ? 'Tab' : `${val} Spaces`}
            </button>
          ))}
        </div>

        <Button
          size="sm"
          variant={minified ? 'primary' : 'secondary'}
          onClick={handleMinifyToggle}
          aria-pressed={minified}
        >
          Minify
        </Button>

        <div className="ml-auto flex items-center gap-2">
          {status !== 'idle' && (
            <Badge variant={status === 'valid' ? 'success' : 'error'}>
              {status === 'valid' ? '✓ Valid JSON' : '✗ Invalid'}
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
            <span className="tool-panel-label">Input</span>
            <Button size="xs" variant="ghost" onClick={handlePaste} leftIcon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5" aria-hidden="true">
                <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
              </svg>
            }>
              Paste
            </Button>
          </div>
          <div className="tool-panel-body">
            <textarea
              id="json-input"
              className="tool-textarea"
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder='Paste your JSON here…&#10;&#10;{"name": "LocalDevKit", "version": 1}'
              spellCheck={false}
              aria-label="JSON input"
              aria-describedby={error ? 'json-error' : undefined}
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
                    onClick={() => downloadText(output, 'formatted.json', 'application/json')}
                    leftIcon={
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5" aria-hidden="true">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>
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
            {error ? (
              <div id="json-error" role="alert" className="p-4">
                <div className="flex items-start gap-2 p-3 rounded-lg bg-error/10 border border-error/25 text-error">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true">
                    <circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>
                  </svg>
                  <div>
                    <p className="text-sm font-semibold">Invalid JSON</p>
                    <p className="text-xs mt-0.5 font-mono">{error}</p>
                  </div>
                </div>
              </div>
            ) : output ? (
              <pre className="tool-textarea whitespace-pre-wrap break-all" aria-label="Formatted JSON output">{output}</pre>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-foreground-subtle">
                Formatted output will appear here
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
