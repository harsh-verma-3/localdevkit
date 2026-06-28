import { describe, it, expect } from 'vitest';
import { formatJson } from './jsonFormatter.logic';

// ─── Happy Paths ──────────────────────────────────────────────────────────────

describe('formatJson() — pretty printing', () => {
  it('formats with 2-space indent', () => {
    const result = formatJson('{"a":1,"b":2}', false, 2);
    expect(result).toBe('{\n  "a": 1,\n  "b": 2\n}');
  });

  it('formats with 4-space indent', () => {
    const result = formatJson('{"a":1}', false, 4);
    expect(result).toBe('{\n    "a": 1\n}');
  });

  it('formats with tab indent', () => {
    const result = formatJson('{"a":1}', false, 'tab');
    expect(result).toContain('\t');
    expect(result).toContain('"a": 1');
  });

  it('formats an array of objects', () => {
    const input = '[{"id":1},{"id":2}]';
    const result = formatJson(input, false, 2);
    expect(result).toContain('[\n  {');
  });

  it('formats deeply nested JSON', () => {
    const nested = JSON.stringify(
      Array.from({ length: 10 }, (_, i) => ({ level: i, child: {} }))
    );
    expect(() => formatJson(nested, false, 2)).not.toThrow();
  });
});

describe('formatJson() — minify mode', () => {
  it('minifies JSON to a single line with no whitespace', () => {
    const input = '{\n  "a": 1,\n  "b": 2\n}';
    const result = formatJson(input, true, 2);
    expect(result).toBe('{"a":1,"b":2}');
  });

  it('minification is idempotent', () => {
    const input = '{"x":1}';
    expect(formatJson(input, true, 2)).toBe('{"x":1}');
  });
});

// ─── Edge Cases ───────────────────────────────────────────────────────────────

describe('formatJson() — edge cases', () => {
  it('formats an empty object', () => {
    expect(formatJson('{}', false, 2)).toBe('{}');
  });

  it('formats an empty array', () => {
    expect(formatJson('[]', false, 2)).toBe('[]');
  });

  it('formats a JSON number at root', () => {
    expect(formatJson('42', false, 2)).toBe('42');
  });

  it('formats JSON null', () => {
    expect(formatJson('null', false, 2)).toBe('null');
  });

  it('formats JSON boolean true', () => {
    expect(formatJson('true', false, 2)).toBe('true');
  });

  it('formats a JSON string at root', () => {
    expect(formatJson('"hello world"', false, 2)).toBe('"hello world"');
  });

  it('handles Unicode escape sequences', () => {
    const result = formatJson('{"emoji":"\\u2713"}', false, 2);
    expect(result).toContain('✓');
  });

  it('handles deeply nested JSON (50 levels) without stack overflow', () => {
    // Build {"a":{"a":...}} 50 levels deep
    let deep = '1';
    for (let i = 0; i < 50; i++) deep = `{"a":${deep}}`;
    expect(() => formatJson(deep, false, 2)).not.toThrow();
  });
});

// ─── Error Vectors ────────────────────────────────────────────────────────────

describe('formatJson() — error paths', () => {
  it('throws SyntaxError for trailing comma', () => {
    expect(() => formatJson('{"a":1,}', false, 2)).toThrow(SyntaxError);
  });

  it('throws SyntaxError for single-quoted strings', () => {
    expect(() => formatJson("{'a':1}", false, 2)).toThrow(SyntaxError);
  });

  it('throws SyntaxError for unquoted keys', () => {
    expect(() => formatJson('{a:1}', false, 2)).toThrow(SyntaxError);
  });

  it('throws SyntaxError for comments (JSON does not support them)', () => {
    expect(() => formatJson('{"a":1} // comment', false, 2)).toThrow(SyntaxError);
  });

  it('throws SyntaxError for completely empty string', () => {
    expect(() => formatJson('', false, 2)).toThrow(SyntaxError);
  });

  it('throws SyntaxError for plain text', () => {
    expect(() => formatJson('not json', false, 2)).toThrow(SyntaxError);
  });
});
