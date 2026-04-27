import * as vscode from 'vscode';
import { findConditionalPairs } from '../util/conditional-pairs';
import { findHtmlMarkerPairs } from '../util/html-markers';
import { findTagPairs, findSelfClosingTags } from '../util/tag-pairs';

const YAHOO_OCCURRENCE_RE = /(@media\s+screen\s+)(yahoo)\b/gi;

/**
 * Finds the closing `}` index of the block whose opening `{` is the next
 * non-whitespace, non-comment character at or after `fromIdx`. Walks the text
 * counting brace depth while skipping CSS comments and string literals so the
 * returned `}` is the one that actually balances the opening brace.
 *
 * Returns `null` if the next non-whitespace token isn't `{`, if a string or
 * comment is unterminated, or if the brace count never returns to zero
 * before end-of-document.
 *
 * @param text - The full document text.
 * @param fromIdx - The position to start scanning from (typically just after the at-rule prelude).
 */
function findBlockEnd(text: string, fromIdx: number): number | null {
  let i = fromIdx;

  while (i < text.length) {
    const ch = text[i];

    if (ch === '/' && text[i + 1] === '*') {
      const end = text.indexOf('*/', i + 2);

      if (end === -1) {
        return null;
      }

      i = end + 2;

      continue;
    }

    if (ch === '{') {
      break;
    }

    if (!isWhitespace(ch)) {
      return null;
    }

    i++;
  }

  if (text[i] !== '{') {
    return null;
  }

  let depth = 1;

  i++;

  while (i < text.length) {
    const ch = text[i];

    if (ch === '/' && text[i + 1] === '*') {
      const end = text.indexOf('*/', i + 2);

      if (end === -1) {
        return null;
      }

      i = end + 2;

      continue;
    }

    if (ch === '"' || ch === '\'') {
      i = skipString(text, i);

      continue;
    }

    if (ch === '{') {
      depth++;
    }

    else if (ch === '}') {
      depth--;

      if (depth === 0) {
        return i;
      }
    }

    i++;
  }

  return null;
}

/**
 * Skips past a quoted string literal, returning the index of the character
 * immediately after the closing quote (or end-of-document if the string is
 * unterminated). Handles backslash escapes inside the string.
 *
 * @param text - The full document text.
 * @param startIdx - The index of the opening quote.
 */
function skipString(text: string, startIdx: number): number {
  const quote = text[startIdx];

  let i = startIdx + 1;

  while (i < text.length) {
    if (text[i] === '\\') {
      i += 2;

      continue;
    }

    if (text[i] === quote) {
      return i + 1;
    }

    i++;
  }

  return i;
}

/**
 * Whether a character is whitespace (space, tab, newline, carriage return).
 *
 * @param ch - The character to test.
 */
function isWhitespace(ch: string): boolean {
  return ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r';
}

/**
 * Document highlight provider that mirrors VSCode's built-in bracket-matching
 * behaviour for two extension-specific constructs:
 *
 * - MSO conditional comments - placing the cursor inside `<!--[if ...]>` (or
 *   its revealed-conditional counterpart) lights up both the open and close
 *   markers so it's easy to see what the conditional is bracketing.
 * - HTML marker blocks - same treatment for `<!-- * Block Name -->` and
 *   `<!-- * // Block Name -->`.
 *
 * @example
 * vscode.languages.registerDocumentHighlightProvider(
 *   [ { language: 'html' }, { language: 'php' } ],
 *   new MsoMatchingHighlightProvider()
 * );
 */
export class MsoMatchingHighlightProvider implements vscode.DocumentHighlightProvider {
  /**
   * Returns highlights for the open/close pair the cursor is currently inside,
   * or `undefined` when the cursor is outside any of our markers. Returning
   * `undefined` (rather than an empty array) is important: it tells VSCode
   * "this provider doesn't apply here", so the built-in HTML/CSS highlight
   * providers still get a chance to run for ordinary tag/identifier matching.
   *
   * @param document - The document being inspected.
   * @param position - The cursor position.
   */
  provideDocumentHighlights(document: vscode.TextDocument, position: vscode.Position): vscode.DocumentHighlight[] | undefined {
    const conditionalMatch = findConditionalPairs(document).find(({ open, close }) =>
      open.contains(position) || close.contains(position)
    );

    if (conditionalMatch) {
      return [
        new vscode.DocumentHighlight(conditionalMatch.open, vscode.DocumentHighlightKind.Text),
        new vscode.DocumentHighlight(conditionalMatch.close, vscode.DocumentHighlightKind.Text)
      ];
    }

    const markerMatch = findHtmlMarkerPairs(document).find(({ open, close }) =>
      open.contains(position) || close.contains(position)
    );

    if (markerMatch) {
      return [
        new vscode.DocumentHighlight(markerMatch.open, vscode.DocumentHighlightKind.Text),
        new vscode.DocumentHighlight(markerMatch.close, vscode.DocumentHighlightKind.Text)
      ];
    }

    const tagMatch = findTagPairs(document).find(({ openFull, closeFull }) =>
      openFull.contains(position) || closeFull.contains(position)
    );

    if (tagMatch) {
      return [
        new vscode.DocumentHighlight(tagMatch.openName, vscode.DocumentHighlightKind.Text),
        new vscode.DocumentHighlight(tagMatch.closeName, vscode.DocumentHighlightKind.Text)
      ];
    }

    const selfClosing = findSelfClosingTags(document).find(({ full }) => full.contains(position));

    if (selfClosing) {
      return [ new vscode.DocumentHighlight(selfClosing.name, vscode.DocumentHighlightKind.Text) ];
    }

    const yahooHighlights = this.resolveYahooHighlights(document, position);

    if (yahooHighlights) {
      return yahooHighlights;
    }

    return undefined;
  }

  /**
   * Returns highlights covering every `@media screen yahoo { ... }` block in
   * the document when the cursor is anywhere inside the prelude
   * (`@media screen yahoo`) of one of them. This is a workaround for VSCode's
   * CSS word-occurrence highlighter, which bails out at the next `;` after
   * the malformed media query - we ignore its scoping entirely and return
   * the full block ranges, balanced over `{ }` while ignoring braces inside
   * strings and CSS comments.
   *
   * Returns `undefined` when the cursor isn't on the `@media`/`screen`/`yahoo`
   * tokens of any such block, so other providers and the built-in highlighter
   * still get their turn.
   *
   * @param document - The document being inspected.
   * @param position - The cursor position.
   */
  private resolveYahooHighlights(document: vscode.TextDocument, position: vscode.Position): vscode.DocumentHighlight[] | undefined {
    const text = document.getText();
    const blocks: { prelude: vscode.Range; full: vscode.Range }[] = [];

    YAHOO_OCCURRENCE_RE.lastIndex = 0;

    let match: RegExpExecArray | null;

    while ((match = YAHOO_OCCURRENCE_RE.exec(text)) !== null) {
      const preludeStart = match.index;
      const preludeEnd = preludeStart + match[0].length;
      const blockEnd = findBlockEnd(text, preludeEnd);

      if (blockEnd === null) {
        continue;
      }

      blocks.push({
        prelude: new vscode.Range(
          document.positionAt(preludeStart),
          document.positionAt(preludeEnd)
        ),
        full: new vscode.Range(
          document.positionAt(preludeStart),
          document.positionAt(blockEnd + 1)
        )
      });
    }

    if (!blocks.some(({ prelude }) => prelude.contains(position))) {
      return undefined;
    }

    return blocks.map(({ full }) => new vscode.DocumentHighlight(full, vscode.DocumentHighlightKind.Text));
  }
}
