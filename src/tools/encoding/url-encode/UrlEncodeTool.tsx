'use client';

import { useState, useMemo } from 'react';
import { CopyButton } from '@/components/ui/CopyButton';
import { cn, saveToolInput, loadToolInput } from '@/lib/utils';
import { urlEncode, urlDecode } from './urlEncode.logic';

type Mode = 'encode' | 'decode';

export default function UrlEncodeTool() {
  const [input, setInput] = useState(() => loadToolInput('url-encode'));
  const [mode, setMode] = useState<Mode>('encode');

  // Derive output + error together — no state mutation during render
  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: '', error: '' };
    try {
      const result = mode === 'encode' ? urlEncode(input) : urlDecode(input);
      return { output: result, error: '' };
    } catch {
      return {
        output: '',
        error: mode === 'decode' ? 'Invalid URL-encoded input' : 'Encoding failed',
      };
    }
  }, [input, mode]);

  function handleInputChange(value: string) {
    setInput(value);
    saveToolInput('url-encode', value);
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center gap-2">
        <div className="flex p-1 rounded-lg bg-surface-elevated border border-border">
          {(['encode', 'decode'] as Mode[]).map((m) => (
            <button key={m} onClick={() => setMode(m)} aria-pressed={mode === m}
              className={cn('px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-150 capitalize',
                mode === m ? 'bg-primary text-primary-foreground shadow-sm' : 'text-foreground-muted hover:text-foreground')}>
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="tool-panel">
          <div className="tool-panel-header">
            <span className="tool-panel-label">{mode === 'encode' ? 'Plain Text / URL' : 'Encoded URL'}</span>
          </div>
          <div className="tool-panel-body">
            <textarea className="tool-textarea" value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={mode === 'encode' ? 'Enter URL or text to encode…' : 'Paste encoded URL to decode…'}
              spellCheck={false} aria-label="Input" />
          </div>
        </div>

        <div className="tool-panel">
          <div className="tool-panel-header">
            <span className="tool-panel-label">{mode === 'encode' ? 'Encoded URL' : 'Decoded Text'}</span>
            {output && <CopyButton value={output} />}
          </div>
          <div className="tool-panel-body">
            {error ? (
              <div role="alert" className="p-4 text-sm text-error">{error}</div>
            ) : output ? (
              <pre className="tool-textarea whitespace-pre-wrap break-all" aria-label="Output">{output}</pre>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-foreground-subtle">Output will appear here</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
