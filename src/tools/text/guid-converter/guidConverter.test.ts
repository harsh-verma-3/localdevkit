import { describe, it, expect } from 'vitest';
import { parseGuid, formatGuid, convertGuids } from './guidConverter.logic';

describe('parseGuid()', () => {
  it('parses standard 36-character hyphenated UUIDs', () => {
    const raw = 'e02fd0e4-00fd-4b98-a003-3c4f74d0e6df';
    expect(parseGuid(raw)).toBe('e02fd0e400fd4b98a0033c4f74d0e6df');
  });

  it('parses 32-character compact UUIDs', () => {
    const raw = 'e02fd0e400fd4b98a0033c4f74d0e6df';
    expect(parseGuid(raw)).toBe('e02fd0e400fd4b98a0033c4f74d0e6df');
  });

  it('handles surrounding braces, parentheses, quotes, and square brackets', () => {
    expect(parseGuid('{e02fd0e4-00fd-4b98-a003-3c4f74d0e6df}')).toBe('e02fd0e400fd4b98a0033c4f74d0e6df');
    expect(parseGuid('(e02fd0e4-00fd-4b98-a003-3c4f74d0e6df)')).toBe('e02fd0e400fd4b98a0033c4f74d0e6df');
    expect(parseGuid('[e02fd0e4-00fd-4b98-a003-3c4f74d0e6df]')).toBe('e02fd0e400fd4b98a0033c4f74d0e6df');
    expect(parseGuid('"e02fd0e4-00fd-4b98-a003-3c4f74d0e6df"')).toBe('e02fd0e400fd4b98a0033c4f74d0e6df');
    expect(parseGuid("'e02fd0e4-00fd-4b98-a003-3c4f74d0e6df'")).toBe('e02fd0e400fd4b98a0033c4f74d0e6df');
  });

  it('strips common prefixes (0x, guid, uuid, urn:uuid:)', () => {
    expect(parseGuid('0xe02fd0e400fd4b98a0033c4f74d0e6df')).toBe('e02fd0e400fd4b98a0033c4f74d0e6df');
    expect(parseGuid('guid"e02fd0e4-00fd-4b98-a003-3c4f74d0e6df"')).toBe('e02fd0e400fd4b98a0033c4f74d0e6df');
    expect(parseGuid('uuid:e02fd0e4-00fd-4b98-a003-3c4f74d0e6df')).toBe('e02fd0e400fd4b98a0033c4f74d0e6df');
    expect(parseGuid('urn:uuid:e02fd0e4-00fd-4b98-a003-3c4f74d0e6df')).toBe('e02fd0e400fd4b98a0033c4f74d0e6df');
  });

  it('returns null for invalid inputs', () => {
    expect(parseGuid('not-a-uuid')).toBeNull();
    expect(parseGuid('e02fd0e4-00fd-4b98-a003-3c4f74d0e6d')).toBeNull(); // too short
    expect(parseGuid('e02fd0e4-00fd-4b98-a003-3c4f74d0e6df-extra')).toBeNull(); // too long
    expect(parseGuid('e02fd0e4-00fd-4b98-a003-3c4f74d0e6dg')).toBeNull(); // invalid character 'g'
  });
});

describe('formatGuid()', () => {
  const cleanHex = 'e02fd0e400fd4b98a0033c4f74d0e6df';

  it('formats to 36-char lower case', () => {
    expect(formatGuid(cleanHex, '36', 'lower')).toBe('e02fd0e4-00fd-4b98-a003-3c4f74d0e6df');
  });

  it('formats to 36-char upper case', () => {
    expect(formatGuid(cleanHex, '36', 'upper')).toBe('E02FD0E4-00FD-4B98-A003-3C4F74D0E6DF');
  });

  it('formats to 32-char lower case', () => {
    expect(formatGuid(cleanHex, '32', 'lower')).toBe('e02fd0e400fd4b98a0033c4f74d0e6df');
  });

  it('formats to 32-char upper case', () => {
    expect(formatGuid(cleanHex, '32', 'upper')).toBe('E02FD0E400FD4B98A0033C4F74D0E6DF');
  });
});

describe('convertGuids() bulk', () => {
  it('converts lists of GUIDs line by line', () => {
    const input = [
      'e02fd0e400fd4b98a0033c4f74d0e6df',
      '{e02fd0e4-00fd-4b98-a003-3c4f74d0e6df}',
      '',
      'invalid-guid-line',
      '0xe02fd0e400fd4b98a0033c4f74d0e6df'
    ].join('\n');

    const result = convertGuids(input, { format: '36', casing: 'upper' });

    expect(result.output).toBe([
      'E02FD0E4-00FD-4B98-A003-3C4F74D0E6DF',
      'E02FD0E4-00FD-4B98-A003-3C4F74D0E6DF',
      '',
      'invalid-guid-line',
      'E02FD0E4-00FD-4B98-A003-3C4F74D0E6DF'
    ].join('\n'));

    expect(result.error).toBe('1 line(s) could not be parsed as valid GUIDs');
  });

  it('returns empty output for empty input', () => {
    expect(convertGuids('', { format: '36', casing: 'lower' }).output).toBe('');
    expect(convertGuids('   ', { format: '36', casing: 'lower' }).output).toBe('');
  });
});
