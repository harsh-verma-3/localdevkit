/**
 * GUID/UUID formatting and validation logic.
 */

export type GuidFormat = '36' | '32';
export type GuidCase = 'lower' | 'upper';

export interface ConvertOptions {
  format: GuidFormat;
  casing: GuidCase;
}

export interface ConvertResult {
  output: string;
  error?: string;
}

/**
 * Attempts to parse a single string as a GUID/UUID.
 * Returns the cleaned 32-character hex representation if valid, or null.
 */
export function parseGuid(raw: string): string | null {
  let cleaned = raw.trim();

  let prev: string;
  do {
    prev = cleaned;
    cleaned = cleaned
      // Remove outer wrappers
      .replace(/^[{(['"\s]+|[})\]'"\s]+$/g, '')
      // Remove typical prefixes (possibly followed by colons/quotes)
      .replace(/^(0x|guid:?|uuid:?|urn:uuid:)/i, '');
  } while (cleaned !== prev);

  // Strict match for standard hyphenated or compact hex-only GUIDs
  if (/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(cleaned)) {
    return cleaned.replace(/-/g, '').toLowerCase();
  }
  if (/^[0-9a-fA-F]{32}$/.test(cleaned)) {
    return cleaned.toLowerCase();
  }

  return null;
}

/**
 * Formats a clean 32-character hex string as specified.
 */
export function formatGuid(hex: string, format: GuidFormat, casing: GuidCase): string {
  let result = hex;

  if (format === '36') {
    result = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  return casing === 'upper' ? result.toUpperCase() : result.toLowerCase();
}

/**
 * Processes bulk lines of text, converting each line if it is a valid GUID/UUID.
 * If a line is not a valid GUID/UUID, it remains unchanged or shows an error.
 */
export function convertGuids(input: string, options: ConvertOptions): ConvertResult {
  if (!input.trim()) {
    return { output: '' };
  }

  const lines = input.split(/\r?\n/);
  const results: string[] = [];
  let invalidCount = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      results.push('');
      continue;
    }

    const hex = parseGuid(trimmed);
    if (hex) {
      results.push(formatGuid(hex, options.format, options.casing));
    } else {
      results.push(line); // keep original line but count as invalid
      invalidCount++;
    }
  }

  return {
    output: results.join('\n'),
    error: invalidCount > 0 ? `${invalidCount} line(s) could not be parsed as valid GUIDs` : undefined,
  };
}
