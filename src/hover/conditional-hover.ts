import * as vscode from 'vscode';
import { CONDITIONAL_KEYWORDS, getMsoVersionNote } from '../data/conditional-keywords';

const CONDITIONAL_OPEN_RE = /<!--\s*\[if\b[^\]]*\]>|<!--\s*\[if\b[^\]]*\]><!-->/;
const CONDITIONAL_CLOSE_RE = /<!\s*\[endif\]\s*-->|<!--\s*<!\s*\[endif\]\s*-->/;
const KEYWORD_RE = /[A-Za-z]+|\d+/;

/**
 * Hover provider for MSO conditional comment keywords. Activates only when the
 * cursor sits inside a conditional-comment marker (open or close).
 */
export class ConditionalHoverProvider implements vscode.HoverProvider {
  /**
   * Provides hover info for a conditional-comment keyword or version number
   * at the cursor, or null when the cursor is not inside a marker.
   *
   * @param document - The active text document.
   * @param position - The position the user is hovering over.
   */
  provideHover(document: vscode.TextDocument, position: vscode.Position): vscode.ProviderResult<vscode.Hover> {
    if (!this.isInsideConditionalMarker(document, position)) {
      return null;
    }

    const wordRange = document.getWordRangeAtPosition(position, KEYWORD_RE);

    if (!wordRange) {
      return null;
    }

    const word = document.getText(wordRange);

    if (/^\d+$/.test(word)) {
      const note = getMsoVersionNote(word);

      if (!note) {
        return null;
      }

      const md = new vscode.MarkdownString();

      md.appendMarkdown(`**MSO version \`${ word }\`** - ${ note }`);

      return new vscode.Hover(md, wordRange);
    }

    const doc = CONDITIONAL_KEYWORDS[word];

    if (!doc) {
      return null;
    }

    const md = new vscode.MarkdownString();

    md.appendMarkdown(`**\`${ word }\`** *(conditional comment keyword)*\n\n`);
    md.appendMarkdown(`${ doc.description }\n\n`);
    md.appendCodeblock(doc.example, 'html');

    return new vscode.Hover(md, wordRange);
  }

  /**
   * Whether the given position falls inside a conditional-comment marker on
   * the same line. Cheap check - only considers the current line.
   *
   * @param document - The active text document.
   * @param position - The cursor position.
   */
  private isInsideConditionalMarker(document: vscode.TextDocument, position: vscode.Position): boolean {
    const lineText = document.lineAt(position.line).text;
    const offsetInLine = position.character;

    return this.matchSpansOffset(lineText, CONDITIONAL_OPEN_RE, offsetInLine)
      || this.matchSpansOffset(lineText, CONDITIONAL_CLOSE_RE, offsetInLine);
  }

  /**
   * Returns true if any match of `regex` in `text` spans the given offset.
   *
   * @param text - The line text to search.
   * @param regex - A non-global regex to evaluate.
   * @param offset - The character offset within `text`.
   */
  private matchSpansOffset(text: string, regex: RegExp, offset: number): boolean {
    const globalRegex = new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : `${ regex.flags }g`);

    let match: RegExpExecArray | null;

    while ((match = globalRegex.exec(text)) !== null) {
      const start = match.index;
      const end = start + match[0].length;

      if (offset >= start && offset <= end) {
        return true;
      }

      if (match[0].length === 0) {
        globalRegex.lastIndex++;
      }
    }

    return false;
  }
}
