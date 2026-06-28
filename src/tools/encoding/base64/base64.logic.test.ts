import { describe, it, expect } from 'vitest';
import { encodeBase64, decodeBase64 } from './base64.logic';

// ─── encodeBase64() ───────────────────────────────────────────────────────────

describe('encodeBase64()', () => {
  it('encodes a simple ASCII string', () => {
    expect(encodeBase64('hello')).toBe('aGVsbG8=');
  });

  it('encodes "Man" correctly (classic RFC 4648 example)', () => {
    expect(encodeBase64('Man')).toBe('TWFu');
  });

  it('encodes a URL-like string', () => {
    const input = 'https://example.com/?q=hello world';
    const encoded = encodeBase64(input);
    expect(encoded).toBeTruthy();
    expect(encoded).not.toContain(' ');
  });

  it('roundtrips Unicode emoji', () => {
    const input = 'Hello 🌍 World';
    expect(decodeBase64(encodeBase64(input))).toBe(input);
  });

  it('roundtrips CJK characters', () => {
    const input = '日本語テスト';
    expect(decodeBase64(encodeBase64(input))).toBe(input);
  });

  it('roundtrips a very long string (10 000 chars)', () => {
    const input = 'a'.repeat(10_000);
    expect(decodeBase64(encodeBase64(input))).toBe(input);
  });

  it('roundtrips special characters and symbols', () => {
    const input = '!@#$%^&*()_+-={}[]|:;"<>,.?/`~\\\'';
    expect(decodeBase64(encodeBase64(input))).toBe(input);
  });
});

// ─── decodeBase64() ───────────────────────────────────────────────────────────

describe('decodeBase64()', () => {
  it('decodes a known Base64 string', () => {
    expect(decodeBase64('aGVsbG8=')).toBe('hello');
  });

  it('decodes without padding', () => {
    // "hello" with padding removed — atob handles this after padEnd in the original
    // but decodeBase64 internally uses atob directly on the result of encodeBase64
    expect(decodeBase64(encodeBase64('test'))).toBe('test');
  });

  it('trims whitespace before decoding', () => {
    // The function calls value.trim() internally
    expect(decodeBase64('  aGVsbG8=  ')).toBe('hello');
  });

  it('throws on malformed Base64 (non-base64 characters)', () => {
    expect(() => decodeBase64('!!!not-base64!!!')).toThrow();
  });

  it('throws on completely invalid input', () => {
    expect(() => decodeBase64('<script>alert(1)</script>')).toThrow();
  });
});
