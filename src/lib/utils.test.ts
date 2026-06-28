import { describe, it, expect } from 'vitest';
import { cn, getToolHistoryKey, truncate, formatShortcut, isMac } from '@/lib/utils';

// ─── cn() ────────────────────────────────────────────────────────────────────

describe('cn()', () => {
  it('merges simple class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('ignores falsy values (undefined, false, null, 0)', () => {
    expect(cn('foo', undefined, false, null as unknown as string, 0 as unknown as string)).toBe('foo');
  });

  it('resolves Tailwind conflicts — last class wins', () => {
    const result = cn('p-4', 'p-2');
    expect(result).toBe('p-2');
  });

  it('handles conditional object syntax', () => {
    expect(cn({ 'text-red-500': true, 'text-blue-500': false })).toBe('text-red-500');
  });

  it('returns empty string when all inputs are falsy', () => {
    expect(cn(false, undefined)).toBe('');
  });

  it('handles array inputs', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar');
  });
});

// ─── getToolHistoryKey() ──────────────────────────────────────────────────────

describe('getToolHistoryKey()', () => {
  it('returns the expected key format', () => {
    expect(getToolHistoryKey('json-formatter')).toBe('localdevkit-history-json-formatter');
  });

  it('works with single-word IDs', () => {
    expect(getToolHistoryKey('base64')).toBe('localdevkit-history-base64');
  });

  it('works with empty string ID', () => {
    expect(getToolHistoryKey('')).toBe('localdevkit-history-');
  });
});

// ─── truncate() ───────────────────────────────────────────────────────────────

describe('truncate()', () => {
  it('truncates a long string and appends ellipsis', () => {
    expect(truncate('hello world', 5)).toBe('hello…');
  });

  it('returns the string as-is when it does not exceed max', () => {
    expect(truncate('hi', 10)).toBe('hi');
  });

  it('returns the string as-is when length equals max', () => {
    expect(truncate('hello', 5)).toBe('hello');
  });

  it('handles empty string', () => {
    expect(truncate('', 5)).toBe('');
  });

  it('truncates unicode correctly (character, not byte, length)', () => {
    // Each emoji is 2 code units in JS — truncate operates on .length not bytes
    const result = truncate('ab', 1);
    expect(result).toBe('a…');
  });

  it('handles max = 0', () => {
    expect(truncate('hello', 0)).toBe('…');
  });
});

// ─── formatShortcut() ─────────────────────────────────────────────────────────

describe('formatShortcut()', () => {
  // isMac() checks navigator.platform — jsdom default is '' (falsy /mac/ test)
  it('replaces mod with Ctrl on non-Mac', () => {
    const result = formatShortcut('mod+k');
    // On jsdom (navigator.platform = ''), isMac() returns false
    expect(result).toContain('Ctrl');
  });

  it('replaces shift with ⇧', () => {
    const result = formatShortcut('mod+shift+k');
    expect(result).toContain('⇧');
  });

  it('replaces alt with Alt on non-Mac', () => {
    const result = formatShortcut('mod+alt+k');
    expect(result).toContain('Alt');
  });

  it('replaces + separator with space', () => {
    const result = formatShortcut('mod+k');
    expect(result).not.toContain('+');
  });
});

// ─── isMac() ─────────────────────────────────────────────────────────────────

describe('isMac()', () => {
  it('returns false in jsdom where navigator.platform is empty', () => {
    // jsdom sets navigator.platform to '' by default
    expect(isMac()).toBe(false);
  });
});

// ─── copyToClipboard() & readFromClipboard() ─────────────────────────────────

import { copyToClipboard, readFromClipboard } from '@/lib/utils';

describe('copyToClipboard()', () => {
  it('returns true when clipboard.writeText resolves', async () => {
    const mockWrite = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', {
      ...navigator,
      clipboard: { writeText: mockWrite, readText: vi.fn() },
    });
    expect(await copyToClipboard('hello')).toBe(true);
    expect(mockWrite).toHaveBeenCalledWith('hello');
    vi.unstubAllGlobals();
  });

  it('returns false when clipboard.writeText rejects', async () => {
    vi.stubGlobal('navigator', {
      ...navigator,
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error('denied')), readText: vi.fn() },
    });
    expect(await copyToClipboard('hello')).toBe(false);
    vi.unstubAllGlobals();
  });
});

describe('readFromClipboard()', () => {
  it('returns the clipboard text on success', async () => {
    vi.stubGlobal('navigator', {
      ...navigator,
      clipboard: { readText: vi.fn().mockResolvedValue('clipboard content'), writeText: vi.fn() },
    });
    expect(await readFromClipboard()).toBe('clipboard content');
    vi.unstubAllGlobals();
  });

  it('returns null when clipboard read is denied', async () => {
    vi.stubGlobal('navigator', {
      ...navigator,
      clipboard: { readText: vi.fn().mockRejectedValue(new Error('denied')), writeText: vi.fn() },
    });
    expect(await readFromClipboard()).toBeNull();
    vi.unstubAllGlobals();
  });
});

// ─── saveToolInput() / loadToolInput() ───────────────────────────────────────

import { saveToolInput, loadToolInput } from '@/lib/utils';

describe('saveToolInput() + loadToolInput()', () => {
  beforeEach(() => localStorage.clear());

  it('saves and loads the correct input', () => {
    saveToolInput('my-tool', 'hello world');
    expect(loadToolInput('my-tool')).toBe('hello world');
  });

  it('persists an ISO timestamp in the stored value', () => {
    saveToolInput('ts-tool', 'test');
    const raw = localStorage.getItem('localdevkit-history-ts-tool')!;
    const parsed = JSON.parse(raw) as { lastEditedAt: string };
    expect(new Date(parsed.lastEditedAt).toISOString()).toBe(parsed.lastEditedAt);
  });

  it('returns empty string when key is not present', () => {
    expect(loadToolInput('nonexistent')).toBe('');
  });

  it('returns empty string when localStorage contains malformed JSON', () => {
    localStorage.setItem('localdevkit-history-bad', 'not-json{');
    expect(loadToolInput('bad')).toBe('');
  });

  it('saves an empty string and loads it back correctly', () => {
    saveToolInput('empty-tool', '');
    expect(loadToolInput('empty-tool')).toBe('');
  });
});

// ─── downloadText() ───────────────────────────────────────────────────────────

import { downloadText } from '@/lib/utils';

describe('downloadText()', () => {
  it('creates an anchor, sets href and download, and calls click()', () => {
    const clickSpy = vi.fn();
    const mockAnchor = { href: '', download: '', click: clickSpy } as unknown as HTMLAnchorElement;
    vi.spyOn(document, 'createElement').mockReturnValueOnce(mockAnchor);

    const revokeObjectURL = vi.fn();
    const createObjectURL = vi.fn().mockReturnValue('blob:fake-url');
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL });

    downloadText('content', 'file.txt', 'text/plain');

    expect(mockAnchor.download).toBe('file.txt');
    expect(mockAnchor.href).toBe('blob:fake-url');
    expect(clickSpy).toHaveBeenCalledOnce();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:fake-url');

    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });
});
