import * as vscode from 'vscode';
import { findConditionalPairs } from '../util/conditional-pairs';
import { findHtmlMarkerPairs } from '../util/html-markers';
import { findTagPairs, findSelfClosingTags } from '../util/tag-pairs';

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

    return undefined;
  }
}
