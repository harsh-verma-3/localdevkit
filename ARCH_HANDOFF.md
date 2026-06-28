# ARCH_HANDOFF.md — LocalDevKit Architecture Handoff

> **Status:** MVP Complete — 18 tools, all phases done, dev server running on `pnpm dev`  
> **Purpose:** Complete architectural reference for testing, debugging, or picking up the codebase cold.  
> **Last updated:** 2026-06-27

---

## 1. Stack & Runtime

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 15.3.4 (App Router) | **Not Turbopack** — `pnpm dev` uses the standard webpack compiler; `pnpm dev --turbopack` uses Turbopack |
| Language | TypeScript 5.9, `strict: true` | `tsconfig.json` — no `any` allowed |
| Package manager | pnpm | lockfile is `pnpm-lock.yaml` |
| Styling | Tailwind CSS 3.4 | Config: `tailwind.config.js` |
| Typography plugin | `@tailwindcss/typography` | Required by Markdown Preview's `.prose` classes |
| State management | Zustand 5 | Two stores — see Section 4 |
| React version | 18.3.1 | Not React 19; `use client` required for all hooks |

### Key Scripts

```bash
pnpm dev          # Start development server (http://localhost:3000)
pnpm dev --turbopack  # Dev with Turbopack (faster, but slightly different error output)
pnpm build        # Production build (also runs type-check)
pnpm lint         # ESLint
pnpm format       # Prettier
```

---

## 2. Directory Structure

```
src/
├── app/
│   ├── layout.tsx               # Root layout — ThemeProvider + AppShell wrapper, anti-flash script
│   ├── globals.css              # Design tokens (CSS custom properties) + Tailwind layers
│   ├── page.tsx                 # Dashboard — recent tools, favorites, all-tools grid
│   ├── not-found.tsx            # Custom 404 page
│   ├── sitemap.ts               # Auto-generated from registry (XML sitemap)
│   ├── ThemeProvider.tsx        # Client component: applies dark/light class to <html>
│   └── tools/[category]/[id]/
│       ├── page.tsx             # Server Component — async params (Next.js 15 requirement)
│       └── ToolPageClient.tsx   # Client Component — renders ToolLayout + lazy tool via Suspense
│
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx         # Global keyboard shortcut layer + sidebar + modals
│   │   ├── Sidebar.tsx          # Navigation: categories, favorites, search trigger, theme toggle
│   │   ├── ToolLayout.tsx       # Per-tool wrapper: header, privacy badge, favorites, related tools
│   │   ├── CommandPalette.tsx   # ⌘K overlay: fuzzy search, keyboard nav (↑↓ Enter Esc)
│   │   └── KeyboardShortcutsModal.tsx  # "?" overlay: grouped shortcut reference
│   └── ui/
│       ├── Badge.tsx            # Variants: "new", "hot" — used in sidebar + tool header
│       ├── Button.tsx           # Primary/secondary/ghost/destructive variants
│       └── CopyButton.tsx       # Click-to-copy with ✓ flash feedback (1.5s)
│
├── core/
│   ├── types/plugin.ts          # ToolPluginV1 interface + ToolCategory enum + labels/icons
│   └── registry.ts              # ALL 18 tools registered here — single source of truth
│
├── store/
│   ├── settingsStore.ts         # Persisted to localStorage — theme, favorites, recentTools, sidebar
│   └── uiStore.ts               # Ephemeral — commandPaletteOpen, activeToolId, mobileMenuOpen
│
├── tools/                       # One subdirectory per tool
│   ├── data/                    # json-formatter, yaml-json, csv-json
│   ├── datetime/                # timestamp-converter
│   ├── encoding/                # base64, url-encode, jwt-decoder, html-entities
│   ├── generators/              # uuid-generator, password-generator, hash-generator, qr-generator
│   ├── preview/                 # markdown-preview
│   ├── reference/               # http-status
│   └── text/                    # regex-tester, case-converter, diff-viewer, word-counter
│
└── lib/
    └── utils.ts                 # cn(), copyToClipboard(), downloadText(), saveToolInput(), loadToolInput(), isMac(), formatShortcut()

public/
├── manifest.json                # PWA manifest
├── robots.txt                   # Allow all, points to /sitemap.xml
└── icons/
    ├── icon-192.png             # PWA icon
    └── icon-512.png             # PWA icon (larger)
```

---

## 3. Tool Registry — The Single Source of Truth

**File:** [`src/core/registry.ts`](src/core/registry.ts)

