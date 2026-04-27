import * as vscode from 'vscode';
import { findConditionalPairs } from '../util/conditional-pairs';
import { findHtmlMarkerPairs } from '../util/html-markers';

/**
 * Folding provider for HTML and PHP documents. Produces folding ranges for:
 *
 * - MSO conditional comments - fold from the open marker line to the line
 *   *before* the matching `<![endif]-->`. Keeping the close on its own visible
 *   line lets it remain fully syntax-highlighted and gives a clean "open + ...
 *   + close" reading order when collapsed.
 * - HTML "marker" blocks - same treatment for `<!-- * Block Name -->` and
 *   `<!-- * // Block Name -->` pairs.
 *
 * Pairs whose open and close are on adjacent lines are skipped - there's no
 * inner content to fold there.
 *
 * @example
 * vscode.languages.registerFoldingRangeProvider(
 *   [ { language: 'html' }, { language: 'php' } ],
 *   new MsoFoldingProvider()
 * );
 */
export class MsoFoldingProvider implements vscode.FoldingRangeProvider {
  /**
   * Returns folding ranges for both MSO conditionals and HTML marker blocks.
   *
   * @param document - The document to scan.
   */
  provideFoldingRanges(document: vscode.TextDocument): vscode.FoldingRange[] {
    return [
      ...this.foldConditionals(document),
      ...this.foldMarkers(document)
    ];
  }

  /**
   * Folding ranges for MSO conditional comment pairs.
   *
   * @param document - The document to scan.
   */
  private foldConditionals(document: vscode.TextDocument): vscode.FoldingRange[] {
    return findConditionalPairs(document)
      .filter(({ open, close }) => close.start.line > open.start.line + 1)
      .map(({ open, close }) => new vscode.FoldingRange(
        open.start.line,
        close.start.line - 1,
        vscode.FoldingRangeKind.Region
      ));
  }

  /**
   * Folding ranges for HTML marker blocks.
   *
   * @param document - The document to scan.
   */
  private foldMarkers(document: vscode.TextDocument): vscode.FoldingRange[] {
    return findHtmlMarkerPairs(document)
      .filter(({ open, close }) => close.start.line > open.start.line + 1)
      .map(({ open, close }) => new vscode.FoldingRange(
        open.start.line,
        close.start.line - 1,
        vscode.FoldingRangeKind.Region
      ));
  }
}
