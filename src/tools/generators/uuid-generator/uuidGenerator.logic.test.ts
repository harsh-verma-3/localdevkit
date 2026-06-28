import { describe, it, expect, vi, afterEach } from 'vitest';
import { generateUuidV4, generateUuidV7 } from './uuidGenerator.logic';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

afterEach(() => vi.unstubAllGlobals());

// ─── generateUuidV4() ─────────────────────────────────────────────────────────

describe('generateUuidV4()', () => {
  it('returns a string matching the UUID format', () => {
    expect(generateUuidV4()).toMatch(UUID_REGEX);
  });

  it('has "4" as the version nibble at position 14', () => {
    const id = generateUuidV4();
    expect(id.charAt(14)).toBe('4');
  });

  it('has a valid variant nibble at position 19 (8, 9, a, or b)', () => {
    const id = generateUuidV4();
    expect(['8', '9', 'a', 'b']).toContain(id.charAt(19));
  });

  it('generates unique values across 100 calls', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateUuidV4()));
    expect(ids.size).toBe(100);
  });

  it('delegates to crypto.randomUUID', () => {
    const mockUUID = vi.fn().mockReturnValue('aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa') as unknown as () => `${string}-${string}-${string}-${string}-${string}`;
    vi.stubGlobal('crypto', { ...crypto, randomUUID: mockUUID });
    generateUuidV4();
    expect(mockUUID).toHaveBeenCalledOnce();
  });
});

// ─── generateUuidV7() ─────────────────────────────────────────────────────────

function makeDeterministicCryptoForV7() {
  return {
    randomUUID: crypto.randomUUID.bind(crypto) as () => `${string}-${string}-${string}-${string}-${string}`,
    subtle: crypto.subtle,
    getRandomValues: <T extends ArrayBufferView>(arr: T): T => {
      const bytes = new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
      // fill with increasing values so version/variant patching is testable
      for (let i = 0; i < bytes.length; i++) bytes[i] = i * 7;
      return arr;
    },
  };
}

describe('generateUuidV7()', () => {
  it('returns a string matching the UUID format', () => {
    vi.stubGlobal('crypto', makeDeterministicCryptoForV7());
    expect(generateUuidV7()).toMatch(UUID_REGEX);
  });

  it('has "7" as the version nibble at position 14', () => {
    vi.stubGlobal('crypto', makeDeterministicCryptoForV7());
    const id = generateUuidV7();
    expect(id.charAt(14)).toBe('7');
  });

  it('has a valid variant nibble at position 19 (8, 9, a, or b)', () => {
    vi.stubGlobal('crypto', makeDeterministicCryptoForV7());
    const id = generateUuidV7();
    expect(['8', '9', 'a', 'b']).toContain(id.charAt(19));
  });

  it('encodes the current timestamp in the first 12 hex characters', () => {
    vi.stubGlobal('crypto', makeDeterministicCryptoForV7());
    const before = Date.now();
    const id = generateUuidV7();
    const after = Date.now();

    // First 8 hex chars are bytes 0–3 of ms timestamp, next 4 are bytes 4–5
    const encodedMs = parseInt(id.slice(0, 8) + id.slice(9, 13), 16);
    expect(encodedMs).toBeGreaterThanOrEqual(before);
    expect(encodedMs).toBeLessThanOrEqual(after);
  });

  it('uses crypto.getRandomValues (not Math.random)', () => {
    const mock = makeDeterministicCryptoForV7();
    const spy = vi.spyOn(mock, 'getRandomValues');
    vi.stubGlobal('crypto', mock);
    generateUuidV7();
    expect(spy).toHaveBeenCalledOnce();
  });

  it('generates unique values across 100 calls', () => {
    // Use real crypto for this uniqueness check
    const ids = new Set(Array.from({ length: 100 }, () => generateUuidV7()));
    expect(ids.size).toBe(100);
  });

  it('returns all-lowercase hex characters', () => {
    vi.stubGlobal('crypto', makeDeterministicCryptoForV7());
    const id = generateUuidV7().replace(/-/g, '');
    expect(id).toMatch(/^[0-9a-f]+$/);
  });
});
