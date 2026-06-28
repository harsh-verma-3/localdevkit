'use client';

import { useMemo } from 'react';
import { useState } from 'react';
import { analyze } from './wordCounter.logic';

export default function WordCounterTool() {
  const [text, setText] = useState('');
  const stats = useMemo(() => analyze(text), [text]);

  const STAT_CARDS = [
    { label: 'Words', value: stats.words.toLocaleString() },
    { label: 'Characters', value: stats.characters.toLocaleString() },
    { label: 'Chars (no spaces)', value: stats.charactersNoSpaces.toLocaleString() },
    { label: 'Sentences', value: stats.sentences.toLocaleString() },
    { label: 'Paragraphs', value: stats.paragraphs.toLocaleString() },
    { label: 'Lines', value: stats.lines.toLocaleString() },
    { label: 'Reading Time', value: stats.readingTime },
    { label: 'Speaking Time', value: stats.speakingTime },
  ];

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {STAT_CARDS.map(({ label, value }) => (
          <div key={label} className="flex flex-col gap-0.5 p-3 rounded-lg bg-surface border border-border">
            <span className="text-2xl font-bold text-foreground font-mono">{value}</span>
            <span className="text-xs text-foreground-subtle">{label}</span>
          </div>
        ))}
      </div>

      {/* Text area */}
      <div className="tool-panel flex-1 min-h-0">
        <div className="tool-panel-header">
          <span className="tool-panel-label">Input Text</span>
          {text && (
            <button onClick={() => setText('')} className="text-xs text-foreground-subtle hover:text-foreground transition-colors">
              Clear
            </button>
          )}
        </div>
        <div className="tool-panel-body">
          <textarea className="tool-textarea" value={text} onChange={(e) => setText(e.target.value)}
            placeholder="Paste or type your text here… Statistics update in real-time."
            spellCheck={false} aria-label="Text to analyze"
            aria-describedby="word-count-live" />
          <div id="word-count-live" className="sr-only" aria-live="polite">
            {stats.words} words, {stats.characters} characters
          </div>
        </div>
      </div>
    </div>
  );
}