Every tool is registered here as a `ToolPluginV1` object. The registry drives:
- URL routing (`/tools/{category}/{id}`)
- Sidebar navigation
- Command palette search
- Dashboard cards
- Related tools section
- `sitemap.ts` (SEO)
- Per-tool SSG metadata (`generateMetadata`)

### `ToolPluginV1` Interface

```typescript
interface ToolPluginV1 {
  id: string;              // Kebab-case, used in URL. NEVER rename after shipping.
  name: string;            // Display name
  description: string;     // 1–2 sentences, used in cards and meta description
  category: ToolCategoryValue; // One of 7 categories
  keywords: string[];      // Fuzzy search terms (include synonyms!)
  icon: string;            // Lucide icon name — currently used as data only, not rendered
  component: ComponentType; // From next/dynamic() — MUST be lazy, no static import
  relatedTools?: string[]; // IDs of related tools shown in footer
  shortcut?: string;       // 'mod+shift+j' format (optional per-tool shortcut)
  stable?: boolean;        // false = hidden from lists but URL-accessible
  isNew?: boolean;         // Shows "New" badge in sidebar
}
```

### Tool Categories

```typescript
const ToolCategory = {
  ENCODING:   'encoding',   // URL path segment AND Zustand filter key
  DATA:       'data',
  GENERATORS: 'generators',
  TEXT:       'text',
  DATETIME:   'datetime',
  PREVIEW:    'preview',
  REFERENCE:  'reference',
} as const;
```

### Registry Accessor Functions

```typescript
getAllTools()           // Returns stable tools only (stable !== false)
getToolById(id)        // Used by ToolPageClient and generateMetadata
getToolsByCategory(cat) // Used by Sidebar to render category sections
getRelatedTools(id)    // Used by ToolLayout footer
searchTools(query)     // Full-text search across name + description + keywords
```

### Adding a New Tool (Checklist)

1. Create `src/tools/{category}/{id}/{Name}Tool.tsx`
2. Add entry to `registry.ts` using `next/dynamic(() => import(...))`
3. Done — sidebar, search, SEO, sitemap, dashboard all update automatically

> ⚠️ **Never statically import** a tool component into registry.ts. The `component` field must always be the result of `dynamic()` or a lazy factory for code-splitting.

---

## 4. Zustand State Architecture

### Store 1 — `settingsStore` (Persisted)

**File:** [`src/store/settingsStore.ts`](src/store/settingsStore.ts)  
**localStorage key:** `localdevkit-settings` (Zustand persist middleware, version 1)

```typescript
interface SettingsState {
  theme: 'light' | 'dark' | 'system';  // Default: 'system'
  favorites: string[];                  // Tool IDs, no max limit
  recentTools: string[];               // Tool IDs, most recent first, max 8
  sidebarCollapsed: boolean;            // Default: false
}

interface SettingsActions {
  setTheme(theme: Theme): void;
  toggleFavorite(toolId: string): void;    // Adds if absent, removes if present
  addRecentTool(toolId: string): void;     // Deduplicates, prepends, trims to 8
  clearRecentTools(): void;
  toggleSidebar(): void;
  setSidebarCollapsed(collapsed: boolean): void;
}
```

**Serialized localStorage shape:**
```json
{
  "state": {
    "theme": "dark",
    "favorites": ["json-formatter", "uuid-generator"],
    "recentTools": ["markdown-preview", "base64", "jwt-decoder"],
    "sidebarCollapsed": false
  },
  "version": 1
}
```

### Store 2 — `uiStore` (Ephemeral, NOT persisted)

**File:** [`src/store/uiStore.ts`](src/store/uiStore.ts)  
Resets on every page reload.

```typescript
interface UiState {
  commandPaletteOpen: boolean;   // Default: false
  commandPaletteQuery: string;   // Default: ''
  activeToolId: string | null;   // Set by ToolLayout.useEffect; null on dashboard
  mobileMenuOpen: boolean;       // Default: false (mobile menu not yet wired to UI)
}

interface UiActions {
  openCommandPalette(initialQuery?: string): void;
  closeCommandPalette(): void;   // Also resets commandPaletteQuery to ''
  setCommandPaletteQuery(query: string): void;
  setActiveToolId(id: string | null): void;
  toggleMobileMenu(): void;
  closeMobileMenu(): void;
}
```

> `activeToolId` is used by `AppShell` for `Ctrl+Shift+F` (toggle favorite for the current tool) and could be used by per-tool shortcut layers.

---

## 5. Theme System

### Anti-Flash Strategy (Critical)

The root `layout.tsx` injects an **inline `<script>`** in `<head>` that runs before React hydrates:

```javascript
(function() {
  try {
    var stored = JSON.parse(localStorage.getItem('localdevkit-settings') || '{}');
    var theme = (stored.state && stored.state.theme) || 'system';
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }
  } catch(e) {}
})();
```

