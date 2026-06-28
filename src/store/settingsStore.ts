import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type Theme = 'light' | 'dark' | 'system';

interface SettingsState {
  theme: Theme;
  favorites: string[]; // Tool IDs
  recentTools: string[]; // Tool IDs, max 8, most recent first
  sidebarCollapsed: boolean;
}

interface SettingsActions {
  setTheme: (theme: Theme) => void;
  toggleFavorite: (toolId: string) => void;
  addRecentTool: (toolId: string) => void;
  clearRecentTools: () => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

// ─────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    (set, get) => ({
      // State
      theme: 'system',
      favorites: [],
      recentTools: [],
      sidebarCollapsed: false,

      // Actions
      setTheme: (theme) => set({ theme }),

      toggleFavorite: (toolId) => {
        const { favorites } = get();
        if (favorites.includes(toolId)) {
          set({ favorites: favorites.filter((id) => id !== toolId) });
        } else {
          set({ favorites: [...favorites, toolId] });
        }
      },

      addRecentTool: (toolId) => {
        const { recentTools } = get();
        const filtered = recentTools.filter((id) => id !== toolId);
        set({ recentTools: [toolId, ...filtered].slice(0, 8) });
      },

      clearRecentTools: () => set({ recentTools: [] }),

      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
    }),
    {
      name: 'localdevkit-settings',
      version: 1,
    }
  )
);
