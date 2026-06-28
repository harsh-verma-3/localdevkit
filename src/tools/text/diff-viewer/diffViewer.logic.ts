/**
 * LCS-based line diff engine.
 * Extracted from DiffViewerTool.tsx for unit-testability.
 */

export type DiffType = 'equal' | 'insert' | 'delete';

export interface DiffLine {
  type: DiffType;
  content: string;
  /** Present on 'equal' and 'delete' lines — 1-based line number in the original text. */
  lineA?: number;
  /** Present on 'equal' and 'insert' lines — 1-based line number in the modified text. */
  lineB?: number;
}

/**
 * Compute a line-level diff between two texts using the Longest Common Subsequence algorithm.
 *
 * Returns an ordered array of DiffLine entries representing the diff output.
 * - `equal`  lines appear in both texts unchanged.
 * - `insert` lines were added in text B (not present in A).
 * - `delete` lines were removed from text A (not present in B).
 */
export function computeDiff(a: string, b: string): DiffLine[] {
  const linesA = a.split('\n');
  const linesB = b.split('\n');

  const m = linesA.length;
  const n = linesB.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (linesA[i - 1] === linesB[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  const result: DiffLine[] = [];
  let i = m, j = n;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && linesA[i - 1] === linesB[j - 1]) {
      result.unshift({ type: 'equal', content: linesA[i - 1], lineA: i, lineB: j });
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.unshift({ type: 'insert', content: linesB[j - 1], lineB: j });
      j--;
    } else {
      result.unshift({ type: 'delete', content: linesA[i - 1], lineA: i });
      i--;
    }
  }

  return result;
}
