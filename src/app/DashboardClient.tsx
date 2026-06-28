'use client';

import Link from 'next/link';
import { useSettingsStore } from '@/store/settingsStore';
import { getAllTools, getToolsByCategory } from '@/core/registry';
import { ToolCategory, ToolCategoryLabels, type ToolCategoryValue } from '@/core/types/plugin';
import type { ToolPlugin } from '@/core/types/plugin';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

const CATEGORY_ORDER: ToolCategoryValue[] = [
  ToolCategory.ENCODING,
  ToolCategory.DATA,
  ToolCategory.GENERATORS,
  ToolCategory.TEXT,
  ToolCategory.DATETIME,
  ToolCategory.PREVIEW,
  ToolCategory.REFERENCE,
];

function ToolCard({ tool }: { tool: ToolPlugin }) {
  const { favorites, toggleFavorite } = useSettingsStore();
  const isFavorite = favorites.includes(tool.id);

  return (
    <Link
      href={`/tools/${tool.category}/${tool.id}`}
      className={cn(
        'group relative flex flex-col gap-3 p-4 rounded-xl',
        'bg-surface border border-border',
        'hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5',
        'transition-all duration-200 cursor-pointer'
      )}
      aria-label={`Open ${tool.name}`}
    >
      {/* Gradient accent line */}
      <div className="absolute top-0 left-4 right-4 h-[2px] rounded-full bg-gradient-to-r from-primary/0 via-primary/60 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-primary" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/>
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
            {tool.name}
          </h3>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {tool.isNew && <Badge variant="new">New</Badge>}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFavorite(tool.id);
            }}
            aria-label={isFavorite ? `Remove ${tool.name} from favorites` : `Add ${tool.name} to favorites`}
            aria-pressed={isFavorite}
            className={cn(
              'p-1 rounded-md transition-colors opacity-0 group-hover:opacity-100',
              isFavorite ? 'opacity-100 text-warning' : 'text-foreground-subtle hover:text-warning'
            )}
          >
            <svg viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5" aria-hidden="true">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </button>
        </div>
      </div>

      <p className="text-xs text-foreground-muted leading-relaxed line-clamp-2">
        {tool.description}
      </p>
    </Link>
  );
}

export function DashboardClient() {
  const { recentTools, favorites } = useSettingsStore();
  const allTools = getAllTools();

  const recentToolObjects = recentTools
    .map((id) => allTools.find((t) => t.id === id))
    .filter((t): t is ToolPlugin => t !== undefined);

  const favoriteToolObjects = favorites
    .map((id) => allTools.find((t) => t.id === id))
    .filter((t): t is ToolPlugin => t !== undefined);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-10">
      {/* Hero */}
      <section aria-labelledby="hero-heading">
        <div className="flex flex-col gap-3 max-w-2xl">
          <div className="privacy-badge w-fit">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3" aria-hidden="true">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            Everything runs in your browser
          </div>
          <h1 id="hero-heading" className="text-3xl font-bold text-foreground">
            Your privacy-first{' '}
            <span className="gradient-text">developer toolbox</span>
          </h1>
          <p className="text-base text-foreground-muted">
            {allTools.length} tools for developers and power users. No accounts, no servers,
            no data leaving your device. Press{' '}
            <kbd className="px-1.5 py-0.5 rounded text-xs font-mono bg-surface-elevated border border-border">⌘K</kbd>
            {' '}to search.
          </p>
        </div>
      </section>

      {/* Recent tools */}
      {recentToolObjects.length > 0 && (
        <section aria-labelledby="recent-heading">
          <h2 id="recent-heading" className="text-sm font-semibold text-foreground-subtle uppercase tracking-wider mb-4">
            Recently Used
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {recentToolObjects.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </section>
      )}

      {/* Favorites */}
      {favoriteToolObjects.length > 0 && (
        <section aria-labelledby="favorites-heading">
          <h2 id="favorites-heading" className="text-sm font-semibold text-foreground-subtle uppercase tracking-wider mb-4">
            Favorites
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {favoriteToolObjects.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </section>
      )}

      {/* All tools by category */}
      {CATEGORY_ORDER.map((category) => {
        const tools = getToolsByCategory(category);
        if (tools.length === 0) return null;
        return (
          <section key={category} aria-labelledby={`cat-${category}`}>
            <h2 id={`cat-${category}`} className="text-sm font-semibold text-foreground-subtle uppercase tracking-wider mb-4">
              {ToolCategoryLabels[category]}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {tools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
