# Plugin Contract — ToolPluginV1

This document defines the contract every tool must implement to integrate with LocalDevKit.  
The TypeScript source of truth is [`src/core/types/plugin.ts`](src/core/types/plugin.ts).

---

## Interface

```typescript
interface ToolPluginV1 {
  /** Unique kebab-case identifier, must be stable — used in URLs and localStorage */
  id: string;

  /** Display name shown in the sidebar and dashboard */
  name: string;

  /** Short description for dashboard cards and SEO meta description */
  description: string;

  /** Category — must be one of the ToolCategory enum values */
  category: ToolCategoryValue;

  /**
   * Keywords for command palette search and SEO.
   * Use lowercase, include synonyms users might search for.
   */
  keywords: string[];

  /**
   * Dynamic import returning the default-exported React component.
   * Must be lazy — never statically imported. This is critical for
   * code-splitting so tool bundles don't inflate the initial JS payload.
   */
  component: () => Promise<{ default: React.ComponentType }>;

  /** Mark as true during initial rollout — shows a "New" badge in the sidebar */
  isNew?: boolean;

  /** Short human-readable version string (e.g. "1.0.0") */
  version?: string;
}
```

---

## Categories

```typescript
const ToolCategory = {
  ENCODING:   'encoding',   // Base64, URL, JWT, HTML entities
  DATA:       'data',       // JSON, YAML, CSV
  GENERATORS: 'generators', // UUID, password, hash, QR
  TEXT:       'text',       // Regex, case, diff, word count
  DATETIME:   'datetime',   // Timestamp converter
  PREVIEW:    'preview',    // Markdown preview
  REFERENCE:  'reference',  // HTTP status codes
} as const;
```

---

## Rules

### 1. Stable IDs
The `id` is used in:
- URL: `/tools/{category}/{id}`
- `localStorage` keys: `localdevkit-history-{id}`
- Favorites list in Zustand store

**Never rename or delete an `id` once shipped.** Use a redirect if you must move a tool.

### 2. Lazy components
Always use dynamic imports:

```typescript
// ✅ Correct
component: () => import('@/tools/data/json-formatter/JsonFormatterTool'),

// ❌ Wrong — this defeats code splitting
import JsonFormatterTool from '@/tools/data/json-formatter/JsonFormatterTool';
component: async () => ({ default: JsonFormatterTool }),
```

### 3. No network calls
Tool components must **never** make network requests. All processing must happen:
- In the browser (JS, WebAssembly)
- Using browser APIs (`crypto.subtle`, `crypto.randomUUID`, `DOMParser`, etc.)
- Using bundled libraries (js-yaml, papaparse, qrcode, marked, etc.)

### 4. localStorage persistence
Use `saveToolInput(toolId, value)` / `loadToolInput(toolId)` from `@/lib/utils` to persist the user's last input across page refreshes. Pass the tool's `id` as the key.

### 5. Privacy badge
The `ToolLayout` wrapper automatically shows a privacy shield badge — don't add your own.

### 6. Accessibility
- Provide `aria-label` on all interactive elements
- Use `role="alert"` for error messages
- Use `aria-live="polite"` for live output updates

---

## Example Registration

```typescript
// src/core/registry.ts

{
  id: 'my-new-tool',
  name: 'My New Tool',
  description: 'Does something useful in the browser.',
  category: ToolCategory.GENERATORS,
  keywords: ['my', 'new', 'tool', 'useful'],
  component: () => import('@/tools/generators/my-new-tool/MyNewToolTool'),
  isNew: true,
  version: '1.0.0',
},
```

---

## Tool Component Guidelines

### Props
Tools receive no props. All state is self-contained within the component. Use `useState` / `useCallback` / `useMemo`.

### Layout
Use the two-panel layout pattern:
```tsx
<div className="flex flex-col gap-4 h-full">
  {/* Toolbar */}
  <div className="flex items-center gap-2">...</div>
  
  {/* Panels */}
  <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-4">
    <div className="tool-panel">
      <div className="tool-panel-header">...</div>
      <div className="tool-panel-body">...</div>
    </div>
    <div className="tool-panel">...</div>
  </div>
</div>
```

The `tool-panel`, `tool-panel-header`, `tool-panel-body`, `tool-textarea` CSS classes are defined in `globals.css`.

### Error States
Always handle and display errors inline:
```tsx
{error && (
  <div role="alert" className="p-4">
    <div className="flex items-start gap-2 p-3 rounded-lg bg-error/10 border border-error/25 text-error">
      {/* ... */}
    </div>
  </div>
)}
```

### Empty States
Show a centered placeholder when there's no input/output yet.
