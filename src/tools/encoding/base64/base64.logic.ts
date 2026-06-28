/**
 * Pure Base64 encoding/decoding logic.
 * Extracted from Base64Tool.tsx for unit-testability.
 *
 * Encoding: uses encodeURIComponent → unescape → btoa to handle full Unicode.
 * Decoding: uses atob → escape → decodeURIComponent (inverse of above).
 *
 * Both functions throw on invalid input; the component catches and displays the error.
 */

/**
 * Encode a plain-text string (including Unicode) to Base64.
 * @throws {Error} if the input cannot be encoded (e.g., certain surrogates).
 */
export function encodeBase64(value: string): string {
  return btoa(unescape(encodeURIComponent(value)));
}

/**
 * Decode a Base64 string back to plain text (including Unicode).
 * @throws {DOMException | URIError} if the input is not valid Base64.
 */
export function decodeBase64(value: string): string {
  return decodeURIComponent(escape(atob(value.trim())));
}
