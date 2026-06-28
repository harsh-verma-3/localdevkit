/**
 * JSON formatting/minifying logic.
 * Extracted from JsonFormatterTool.tsx for unit-testability.
 */

export type IndentSize = 2 | 4 | 'tab';

/**
 * Parse raw JSON and return a re-serialised, pretty-printed or minified string.
 *
 * @param raw      - The raw JSON input string.
 * @param minified - When true, output is compacted with no whitespace.
 * @param indent   - Indent width (2 or 4 spaces) or `'tab'` for tab-indented output.
 *
 * @throws {SyntaxError} if `raw` is not valid JSON (propagated from JSON.parse).
 */
export function formatJson(raw: string, minified: boolean, indent: IndentSize): string {
  const parsed = JSON.parse(raw);
  const indentValue = indent === 'tab' ? '\t' : indent;
  return minified
    ? JSON.stringify(parsed)
    : JSON.stringify(parsed, null, indentValue);
}
