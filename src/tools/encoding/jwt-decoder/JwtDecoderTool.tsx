'use client';

import { useState } from 'react';
import { CopyButton } from '@/components/ui/CopyButton';
import { Badge } from '@/components/ui/Badge';
import { saveToolInput, loadToolInput } from '@/lib/utils';
import { decodeJwt, formatTimestamp, TIME_FIELDS, type JwtParts } from './jwtDecoder.logic';

export default function JwtDecoderTool() {
  const [input, setInput] = useState(() => loadToolInput('jwt-decoder'));
  const [decoded, setDecoded] = useState<JwtParts | null>(null);
  const [error, setError] = useState('');

  function handleInputChange(value: string) {
    setInput(value);
    saveToolInput('jwt-decoder', value);
    if (!value.trim()) { setDecoded(null); setError(''); return; }
    try {
      setDecoded(decodeJwt(value));
      setError('');
    } catch (e) {
      setDecoded(null);
      setError((e as Error).message);
    }
  }

  const isExpired = decoded?.payload?.exp
    ? (decoded.payload.exp as number) * 1000 < Date.now()
    : null;

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Token input */}
      <div className="tool-panel" style={{ flex: '0 0 auto', minHeight: 100 }}>
        <div className="tool-panel-header">
          <span className="tool-panel-label">JWT Token</span>
          <div className="flex items-center gap-2">
            {decoded && isExpired !== null && (
              <Badge variant={isExpired ? 'error' : 'success'}>
                {isExpired ? 'Expired' : 'Not expired'}
              </Badge>
            )}
            {decoded && <Badge variant="primary">{decoded.header.alg as string}</Badge>}
          </div>
        </div>
        <div className="tool-panel-body" style={{ minHeight: 80 }}>
          <textarea
            className="tool-textarea"
            style={{ minHeight: 80 }}
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Paste your JWT token here… eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.abc"
            spellCheck={false}
            aria-label="JWT token input"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div role="alert" className="flex items-center gap-2 p-3 rounded-lg bg-error/10 border border-error/25 text-error text-sm">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 shrink-0" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
          {error}
        </div>
      )}

      {/* Decoded sections */}
      {decoded && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
          {/* Header */}
          <div className="tool-panel">
            <div className="tool-panel-header">
              <span className="tool-panel-label">Header</span>
              <CopyButton value={JSON.stringify(decoded.header, null, 2)} />
            </div>
            <div className="tool-panel-body overflow-auto p-4 space-y-2">
              {Object.entries(decoded.header).map(([k, v]) => (
                <div key={k} className="flex items-start gap-3">
                  <span className="text-xs font-mono font-semibold text-primary w-16 shrink-0">{k}</span>
                  <span className="text-xs font-mono text-foreground break-all">{String(v)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payload */}
          <div className="tool-panel">
            <div className="tool-panel-header">
              <span className="tool-panel-label">Payload</span>
              <CopyButton value={JSON.stringify(decoded.payload, null, 2)} />
            </div>
            <div className="tool-panel-body overflow-auto p-4 space-y-2">
              {Object.entries(decoded.payload).map(([k, v]) => (
                <div key={k} className="flex items-start gap-3">
                  <span className="text-xs font-mono font-semibold text-primary w-24 shrink-0">{k}</span>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-mono text-foreground break-all">{String(v)}</span>
                    {TIME_FIELDS.has(k) && (
                      <span className="text-[11px] text-foreground-subtle">{formatTimestamp(v)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!decoded && !error && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-surface-elevated border border-border flex items-center justify-center mx-auto">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6 text-foreground-subtle" aria-hidden="true">
                <circle cx="12" cy="11" r="3"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 4a6 6 0 0 1 0 12 6 6 0 0 1 0-12z"/>
              </svg>
            </div>
            <p className="text-sm text-foreground-muted font-medium">Paste a JWT token above</p>
            <p className="text-xs text-foreground-subtle">Header and payload will be decoded instantly</p>
          </div>
        </div>
      )}
    </div>
  );
}