- `<html>` has `suppressHydrationWarning` to prevent React warning about the class mismatch
- `ThemeProvider` (client component) then takes over and listens for system media query changes

### Theme Toggle

- **UI:** Button in Sidebar footer cycles `system → light → dark → system`
- **Shortcut:** `Ctrl+Shift+T` from anywhere
- **Icons:** Monitor (system), Sun (light), Moon (dark)
- **CSS class:** `.dark` on `<html>` (Tailwind `darkMode: 'class'`)

---

## 6. CSS Design Token System

**File:** [`src/app/globals.css`](src/app/globals.css)

All color tokens are HSL **channels only** (no `hsl()` wrapper), so Tailwind can inject opacity modifiers:

```css
/* Usage in Tailwind: bg-primary/10, text-primary/50, border-error/25 */
--color-primary: 246 80% 60%;   /* Tailwind reads as hsl(246 80% 60% / <alpha>) */
```

### Token Reference

| Token | Light | Dark | Use |
|---|---|---|---|
| `--color-background` | `220 20% 97%` | `222 47% 7%` | Page background |
| `--color-surface` | `0 0% 100%` | `222 47% 10%` | Cards, panels |
| `--color-surface-elevated` | `220 20% 99%` | `222 47% 13%` | Headers, dropdowns |
| `--color-border` | `220 13% 88%` | `222 25% 22%` | Panel borders |
| `--color-border-subtle` | `220 13% 93%` | `222 25% 17%` | Separator lines |
| `--color-primary` | `246 80% 60%` | `246 80% 68%` | Purple-indigo |
| `--color-accent` | `196 90% 48%` | `196 90% 55%` | Cyan |
| `--color-foreground` | `222 47% 11%` | `210 40% 96%` | Body text |
| `--color-foreground-muted` | `215 25% 40%` | `215 20% 65%` | Secondary text |
| `--color-foreground-subtle` | `215 15% 62%` | `215 15% 45%` | Captions, hints |
| `--color-success` | `142 71% 35%` | `142 70% 45%` | Green |
| `--color-warning` | `38 95% 48%` | `38 95% 58%` | Amber/yellow |
| `--color-error` | `0 84% 55%` | `0 84% 62%` | Red |

### Layout Dimensions

```css
--sidebar-width: 260px;
--sidebar-collapsed-width: 68px;
--header-height: 56px;
```

### Tailwind Component Classes (from `@layer components`)

| Class | Purpose |
|---|---|
| `.tool-panel` | Flex column, full-height, bg-surface, border, rounded-lg |
| `.tool-panel-header` | Row, space-between, border-bottom, bg-surface-elevated |
| `.tool-panel-label` | Uppercase tracking, text-foreground-subtle |
| `.tool-panel-body` | flex-1, min-h-0, overflow-auto |
| `.tool-textarea` | Full size, monospace, transparent bg, no resize, p-4 |
| `.privacy-badge` | Green pill — shield icon + "Local only" |
| `.status-badge` | Base pill class |
| `.status-badge-success/error/warning` | Colored pill variants |
| `.sidebar-item` | Row, gap-2.5, rounded-md, hover:bg-surface-elevated |
| `.sidebar-item-active` | bg-primary/10, text-primary |
| `.gradient-text` | Primary → accent horizontal gradient |

### Tailwind Utility Classes

| Class | Purpose |
|---|---|
| `.glass` | bg-surface/80 + backdrop-blur-md + border |
| `.no-scrollbar` | Hides scrollbar (webkit + standard) |

---

## 7. Routing Architecture

### Route Structure

```
/                                    → app/page.tsx (Dashboard)
/tools/[category]/[id]               → app/tools/[category]/[id]/page.tsx (Server Component)
                                       └─ ToolPageClient.tsx (Client Component)
                                          └─ ToolLayout + <Suspense> + dynamic tool component
/sitemap.xml                         → app/sitemap.ts (auto-generated)
/robots.txt                          → public/robots.txt (static)
```

### Next.js 15 Params — Critical Pattern

In Next.js 15, dynamic route params are a **Promise** and must be awaited:

```typescript
// page.tsx — correct pattern
interface ToolPageProps {
  params: Promise<{ category: string; id: string }>;
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { id, category } = await params;  // ← MUST await
  const tool = getToolById(id);
  if (!tool || tool.category !== category) notFound();
  return <ToolPageClient toolId={tool.id} />;
}
```

> ⚠️ Using `params.id` without `await` causes a runtime warning: _"Route used params.id. params should be awaited before using its properties."_

