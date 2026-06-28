'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { cn, downloadDataUrl } from '@/lib/utils';

type ErrorLevel = 'L' | 'M' | 'Q' | 'H';

export default function QrGeneratorTool() {
  const [text, setText] = useState('');
  const [errorLevel, setErrorLevel] = useState<ErrorLevel>('M');
  const [size, setSize] = useState(256);
  const [darkColor, setDarkColor] = useState('#000000');
  const [lightColor, setLightColor] = useState('#ffffff');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generate = useCallback(async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError('');
    try {
      const QRCode = (await import('qrcode')).default;
      const canvas = canvasRef.current;
      if (!canvas) return;
      await QRCode.toCanvas(canvas, text, {
        width: size,
        errorCorrectionLevel: errorLevel,
        color: { dark: darkColor, light: lightColor },
      });
      setQrDataUrl(canvas.toDataURL('image/png'));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [text, errorLevel, size, darkColor, lightColor]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-3xl">
      {/* Controls */}
      <div className="flex flex-col gap-5 lg:w-72 shrink-0">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="qr-text" className="text-sm font-medium text-foreground-muted">Content</label>
          <textarea id="qr-text" className="h-28 px-3 py-2 rounded-lg border border-border bg-surface-elevated
            text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            value={text} onChange={(e) => setText(e.target.value)}
            placeholder="https://localdevkit.app or any text…" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground-muted">Error Correction</label>
          <div className="flex p-1 rounded-lg bg-surface-elevated border border-border">
            {(['L', 'M', 'Q', 'H'] as ErrorLevel[]).map((l) => (
              <button key={l} onClick={() => setErrorLevel(l)} aria-pressed={errorLevel === l}
                className={cn('flex-1 py-1.5 rounded-md text-xs font-mono font-semibold transition-all duration-150',
                  errorLevel === l ? 'bg-primary text-primary-foreground shadow-sm' : 'text-foreground-muted hover:text-foreground')}>
                {l}
              </button>
            ))}
          </div>
          <p className="text-xs text-foreground-subtle">L=7% / M=15% / Q=25% / H=30% recovery</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="qr-size" className="text-sm font-medium text-foreground-muted">Size: {size}px</label>
          <input id="qr-size" type="range" min={128} max={512} step={64} value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none bg-border
                       [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                       [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="qr-dark" className="text-xs font-medium text-foreground-muted">Dark Color</label>
            <div className="flex items-center gap-2 p-2 rounded-lg border border-border bg-surface-elevated">
              <input id="qr-dark" type="color" value={darkColor} onChange={(e) => setDarkColor(e.target.value)} className="w-6 h-6 rounded cursor-pointer border-0" />
              <code className="text-xs font-mono text-foreground">{darkColor}</code>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="qr-light" className="text-xs font-medium text-foreground-muted">Light Color</label>
            <div className="flex items-center gap-2 p-2 rounded-lg border border-border bg-surface-elevated">
              <input id="qr-light" type="color" value={lightColor} onChange={(e) => setLightColor(e.target.value)} className="w-6 h-6 rounded cursor-pointer border-0" />
              <code className="text-xs font-mono text-foreground">{lightColor}</code>
            </div>
          </div>
        </div>

        <Button variant="primary" loading={loading} onClick={generate} disabled={!text.trim()}>
          Generate QR Code
        </Button>

        {error && <p className="text-sm text-error">{error}</p>}
      </div>

      {/* Preview */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <canvas ref={canvasRef} aria-label="QR Code output"
          className={cn('rounded-xl shadow-md max-w-full', !qrDataUrl && 'hidden')} />

        {!qrDataUrl && (
          <div className="flex flex-col items-center gap-3 p-12 rounded-xl border border-dashed border-border text-center">
            <div className="w-16 h-16 rounded-xl bg-surface-elevated border border-border flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-foreground-subtle" aria-hidden="true">
                <rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>
                <path d="M14 14h3v3M14 17h3M17 14v3"/>
              </svg>
            </div>
            <p className="text-sm text-foreground-muted">Enter text and click Generate</p>
          </div>
        )}

        {qrDataUrl && (
          <Button variant="secondary" onClick={() => downloadDataUrl(qrDataUrl, 'qrcode.png')}
            leftIcon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>}>
            Download PNG
          </Button>
        )}
      </div>
    </div>
  );
}
