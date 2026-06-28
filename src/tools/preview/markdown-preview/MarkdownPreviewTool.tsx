'use client';

import { useState, useEffect } from 'react';
import { saveToolInput, loadToolInput } from '@/lib/utils';

export default function MarkdownPreviewTool() {
  const [markdown, setMarkdown] = useState(() => loadToolInput('markdown-preview') || '# Welcome to Markdown Preview\n\nType or paste your **Markdown** here and see the live preview.\n\n## Features\n\n- Live rendering\n- GitHub Flavored Markdown\n- Syntax safe (sanitized)\n\n```js\nconst greet = (name) => `Hello, ${name}!`;\n```\n\n> LocalDevKit processes everything locally. Nothing is sent to any server.');
  const [html, setHtml] = useState('');
  const [view, setView] = useState<'split' | 'preview' | 'source'>('split');

  useEffect(() => {
    let cancelled = false;
    async function render() {
      const { marked } = await import('marked');
      const DOMPurify = (await import('dompurify')).default;
      marked.setOptions({ breaks: true, gfm: true } as Parameters<typeof marked.setOptions>[0]);
      const rawHtml = await marked(markdown);
      if (!cancelled) setHtml(DOMPurify.sanitize(rawHtml));
    }
    render();
    return () => { cancelled = true; };
  }, [markdown]);

  function handleChange(value: string) {
    setMarkdown(value);
    saveToolInput('markdown-preview', value);
  }

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* View toggle */}
      <div className="flex items-center gap-1 p-1 rounded-lg bg-surface-elevated border border-border w-fit">
        {(['split', 'source', 'preview'] as const).map((v) => (
          <button key={v} onClick={() => setView(v)} aria-pressed={view === v}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150 capitalize ${view === v ? 'bg-primary text-primary-foreground shadow-sm' : 'text-foreground-muted hover:text-foreground'}`}>
            {v}
          </button>
        ))}
      </div>

      <div className={`flex-1 min-h-0 grid gap-4 ${view === 'split' ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {/* Source */}
        {(view === 'split' || view === 'source') && (
          <div className="tool-panel">
            <div className="tool-panel-header"><span className="tool-panel-label">Markdown</span></div>
            <div className="tool-panel-body">
              <textarea className="tool-textarea" value={markdown}
                onChange={(e) => handleChange(e.target.value)}
                placeholder="# Hello World" spellCheck={false} aria-label="Markdown source" />
            </div>
          </div>
        )}

        {/* Preview */}
        {(view === 'split' || view === 'preview') && (
          <div className="tool-panel">
            <div className="tool-panel-header"><span className="tool-panel-label">Preview</span></div>
            <div className="tool-panel-body overflow-auto">
              <article
                className="prose prose-sm dark:prose-invert max-w-none p-4
                  prose-headings:text-foreground prose-p:text-foreground-muted
                  prose-code:text-primary prose-code:bg-surface-elevated prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                  prose-pre:bg-surface-elevated prose-pre:border prose-pre:border-border
                  prose-blockquote:text-foreground-muted prose-blockquote:border-primary"
                dangerouslySetInnerHTML={{ __html: html }}
                aria-label="Rendered markdown"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
