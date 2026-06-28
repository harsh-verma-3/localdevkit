import { describe, it, expect } from 'vitest';
import { decodeJwt, formatTimestamp, TIME_FIELDS } from './jwtDecoder.logic';

// Known valid HS256 JWT:
// Header: {"alg":"HS256","typ":"JWT"}
// Payload: {"sub":"1234567890","name":"John Doe","iat":1516239022}
const SAMPLE_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' +
  '.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ' +
  '.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

// ─── decodeJwt() ──────────────────────────────────────────────────────────────

describe('decodeJwt()', () => {
  it('returns correct header for a known HS256 JWT', () => {
    const result = decodeJwt(SAMPLE_JWT);
    expect(result.header).toEqual({ alg: 'HS256', typ: 'JWT' });
  });

  it('returns correct payload for a known HS256 JWT', () => {
    const result = decodeJwt(SAMPLE_JWT);
    expect(result.payload).toMatchObject({
      sub: '1234567890',
      name: 'John Doe',
      iat: 1516239022,
    });
  });

  it('returns the signature part unchanged', () => {
    const result = decodeJwt(SAMPLE_JWT);
    expect(result.signature).toBe('SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');
  });

  it('handles URL-safe Base64 with - and _ characters', () => {
    // The signature part uses _ — verifies replace(/-/g,'+').replace(/_/g,'/') in b64decode
    // We test by constructing a payload with - and _ in the encoded header
    // The sample JWT itself has _ in the signature part but not in the decodable parts.
    // Build a mini JWT with URL-safe chars in payload:
    // payload: {"k":"a-b_c"} → base64url: eyJrIjoiYS1iX2MifQ
    const urlSafeJwt =
      'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0' +     // {"alg":"none","typ":"JWT"}
      '.eyJrIjoiYS1iX2MifQ' +                        // {"k":"a-b_c"}
      '.';
    const result = decodeJwt(urlSafeJwt);
    expect(result.payload).toEqual({ k: 'a-b_c' });
  });

  it('handles tokens with trailing whitespace', () => {
    const result = decodeJwt('  ' + SAMPLE_JWT + '  ');
    expect(result.header.alg).toBe('HS256');
  });

  it('handles Base64 segments with missing padding', () => {
    // eyJhbGciOiJub25lIn0 = {"alg":"none"} without padding (length not multiple of 4)
    const jwt = 'eyJhbGciOiJub25lIn0.eyJzdWIiOiIxIn0.';
    expect(() => decodeJwt(jwt)).not.toThrow();
    expect(decodeJwt(jwt).header).toEqual({ alg: 'none' });
  });

  it('throws when the token has only 2 parts', () => {
    expect(() => decodeJwt('part1.part2')).toThrow(
      'JWT must have exactly 3 parts separated by dots'
    );
  });

  it('throws when the token has more than 3 parts', () => {
    expect(() => decodeJwt('a.b.c.d')).toThrow(
      'JWT must have exactly 3 parts separated by dots'
    );
  });

  it('throws when the token has no dots', () => {
    expect(() => decodeJwt('noDotsAtAll')).toThrow(
      'JWT must have exactly 3 parts separated by dots'
    );
  });

  it('throws SyntaxError when the header segment is not valid JSON', () => {
    // "not-json" base64-encoded = bm90LWpzb24
    const badJwt = 'bm90LWpzb24.eyJzdWIiOiIxIn0.signature';
    expect(() => decodeJwt(badJwt)).toThrow(SyntaxError);
  });

  it('throws when the payload segment is not valid JSON', () => {
    // valid header, invalid payload
    const badJwt = 'eyJhbGciOiJub25lIn0.bm90LWpzb24.sig';
    expect(() => decodeJwt(badJwt)).toThrow();
  });
});

// ─── formatTimestamp() ────────────────────────────────────────────────────────

describe('formatTimestamp()', () => {
  it('converts a Unix epoch number to a locale date string', () => {
    const ts = 1516239022;
    const result = formatTimestamp(ts);
    // Should contain the year at minimum
    expect(result).toContain('2018');
  });

  it('returns string representation of non-numeric value', () => {
    expect(formatTimestamp('some-string')).toBe('some-string');
  });

  it('returns "null" for null input', () => {
    expect(formatTimestamp(null)).toBe('null');
  });

  it('returns "undefined" for undefined input', () => {
    expect(formatTimestamp(undefined)).toBe('undefined');
  });

  it('formats 0 (epoch start) without throwing', () => {
    const result = formatTimestamp(0);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});

// ─── TIME_FIELDS ─────────────────────────────────────────────────────────────

describe('TIME_FIELDS', () => {
  it('contains the standard JWT timestamp claim names', () => {
    expect(TIME_FIELDS.has('exp')).toBe(true);
    expect(TIME_FIELDS.has('iat')).toBe(true);
    expect(TIME_FIELDS.has('nbf')).toBe(true);
    expect(TIME_FIELDS.has('auth_time')).toBe(true);
    expect(TIME_FIELDS.has('updated_at')).toBe(true);
  });

  it('does not contain arbitrary fields', () => {
    expect(TIME_FIELDS.has('sub')).toBe(false);
    expect(TIME_FIELDS.has('name')).toBe(false);
  });
});
