'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSettingsStore } from '@/store/settingsStore';
import { useUiStore } from '@/store/uiStore';
import { getAllTools, getToolsByCategory } from '@/core/registry';
import { ToolCategory, ToolCategoryLabels, type ToolCategoryValue } from '@/core/types/plugin';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { useState, useEffect } from 'react';

// ─────────────────────────────────────────────
// Category icons (inline SVG — lucide paths)
// ─────────────────────────────────────────────
function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const icons: Record<string, React.ReactNode> = {
    'lock-keyhole': (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn('h-4 w-4', className)} aria-hidden="true">
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>
        <circle cx="12" cy="16" r="1" fill="currentColor"/>
      </svg>
    ),
    shuffle: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn('h-4 w-4', className)} aria-hidden="true">
        <path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22"/><path d="m18 2 4 4-4 4"/><path d="M2 6h1.9c1.5 0 2.9.9 3.5 2.2"/><path d="M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8"/><path d="m18 14 4 4-4 4"/>
      </svg>
    ),
    sparkles: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn('h-4 w-4', className)} aria-hidden="true">
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
        <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
      </svg>
    ),
    type: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn('h-4 w-4', className)} aria-hidden="true">
        <polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/>
      </svg>
    ),
    clock: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn('h-4 w-4', className)} aria-hidden="true">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    eye: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn('h-4 w-4', className)} aria-hidden="true">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
      </svg>
    ),
    'book-open': (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn('h-4 w-4', className)} aria-hidden="true">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
      </svg>
    ),
  };
  return <>{icons[name] ?? null}</>;
}

// ─────────────────────────────────────────────
// Theme toggle icon
// ─────────────────────────────────────────────
function ThemeIcon({ theme }: { theme: 'light' | 'dark' | 'system' }) {
  if (theme === 'dark') return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
    </svg>
  );
  if (theme === 'light') return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
      <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
    </svg>
  );
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
      <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
    </svg>
  );
}

// ─────────────────────────────────────────────
// Sidebar
// ─────────────────────────────────────────────
const CATEGORY_ORDER: ToolCategoryValue[] = [
  ToolCategory.ENCODING,
  ToolCategory.DATA,
  ToolCategory.GENERATORS,
  ToolCategory.TEXT,
  ToolCategory.DATETIME,
  ToolCategory.PREVIEW,
  ToolCategory.REFERENCE,
];

const CATEGORY_ICONS: Record<string, string> = {
  encoding: 'lock-keyhole',
  data: 'shuffle',
  generators: 'sparkles',
  text: 'type',
  datetime: 'clock',
  preview: 'eye',
  reference: 'book-open',
};

