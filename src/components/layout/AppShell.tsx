'use client';

import { useEffect, useState, useCallback } from 'react';

import { useUiStore } from '@/store/uiStore';
import { useSettingsStore } from '@/store/settingsStore';
import { Sidebar } from './Sidebar';
import { CommandPalette } from './CommandPalette';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';
import { cn } from '@/lib/utils';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { commandPaletteOpen, openCommandPalette, closeCommandPalette, activeToolId } = useUiStore();
  const { toggleSidebar, setTheme, theme, toggleFavorite } = useSettingsStore();
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  const closeShortcuts = useCallback(() => setShortcutsOpen(false), []);

  // Global keyboard shortcut layer
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const active = document.activeElement;
      const isEditing =
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement ||
        (active instanceof HTMLElement && active.isContentEditable);

      // ⌘K / Ctrl+K — Command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (commandPaletteOpen) {
          closeCommandPalette();
        } else {
          openCommandPalette();
        }
        return;
      }

      // Ctrl+B — Toggle sidebar
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        toggleSidebar();
        return;
      }

      // Ctrl+Shift+T — Cycle theme
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        const next = theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system';
        setTheme(next);
        return;
      }

      // Ctrl+Shift+F — Toggle favorite for current tool
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'F' && activeToolId) {
        e.preventDefault();
        toggleFavorite(activeToolId);
        return;
      }

      // Escape — close any open overlay
      if (e.key === 'Escape') {
        if (commandPaletteOpen) closeCommandPalette();
        if (shortcutsOpen) setShortcutsOpen(false);
        return;
      }

      // ? — toggle shortcuts modal (only when not typing in an input)
      if (e.key === '?' && !isEditing && !commandPaletteOpen) {
        e.preventDefault();
        setShortcutsOpen((prev) => !prev);
        return;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    commandPaletteOpen, openCommandPalette, closeCommandPalette,
    toggleSidebar, setTheme, theme, shortcutsOpen, activeToolId, toggleFavorite,
  ]);

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <main
        id="main-content"
        className={cn(
          'flex-1 flex flex-col min-w-0 overflow-hidden',
          'transition-all duration-200'
        )}
      >
        {/* Skip-to-content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50
                     focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg"
        >
          Skip to content
        </a>

        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>

      {/* Command Palette — rendered at root so it overlays everything */}
      {commandPaletteOpen && <CommandPalette />}

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal open={shortcutsOpen} onClose={closeShortcuts} />
    </div>
  );
}
