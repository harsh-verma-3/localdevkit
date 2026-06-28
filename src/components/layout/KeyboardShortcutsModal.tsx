'use client';

import { useEffect } from 'react';

interface ShortcutGroup {
  label: string;
  shortcuts: { keys: string[]; description: string }[];
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    label: 'Navigation',
    shortcuts: [
      { keys: ['Ctrl', 'K'], description: 'Open command palette / search' },
      { keys: ['?'], description: 'Show keyboard shortcuts' },
      { keys: ['Esc'], description: 'Close modal / palette' },
      { keys: ['Alt', '←'], description: 'Go back' },
    ],
  },
  {
    label: 'Tools',
    shortcuts: [
      { keys: ['Ctrl', 'Enter'], description: 'Run / process current tool' },
      { keys: ['Ctrl', 'Shift', 'C'], description: 'Copy output' },
      { keys: ['Ctrl', 'Shift', 'X'], description: 'Clear input' },
      { keys: ['Ctrl', 'Shift', 'D'], description: 'Download output' },
    ],
  },
  {
    label: 'App',
    shortcuts: [
      { keys: ['Ctrl', 'B'], description: 'Toggle sidebar' },
      { keys: ['Ctrl', 'Shift', 'T'], description: 'Cycle theme (light/dark/system)' },
      { keys: ['Ctrl', 'Shift', 'F'], description: 'Toggle favorite' },
    ],
  },
];

interface KeyboardShortcutsModalProps {
  open: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsModal({ open, onClose }: KeyboardShortcutsModalProps) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-surface border border-border rounded-2xl shadow-lg animate-scale-in overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-primary" aria-hidden="true">
                <rect width="20" height="16" x="2" y="4" rx="2"/><path d="M6 8h.001M10 8h.001M14 8h.001M18 8h.001M8 12h.001M12 12h.001M16 12h.001M7 16h10"/>
              </svg>
            </div>
            <h2 className="text-sm font-semibold text-foreground">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close shortcuts"
            className="p-1.5 rounded-md text-foreground-subtle hover:text-foreground hover:bg-surface-elevated transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5 max-h-[60vh] overflow-auto">
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-foreground-subtle mb-2">
                {group.label}
              </p>
              <div className="space-y-1">
                {group.shortcuts.map((shortcut, i) => (
                  <div key={i} className="flex items-center justify-between gap-4 py-1.5 px-2 rounded-lg hover:bg-surface-elevated transition-colors">
                    <span className="text-sm text-foreground-muted">{shortcut.description}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      {shortcut.keys.map((key, ki) => (
                        <span key={ki} className="flex items-center gap-1">
                          <kbd className="inline-flex items-center justify-center min-w-[1.75rem] h-7 px-1.5
                            rounded-md border border-border bg-surface-elevated
                            text-[11px] font-mono font-medium text-foreground-muted
                            shadow-[0_1px_0_0_hsl(var(--color-border))]">
                            {key}
                          </kbd>
                          {ki < shortcut.keys.length - 1 && (
                            <span className="text-foreground-subtle text-xs">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border bg-surface-elevated/50 flex items-center justify-between">
          <p className="text-xs text-foreground-subtle">
            Press <kbd className="px-1.5 py-0.5 rounded border border-border bg-surface text-[11px] font-mono">?</kbd> to toggle this panel
          </p>
          <button
            onClick={onClose}
            className="text-xs font-medium text-foreground-muted hover:text-foreground transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
