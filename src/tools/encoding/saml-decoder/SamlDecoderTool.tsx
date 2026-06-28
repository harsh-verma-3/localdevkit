'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { CopyButton } from '@/components/ui/CopyButton';
import { Badge } from '@/components/ui/Badge';
import { cn, downloadText, loadToolInput, saveToolInput } from '@/lib/utils';
import { decodeSaml, type SamlDecodeMode } from './samlDecoder.logic';
import { formatXml } from '@/tools/data/xml-formatter/xmlFormatter.logic';

export default function SamlDecoderTool() {
  const [input, setInput] = useState(() => loadToolInput('saml-decoder'));
  const [mode, setMode] = useState<SamlDecodeMode>('auto');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [detectedMode, setDetectedMode] = useState<'redirect' | 'post' | null>(null);

  const processPayload = useCallback(async (val: string, m: SamlDecodeMode) => {
    if (!val.trim()) {
      setOutput('');
      setError('');
      setDetectedMode(null);
      return;
    }
    try {
      const res = await decodeSaml(val, m);
      setOutput(res.output);
      setDetectedMode(res.detectedMode);
      setError('');
    } catch (e) {
      setError((e as Error).message);
      setOutput('');
      setDetectedMode(null);
    }
  }, []);

  // Recalculate output when input or mode changes
  useEffect(() => {
    processPayload(input, mode);
  }, [input, mode, processPayload]);

  const handleInputChange = (val: string) => {
    setInput(val);
    saveToolInput('saml-decoder', val);
  };

  const handleClear = () => {
    handleInputChange('');
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      handleInputChange(text);
    } catch {
      /* clipboard access denied */
    }
  };

  const handleFormatXml = () => {
    if (!output) return;
    try {
      const formatted = formatXml(output, 2);
      setOutput(formatted);
      setError('');
    } catch (e) {
      setError(`Cannot format decoded XML: ${(e as Error).message}`);
    }
  };

  const isXml = output.trim().startsWith('<');

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold text-foreground-muted uppercase tracking-wider">Decoding Mode</span>
          <div className="flex p-0.5 rounded-lg bg-surface-elevated border border-border">
            {([
              { value: 'auto', label: 'Auto-detect' },
              { value: 'redirect', label: 'Redirect (Base64 + Inflate)' },
              { value: 'post', label: 'POST (Base64 Only)' },
            ] as { value: SamlDecodeMode; label: string }[]).map((opt) => (
              <button
                key={opt.value}
                onClick={() => setMode(opt.value)}
                aria-pressed={mode === opt.value}
                className={cn(
                  'px-3 py-1 rounded-md text-xs font-medium transition-all duration-150',
                  mode === opt.value
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-foreground-muted hover:text-foreground'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2 self-end">
          {detectedMode && mode === 'auto' && (
            <Badge variant="success">
              Detected: {detectedMode === 'redirect' ? 'HTTP-Redirect' : 'HTTP-POST'}
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
            <span className="tool-panel-label">Raw SAML Payload / URL</span>
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
              id="saml-input"
              className="tool-textarea"
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Paste raw Base64 SAMLRequest/SAMLResponse, or complete redirect URL containing query parameters here…"
              spellCheck={false}
              aria-label="SAML Input"
            />
          </div>
        </div>

        {/* Output */}
        <div className="tool-panel">
          <div className="tool-panel-header">
            <span className="tool-panel-label">Decoded XML</span>
            <div className="flex items-center gap-1">
              {output && (
                <>
                  {isXml && (
                    <Button size="xs" variant="secondary" onClick={handleFormatXml}>
                      Pretty Print XML
                    </Button>
                  )}
                  <CopyButton value={output} />
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => downloadText(output, 'saml_decoded.xml', 'application/xml')}
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
              <div role="alert" className="p-4">
                <div className="flex items-start gap-2 p-3 rounded-lg bg-error/10 border border-error/25 text-error">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" x2="12" y1="8" y2="12" />
                    <line x1="12" x2="12.01" y1="16" y2="16" />
                  </svg>
                  <div>
                    <p className="text-sm font-semibold">Decoding Error</p>
                    <p className="text-xs mt-0.5 font-mono">{error}</p>
                  </div>
                </div>
              </div>
            ) : output ? (
              <textarea
                readOnly
                className="tool-textarea bg-transparent resize-none font-mono"
                value={output}
                aria-label="Decoded XML Output"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-foreground-subtle">
                Decoded XML output will appear here
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
