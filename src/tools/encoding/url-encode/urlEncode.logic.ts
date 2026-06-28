/**
 * Pure URL encoding/decoding logic.
 * Extracted from UrlEncodeTool.tsx for unit-testability.
 */

/**
 * Percent-encode a URL component using encodeURIComponent.
 * @throws {URIError} on malformed Unicode surrogates.
 */
export function urlEncode(input: string): string {
  return encodeURIComponent(input);
}

/**
 * Decode a percent-encoded URL component using decodeURIComponent.
 * @throws {URIError} if the input contains an invalid percent-encoded sequence (e.g., %zz).
 */
export function urlDecode(input: string): string {
  return decodeURIComponent(input);
}
