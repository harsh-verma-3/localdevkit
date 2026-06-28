import { describe, it, expect, vi, afterEach } from 'vitest';
import { getStrength, generatePasswords, CHARS, AMBIGUOUS } from './passwordGenerator.logic';

// ─── CHARS ────────────────────────────────────────────────────────────────────

describe('CHARS', () => {
  it('upper contains 26 uppercase letters', () => {
    expect(CHARS.upper).toHaveLength(26);
    expect(/^[A-Z]+$/.test(CHARS.upper)).toBe(true);
  });

  it('lower contains 26 lowercase letters', () => {
    expect(CHARS.lower).toHaveLength(26);
    expect(/^[a-z]+$/.test(CHARS.lower)).toBe(true);
  });

  it('numbers contains 10 digits', () => {
    expect(CHARS.numbers).toHaveLength(10);
    expect(/^[0-9]+$/.test(CHARS.numbers)).toBe(true);
  });

  it('symbols contains no alphanumeric characters', () => {
    expect(/[a-zA-Z0-9]/.test(CHARS.symbols)).toBe(false);
  });
});

// ─── AMBIGUOUS ────────────────────────────────────────────────────────────────

describe('AMBIGUOUS', () => {
  it('contains I, l, 1, O, 0', () => {
    expect(AMBIGUOUS).toContain('I');
    expect(AMBIGUOUS).toContain('l');
    expect(AMBIGUOUS).toContain('1');
    expect(AMBIGUOUS).toContain('O');
    expect(AMBIGUOUS).toContain('0');
  });
});

// ─── getStrength() ────────────────────────────────────────────────────────────

describe('getStrength()', () => {
  it('returns "Weak" for a short lowercase-only password', () => {
    expect(getStrength('abc').label).toBe('Weak');
  });

  it('returns "Weak" for a 6-char mixed but short password', () => {
    // score: uppercase(+1) + lowercase(+1) + number(+1) = 3 but length <12 so no length bonuses → score=3 → Fair
    // Let's test something truly weak: all lowercase no special, short
    expect(getStrength('abcdef').label).toBe('Weak');
  });

  it('returns "Fair" for a moderate password', () => {
    // score: lower(+1) + upper(+1) + number(+1) = 3 → Fair
    expect(getStrength('Abc123').label).toBe('Fair');
  });

  it('returns "Good" for a 12-char mixed password without symbols', () => {
    // score: length>=12(+1) + upper(+1) + lower(+1) + number(+1) = 4 → Good
    expect(getStrength('Abcdefgh1234').label).toBe('Good');
  });

  it('returns "Strong" for a 16+ char fully mixed password', () => {
    // score: length>=12(+1) + length>=16(+1) + upper(+1) + lower(+1) + number(+1) + symbol(+1) = 6 → Strong
    expect(getStrength('AbcDEFGH1234!@#$').label).toBe('Strong');
  });

  it('includes a color class string', () => {
    const result = getStrength('AbcDEFGH1234!@#$');
    expect(result.color).toBeTruthy();
    expect(result.color.startsWith('bg-')).toBe(true);
  });

  it('includes a width percentage string', () => {
    const result = getStrength('AbcDEFGH1234!@#$');
    expect(result.width).toMatch(/^\d+%$/);
  });
});

// ─── generatePasswords() ──────────────────────────────────────────────────────

// Deterministic mock: fills every byte with the index value mod 256
function makeDeterministicCrypto() {
  return {
    getRandomValues: <T extends ArrayBufferView>(arr: T): T => {
      const bytes = new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
      for (let i = 0; i < bytes.length; i++) bytes[i] = i % 256;
      return arr;
    },
    randomUUID: () => '00000000-0000-4000-8000-000000000000' as `${string}-${string}-${string}-${string}-${string}`,
    subtle: crypto.subtle,
  };
}

afterEach(() => vi.unstubAllGlobals());

describe('generatePasswords()', () => {
  it('returns exactly 5 passwords by default', () => {
    vi.stubGlobal('crypto', makeDeterministicCrypto());
    const passwords = generatePasswords(
      { upper: true, lower: true, numbers: true, symbols: true },
      16,
      false,
    );
    expect(passwords).toHaveLength(5);
  });

  it('each password has the correct length', () => {
    vi.stubGlobal('crypto', makeDeterministicCrypto());
    const passwords = generatePasswords(
      { upper: true, lower: false, numbers: false, symbols: false },
      24,
      false,
    );
    passwords.forEach((pw) => expect(pw).toHaveLength(24));
  });

  it('all characters come from the selected charset (uppercase only)', () => {
    vi.stubGlobal('crypto', makeDeterministicCrypto());
    const passwords = generatePasswords(
      { upper: true, lower: false, numbers: false, symbols: false },
      32,
      false,
    );
    passwords.forEach((pw) => {
      expect(/^[A-Z]+$/.test(pw)).toBe(true);
    });
  });

  it('excludeAmbiguous removes I, l, 1, O, 0 from all passwords', () => {
    vi.stubGlobal('crypto', makeDeterministicCrypto());
    const passwords = generatePasswords(
      { upper: true, lower: true, numbers: true, symbols: false },
      128,
      true,
    );
    passwords.forEach((pw) => {
      expect(pw).not.toMatch(/[Il1O0]/);
    });
  });

  it('returns empty array when all charset options are disabled', () => {
    vi.stubGlobal('crypto', makeDeterministicCrypto());
    const passwords = generatePasswords(
      { upper: false, lower: false, numbers: false, symbols: false },
      16,
      false,
    );
    expect(passwords).toHaveLength(0);
  });

  it('uses crypto.getRandomValues (not Math.random)', () => {
    const mock = makeDeterministicCrypto();
    const spy = vi.spyOn(mock, 'getRandomValues');
    vi.stubGlobal('crypto', mock);
    generatePasswords({ upper: true, lower: true, numbers: true, symbols: true }, 16, false);
    expect(spy).toHaveBeenCalled();
  });

  it('respects a custom count parameter', () => {
    vi.stubGlobal('crypto', makeDeterministicCrypto());
    const passwords = generatePasswords(
      { upper: true, lower: true, numbers: true, symbols: true },
      16,
      false,
      1,
    );
    expect(passwords).toHaveLength(1);
  });

  it('generates 5 passwords of length 8 (minimum)', () => {
    vi.stubGlobal('crypto', makeDeterministicCrypto());
    const passwords = generatePasswords(
      { upper: true, lower: true, numbers: true, symbols: true },
      8,
      false,
    );
    passwords.forEach((pw) => expect(pw).toHaveLength(8));
  });

  it('generates passwords of length 128 (maximum)', () => {
    vi.stubGlobal('crypto', makeDeterministicCrypto());
    const passwords = generatePasswords(
      { upper: true, lower: true, numbers: true, symbols: true },
      128,
      false,
    );
    passwords.forEach((pw) => expect(pw).toHaveLength(128));
  });
});
