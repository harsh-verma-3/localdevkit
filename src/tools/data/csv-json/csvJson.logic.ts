/**
 * CSV ↔ JSON conversion logic.
 * Extracted from CsvJsonTool.tsx for unit-testability.
 * Uses papaparse via dynamic import (same pattern as the component).
 */

/**
 * Parse a CSV string into a pretty-printed JSON array.
 *
 * @param csv       - Raw CSV input including a header row.
 * @param delimiter - Field delimiter character (default `,`).
 * @param pretty    - If true, JSON is 2-space indented; otherwise minified.
 *
 * @throws {Error} if papaparse reports parse errors.
 */
export async function csvToJson(csv: string, delimiter: string, pretty: boolean): Promise<string> {
  const Papa = (await import('papaparse')).default;
  const result = Papa.parse(csv.trim(), {
    header: true,
    delimiter,
    skipEmptyLines: true,
    dynamicTyping: true,
  });
  if (result.errors.length) throw new Error(result.errors[0].message);
  return JSON.stringify(result.data, null, pretty ? 2 : 0);
}

/**
 * Serialize a JSON array (or single object) to CSV.
 *
 * @param json      - JSON string representing an array or a single object.
 * @param delimiter - Field delimiter character (default `,`).
 *
 * @throws {SyntaxError} if the JSON string is invalid.
 */
export async function jsonToCsv(json: string, delimiter: string): Promise<string> {
  const Papa = (await import('papaparse')).default;
  const parsed: unknown = JSON.parse(json);
  const arr = Array.isArray(parsed) ? parsed : [parsed];
  return Papa.unparse(arr as Record<string, unknown>[], { delimiter });
}