### Static Generation

`generateStaticParams()` in `page.tsx` pre-renders all 18 tool pages at build time (SSG). At runtime, these are served as static HTML with client hydration only for the interactive parts.

---

## 8. Global Keyboard Shortcut Layer

**File:** [`src/components/layout/AppShell.tsx`](src/components/layout/AppShell.tsx)

All global shortcuts are registered in a single `useEffect` with a `keydown` listener. Shortcuts are **guarded** against firing when the user is typing in an input/textarea/contentEditable.

| Shortcut | Action | Guard |
|---|---|---|
| `Ctrl+K` / `⌘K` | Toggle command palette | None |
| `Ctrl+B` | Toggle sidebar | None |
| `Ctrl+Shift+T` | Cycle theme | None |
| `Ctrl+Shift+F` | Toggle favorite for active tool | `activeToolId !== null` |
| `Escape` | Close any open overlay | None |
| `?` | Toggle keyboard shortcuts modal | `!isEditing` |

**isEditing guard:**
```typescript
const isEditing =
  active instanceof HTMLInputElement ||
  active instanceof HTMLTextAreaElement ||
  (active instanceof HTMLElement && active.isContentEditable);
```

---

## 9. Tool Component Patterns

### Standard Tool Structure

Every tool is a self-contained client component with no props:

```tsx
'use client';

import { useState, useMemo } from 'react';
import { CopyButton } from '@/components/ui/CopyButton';
import { saveToolInput, loadToolInput } from '@/lib/utils';

export default function MyTool() {
  const [input, setInput] = useState(() => loadToolInput('my-tool-id'));

  // ✅ CORRECT: Use useMemo for synchronous derived output — no setState during render
  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: '', error: '' };
    try {
      return { output: transform(input), error: '' };
    } catch (e) {
      return { output: '', error: (e as Error).message };
    }
  }, [input]);

  function handleChange(value: string) {
    setInput(value);
    saveToolInput('my-tool-id', value);  // localStorage persistence
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Toolbar row */}
      <div className="flex items-center gap-2">...</div>

      {/* Two-panel layout */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="tool-panel">
          <div className="tool-panel-header">
            <span className="tool-panel-label">Input</span>
          </div>
          <div className="tool-panel-body">
            <textarea className="tool-textarea" value={input}
              onChange={(e) => handleChange(e.target.value)} aria-label="Input" />
          </div>
        </div>

        <div className="tool-panel">
          <div className="tool-panel-header">
            <span className="tool-panel-label">Output</span>
            {output && <CopyButton value={output} />}
          </div>
          <div className="tool-panel-body">
            {error ? (
              <div role="alert" className="p-4 text-sm text-error">{error}</div>
            ) : output ? (
              <pre className="tool-textarea whitespace-pre-wrap">{output}</pre>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-foreground-subtle">
                Output will appear here
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

### localStorage Persistence

- **Key format:** `localdevkit-history-{toolId}` (from `getToolHistoryKey()` in utils.ts)
- **Stored shape:** `{ input: string, lastEditedAt: ISO string }`
- **Load on mount:** `useState(() => loadToolInput('tool-id'))` — lazy initializer to avoid SSR mismatch
- **Save on change:** Call `saveToolInput('tool-id', value)` in every input handler

---

## 10. Bugs Resolved During Development

### Bug 1 — CSS `@import` Must Precede All Rules

**Symptom:** Turbopack compile error — `@import rules must precede all rules aside from @charset and @layer statements`

**Root Cause:** The Google Fonts `@import` was placed after `@tailwind base/components/utilities` directives.

**Fix:** `@import` must be the **very first line** of `globals.css`, before `@tailwind` directives.

```css
/* ✅ Correct order */
@import url('https://fonts.googleapis.com/...');
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

### Bug 2 — "Too Many Re-Renders" in UrlEncodeTool

**Symptom:** React fatal — _"Too many re-renders. React limits the number of renders to prevent an infinite loop."_ on `/tools/encoding/url-encode`.

**Root Cause:** Calling `setError('')` inside an IIFE that ran **directly in the component render body** (not inside `useEffect`, `useMemo`, or an event handler). This triggered a state update during render → re-render → `setError` again → infinite loop.

```typescript
// ❌ BROKEN — setState called during render
const output = (() => {
  setError('');          // ← This is a state update DURING render
  return getOutput(input, mode);
})();
```

**Fix:** Replaced with `useMemo` — output and error are derived values, not state:

