'use client';

import { useState } from 'react';
import { CopyButton } from '@/components/ui/CopyButton';
import { cn, saveToolInput, loadToolInput } from '@/lib/utils';
import { encode, decode } from './htmlEntities.logic';

type Mode = 'encode' | 'decode';

export default function HtmlEntitiesToolLazy() {
  const [input, setInput] = useState(() => loadToolInput('html-entities'));
  const [mode, setMode] = useState<Mode>('encode');

  const output = (() => {
    if (!input.trim()) return '';
    return mode === 'encode' ? encode(input) : decode(input);
  })();

  function handleInputChange(value: string) {
    setInput(value);
    saveToolInput('html-entities', value);
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
        <span className="text-xs text-foreground-subtle">
          {mode === 'encode' ? 'Text → HTML entities' : 'HTML entities → Text'}
        </span>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="tool-panel">
          <div className="tool-panel-header">
            <span className="tool-panel-label">{mode === 'encode' ? 'Plain Text' : 'HTML Entities'}</span>
          </div>
          <div className="tool-panel-body">
            <textarea className="tool-textarea" value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={mode === 'encode' ? 'Enter text to encode… <div class="hello">' : 'Enter encoded text… &lt;div class=&quot;hello&quot;&gt;'}
              spellCheck={false} aria-label="Input" />
          </div>
        </div>

        <div className="tool-panel">
          <div className="tool-panel-header">
            <span className="tool-panel-label">{mode === 'encode' ? 'HTML Entities' : 'Plain Text'}</span>
            {output && <CopyButton value={output} />}
          </div>
          <div className="tool-panel-body">
            {output ? (
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
