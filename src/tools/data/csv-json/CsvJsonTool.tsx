'use client';

import { useState } from 'react';
import { CopyButton } from '@/components/ui/CopyButton';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn, saveToolInput, loadToolInput } from '@/lib/utils';
import { csvToJson, jsonToCsv } from './csvJson.logic';

type Direction = 'csv-to-json' | 'json-to-csv';

export default function CsvJsonTool() {
  const [input, setInput] = useState(() => loadToolInput('csv-json'));
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [direction, setDirection] = useState<Direction>('csv-to-json');
  const [delimiter, setDelimiter] = useState(',');
  const [pretty, setPretty] = useState(true);

  async function process(value: string, dir: Direction, delim: string, p: boolean) {
    if (!value.trim()) { setOutput(''); setError(''); return; }
    try {
      const result = dir === 'csv-to-json'
        ? await csvToJson(value, delim, p)
        : await jsonToCsv(value, delim);
      setOutput(result);
      setError('');
    } catch (e) {
      setError((e as Error).message);
      setOutput('');
    }
  }

  function handleInputChange(value: string) {
    setInput(value);
    saveToolInput('csv-json', value);
    process(value, direction, delimiter, pretty);
  }

  function handleDelimiterChange(d: string) {
    setDelimiter(d);
    process(input, direction, d, pretty);
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex p-1 rounded-lg bg-surface-elevated border border-border">
          {(['csv-to-json', 'json-to-csv'] as Direction[]).map((d) => (
            <button key={d} onClick={() => { setDirection(d); process(input, d, delimiter, pretty); }} aria-pressed={direction === d}
              className={cn('px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150',
                direction === d ? 'bg-primary text-primary-foreground shadow-sm' : 'text-foreground-muted hover:text-foreground')}>
              {d === 'csv-to-json' ? 'CSV → JSON' : 'JSON → CSV'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-foreground-subtle">Delimiter:</span>
          {[',', ';', '\t', '|'].map((d) => (
            <button key={d} onClick={() => handleDelimiterChange(d)} aria-pressed={delimiter === d}
              className={cn('w-8 h-7 rounded-md text-xs font-mono font-medium border transition-all',
                delimiter === d ? 'bg-primary text-primary-foreground border-primary' : 'bg-surface-elevated border-border text-foreground-muted hover:text-foreground')}>
              {d === '\t' ? 'Tab' : d}
            </button>
          ))}
        </div>

        {direction === 'csv-to-json' && (
          <Button size="sm" variant={pretty ? 'primary' : 'secondary'} onClick={() => { setPretty(!pretty); process(input, direction, delimiter, !pretty); }}>
            Pretty
          </Button>
        )}

        <div className="ml-auto">
          {error && <Badge variant="error">Error</Badge>}
          {output && !error && <Badge variant="success">✓</Badge>}
        </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="tool-panel">
          <div className="tool-panel-header">
            <span className="tool-panel-label">{direction === 'csv-to-json' ? 'CSV' : 'JSON'}</span>
          </div>
          <div className="tool-panel-body">
            <textarea className="tool-textarea" value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={direction === 'csv-to-json' ? 'name,age,city\nAlice,30,London\nBob,25,Paris' : '[{"name":"Alice","age":30}]'}
              spellCheck={false} aria-label="Input" />
          </div>
        </div>

        <div className="tool-panel">
          <div className="tool-panel-header">
            <span className="tool-panel-label">{direction === 'csv-to-json' ? 'JSON' : 'CSV'}</span>
            {output && <CopyButton value={output} />}
          </div>
          <div className="tool-panel-body">
            {error ? (
              <div role="alert" className="p-4 text-sm text-error">{error}</div>
            ) : output ? (
              <pre className="tool-textarea whitespace-pre-wrap" aria-label="Output">{output}</pre>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-foreground-subtle">Output will appear here</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
