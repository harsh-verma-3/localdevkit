'use client';

import { useState } from 'react';
import { CopyButton } from '@/components/ui/CopyButton';
import { Badge } from '@/components/ui/Badge';
import { cn, downloadText, saveToolInput, loadToolInput } from '@/lib/utils';
import { yamlToJson, jsonToYaml } from './yamlJson.logic';

type Direction = 'yaml-to-json' | 'json-to-yaml';

export default function YamlJsonTool() {
  const [input, setInput] = useState(() => loadToolInput('yaml-json'));
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [direction, setDirection] = useState<Direction>('yaml-to-json');

  async function process(value: string, dir: Direction) {
    if (!value.trim()) { setOutput(''); setError(''); return; }
    try {
      const result = dir === 'yaml-to-json'
        ? await yamlToJson(value)
        : await jsonToYaml(value);
      setOutput(result);
      setError('');
    } catch (e) {
      setError((e as Error).message);
      setOutput('');
    }
  }

  function handleInputChange(value: string) {
    setInput(value);
    saveToolInput('yaml-json', value);
    process(value, direction);
  }

  function handleDirectionChange(dir: Direction) {
    setDirection(dir);
    // Swap input/output
    if (output) {
      setInput(output);
      saveToolInput('yaml-json', output);
      process(output, dir);
    } else {
      process(input, dir);
    }
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center gap-3">
        <div className="flex p-1 rounded-lg bg-surface-elevated border border-border">
          {(['yaml-to-json', 'json-to-yaml'] as Direction[]).map((d) => (
            <button key={d} onClick={() => handleDirectionChange(d)} aria-pressed={direction === d}
              className={cn('px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150',
                direction === d ? 'bg-primary text-primary-foreground shadow-sm' : 'text-foreground-muted hover:text-foreground')}>
              {d === 'yaml-to-json' ? 'YAML → JSON' : 'JSON → YAML'}
            </button>
          ))}
        </div>
        {error && <Badge variant="error">Error</Badge>}
        {output && !error && <Badge variant="success">✓</Badge>}
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="tool-panel">
          <div className="tool-panel-header">
            <span className="tool-panel-label">{direction === 'yaml-to-json' ? 'YAML' : 'JSON'}</span>
          </div>
          <div className="tool-panel-body">
            <textarea className="tool-textarea" value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={direction === 'yaml-to-json' ? 'name: LocalDevKit\nversion: 1\nprivate: true' : '{\n  "name": "LocalDevKit",\n  "version": 1\n}'}
              spellCheck={false} aria-label="Input" />
          </div>
        </div>

        <div className="tool-panel">
          <div className="tool-panel-header">
            <span className="tool-panel-label">{direction === 'yaml-to-json' ? 'JSON' : 'YAML'}</span>
            {output && (
              <>
                <CopyButton value={output} />
                <button onClick={() => downloadText(output, direction === 'yaml-to-json' ? 'output.json' : 'output.yaml')} className="text-xs text-foreground-muted hover:text-foreground px-2 py-1 rounded transition-colors">↓ Download</button>
              </>
            )}
          </div>
          <div className="tool-panel-body">
            {error ? (
              <div role="alert" className="p-4 text-sm text-error font-mono">{error}</div>
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
