import { describe, it, expect } from 'vitest';
import { csvToJson, jsonToCsv } from './csvJson.logic';

// ─── csvToJson() ──────────────────────────────────────────────────────────────

describe('csvToJson()', () => {
  it('converts a standard 2-row CSV with header to JSON array', async () => {
    const csv = 'name,age,city\nAlice,30,London\nBob,25,Paris';
    const result = JSON.parse(await csvToJson(csv, ',', true));
    expect(result).toEqual([
      { name: 'Alice', age: 30, city: 'London' },
      { name: 'Bob', age: 25, city: 'Paris' },
    ]);
  });

  it('applies dynamicTyping — numeric strings become numbers', async () => {
    const csv = 'id,score\n1,99.5\n2,80';
    const result = JSON.parse(await csvToJson(csv, ',', true));
    expect(result[0].id).toBe(1);
    expect(result[0].score).toBe(99.5);
  });

  it('outputs pretty JSON when pretty=true', async () => {
    const csv = 'a,b\n1,2';
    const result = await csvToJson(csv, ',', true);
    expect(result).toContain('\n  ');
  });

  it('outputs minified JSON when pretty=false', async () => {
    const csv = 'a,b\n1,2';
    const result = await csvToJson(csv, ',', false);
    expect(result).not.toContain('\n');
  });

  it('uses semicolon as delimiter', async () => {
    const csv = 'name;age\nAlice;30';
    const result = JSON.parse(await csvToJson(csv, ';', true));
    expect(result[0]).toEqual({ name: 'Alice', age: 30 });
  });

  it('uses tab as delimiter', async () => {
    const csv = 'name\tage\nAlice\t30';
    const result = JSON.parse(await csvToJson(csv, '\t', true));
    expect(result[0]).toEqual({ name: 'Alice', age: 30 });
  });

  it('uses pipe as delimiter', async () => {
    const csv = 'name|age\nAlice|30';
    const result = JSON.parse(await csvToJson(csv, '|', true));
    expect(result[0]).toEqual({ name: 'Alice', age: 30 });
  });

  it('handles CSV with quoted fields containing commas', async () => {
    const csv = 'name,city\n"Doe, John","New York, NY"';
    const result = JSON.parse(await csvToJson(csv, ',', true));
    expect(result[0].name).toBe('Doe, John');
    expect(result[0].city).toBe('New York, NY');
  });

  it('handles a single-column CSV', async () => {
    const csv = 'tag\nalpha\nbeta';
    const result = JSON.parse(await csvToJson(csv, ',', true));
    expect(result).toEqual([{ tag: 'alpha' }, { tag: 'beta' }]);
  });
});

// ─── jsonToCsv() ──────────────────────────────────────────────────────────────

describe('jsonToCsv()', () => {
  it('converts a JSON array to CSV with header row', async () => {
    const json = '[{"name":"Alice","age":30},{"name":"Bob","age":25}]';
    const result = await jsonToCsv(json, ',');
    // papaparse may use CRLF — normalize to LF for cross-platform assertion
    const lines = result.trim().split('\n').map((l) => l.replace('\r', ''));
    expect(lines[0]).toBe('name,age');
    expect(lines[1]).toBe('Alice,30');
    expect(lines[2]).toBe('Bob,25');
  });

  it('wraps a single JSON object in an array before converting', async () => {
    const json = '{"name":"Alice","age":30}';
    const result = await jsonToCsv(json, ',');
    expect(result).toContain('name,age');
    expect(result).toContain('Alice,30');
  });

  it('uses semicolon as delimiter', async () => {
    const json = '[{"a":1,"b":2}]';
    const result = await jsonToCsv(json, ';');
    expect(result).toContain('a;b');
    expect(result).toContain('1;2');
  });

  it('rejects with SyntaxError for invalid JSON', async () => {
    await expect(jsonToCsv('{invalid json', ',')).rejects.toThrow(SyntaxError);
  });

  it('handles a JSON array with a single object', async () => {
    const json = '[{"x":42}]';
    const result = await jsonToCsv(json, ',');
    expect(result).toContain('x');
    expect(result).toContain('42');
  });
});
