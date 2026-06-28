/**
 * HTML entity encoding/decoding logic.
 * Extracted from HtmlEntitiesToolLazy.tsx for unit-testability.
 *
 * encode() uses a static lookup table for security-critical characters.
 * decode() delegates to the browser's own DOMParser for correctness.
 */

export const HTML_ENTITIES: [string, string][] = [
  ['&', '&amp;'], ['<', '&lt;'], ['>', '&gt;'], ['"', '&quot;'],
  ["'", '&#39;'], ['/', '&#x2F;'], ['`', '&#x60;'], ['=', '&#x3D;'],
  ['©', '&copy;'], ['®', '&reg;'], ['™', '&trade;'], ['€', '&euro;'],
  ['£', '&pound;'], ['¥', '&yen;'], ['°', '&deg;'], ['·', '&middot;'],
  ['…', '&hellip;'], ['–', '&ndash;'], ['—', '&mdash;'],
  ['\u00A0', '&nbsp;'],
];

/**
 * Encode special characters to their HTML entity equivalents.
 * The `&` character is replaced first to prevent double-encoding.
 */
export function encode(text: string): string {
  return HTML_ENTITIES.reduce((acc, [char, entity]) => acc.split(char).join(entity), text);
}

/**
 * Decode HTML entities back to their literal characters.
 * Uses DOMParser (available in browser and jsdom) for comprehensive entity support.
 */
export function decode(text: string): string {
  const doc = new DOMParser().parseFromString(text, 'text/html');
  return doc.documentElement.textContent ?? text;
}
