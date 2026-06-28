/**
 * UUID generation logic (V4 and V7).
 * Extracted from UuidGeneratorTool.tsx for unit-testability.
 *
 * Both generators use Web Crypto APIs (crypto.randomUUID / crypto.getRandomValues)
 * so tests must mock the global `crypto` object.
 */

/**
 * Generate a Version 4 (random) UUID using the browser's built-in crypto.randomUUID().
 */
export function generateUuidV4(): string {
  return crypto.randomUUID();
}

/**
 * Generate a Version 7 UUID.
 *
 * Structure (per draft-ietf-uuidrev-rfc4122bis):
 * - Bits 0–47  : unix_ts_ms (current timestamp in milliseconds, big-endian)
 * - Bits 48–51 : version = 0x7
 * - Bits 52–63 : random
 * - Bits 64–65 : variant = 0b10
 * - Bits 66–127: random
 *
 * The implementation encodes the millisecond timestamp into the first 12 hex digits,
 * then fills the remainder with crypto.getRandomValues, patching version and variant nibbles.
 */
export function generateUuidV7(): string {
  const ms = Date.now();
  const msHex = ms.toString(16).padStart(12, '0');
  const rand = crypto.getRandomValues(new Uint8Array(10));
  rand[0] = (rand[0] & 0x0f) | 0x70; // version 7
  rand[2] = (rand[2] & 0x3f) | 0x80; // variant 10xx
  const randHex = Array.from(rand).map((b) => b.toString(16).padStart(2, '0')).join('');
  return `${msHex.slice(0, 8)}-${msHex.slice(8, 12)}-${randHex.slice(0, 4)}-${randHex.slice(4, 8)}-${randHex.slice(8)}`;
}
