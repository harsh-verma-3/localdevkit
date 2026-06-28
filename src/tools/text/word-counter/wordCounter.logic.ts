/**
 * Text statistical analysis logic.
 * Extracted from WordCounterTool.tsx for unit-testability.
 */

export interface Stats {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  readingTime: string;
  speakingTime: string;
}

/**
 * Format a fractional minute count into a human-readable time string.
 * - Less than 1 minute → `'< 1 min'`
 * - Up to 59 minutes → `'N min'`
 * - 60+ minutes → `'Xh Ym'`
 */
export function formatTime(mins: number): string {
  if (mins < 1) return '< 1 min';
  const m = Math.round(mins);
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)}h ${m % 60}m`;
}

/**
 * Compute word, character, sentence, paragraph, line, and time-to-read statistics
 * for the given text.
 *
 * Reading speed baseline: 238 WPM  
 * Speaking speed baseline: 150 WPM
 */
export function analyze(text: string): Stats {
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const sentences = text.trim() ? (text.match(/[.!?]+/g) ?? []).length : 0;
  const paragraphs = text.trim() ? text.split(/\n\s*\n/).filter((p) => p.trim()).length : 0;
  const lines = text ? text.split('\n').length : 0;
  const readingMins = words / 238;
  const speakingMins = words / 150;

  return {
    characters: text.length,
    charactersNoSpaces: text.replace(/\s/g, '').length,
    words,
    sentences,
    paragraphs,
    lines,
    readingTime: formatTime(readingMins),
    speakingTime: formatTime(speakingMins),
  };
}
