import type { ComponentType } from 'react';

// ─────────────────────────────────────────────
// Tool Categories
// ─────────────────────────────────────────────

export const ToolCategory = {
  ENCODING: 'encoding',
  DATA: 'data',
  GENERATORS: 'generators',
  TEXT: 'text',
  DATETIME: 'datetime',
  PREVIEW: 'preview',
  REFERENCE: 'reference',
} as const;

export type ToolCategoryValue = (typeof ToolCategory)[keyof typeof ToolCategory];

export const ToolCategoryLabels: Record<ToolCategoryValue, string> = {
  [ToolCategory.ENCODING]: 'Encoding & Decoding',
  [ToolCategory.DATA]: 'Data Transformation',
  [ToolCategory.GENERATORS]: 'Generators',
  [ToolCategory.TEXT]: 'Text Utilities',
  [ToolCategory.DATETIME]: 'Date & Time',
  [ToolCategory.PREVIEW]: 'Preview',
  [ToolCategory.REFERENCE]: 'Reference',
};

export const ToolCategoryIcons: Record<ToolCategoryValue, string> = {
  [ToolCategory.ENCODING]: 'lock-keyhole',
  [ToolCategory.DATA]: 'shuffle',
  [ToolCategory.GENERATORS]: 'sparkles',
  [ToolCategory.TEXT]: 'type',
  [ToolCategory.DATETIME]: 'clock',
  [ToolCategory.PREVIEW]: 'eye',
  [ToolCategory.REFERENCE]: 'book-open',
};

// ─────────────────────────────────────────────
// Tool Plugin Contract v1
// ─────────────────────────────────────────────

/**
 * ToolPluginV1 — The canonical plugin contract for all LocalDevKit tools.
 *
 * Every tool (first-party or future community) must satisfy this interface.
 * Do not add required fields without a deprecation cycle.
 * See PLUGIN_CONTRACT.md for full documentation.
 */
export interface ToolPluginV1 {
  /** Unique identifier, kebab-case. Used in the URL: /tools/{category}/{id} */
  id: string;

  /** Display name shown in the sidebar and command palette */
  name: string;

  /** Short description (1–2 sentences) shown in tool cards and meta description */
  description: string;

  /** Category this tool belongs to */
  category: ToolCategoryValue;

  /**
   * Keywords used by the command palette fuzzy search.
   * Include synonyms, alternate names, and common use cases.
   */
  keywords: string[];

  /** Lucide icon name (e.g. 'key', 'braces', 'shield') */
  icon: string;

  /**
   * The React component that renders the tool's full UI.
   * Must be dynamically imported at the tool page level — never inline here.
   */
  component: ComponentType;

  /** IDs of related tools to show at the bottom of the tool page */
  relatedTools?: string[];

  /**
   * Optional per-tool keyboard shortcut to activate the tool via command palette.
   * Format: 'mod+shift+j' (mod = Cmd on Mac, Ctrl on Windows/Linux)
   */
  shortcut?: string;

  /**
   * Whether this tool is considered stable.
   * Unstable tools are hidden by default but accessible via URL.
   * @default true
   */
  stable?: boolean;

  /**
   * Whether this tool is new (shows a 'New' badge in the sidebar).
   * @default false
   */
  isNew?: boolean;
}

// Convenience alias — pin to V1 as the current contract
export type ToolPlugin = ToolPluginV1;

// ─────────────────────────────────────────────
// Tool Runtime State (per-tool localStorage)
// ─────────────────────────────────────────────

export interface ToolHistory {
  toolId: string;
  input: string;
  /** ISO timestamp of last edit */
  lastEditedAt: string;
}
