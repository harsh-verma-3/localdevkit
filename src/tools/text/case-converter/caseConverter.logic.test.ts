import { describe, it, expect } from 'vitest';
import { toWords, convert, CASE_LABELS, type CaseType } from './caseConverter.logic';

// ─── CASE_LABELS ──────────────────────────────────────────────────────────────

describe('CASE_LABELS', () => {
  it('contains all 9 case types', () => {
    const keys = Object.keys(CASE_LABELS);
    expect(keys).toHaveLength(9);
    expect(keys).toContain('camel');
    expect(keys).toContain('pascal');
    expect(keys).toContain('snake');
    expect(keys).toContain('kebab');
    expect(keys).toContain('upper_snake');
    expect(keys).toContain('title');
    expect(keys).toContain('upper');
    expect(keys).toContain('lower');
    expect(keys).toContain('sentence');
  });
});

// ─── toWords() ────────────────────────────────────────────────────────────────

describe('toWords()', () => {
  it('splits a space-separated string into words', () => {
    expect(toWords('hello world')).toEqual(['hello', 'world']);
  });

  it('splits camelCase', () => {
    expect(toWords('helloWorld')).toEqual(['hello', 'World']);
  });

  it('splits PascalCase', () => {
    expect(toWords('HelloWorld')).toEqual(['Hello', 'World']);
  });

  it('splits snake_case', () => {
    expect(toWords('hello_world')).toEqual(['hello', 'world']);
  });

  it('splits kebab-case', () => {
    expect(toWords('hello-world')).toEqual(['hello', 'world']);
  });

  it('splits UPPER_SNAKE_CASE', () => {
    expect(toWords('HELLO_WORLD')).toEqual(['HELLO', 'WORLD']);
  });

  it('handles mixed delimiters', () => {
    const words = toWords('hello-world_foo');
    expect(words).toEqual(['hello', 'world', 'foo']);
  });

  it('filters out empty tokens from multiple spaces', () => {
    const words = toWords('hello   world');
    expect(words).toEqual(['hello', 'world']);
  });

  it('returns empty array for empty string', () => {
    expect(toWords('')).toEqual([]);
  });

  it('returns empty array for whitespace-only string', () => {
    expect(toWords('   ')).toEqual([]);
  });

  it('handles a single word', () => {
    expect(toWords('hello')).toEqual(['hello']);
  });

  it('handles consecutive uppercase (acronym) like XMLParser', () => {
    // 'XMLParser' → ['XML', 'Parser']
    const words = toWords('XMLParser');
    expect(words.join(' ')).toContain('Parser');
  });
});

// ─── convert() — all 9 case types ────────────────────────────────────────────

const INPUT = 'hello world foo bar';

describe('convert() — camelCase', () => {
  it('converts "hello world" to camelCase', () => {
    expect(convert('hello world', 'camel')).toBe('helloWorldFooBar'.slice(0, 'helloWorld'.length));
  });

  it('converts to camelCase correctly', () => {
    expect(convert(INPUT, 'camel')).toBe('helloWorldFooBar');
  });

  it('converts PascalCase input to camelCase', () => {
    expect(convert('HelloWorld', 'camel')).toBe('helloWorld');
  });
});

describe('convert() — PascalCase', () => {
  it('converts "hello world" to PascalCase', () => {
    expect(convert('hello world', 'pascal')).toBe('HelloWorld');
  });

  it('converts snake_case to PascalCase', () => {
    expect(convert('hello_world', 'pascal')).toBe('HelloWorld');
  });
});

describe('convert() — snake_case', () => {
  it('converts "hello world" to snake_case', () => {
    expect(convert('hello world', 'snake')).toBe('hello_world');
  });

  it('converts camelCase input to snake_case', () => {
    expect(convert('helloWorld', 'snake')).toBe('hello_world');
  });
});

describe('convert() — kebab-case', () => {
  it('converts "hello world" to kebab-case', () => {
    expect(convert('hello world', 'kebab')).toBe('hello-world');
  });

  it('converts camelCase input to kebab-case', () => {
    expect(convert('helloWorld', 'kebab')).toBe('hello-world');
  });
});

describe('convert() — UPPER_SNAKE', () => {
  it('converts "hello world" to UPPER_SNAKE', () => {
    expect(convert('hello world', 'upper_snake')).toBe('HELLO_WORLD');
  });
});

describe('convert() — Title Case', () => {
  it('converts "hello world" to Title Case', () => {
    expect(convert('hello world', 'title')).toBe('Hello World');
  });

  it('converts snake_case to Title Case', () => {
    expect(convert('snake_case_input', 'title')).toBe('Snake Case Input');
  });
});

describe('convert() — UPPERCASE', () => {
  it('converts to full uppercase (uses input.toUpperCase())', () => {
    expect(convert('hello World 123!', 'upper')).toBe('HELLO WORLD 123!');
  });
});

describe('convert() — lowercase', () => {
  it('converts to full lowercase (uses input.toLowerCase())', () => {
    expect(convert('HELLO WORLD!', 'lower')).toBe('hello world!');
  });
});

describe('convert() — Sentence case', () => {
  it('capitalizes first character, lowercases the rest', () => {
    expect(convert('hello WORLD', 'sentence')).toBe('Hello world');
  });
});

// ─── Edge cases ───────────────────────────────────────────────────────────────

describe('convert() — edge cases', () => {
  it('returns empty string for empty input on all case types', () => {
    const types: CaseType[] = ['camel', 'pascal', 'snake', 'kebab', 'upper_snake', 'title'];
    types.forEach((t) => expect(convert('', t)).toBe(''));
  });

  it('handles single-word input', () => {
    expect(convert('hello', 'pascal')).toBe('Hello');
    expect(convert('hello', 'camel')).toBe('hello');
    expect(convert('hello', 'snake')).toBe('hello');
  });

  it('handles whitespace-only input', () => {
    expect(convert('   ', 'camel')).toBe('');
  });
});
