import * as vscode from 'vscode';
import { findAllMatches } from './text-scan';

const OPEN_MARKER_RE = /<!--\s*\[if\b[^\]]*\]>(?:<!-->)?/g;
const CLOSE_MARKER_RE = /(?:<!--\s*)?<!\s*\[endif\]\s*-->/g;

/**
 * A matched conditional comment open/close pair.
 *
 * @param open - Range covering the open marker (`<!--[if ...]>` or `<!--[if ...]><!-->`).
 * @param close - Range covering the close marker (`<![endif]-->` or `<!--<![endif]-->`).
 */
export interface ConditionalPair {
  open: vscode.Range;
  close: vscode.Range;
}

/**
 * Walks a document for MSO conditional comment markers and pairs each open
 * with its corresponding close using a balanced-stack strategy. Unmatched
 * opens or stray closes are silently dropped (the diagnostics linter handles
 * reporting them separately).
 *
 * @param document - The document to scan.
 *
 * @example
 * const pairs = findConditionalPairs(document);
 * for (const { open, close } of pairs) {
 *   const inner = new vscode.Range(open.end, close.start);
 *   editor.setDecorations(decoration, [ inner ]);
 * }
 */
export function findConditionalPairs(document: vscode.TextDocument): ConditionalPair[] {
  const opens = findAllMatches(document, OPEN_MARKER_RE);
  const closes = findAllMatches(document, CLOSE_MARKER_RE);

  const events = [
    ...opens.map(o => ({ kind: 'open' as const, range: o.range, index: o.match.index })),
    ...closes.map(c => ({ kind: 'close' as const, range: c.range, index: c.match.index }))
  ].sort((a, b) => a.index - b.index);

  const pairs: ConditionalPair[] = [];
  const stack: vscode.Range[] = [];

  for (const event of events) {
    if (event.kind === 'open') {
      stack.push(event.range);
    }

    else {
      const open = stack.pop();

      if (open) {
        pairs.push({ open, close: event.range });
      }
    }
  }

  return pairs;
}
