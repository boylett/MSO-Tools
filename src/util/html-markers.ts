import * as vscode from 'vscode';
import { findAllMatches } from './text-scan';

const MARKER_OPEN_RE = /<!--\s*\*\s+(?!\/\/)(.+?)\s*-->/g;
const MARKER_CLOSE_RE = /<!--\s*\*\s+\/\/\s*(.+?)\s*-->/g;

/**
 * A matched HTML marker open/close pair.
 *
 * @param open - Range covering the open marker (`<!-- * Block Name -->`).
 * @param close - Range covering the close marker (`<!-- * // Block Name -->`).
 * @param name - The block name as it appears on the open marker (case preserved).
 */
export interface HtmlMarkerPair {
  open: vscode.Range;
  close: vscode.Range;
  name: string;
}

/**
 * Walks a document for HTML marker comments and pairs each open with its
 * corresponding close by case-insensitive block name. Uses a balanced-stack
 * strategy so nested markers and out-of-order closes still match correctly.
 *
 * @param document - The document to scan.
 *
 * @example
 * for (const { open, close, name } of findHtmlMarkerPairs(document)) {
 *   console.log(`Block "${ name }" spans ${ open.start.line }-${ close.end.line }`);
 * }
 */
export function findHtmlMarkerPairs(document: vscode.TextDocument): HtmlMarkerPair[] {
  const opens = findAllMatches(document, MARKER_OPEN_RE);
  const closes = findAllMatches(document, MARKER_CLOSE_RE);

  const events = [
    ...opens.map(o => ({
      kind: 'open' as const,
      name: o.match[1],
      key: o.match[1].toLowerCase(),
      range: o.range,
      index: o.match.index
    })),
    ...closes.map(c => ({
      kind: 'close' as const,
      name: c.match[1],
      key: c.match[1].toLowerCase(),
      range: c.range,
      index: c.match.index
    }))
  ].sort((a, b) => a.index - b.index);

  const pairs: HtmlMarkerPair[] = [];
  const stack: Array<{ name: string; key: string; range: vscode.Range }> = [];

  for (const event of events) {
    if (event.kind === 'open') {
      stack.push({ name: event.name, key: event.key, range: event.range });

      continue;
    }

    const matchIdx = findLastIndex(stack, entry => entry.key === event.key);

    if (matchIdx === -1) {
      continue;
    }

    const open = stack[matchIdx];

    stack.splice(matchIdx, 1);

    pairs.push({ open: open.range, close: event.range, name: open.name });
  }

  return pairs;
}

/**
 * Finds the last index in an array matching a predicate.
 *
 * @param array - The array to search.
 * @param predicate - A boolean test for each element.
 */
function findLastIndex<T>(array: T[], predicate: (value: T) => boolean): number {
  for (let i = array.length - 1; i >= 0; i--) {
    if (predicate(array[i])) {
      return i;
    }
  }

  return -1;
}
