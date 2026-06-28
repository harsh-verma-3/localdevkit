import { describe, it, expect } from 'vitest';
import { generateHash, hashBuffer } from './hashGenerator.logic';

// Known SHA-256 vectors (from NIST / RFC)
const SHA256_EMPTY = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
const SHA256_HELLO = '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824';
// Known SHA-1 vectors
const SHA1_HELLO = 'aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d';
// SHA-512 of 'hello' (64 bytes = 128 hex chars)
const SHA512_HELLO_LEN = 128;

// ─── generateHash() ───────────────────────────────────────────────────────────

describe('generateHash() — SHA-256', () => {
  it('returns the correct SHA-256 hash of an empty string', async () => {
    expect(await generateHash('', 'SHA-256')).toBe(SHA256_EMPTY);
  });

  it('returns the correct SHA-256 hash of "hello"', async () => {
    expect(await generateHash('hello', 'SHA-256')).toBe(SHA256_HELLO);
  });

  it('output is always lowercase hex', async () => {
    const hash = await generateHash('Test', 'SHA-256');
    expect(hash).toMatch(/^[0-9a-f]+$/);
  });

  it('output is always 64 characters for SHA-256 (256 bits = 32 bytes)', async () => {
    const hash = await generateHash('any input', 'SHA-256');
    expect(hash).toHaveLength(64);
  });

  it('is deterministic — same input, same output', async () => {
    const a = await generateHash('deterministic', 'SHA-256');
    const b = await generateHash('deterministic', 'SHA-256');
    expect(a).toBe(b);
  });

  it('produces different hashes for different inputs', async () => {
    const a = await generateHash('foo', 'SHA-256');
    const b = await generateHash('bar', 'SHA-256');
    expect(a).not.toBe(b);
  });
});

describe('generateHash() — SHA-512', () => {
  it('returns a 128-character hex string for SHA-512', async () => {
    const hash = await generateHash('hello', 'SHA-512');
    expect(hash).toHaveLength(SHA512_HELLO_LEN);
  });

  it('output is lowercase hex', async () => {
    const hash = await generateHash('hello', 'SHA-512');
    expect(hash).toMatch(/^[0-9a-f]+$/);
  });

  it('is deterministic', async () => {
    const a = await generateHash('same', 'SHA-512');
    const b = await generateHash('same', 'SHA-512');
    expect(a).toBe(b);
  });
});

describe('generateHash() — SHA-1', () => {
  it('returns the correct SHA-1 hash of "hello"', async () => {
    expect(await generateHash('hello', 'SHA-1')).toBe(SHA1_HELLO);
  });

  it('returns a 40-character hex string for SHA-1 (160 bits = 20 bytes)', async () => {
    const hash = await generateHash('hello', 'SHA-1');
    expect(hash).toHaveLength(40);
  });
});

describe('generateHash() — edge cases', () => {
  it('hashes a very large input (100 KB) without error', async () => {
    const largeInput = 'a'.repeat(100_000);
    const hash = await generateHash(largeInput, 'SHA-256');
    expect(hash).toHaveLength(64);
  });

  it('hashes Unicode emoji correctly', async () => {
    const hash = await generateHash('🌍', 'SHA-256');
    expect(hash).toHaveLength(64);
  });

  it('hashes a newline character', async () => {
    const hash = await generateHash('\n', 'SHA-256');
    expect(hash).toHaveLength(64);
  });
});

// ─── hashBuffer() ─────────────────────────────────────────────────────────────

describe('hashBuffer()', () => {
  // jsdom's SubtleCrypto requires the data argument to be a Uint8Array (TypedArray),
  // NOT a detached slice. Pass the full buffer from a Uint8Array.
  async function hashU8(arr: number[], alg: Algorithm): Promise<string> {
    const u8 = new Uint8Array(arr);
    return hashBuffer(u8 as unknown as ArrayBuffer, alg);
  }

  it('returns correct SHA-256 for a known byte buffer', async () => {
    // UTF-8 encoding of "hello" = [104, 101, 108, 108, 111]
    expect(await hashU8([104, 101, 108, 108, 111], 'SHA-256')).toBe(SHA256_HELLO);
  });

  it('returns correct SHA-256 for an empty buffer', async () => {
    // Pass empty Uint8Array — jsdom SubtleCrypto requires TypedArray, not bare ArrayBuffer
    const empty = new Uint8Array(0);
    const result = await hashBuffer(empty as unknown as ArrayBuffer, 'SHA-256');
    expect(result).toBe(SHA256_EMPTY);
  });

  it('returns a 40-char hash for SHA-1', async () => {
    const hash = await hashU8([72, 101, 108, 108, 111], 'SHA-1'); // "Hello"
    expect(hash).toHaveLength(40);
  });

  it('returns a 128-char hash for SHA-512', async () => {
    const hash = await hashU8([104, 101, 108, 108, 111], 'SHA-512'); // "hello"
    expect(hash).toHaveLength(128);
  });

  it('produces the same result as generateHash for identical input', async () => {
    const text = 'test string';
    const fromText = await generateHash(text, 'SHA-256');
    const encoded = new TextEncoder().encode(text);
    const fromBuffer = await hashBuffer(encoded as unknown as ArrayBuffer, 'SHA-256');
    expect(fromText).toBe(fromBuffer);
  });
});
