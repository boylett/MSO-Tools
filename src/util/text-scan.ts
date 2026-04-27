import * as vscode from 'vscode';

/**
 * A single regex hit inside a TextDocument, paired with its VSCode range.
 *
 * @param match - The full RegExpExecArray from the underlying regex.
 * @param range - The VSCode range covering the matched text.
 */
export interface DocumentMatch {
  match: RegExpExecArray;
  range: vscode.Range;
}

/**
 * Finds every match of a global regex in a document and returns each with its range.
 * The supplied regex must have the global flag set.
 *
 * @param document - The text document to scan.
 * @param regex - A global regex to evaluate against the document text.
 *
 * @example
 * const matches = findAllMatches(doc, /mso-[a-z-]+/g);
 * for (const { range, match } of matches) {
 *   console.log(match[0], range);
 * }
 */
export function findAllMatches(document: vscode.TextDocument, regex: RegExp): DocumentMatch[] {
  if (!regex.global) {
    throw new Error('findAllMatches requires a global regex');
  }

  const text = document.getText();
  const results: DocumentMatch[] = [];

  regex.lastIndex = 0;

  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const start = document.positionAt(match.index);
    const end = document.positionAt(match.index + match[0].length);

    results.push({ match, range: new vscode.Range(start, end) });

    if (match[0].length === 0) {
      regex.lastIndex++;
    }
  }

  return results;
}

/**
 * Whether the given range is in a tag-name position - i.e. the characters
 * immediately before the range are `<` or `</`. Used to reject free-text hits
 * for tag names that are also common English words (e.g. `xml`).
 *
 * @param document - The text document.
 * @param range - The range covering the candidate tag name.
 */
export function isTagNamePosition(document: vscode.TextDocument, range: vscode.Range): boolean {
  const lineStart = new vscode.Position(range.start.line, 0);
  const before = document.getText(new vscode.Range(lineStart, range.start));
  const trimmed = before.replace(/\s+$/, '');

  return trimmed.endsWith('<') || trimmed.endsWith('</');
}

/**
 * Returns the offset of the previous unmatched `<` before the cursor, or null
 * if there isn't one (i.e. the cursor is not inside an open-tag context).
 *
 * Used by hover providers to determine whether a word at the cursor is part of
 * a tag's attribute list rather than free text.
 *
 * @param document - The text document.
 * @param position - The position to scan back from.
 */
export function findEnclosingTagStart(document: vscode.TextDocument, position: vscode.Position): number | null {
  const offset = document.offsetAt(position);
  const text = document.getText();

  for (let i = offset - 1; i >= 0; i--) {
    const ch = text[i];

    if (ch === '>') {
      return null;
    }

    if (ch === '<') {
      return i;
    }
  }

  return null;
}

/**
 * Computes the Levenshtein edit distance between two strings.
 *
 * @param a - The first string.
 * @param b - The second string.
 */
export function levenshtein(a: string, b: string): number {
  if (a === b) {
    return 0;
  }

  if (a.length === 0) {
    return b.length;
  }

  if (b.length === 0) {
    return a.length;
  }

  const previous: number[] = new Array(b.length + 1);

  for (let j = 0; j <= b.length; j++) {
    previous[j] = j;
  }

  for (let i = 1; i <= a.length; i++) {
    let prevDiag = previous[0];

    previous[0] = i;

    for (let j = 1; j <= b.length; j++) {
      const temp = previous[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;

      previous[j] = Math.min(
        previous[j] + 1,
        previous[j - 1] + 1,
        prevDiag + cost
      );

      prevDiag = temp;
    }
  }

  return previous[b.length];
}

/**
 * Finds the closest string from a candidate list within a maximum edit distance.
 * Returns null if nothing falls within `maxDistance`.
 *
 * @param target - The (likely misspelled) input string.
 * @param candidates - The known-good strings to compare against.
 * @param maxDistance - The maximum acceptable Levenshtein distance.
 */
export function suggestClosest(target: string, candidates: string[], maxDistance: number): string | null {
  let best: string | null = null;
  let bestDistance = Infinity;

  for (const candidate of candidates) {
    const distance = levenshtein(target, candidate);

    if (distance < bestDistance && distance <= maxDistance) {
      best = candidate;
      bestDistance = distance;
    }
  }

  return best;
}
