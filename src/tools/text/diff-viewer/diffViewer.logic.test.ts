import { describe, it, expect } from 'vitest';
import { computeDiff, type DiffLine } from './diffViewer.logic';

function counts(diff: DiffLine[]) {
  return {
    equal: diff.filter((l) => l.type === 'equal').length,
    insert: diff.filter((l) => l.type === 'insert').length,
    delete: diff.filter((l) => l.type === 'delete').length,
  };
}

// ─── Identical inputs ──────────────────────────────────────────────────────────

describe('computeDiff() — identical texts', () => {
  it('produces all equal lines for identical single-line texts', () => {
    const diff = computeDiff('hello', 'hello');
    expect(counts(diff)).toEqual({ equal: 1, insert: 0, delete: 0 });
  });

  it('produces all equal lines for identical multi-line texts', () => {
    const text = 'line1\nline2\nline3';
    const diff = computeDiff(text, text);
    expect(counts(diff)).toEqual({ equal: 3, insert: 0, delete: 0 });
  });

  it('produces only equal lines for empty strings (both empty)', () => {
    const diff = computeDiff('', '');
    // ''.split('\n') = [''] — one empty element, so 1 equal line with empty content
    expect(diff).toHaveLength(1);
    expect(diff[0].type).toBe('equal');
    expect(diff[0].content).toBe('');
  });
});

// ─── Line number tracking ─────────────────────────────────────────────────────

describe('computeDiff() — line numbers', () => {
  it('equal lines have both lineA and lineB set to 1-based indices', () => {
    const diff = computeDiff('a\nb', 'a\nb');
    const equalLines = diff.filter((l) => l.type === 'equal');
    expect(equalLines[0]).toMatchObject({ lineA: 1, lineB: 1 });
    expect(equalLines[1]).toMatchObject({ lineA: 2, lineB: 2 });
  });

  it('insert lines have lineB defined but not lineA', () => {
    const diff = computeDiff('', 'only in B');
    const ins = diff.find((l) => l.type === 'insert')!;
    expect(ins.lineB).toBeDefined();
    expect(ins.lineA).toBeUndefined();
  });

  it('delete lines have lineA defined but not lineB', () => {
    const diff = computeDiff('only in A', '');
    const del = diff.find((l) => l.type === 'delete')!;
    expect(del.lineA).toBeDefined();
    expect(del.lineB).toBeUndefined();
  });
});

// ─── One-sided diffs ──────────────────────────────────────────────────────────

describe('computeDiff() — one-sided diffs', () => {
  it('empty A vs non-empty B → mostly insert lines', () => {
    // ''.split('\n') = [''] so A has 1 empty line; B has 2 lines
    // The empty line from A becomes a delete, and both B lines are inserts
    const diff = computeDiff('', 'new line 1\nnew line 2');
    const c = counts(diff);
    expect(c.insert).toBe(2);
    expect(c.equal).toBe(0);
  });

  it('non-empty A vs empty B → mostly delete lines', () => {
    // ''.split('\n') = [''] so B has 1 empty line; A has 2 lines
    // The empty line from B becomes an insert, A lines become deletes
    const diff = computeDiff('old line 1\nold line 2', '');
    const c = counts(diff);
    expect(c.delete).toBe(2);
    expect(c.equal).toBe(0);
  });
});

// ─── Single insertions / deletions ────────────────────────────────────────────

describe('computeDiff() — single change', () => {
  it('detects a single inserted line', () => {
    const a = 'line1\nline3';
    const b = 'line1\nline2\nline3';
    const c = counts(computeDiff(a, b));
    expect(c.insert).toBe(1);
    expect(c.delete).toBe(0);
    expect(c.equal).toBe(2);
  });

  it('detects a single deleted line', () => {
    const a = 'line1\nline2\nline3';
    const b = 'line1\nline3';
    const c = counts(computeDiff(a, b));
    expect(c.delete).toBe(1);
    expect(c.insert).toBe(0);
    expect(c.equal).toBe(2);
  });

  it('detects a substitution (delete old + insert new)', () => {
    const a = 'hello';
    const b = 'world';
    const c = counts(computeDiff(a, b));
    expect(c.delete).toBe(1);
    expect(c.insert).toBe(1);
    expect(c.equal).toBe(0);
  });
});

// ─── Content preservation ─────────────────────────────────────────────────────

describe('computeDiff() — content', () => {
  it('preserves the actual line content in each DiffLine', () => {
    const diff = computeDiff('alpha\nbeta', 'alpha\ngamma');
    const beta = diff.find((l) => l.content === 'beta');
    const gamma = diff.find((l) => l.content === 'gamma');
    expect(beta?.type).toBe('delete');
    expect(gamma?.type).toBe('insert');
  });

  it('handles lines with special regex characters without errors', () => {
    const a = '(a+b)*\n[c|d]';
    const b = '(a+b)*\n[e|f]';
    expect(() => computeDiff(a, b)).not.toThrow();
  });
});

// ─── Large input ──────────────────────────────────────────────────────────────

describe('computeDiff() — performance / large input', () => {
  it('handles 100 identical lines on each side without error', () => {
    const text = Array.from({ length: 100 }, (_, i) => `line ${i}`).join('\n');
    expect(() => computeDiff(text, text)).not.toThrow();
    const diff = computeDiff(text, text);
    expect(counts(diff).equal).toBe(100);
  });

  it('handles 200 lines with one change at the end', () => {
    const lines = Array.from({ length: 199 }, (_, i) => `line ${i}`);
    const a = [...lines, 'OLD END'].join('\n');
    const b = [...lines, 'NEW END'].join('\n');
    const c = counts(computeDiff(a, b));
    expect(c.equal).toBe(199);
    expect(c.delete).toBe(1);
    expect(c.insert).toBe(1);
  });
});
