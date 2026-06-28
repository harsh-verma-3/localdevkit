/**
 * Text case conversion logic.
 * Extracted from CaseConverterTool.tsx for unit-testability.
 */

export type CaseType =
  | 'camel'
  | 'pascal'
  | 'snake'
  | 'kebab'
  | 'upper_snake'
  | 'title'
  | 'upper'
  | 'lower'
  | 'sentence';

export const CASE_LABELS: Record<CaseType, string> = {
  camel: 'camelCase',
  pascal: 'PascalCase',
  snake: 'snake_case',
  kebab: 'kebab-case',
  upper_snake: 'UPPER_SNAKE',
  title: 'Title Case',
  upper: 'UPPERCASE',
  lower: 'lowercase',
  sentence: 'Sentence case',
};

/**
 * Split an input string into a list of words.
 * Handles camelCase, PascalCase, snake_case, kebab-case, and whitespace-separated inputs.
 */
export function toWords(input: string): string[] {
  return input
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/[-_]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Convert an input string to the specified case format.
 * Returns an empty string if the input yields no words after tokenisation.
 */
export function convert(input: string, caseType: CaseType): string {
  const words = toWords(input);
  if (words.length === 0) return '';
  switch (caseType) {
    case 'camel':
      return words[0].toLowerCase() +
        words.slice(1).map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase()).join('');
    case 'pascal':
      return words.map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase()).join('');
    case 'snake':
      return words.map((w) => w.toLowerCase()).join('_');
    case 'kebab':
      return words.map((w) => w.toLowerCase()).join('-');
    case 'upper_snake':
      return words.map((w) => w.toUpperCase()).join('_');
    case 'title':
      return words.map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    case 'upper':
      return input.toUpperCase();
    case 'lower':
      return input.toLowerCase();
    case 'sentence':
      return input.slice(0, 1).toUpperCase() + input.slice(1).toLowerCase();
  }
}
