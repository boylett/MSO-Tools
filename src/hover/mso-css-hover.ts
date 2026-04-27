import * as vscode from 'vscode';
import { MSO_PROPERTIES } from '../data/mso-properties';

const MSO_PROPERTY_RE = /mso-[a-z][a-z0-9-]*/;
const YAHOO_KEYWORD_RE = /yahoo/;
const YAHOO_PRECEDING_RE = /@media\s+screen\s+$/;

/**
 * Hover provider for MSO CSS properties and email-client targeting hacks.
 * Activates inside CSS files and inside `<style>` blocks of HTML/PHP documents.
 */
export class MsoCssHoverProvider implements vscode.HoverProvider {
  /**
   * Provides hover info for an MSO CSS property or a Yahoo Mail conditional
   * media query keyword at the cursor.
   *
   * @param document - The active text document.
   * @param position - The position the user is hovering over.
   */
  provideHover(document: vscode.TextDocument, position: vscode.Position): vscode.ProviderResult<vscode.Hover> {
    const propertyHover = this.resolvePropertyHover(document, position);

    if (propertyHover) {
      return propertyHover;
    }

    return this.resolveYahooHover(document, position);
  }

  /**
   * Returns a hover for an `mso-*` CSS property at the cursor, or null when
   * the cursor isn't on one.
   *
   * @param document - The active text document.
   * @param position - The cursor position.
   */
  private resolvePropertyHover(document: vscode.TextDocument, position: vscode.Position): vscode.Hover | null {
    const range = document.getWordRangeAtPosition(position, MSO_PROPERTY_RE);

    if (!range) {
      return null;
    }

    const word = document.getText(range);
    const doc = MSO_PROPERTIES[word];

    if (!doc) {
      const md = new vscode.MarkdownString();

      md.appendMarkdown(`**\`${ word }\`** *(unrecognised MSO property)*\n\n`);
      md.appendMarkdown('This is not in the known `mso-*` property list. Verify the spelling against the [MS Office CSS reference](https://learn.microsoft.com/en-us/dotnet/api/system.windows.documents.officestyles).');

      return new vscode.Hover(md, range);
    }

    const md = new vscode.MarkdownString();

    md.appendMarkdown(`**\`${ word }\`** *(MSO CSS property)*\n\n`);
    md.appendMarkdown(`${ doc.description }\n\n`);
    md.appendMarkdown(`**Values:** ${ doc.values }\n\n`);
    md.appendCodeblock(doc.example, 'css');

    return new vscode.Hover(md, range);
  }

  /**
   * Returns a hover for the `yahoo` keyword in `@media screen yahoo` rules,
   * or null when the cursor isn't on it. Verifies the preceding text matches
   * `@media screen ` so we don't fire on the word `yahoo` in unrelated places.
   *
   * @param document - The active text document.
   * @param position - The cursor position.
   */
  private resolveYahooHover(document: vscode.TextDocument, position: vscode.Position): vscode.Hover | null {
    const range = document.getWordRangeAtPosition(position, YAHOO_KEYWORD_RE);

    if (!range) {
      return null;
    }

    const lineStart = new vscode.Position(range.start.line, 0);
    const before = document.getText(new vscode.Range(lineStart, range.start));

    if (!YAHOO_PRECEDING_RE.test(before)) {
      return null;
    }

    const md = new vscode.MarkdownString();

    md.appendMarkdown('**`yahoo`** *(Yahoo Mail conditional CSS)*\n\n');
    md.appendMarkdown('Yahoo Mail-specific media query hack. Yahoo Mail recognises `@media screen yahoo` as a valid query and applies the rules inside; other email clients reject the malformed query and skip the block, making this a reliable Yahoo-only target.\n\n');
    md.appendCodeblock('@media screen yahoo {\n  .yahoo-only {\n    color: red;\n  }\n}', 'css');

    return new vscode.Hover(md, range);
  }
}
