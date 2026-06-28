import { create } from 'zustand';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface UiState {
  commandPaletteOpen: boolean;
  commandPaletteQuery: string;
  activeToolId: string | null;
  mobileMenuOpen: boolean;
}

interface UiActions {
  openCommandPalette: (initialQuery?: string) => void;
  closeCommandPalette: () => void;
  setCommandPaletteQuery: (query: string) => void;
  setActiveToolId: (id: string | null) => void;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
}

// ─────────────────────────────────────────────
// Store (not persisted — ephemeral UI state)
// ─────────────────────────────────────────────

export const useUiStore = create<UiState & UiActions>()((set) => ({
  // State
  commandPaletteOpen: false,
  commandPaletteQuery: '',
  activeToolId: null,
  mobileMenuOpen: false,

  // Actions
  openCommandPalette: (initialQuery = '') =>
    set({ commandPaletteOpen: true, commandPaletteQuery: initialQuery }),

  closeCommandPalette: () =>
    set({ commandPaletteOpen: false, commandPaletteQuery: '' }),

  setCommandPaletteQuery: (query) => set({ commandPaletteQuery: query }),

  setActiveToolId: (id) => set({ activeToolId: id }),

  toggleMobileMenu: () => set((s) => ({ mobileMenuOpen: !s.mobileMenuOpen })),

  closeMobileMenu: () => set({ mobileMenuOpen: false }),
}));
