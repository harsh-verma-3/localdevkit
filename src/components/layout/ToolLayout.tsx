'use client';

import { useEffect } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { useUiStore } from '@/store/uiStore';
import { getRelatedTools } from '@/core/registry';
import type { ToolPlugin } from '@/core/types/plugin';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

interface ToolLayoutProps {
  tool: ToolPlugin;
  children: React.ReactNode;
}

/**
 * Shared layout wrapper for every tool page.
 * Handles: page header, privacy badge, favorites toggle,
 * related tools section, and recent-tool tracking.
 */
export function ToolLayout({ tool, children }: ToolLayoutProps) {
  const { favorites, toggleFavorite, addRecentTool } = useSettingsStore();
  const { setActiveToolId } = useUiStore();
  const isFavorite = favorites.includes(tool.id);
  const relatedTools = getRelatedTools(tool.id);

  useEffect(() => {
    setActiveToolId(tool.id);
    addRecentTool(tool.id);
    return () => setActiveToolId(null);
  }, [tool.id, setActiveToolId, addRecentTool]);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Tool header */}
      <header className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-border shrink-0">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-foreground">{tool.name}</h1>
            {tool.isNew && <Badge variant="new">New</Badge>}
          </div>
          <p className="text-sm text-foreground-muted max-w-xl">{tool.description}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-4">
          {/* Privacy badge */}
          <div className="privacy-badge hidden sm:flex">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3" aria-hidden="true">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            Local only
          </div>

          {/* Keyboard shortcut hint */}
          <kbd className="hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono
            bg-surface-elevated border border-border text-foreground-subtle"
            title="Press ? for keyboard shortcuts">
            ?
          </kbd>

          {/* Favorite toggle */}
          <button
            onClick={() => toggleFavorite(tool.id)}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            aria-pressed={isFavorite}
            title={isFavorite ? 'Remove from favorites (Ctrl+Shift+F)' : 'Add to favorites (Ctrl+Shift+F)'}
            className={cn(
              'p-2 rounded-lg transition-all duration-150',
              'focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none',
              isFavorite
                ? 'text-warning bg-warning/10 hover:bg-warning/20'
                : 'text-foreground-muted bg-surface-elevated hover:text-warning hover:bg-warning/10'
            )}
          >
            <svg viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" className="w-4 h-4" aria-hidden="true">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </button>
        </div>
      </header>

      {/* Tool content */}
      <div className="flex-1 min-h-0 overflow-y-auto p-6">
        {children}
      </div>

      {/* Related tools */}
      {relatedTools.length > 0 && (
        <footer className="shrink-0 px-6 py-4 border-t border-border bg-surface-elevated">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs text-foreground-subtle font-medium">Related:</span>
            {relatedTools.map((t) => (
              <Link
                key={t.id}
                href={`/tools/${t.category}/${t.id}`}
                className="text-xs px-2.5 py-1 rounded-full border border-border
                           text-foreground-muted hover:text-primary hover:border-primary/40
                           transition-all duration-150"
              >
                {t.name}
              </Link>
            ))}
          </div>
        </footer>
      )}
    </div>
  );
}
