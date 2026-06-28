/**
 * YAML ↔ JSON conversion logic.
 * Extracted from YamlJsonTool.tsx for unit-testability.
 * Uses js-yaml via dynamic import (same pattern as the component).
 */

/**
 * Convert a YAML string to a pretty-printed JSON string.
 *
 * @throws {YAMLException} if the YAML is syntactically invalid.
 */
export async function yamlToJson(yamlStr: string): Promise<string> {
  const yaml = await import('js-yaml');
  const parsed = yaml.load(yamlStr);
  return JSON.stringify(parsed, null, 2);
}

/**
 * Convert a JSON string to YAML (2-space indent).
 *
 * @throws {SyntaxError} if the JSON is invalid.
 */
export async function jsonToYaml(jsonStr: string): Promise<string> {
  const yaml = await import('js-yaml');
  const parsed = JSON.parse(jsonStr);
  return yaml.dump(parsed, { indent: 2 });
}