```typescript
// ✅ CORRECT — useMemo, no setState during render
const { output, error } = useMemo(() => {
  if (!input.trim()) return { output: '', error: '' };
  try {
    return { output: encodeURIComponent(input), error: '' };
  } catch {
    return { output: '', error: 'Encoding failed' };
  }
}, [input, mode]);
```

**Audit note:** The IIFE pattern exists in `HtmlEntitiesToolLazy.tsx` as well, but it is **harmless there** because no `setState` calls exist inside that IIFE — it only reads state and computes a value.

---

### Bug 3 — Next.js 15 Async Params

**Symptom:** Warning — _"Route '/tools/[category]/[id]' used params.id. params should be awaited before using its properties."_

**Root Cause:** In Next.js 15, `params` is a Promise. The page component was accessing `params.id` directly (synchronously), which triggers the warning and incorrect behavior.

**Fix:** Page function must be `async` and `params` must be awaited:

```typescript
// ❌ Old (Next.js 14 style)
export default function ToolPage({ params }: { params: { id: string } }) {
  const tool = getToolById(params.id);
  ...
}

// ✅ Fixed (Next.js 15 style)
export default async function ToolPage({ params }: { params: Promise<{ category: string; id: string }> }) {
  const { id, category } = await params;
  const tool = getToolById(id);
  ...
}
```

---

### Decision: No SSR for Tool Components

Tool components are **pure client components** loaded via `next/dynamic`. This was an intentional decision because:

1. All tools use browser-only APIs (`crypto.subtle`, `DOMParser`, `canvas`, `FileReader`)
2. SSR would require duplicating or mocking these APIs server-side
3. The `Suspense` fallback (spinner) provides a good loading UX without SSR

The page shell (`layout.tsx`, `ToolLayout`) renders on the server; only the tool component itself is deferred to the client.

---

### Decision: No Turbopack for Production Dev

`pnpm dev` uses standard Next.js (webpack) compiler. `pnpm dev --turbopack` is available but was used only for quick startup checks. The standard compiler was used throughout development for consistency with `pnpm build`.

---

## 11. Security Headers

All responses include these headers (configured in `next.config.js`):

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

`poweredByHeader: false` removes the `X-Powered-By: Next.js` response header.

---

## 12. PWA Configuration

**File:** `public/manifest.json`

```json
{
  "name": "LocalDevKit",
  "short_name": "DevUtil",
  "display": "standalone",
  "start_url": "/",
  "theme_color": "#7c3aed",
  "background_color": "#0d1117",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

The manifest is linked via `metadata.manifest` in `layout.tsx`. No service worker is registered yet (offline caching deferred to v1.1 — add `@serwist/next` or `next-pwa`).

---

## 13. Deferred / Future Work

These items are **not implemented** in the current MVP — documented to avoid rediscovery:

| Item | Status | Notes |
|---|---|---|
| Service Worker / Offline | Deferred (v1.1) | Add `@serwist/next` for offline support |
| `next-intl` i18n | Deferred (v1.1) | Infrastructure in package.json, no messages/ directory yet |
| Image tools | Deferred (v2.0) | Requires WebAssembly (Sharp/libvips) or canvas processing |
| PDF tools | Deferred (v2.0) | `pdf-lib` or similar — large bundle |
| XML Formatter | Next priority (v1.1) | Straightforward DOM-based implementation |
| Community Plugin System | Deferred (v2.0) | `ToolPluginV1` contract is ready; loader not wired |
| Lighthouse audit | Pre-deploy | Run against prod build before first deployment |
| TWA / Play Store | Post-deploy | Bubblewrap CLI wraps the deployed PWA |

Full details in [`FUTURE.md`](FUTURE.md).

---

## 14. File Quick-Reference

| Purpose | File |
|---|---|
| Plugin contract | `src/core/types/plugin.ts` |
| Tool registry | `src/core/registry.ts` |
| Persisted state | `src/store/settingsStore.ts` |
| Ephemeral UI state | `src/store/uiStore.ts` |
| Design tokens | `src/app/globals.css` |
| Tailwind config | `tailwind.config.js` |
| Root layout + anti-flash | `src/app/layout.tsx` |
| Theme logic | `src/app/ThemeProvider.tsx` |
| Keyboard shortcuts | `src/components/layout/AppShell.tsx` |
| Tool page shell | `src/components/layout/ToolLayout.tsx` |
| Command palette | `src/components/layout/CommandPalette.tsx` |
| Shortcuts modal | `src/components/layout/KeyboardShortcutsModal.tsx` |
| Shared utilities | `src/lib/utils.ts` |
| Security headers | `next.config.js` |
| SEO sitemap | `src/app/sitemap.ts` |
| PWA manifest | `public/manifest.json` |
| SEO robots | `public/robots.txt` |
