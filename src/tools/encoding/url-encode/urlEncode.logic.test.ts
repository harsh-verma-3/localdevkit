import { describe, it, expect } from 'vitest';
import { urlEncode, urlDecode } from './urlEncode.logic';

// ─── urlEncode() ──────────────────────────────────────────────────────────────

describe('urlEncode()', () => {
  it('encodes spaces as %20', () => {
    expect(urlEncode('hello world')).toBe('hello%20world');
  });

  it('encodes a full URL including special chars', () => {
    const result = urlEncode('https://example.com/path?q=foo&bar=1');
    expect(result).toContain('%3A%2F%2F');   // "://"
    expect(result).toContain('%3F');          // "?"
    expect(result).toContain('%3D');          // "="
    expect(result).toContain('%26');          // "&"
  });

  it('does not encode unreserved chars (letters, digits, -, _, ., ~)', () => {
    expect(urlEncode('abc-123_test.value~')).toBe('abc-123_test.value~');
  });

  it('encodes Unicode characters', () => {
    expect(urlEncode('✓')).toBe('%E2%9C%93');
  });

  it('encodes empty string to empty string', () => {
    expect(urlEncode('')).toBe('');
  });

  it('encodes a string of only spaces', () => {
    expect(urlEncode('   ')).toBe('%20%20%20');
  });

  it('double-encoding an already-encoded string produces double-encoded output', () => {
    const once = urlEncode('hello world');   // 'hello%20world'
    const twice = urlEncode(once);           // 'hello%2520world'
    expect(twice).toContain('%2520');
  });
});

// ─── urlDecode() ──────────────────────────────────────────────────────────────

describe('urlDecode()', () => {
  it('decodes %20 back to a space', () => {
    expect(urlDecode('hello%20world')).toBe('hello world');
  });

  it('decodes a Unicode percent-encoded sequence', () => {
    expect(urlDecode('%E2%9C%93')).toBe('✓');
  });

  it('is the inverse of urlEncode for arbitrary strings', () => {
    const input = 'https://dev.example.com/search?q=hello world&lang=en';
    expect(urlDecode(urlEncode(input))).toBe(input);
  });

  it('returns an unencoded string unchanged', () => {
    expect(urlDecode('hello')).toBe('hello');
  });

  it('decodes empty string to empty string', () => {
    expect(urlDecode('')).toBe('');
  });

  it('throws URIError on a malformed percent sequence (%zz)', () => {
    expect(() => urlDecode('%zz')).toThrow(URIError);
  });

  it('throws URIError on a truncated percent sequence (%)', () => {
    expect(() => urlDecode('%')).toThrow(URIError);
  });

  it('throws URIError on an incomplete sequence (%2)', () => {
    expect(() => urlDecode('%2')).toThrow(URIError);
  });
});
