import { describe, it, expect } from 'vitest';
import { encode, decode, HTML_ENTITIES } from './htmlEntities.logic';

// ─── HTML_ENTITIES table ──────────────────────────────────────────────────────

describe('HTML_ENTITIES table', () => {
  it('starts with & → &amp; (must be first to prevent double-encoding)', () => {
    expect(HTML_ENTITIES[0]).toEqual(['&', '&amp;']);
  });

  it('contains entries for all XSS-critical characters', () => {
    const chars = HTML_ENTITIES.map(([c]) => c);
    expect(chars).toContain('<');
    expect(chars).toContain('>');
    expect(chars).toContain('"');
    expect(chars).toContain("'");
  });
});

// ─── encode() ────────────────────────────────────────────────────────────────

describe('encode()', () => {
  it('encodes < > " into their entities', () => {
    // Note: '=' is also encoded as '&#x3D;' per the OWASP entity table
    expect(encode('<div class="hello">')).toBe('&lt;div class&#x3D;&quot;hello&quot;&gt;');
  });

  it('encodes & without double-encoding (& → &amp;, not &amp;amp;)', () => {
    expect(encode('a & b')).toBe('a &amp; b');
  });

  it('encodes © ® ™ into named entities', () => {
    expect(encode('© & ™')).toBe('&copy; &amp; &trade;');
  });

  it('returns empty string for empty input', () => {
    expect(encode('')).toBe('');
  });

  it('leaves plain text with no special chars unchanged', () => {
    expect(encode('hello world 123')).toBe('hello world 123');
  });

  it('encodes a very long string (5 000 chars)', () => {
    const input = '<script>'.repeat(625);  // 5000 chars
    const result = encode(input);
    expect(result).not.toContain('<');
    expect(result).toContain('&lt;');
  });

  it('encodes all entity characters in a combined string', () => {
    const input = '&<>"\'/`=©®™€£¥°·…–— ';
    const result = encode(input);
    // & is encoded as &amp; (starts with &a)
    expect(result).toContain('&amp;');
    expect(result).toContain('&lt;');
    expect(result).toContain('&gt;');
  });
});

// ─── decode() ─────────────────────────────────────────────────────────────────

describe('decode()', () => {
  it('decodes &lt; &gt; back to < >', () => {
    expect(decode('&lt;div&gt;')).toBe('<div>');
  });

  it('decodes &amp; back to &', () => {
    expect(decode('&amp;')).toBe('&');
  });

  it('decodes &quot; back to "', () => {
    expect(decode('&quot;')).toBe('"');
  });

  it('decodes a realistic escaped HTML fragment', () => {
    const input = '&lt;script&gt;alert(1)&lt;/script&gt;';
    expect(decode(input)).toBe('<script>alert(1)</script>');
  });

  it('handles plain text with no entities unchanged', () => {
    expect(decode('hello world')).toBe('hello world');
  });

  it('handles empty string', () => {
    expect(decode('')).toBe('');
  });

  it('decodes numeric entities', () => {
    // &#65; = 'A'
    expect(decode('&#65;')).toBe('A');
  });
});

// ─── Roundtrip ────────────────────────────────────────────────────────────────

describe('roundtrip: decode(encode(text)) === text', () => {
  it('roundtrips a string with XSS characters', () => {
    const input = '<script>alert("xss & more")</script>';
    expect(decode(encode(input))).toBe(input);
  });

  it('roundtrips a string with symbols and entities', () => {
    const input = '© 2024 — "LocalDevKit" & <Tools>';
    expect(decode(encode(input))).toBe(input);
  });

  it('roundtrips an empty string', () => {
    expect(decode(encode(''))).toBe('');
  });
});
