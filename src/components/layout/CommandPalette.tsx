'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUiStore } from '@/store/uiStore';
import { useSettingsStore } from '@/store/settingsStore';
import { searchTools } from '@/core/registry';
import { ToolCategoryLabels } from '@/core/types/plugin';
import type { ToolPlugin } from '@/core/types/plugin';
import { cn } from '@/lib/utils';

export function CommandPalette() {
  const router = useRouter();
  const { commandPaletteQuery, setCommandPaletteQuery, closeCommandPalette } = useUiStore();
  const { addRecentTool } = useSettingsStore();
  const [query, setQuery] = useState(commandPaletteQuery);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = searchTools(query).slice(0, 12);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const navigate = useCallback(
    (tool: ToolPlugin) => {
      addRecentTool(tool.id);
      closeCommandPalette();
      router.push(`/tools/${tool.category}/${tool.id}`);
    },
    [addRecentTool, closeCommandPalette, router]
  );

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      navigate(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      closeCommandPalette();
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={closeCommandPalette}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette — search tools"
        className="fixed top-[20vh] left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4 animate-scale-in"
      >
        <div className="glass rounded-xl shadow-lg overflow-hidden border border-border">
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-foreground-muted shrink-0" aria-hidden="true">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setCommandPaletteQuery(e.target.value);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search tools…"
              className="flex-1 bg-transparent text-foreground placeholder:text-foreground-subtle text-sm focus:outline-none"
              aria-autocomplete="list"
              aria-controls="command-palette-results"
              aria-activedescendant={results[selectedIndex] ? `cp-result-${results[selectedIndex].id}` : undefined}
            />
            <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-surface-elevated text-foreground-subtle border border-border">
              Esc
            </kbd>
          </div>

          {/* Results */}
          <ul
            id="command-palette-results"
            role="listbox"
            className="max-h-80 overflow-y-auto py-2 no-scrollbar"
            aria-label="Tool search results"
          >
            {results.length === 0 && (
              <li className="px-4 py-8 text-center text-sm text-foreground-subtle">
                No tools match &ldquo;{query}&rdquo;
              </li>
            )}
            {results.map((tool, index) => (
              <li
                key={tool.id}
                id={`cp-result-${tool.id}`}
                role="option"
                aria-selected={index === selectedIndex}
                onClick={() => navigate(tool)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors duration-100',
                  index === selectedIndex
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground hover:bg-surface-elevated'
                )}
              >
                <div className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                  index === selectedIndex ? 'bg-primary/20' : 'bg-surface-elevated'
                )}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4" aria-hidden="true">
                    <circle cx="12" cy="12" r="10"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{tool.name}</p>
                  <p className="text-xs text-foreground-muted truncate">{tool.description}</p>
                </div>
                <span className="shrink-0 text-xs text-foreground-subtle px-2 py-0.5 rounded-full bg-surface-elevated border border-border">
                  {ToolCategoryLabels[tool.category]}
                </span>
              </li>
            ))}
          </ul>

          {/* Footer hint */}
          <div className="flex items-center gap-4 px-4 py-2.5 border-t border-border bg-surface-elevated">
            <span className="flex items-center gap-1.5 text-[11px] text-foreground-subtle">
              <kbd className="px-1 py-0.5 rounded text-[10px] bg-surface border border-border font-mono">↑↓</kbd>
              navigate
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-foreground-subtle">
              <kbd className="px-1 py-0.5 rounded text-[10px] bg-surface border border-border font-mono">↵</kbd>
              open
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-foreground-subtle">
              <kbd className="px-1 py-0.5 rounded text-[10px] bg-surface border border-border font-mono">Esc</kbd>
              close
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
