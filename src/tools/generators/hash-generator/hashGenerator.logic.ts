/**
 * Cryptographic hash generation logic.
 * Extracted from HashGeneratorTool.tsx for unit-testability.
 *
 * Both functions use the Web Crypto SubtleCrypto API (crypto.subtle.digest),
 * which is available natively in jsdom 16+ test environments.
 */

export type Algorithm = 'SHA-256' | 'SHA-512' | 'SHA-1';

/**
 * Hash a UTF-8 text string and return the hex-encoded digest.
 *
 * @param input     - Plain text to hash.
 * @param algorithm - One of 'SHA-256', 'SHA-512', or 'SHA-1'.
 * @returns Lowercase hex string of the digest.
 */
export async function generateHash(input: string, algorithm: Algorithm): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest(algorithm, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Hash a raw ArrayBuffer and return the hex-encoded digest.
 * Used for file hashing in the component.
 *
 * @param buffer    - Raw binary data to hash.
 * @param algorithm - One of 'SHA-256', 'SHA-512', or 'SHA-1'.
 * @returns Lowercase hex string of the digest.
 */
export async function hashBuffer(buffer: ArrayBuffer, algorithm: Algorithm): Promise<string> {
  const hashBuffer = await crypto.subtle.digest(algorithm, buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
