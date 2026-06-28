import { describe, it, expect } from 'vitest';
import { validateXml, formatXml } from './xmlFormatter.logic';

describe('validateXml()', () => {
  it('returns null for well-formed XML', () => {
    const valid = '<root><child attr="val">text</child></root>';
    expect(validateXml(valid)).toBeNull();
  });

  it('returns details on invalid XML tags', () => {
    const invalid = '<root><child attr="val">text</root>'; // missing closing child tag
    const error = validateXml(invalid);
    expect(error).not.toBeNull();
    expect(typeof error).toBe('string');
  });

  it('returns null for empty input', () => {
    expect(validateXml('')).toBeNull();
    expect(validateXml('   ')).toBeNull();
  });
});

describe('formatXml()', () => {
  it('formats elements with correct indentation', () => {
    const raw = '<root><child attr="val">text</child><empty-tag/></root>';
    const expected = [
      '<root>',
      '  <child attr="val">text</child>',
      '  <empty-tag />',
      '</root>'
    ].join('\n');

    expect(formatXml(raw, 2)).toBe(expected);
  });

  it('preserves XML declaration if present in raw string', () => {
    const raw = '<?xml version="1.0" encoding="UTF-8"?><root><child>test</child></root>';
    const expected = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<root>',
      '  <child>test</child>',
      '</root>'
    ].join('\n');

    expect(formatXml(raw, 2)).toBe(expected);
  });

  it('formats comments correctly', () => {
    const raw = '<root><!-- This is a comment --><child>hello</child></root>';
    const expected = [
      '<root>',
      '  <!-- This is a comment -->',
      '  <child>hello</child>',
      '</root>'
    ].join('\n');

    expect(formatXml(raw, 2)).toBe(expected);
  });

  it('throws an error for invalid XML', () => {
    const invalid = '<root><child>unclosed-tag</root>';
    expect(() => formatXml(invalid, 2)).toThrow();
  });

  it('returns empty string for empty input', () => {
    expect(formatXml('', 2)).toBe('');
    expect(formatXml('  ', 2)).toBe('');
  });
});