export function Sidebar() {
  const pathname = usePathname();
  const { favorites, sidebarCollapsed, toggleSidebar, theme, setTheme } = useSettingsStore();
  const { openCommandPalette } = useUiStore();
  const [search, setSearch] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const allTools = getAllTools();
  const filteredTools = search.trim()
    ? allTools.filter(
        (t) =>
          t.name.toLowerCase().includes(search.toLowerCase()) ||
          t.keywords.some((k) => k.includes(search.toLowerCase()))
      )
    : null;

  const favoriteTools = allTools.filter((t) => favorites.includes(t.id));

  // Cycle theme: system → light → dark → system
  function cycleTheme() {
    const next = theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system';
    setTheme(next);
  }

  const themeLabel = !mounted
    ? 'System theme'
    : theme === 'dark' ? 'Dark mode' : theme === 'light' ? 'Light mode' : 'System theme';

  return (
    <aside
      aria-label="Navigation"
      style={{
        width: sidebarCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
      }}
      className={cn(
        'flex flex-col h-full border-r border-border bg-surface',
        'transition-all duration-200 ease-in-out shrink-0 overflow-hidden'
      )}
    >
      {/* Logo / Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-border-subtle min-h-[var(--header-height)]">
        {!sidebarCollapsed && (
          <Link href="/" className="flex items-center gap-2.5 group" aria-label="LocalDevKit home">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-sm">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-4 h-4" aria-hidden="true">
                <path d="m8 3 4 8 5-5 5 15H2L8 3z"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-foreground leading-none">LocalDevKit</p>
              <p className="text-[10px] text-foreground-subtle mt-0.5">Privacy-first tools</p>
            </div>
          </Link>
        )}
        <button
          onClick={toggleSidebar}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="p-1.5 rounded-md text-foreground-subtle hover:text-foreground hover:bg-surface-elevated transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4" aria-hidden="true">
            {sidebarCollapsed ? (
              <path d="M9 18l6-6-6-6"/>
            ) : (
              <path d="M15 18l-6-6 6-6"/>
            )}
          </svg>
        </button>
      </div>

      {/* Search / Command palette trigger */}
      {!sidebarCollapsed && (
        <div className="px-3 py-3 border-b border-border-subtle">
          <button
            onClick={() => openCommandPalette()}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg
                       bg-surface-elevated border border-border
                       text-sm text-foreground-subtle
                       hover:border-primary/40 hover:text-foreground
                       transition-all duration-150 text-left"
            aria-label="Open command palette"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 shrink-0" aria-hidden="true">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <span className="flex-1 text-sm">Search tools…</span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono bg-border text-foreground-subtle">
              ⌘K
            </kbd>
          </button>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4 no-scrollbar" aria-label="Tools navigation">
        {/* Favorites */}
        {!sidebarCollapsed && favoriteTools.length > 0 && !filteredTools && (
          <section aria-label="Favorite tools">
            <p className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-widest text-foreground-subtle">
              Favorites
            </p>
            <ul className="space-y-0.5" role="list">
              {favoriteTools.map((tool) => {
                const href = `/tools/${tool.category}/${tool.id}`;
                const isActive = pathname === href;
                return (
                  <li key={tool.id}>
                    <Link
                      href={href}
                      className={cn('sidebar-item', isActive && 'sidebar-item-active')}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-warning shrink-0" aria-hidden="true">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      <span className="truncate">{tool.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {/* Filtered results */}
        {filteredTools && !sidebarCollapsed && (
          <section aria-label="Search results">
            <p className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-widest text-foreground-subtle">
              Results
            </p>
            <ul className="space-y-0.5" role="list">
              {filteredTools.length === 0 && (
                <li className="px-3 py-2 text-sm text-foreground-subtle">No tools found</li>
              )}
              {filteredTools.map((tool) => {
                const href = `/tools/${tool.category}/${tool.id}`;
                const isActive = pathname === href;
                return (
                  <li key={tool.id}>
                    <Link
                      href={href}
                      onClick={() => setSearch('')}
                      className={cn('sidebar-item', isActive && 'sidebar-item-active')}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <span className="truncate">{tool.name}</span>
                      {tool.isNew && <Badge variant="new" className="ml-auto">New</Badge>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {/* Categories */}
        {!filteredTools && CATEGORY_ORDER.map((category) => {
          const tools = getToolsByCategory(category);
          if (tools.length === 0) return null;
          const iconName = CATEGORY_ICONS[category] ?? 'circle';

          return (
            <section key={category} aria-label={ToolCategoryLabels[category]}>
              {!sidebarCollapsed && (
                <div className="flex items-center gap-2 px-2 mb-1">
                  <CategoryIcon name={iconName} className="text-foreground-subtle" />
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-foreground-subtle">
                    {ToolCategoryLabels[category]}
                  </p>
                </div>
              )}
              <ul className="space-y-0.5" role="list">
                {tools.map((tool) => {
                  const href = `/tools/${tool.category}/${tool.id}`;
                  const isActive = pathname === href;
                  return (
                    <li key={tool.id}>
                      <Link
                        href={href}
                        title={sidebarCollapsed ? tool.name : undefined}
                        className={cn(
                          'sidebar-item',
                          isActive && 'sidebar-item-active',
                          sidebarCollapsed && 'justify-center px-0'
                        )}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        {sidebarCollapsed ? (
                          <>
                            {/* Show first 2 letters as icon when collapsed */}
                            <span className="text-[10px] font-bold font-mono text-foreground-muted" aria-hidden="true">
                              {tool.name.slice(0, 2).toUpperCase()}
                            </span>
                            <span className="sr-only">{tool.name}</span>
                          </>
                        ) : (
                          <>
                            <span className="truncate">{tool.name}</span>
                            {tool.isNew && <Badge variant="new" className="ml-auto shrink-0">New</Badge>}
                          </>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </nav>

      {/* Footer — theme toggle + privacy badge */}
      <div className={cn(
        'border-t border-border-subtle',
        sidebarCollapsed ? 'px-2 py-3 flex flex-col items-center gap-2' : 'px-4 py-3 flex items-center justify-between gap-2'
      )}>
        {/* Privacy badge */}
        {!sidebarCollapsed && (
          <div className="privacy-badge text-[10px]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3" aria-hidden="true">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            All processing is local
          </div>
        )}

        {/* Theme toggle */}
        <button
          onClick={cycleTheme}
          title={themeLabel}
          aria-label={`Current: ${themeLabel}. Click to cycle theme.`}
          className="p-1.5 rounded-md text-foreground-subtle hover:text-foreground hover:bg-surface-elevated transition-colors"
        >
          <ThemeIcon theme={mounted ? theme : 'system'} />
        </button>
      </div>
    </aside>
  );
}
