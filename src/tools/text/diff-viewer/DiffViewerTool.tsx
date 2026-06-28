'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { computeDiff } from './diffViewer.logic';

export default function DiffViewerTool() {
  const [textA, setTextA] = useState('');
  const [textB, setTextB] = useState('');
  const [showDiff, setShowDiff] = useState(false);

  const diff = showDiff ? computeDiff(textA, textB) : [];
  const additions = diff.filter((l) => l.type === 'insert').length;
  const deletions = diff.filter((l) => l.type === 'delete').length;

  return (
    <div className="flex flex-col gap-4 h-full">
      {!showDiff ? (
        <>
          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="tool-panel">
              <div className="tool-panel-header"><span className="tool-panel-label">Original</span></div>
              <div className="tool-panel-body">
                <textarea className="tool-textarea" value={textA} onChange={(e) => setTextA(e.target.value)}
                  placeholder="Paste original text here…" spellCheck={false} aria-label="Original text" />
              </div>
            </div>
            <div className="tool-panel">
              <div className="tool-panel-header"><span className="tool-panel-label">Modified</span></div>
              <div className="tool-panel-body">
                <textarea className="tool-textarea" value={textB} onChange={(e) => setTextB(e.target.value)}
                  placeholder="Paste modified text here…" spellCheck={false} aria-label="Modified text" />
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <button onClick={() => setShowDiff(true)} disabled={!textA && !textB}
              className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm
                hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
              Compare →
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowDiff(false)}
              className="text-sm text-foreground-muted hover:text-foreground transition-colors flex items-center gap-1.5">
              ← Edit
            </button>
            <div className="flex items-center gap-2 text-xs">
              {additions > 0 && <span className="px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/20">+{additions} added</span>}
              {deletions > 0 && <span className="px-2 py-0.5 rounded-full bg-error/10 text-error border border-error/20">−{deletions} removed</span>}
              {additions === 0 && deletions === 0 && <span className="text-foreground-subtle">Files are identical</span>}
            </div>
          </div>

          <div className="tool-panel flex-1 min-h-0">
            <div className="tool-panel-header">
              <span className="tool-panel-label">Diff</span>
            </div>
            <div className="tool-panel-body overflow-auto">
              <table className="w-full font-mono text-xs" role="table" aria-label="Diff output">
                <tbody>
                  {diff.map((line, i) => (
                    <tr key={i} className={cn(
                      line.type === 'insert' && 'bg-success/8',
                      line.type === 'delete' && 'bg-error/8',
                    )}>
                      <td className="w-10 px-2 py-0.5 text-right text-foreground-subtle select-none border-r border-border">
                        {line.lineA ?? ''}
                      </td>
                      <td className="w-10 px-2 py-0.5 text-right text-foreground-subtle select-none border-r border-border">
                        {line.lineB ?? ''}
                      </td>
                      <td className={cn('w-6 px-2 py-0.5 text-center font-bold select-none',
                        line.type === 'insert' && 'text-success',
                        line.type === 'delete' && 'text-error',
                        line.type === 'equal' && 'text-foreground-subtle',
                      )}>
                        {line.type === 'insert' ? '+' : line.type === 'delete' ? '−' : ' '}
                      </td>
                      <td className="px-3 py-0.5 whitespace-pre-wrap break-all text-foreground">
                        {line.content}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
