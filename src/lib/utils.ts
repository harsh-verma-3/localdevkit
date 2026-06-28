import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes safely — resolves conflicts correctly */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Copy text to clipboard — returns true on success */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** Read text from clipboard — returns null if denied */
export async function readFromClipboard(): Promise<string | null> {
  try {
    return await navigator.clipboard.readText();
  } catch {
    return null;
  }
}

/** Download a string as a file */
export function downloadText(content: string, filename: string, mimeType = 'text/plain'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Download a data URL (e.g. canvas output) as a file */
export function downloadDataUrl(dataUrl: string, filename: string): void {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

/** Get the per-tool localStorage key for input history */
export function getToolHistoryKey(toolId: string): string {
  return `localdevkit-history-${toolId}`;
}

/** Persist tool input to localStorage */
export function saveToolInput(toolId: string, input: string): void {
  try {
    const key = getToolHistoryKey(toolId);
    localStorage.setItem(
      key,
      JSON.stringify({ input, lastEditedAt: new Date().toISOString() })
    );
  } catch {
    // localStorage may be unavailable (private browsing, full quota)
  }
}

/** Load the last tool input from localStorage */
export function loadToolInput(toolId: string): string {
  try {
    const key = getToolHistoryKey(toolId);
    const raw = localStorage.getItem(key);
    if (!raw) return '';
    const parsed = JSON.parse(raw) as { input: string };
    return parsed.input ?? '';
  } catch {
    return '';
  }
}

/** Detect OS — used for keyboard shortcut display */
export function isMac(): boolean {
  if (typeof window === 'undefined') return false;
  return /mac/i.test(navigator.platform);
}

/** Format a keyboard shortcut for display (mod → ⌘ on Mac, Ctrl on Windows) */
export function formatShortcut(shortcut: string): string {
  const modKey = isMac() ? '⌘' : 'Ctrl';
  return shortcut
    .replace('mod', modKey)
    .replace('shift', '⇧')
    .replace('alt', isMac() ? '⌥' : 'Alt')
    .replace('+', ' ');
}

/** Truncate a string to a max length with ellipsis */
export function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max) + '…';
}
