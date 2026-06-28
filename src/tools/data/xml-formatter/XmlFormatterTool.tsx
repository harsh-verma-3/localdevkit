'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { CopyButton } from '@/components/ui/CopyButton';
import { Badge } from '@/components/ui/Badge';
import { cn, downloadText, loadToolInput, saveToolInput } from '@/lib/utils';
import { formatXml, type XmlIndentSize } from './xmlFormatter.logic';

type Status = 'idle' | 'valid' | 'error';

export default function XmlFormatterTool() {
  const [input, setInput] = useState(() => loadToolInput('xml-formatter'));
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [indent, setIndent] = useState<XmlIndentSize>(2);

  const process = useCallback((raw: string, ind: XmlIndentSize) => {
    if (!raw.trim()) {
      setOutput('');
      setError('');
      setStatus('idle');
      return;
    }
    try {
      setOutput(formatXml(raw, ind));
      setError('');
      setStatus('valid');
    } catch (e) {
      setError((e as Error).message);
      setOutput('');
      setStatus('error');
    }
  }, []);

  // Update output on input or indent changes
  useEffect(() => {
    process(input, indent);
  }, [input, indent, process]);

  const handleInputChange = (value: string) => {
    setInput(value);
    saveToolInput('xml-formatter', value);
  };

  const handleIndentChange = (val: XmlIndentSize) => {
    setIndent(val);
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError('');
    setStatus('idle');
    saveToolInput('xml-formatter', '');
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      handleInputChange(text);
    } catch {
      /* clipboard denied */
    }
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 p-1 rounded-lg bg-surface-elevated border border-border">
          {([2, 4, 'tab'] as XmlIndentSize[]).map((val) => (
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

        <div className="ml-auto flex items-center gap-2">
          {status !== 'idle' && (
            <Badge variant={status === 'valid' ? 'success' : 'error'}>
              {status === 'valid' ? '✓ Valid XML' : '✗ Invalid XML'}
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
            <span className="tool-panel-label">Input XML</span>
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
              id="xml-input"
              className="tool-textarea"
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder='Paste your XML here…&#10;&#10;<note><to>User</to><from>LocalDevKit</from><heading>Reminder</heading><body>XML formatting works!</body></note>'
              spellCheck={false}
              aria-label="XML input"
              aria-describedby={error ? 'xml-error' : undefined}
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
                    onClick={() => downloadText(output, 'formatted.xml', 'application/xml')}
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
            {error ? (
              <div id="xml-error" role="alert" className="p-4">
                <div className="flex items-start gap-2 p-3 rounded-lg bg-error/10 border border-error/25 text-error">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" x2="12" y1="8" y2="12" />
                    <line x1="12" x2="12.01" y1="16" y2="16" />
                  </svg>
                  <div>
                    <p className="text-sm font-semibold">XML Validation Failed</p>
                    <p className="text-xs mt-0.5 font-mono whitespace-pre-wrap">{error}</p>
                  </div>
                </div>
              </div>
            ) : output ? (
              <textarea
                readOnly
                className="tool-textarea bg-transparent resize-none font-mono"
                value={output}
                aria-label="Formatted XML output"
              />
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
