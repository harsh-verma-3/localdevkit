'use client';

import { useState } from 'react';
import { CopyButton } from '@/components/ui/CopyButton';
import { convert, CASE_LABELS, type CaseType } from './caseConverter.logic';

export default function CaseConverterTool() {
  const [input, setInput] = useState('');

  const results = Object.keys(CASE_LABELS).map((caseType) => ({
    caseType: caseType as CaseType,
    label: CASE_LABELS[caseType as CaseType],
    output: convert(input, caseType as CaseType),
  }));

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <div className="tool-panel">
        <div className="tool-panel-header">
          <span className="tool-panel-label">Input Text</span>
        </div>
        <div className="tool-panel-body">
          <textarea className="tool-textarea" style={{ minHeight: 80 }} value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter text to convert… hello world or helloWorld"
            spellCheck={false} aria-label="Text to convert" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {results.map(({ caseType, label, output }) => (
          <div key={caseType} className="flex items-center justify-between gap-2 p-3 rounded-lg
            bg-surface border border-border hover:border-primary/40 transition-colors group">
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-xs text-foreground-subtle">{label}</span>
              <code className="text-sm font-mono text-foreground truncate">{output || '—'}</code>
            </div>
            {output && <CopyButton value={output} size="sm" />}
          </div>
        ))}
      </div>
    </div>
  );
}
