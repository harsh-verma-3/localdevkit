/**
 * Password generation and strength-scoring logic.
 * Extracted from PasswordGeneratorTool.tsx for unit-testability.
 *
 * All randomness comes from crypto.getRandomValues (CSPRNG), never Math.random.
 */

export const CHARS = {
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lower: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{}|;:,.<>?',
} as const;

export const AMBIGUOUS = 'Il1O0';

export type CharsetOptions = {
  upper: boolean;
  lower: boolean;
  numbers: boolean;
  symbols: boolean;
};

export interface StrengthResult {
  label: 'Weak' | 'Fair' | 'Good' | 'Strong';
  color: string;
  width: string;
}

/**
 * Score the strength of a generated password.
 * Returns a label, CSS color class, and progress-bar width string.
 */
export function getStrength(password: string): StrengthResult {
  let score = 0;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { label: 'Weak', color: 'bg-error', width: '25%' };
  if (score <= 3) return { label: 'Fair', color: 'bg-warning', width: '50%' };
  if (score <= 4) return { label: 'Good', color: 'bg-info', width: '75%' };
  return { label: 'Strong', color: 'bg-success', width: '100%' };
}

/**
 * Generate `count` (default 5) cryptographically random passwords.
 *
 * Returns an empty array when no charset option is selected.
 * Each password character is drawn uniformly from the active charset using
 * crypto.getRandomValues to ensure CSPRNG quality.
 *
 * @param options          - Which character groups to include.
 * @param length           - Desired password length (8–128).
 * @param excludeAmbiguous - When true, strips `I`, `l`, `1`, `O`, `0` from the charset.
 * @param count            - Number of passwords to generate (default 5).
 */
export function generatePasswords(
  options: CharsetOptions,
  length: number,
  excludeAmbiguous: boolean,
  count = 5,
): string[] {
  let charset = '';
  if (options.upper) charset += CHARS.upper;
  if (options.lower) charset += CHARS.lower;
  if (options.numbers) charset += CHARS.numbers;
  if (options.symbols) charset += CHARS.symbols;
  if (excludeAmbiguous) {
    charset = charset.split('').filter((c) => !AMBIGUOUS.includes(c)).join('');
  }
  if (!charset) return [];

  const result: string[] = [];
  for (let p = 0; p < count; p++) {
    const arr = crypto.getRandomValues(new Uint32Array(length));
    result.push(Array.from(arr).map((n) => charset[n % charset.length]).join(''));
  }
  return result;
}
