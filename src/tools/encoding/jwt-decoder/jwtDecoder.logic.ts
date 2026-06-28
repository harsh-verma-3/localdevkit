/**
 * JWT decoding logic (header + payload only — no signature verification).
 * Extracted from JwtDecoderTool.tsx for unit-testability.
 */

export interface JwtParts {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
}

/**
 * Decode a JWT token string into its three constituent parts.
 * Uses URL-safe Base64 (replaces - with + and _ with /) and re-pads as required.
 *
 * @throws {Error} if the token does not have exactly 3 dot-separated parts.
 * @throws {SyntaxError} if header or payload segments are not valid JSON after decoding.
 * @throws {DOMException} if segments contain invalid Base64 characters.
 */
export function decodeJwt(token: string): JwtParts {
  const parts = token.trim().split('.');
  if (parts.length !== 3) throw new Error('JWT must have exactly 3 parts separated by dots');

  function b64decode(str: string): unknown {
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
    return JSON.parse(atob(padded));
  }

  return {
    header: b64decode(parts[0]) as Record<string, unknown>,
    payload: b64decode(parts[1]) as Record<string, unknown>,
    signature: parts[2],
  };
}

/**
 * Recognised JWT timestamp claim names whose numeric values are auto-formatted.
 */
export const TIME_FIELDS = new Set(['iat', 'exp', 'nbf', 'auth_time', 'updated_at']);

/**
 * Format a JWT timestamp claim value as a locale-aware date string.
 * Non-numeric values are coerced to string as-is.
 */
export function formatTimestamp(val: unknown): string {
  if (typeof val === 'number') {
    return new Date(val * 1000).toLocaleString();
  }
  return String(val);
}
