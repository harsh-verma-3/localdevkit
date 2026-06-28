import { describe, it, expect } from 'vitest';
import { analyze, formatTime } from './wordCounter.logic';

// ─── formatTime() ─────────────────────────────────────────────────────────────

describe('formatTime()', () => {
  it('returns "< 1 min" for fractional minutes < 1', () => {
    expect(formatTime(0.5)).toBe('< 1 min');
    expect(formatTime(0)).toBe('< 1 min');
  });

  it('returns "N min" for 1–59 minutes', () => {
    expect(formatTime(1)).toBe('1 min');
    expect(formatTime(5.4)).toBe('5 min');  // rounds to 5
    expect(formatTime(59)).toBe('59 min');
  });

  it('returns "Xh Ym" for 60+ minutes', () => {
    expect(formatTime(60)).toBe('1h 0m');
    expect(formatTime(90)).toBe('1h 30m');  // 90 minutes = 1h 30m
    expect(formatTime(120)).toBe('2h 0m');
  });
});

// ─── analyze() — empty / trivial ─────────────────────────────────────────────

describe('analyze() — empty input', () => {
  it('returns all zeros for an empty string', () => {
    const s = analyze('');
    expect(s.characters).toBe(0);
    expect(s.charactersNoSpaces).toBe(0);
    expect(s.words).toBe(0);
    expect(s.sentences).toBe(0);
    expect(s.paragraphs).toBe(0);
    expect(s.lines).toBe(0);
    expect(s.readingTime).toBe('< 1 min');
    expect(s.speakingTime).toBe('< 1 min');
  });

  it('returns zero words for whitespace-only input', () => {
    expect(analyze('   \n  \t  ').words).toBe(0);
  });
});

// ─── analyze() — words & characters ──────────────────────────────────────────

describe('analyze() — word and character counting', () => {
  it('counts words correctly for a simple sentence', () => {
    const s = analyze('Hello world this is a test');
    expect(s.words).toBe(6);
  });

  it('counts characters including spaces', () => {
    expect(analyze('hello world').characters).toBe(11);
  });

  it('counts characters excluding spaces', () => {
    expect(analyze('hello world').charactersNoSpaces).toBe(10);
  });

  it('counts a single character correctly', () => {
    const s = analyze('A');
    expect(s.words).toBe(1);
    expect(s.characters).toBe(1);
    expect(s.charactersNoSpaces).toBe(1);
  });
});

// ─── analyze() — sentences ────────────────────────────────────────────────────

describe('analyze() — sentence counting', () => {
  it('counts period-ended sentences', () => {
    expect(analyze('Hello. World.').sentences).toBe(2);
  });

  it('counts exclamation and question marks', () => {
    expect(analyze('Really? Yes! No.').sentences).toBe(3);
  });

  it('counts consecutive punctuation as one sentence boundary', () => {
    // "Hello..." → one boundary group [.!?]+
    expect(analyze('Hello...').sentences).toBe(1);
  });

  it('returns 0 sentences for text with no punctuation', () => {
    expect(analyze('hello world no punctuation here').sentences).toBe(0);
  });
});

// ─── analyze() — paragraphs ───────────────────────────────────────────────────

describe('analyze() — paragraph counting', () => {
  it('counts a single paragraph (no blank line)', () => {
    expect(analyze('line one\nline two').paragraphs).toBe(1);
  });

  it('counts two paragraphs separated by a blank line', () => {
    expect(analyze('Para one.\n\nPara two.').paragraphs).toBe(2);
  });

  it('counts three paragraphs', () => {
    expect(analyze('A\n\nB\n\nC').paragraphs).toBe(3);
  });
});

// ─── analyze() — lines ────────────────────────────────────────────────────────

describe('analyze() — line counting', () => {
  it('returns 1 for a single line with no newlines', () => {
    expect(analyze('hello').lines).toBe(1);
  });

  it('counts newline-separated lines correctly', () => {
    expect(analyze('line1\nline2\nline3').lines).toBe(3);
  });

  it('returns 0 for an empty string', () => {
    expect(analyze('').lines).toBe(0);
  });
});

// ─── analyze() — reading and speaking time ────────────────────────────────────

describe('analyze() — reading/speaking time', () => {
  // 238 words = exactly 1 reading minute
  const text238 = Array(238).fill('word').join(' ');
  // 150 words = exactly 1 speaking minute
  const text150 = Array(150).fill('word').join(' ');

  it('shows "1 min" reading time for exactly 238 words', () => {
    expect(analyze(text238).readingTime).toBe('1 min');
  });

  it('shows "1 min" speaking time for exactly 150 words', () => {
    expect(analyze(text150).speakingTime).toBe('1 min');
  });

  it('shows "< 1 min" reading time for fewer than 238 words', () => {
    expect(analyze('hello world').readingTime).toBe('< 1 min');
  });

  it('shows hour-level reading time for a very large word count', () => {
    const bigText = Array(15_000).fill('word').join(' ');
    const s = analyze(bigText);
    expect(s.readingTime).toContain('h');
  });
});
