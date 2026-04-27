import * as vscode from 'vscode';
import { MSO_PROPERTIES } from '../data/mso-properties';

const STYLE_OPEN_RE = /<style\b[^>]*>/gi;
const STYLE_CLOSE_RE = /<\/style\s*>/gi;

/**
 * Completion provider for `mso-*` CSS properties inside HTML/PHP `<style>`
 * blocks and `style="..."` attributes. Standalone `.css` files are covered by
 * the registered `css.customData` file; this provider exists because
 * VSCode's HTML extension validates and completes embedded CSS through a
 * separate pipeline that doesn't read `css.customData`.
 *
 * @example
 * vscode.languages.registerCompletionItemProvider(
 *   [ { language: 'html' }, { language: 'php' } ],
 *   new MsoCssCompletionProvider(),
 *   '-', 'm'
 * );
 */
export class MsoCssCompletionProvider implements vscode.CompletionItemProvider {
  /**
   * Provides completion items for every known `mso-*` property when the
   * cursor is in a CSS context (inside a `<style>` block or a `style=""`
   * attribute). Returns `undefined` outside of CSS contexts so other
   * providers and built-in HTML completions still get their turn.
   *
   * @param document - The active text document.
   * @param position - The cursor position.
   */
  provideCompletionItems(document: vscode.TextDocument, position: vscode.Position): vscode.CompletionItem[] | undefined {
    if (!isInCssContext(document, position)) {
      return undefined;
    }

    const items: vscode.CompletionItem[] = [];

    for (const [ name, doc ] of Object.entries(MSO_PROPERTIES)) {
      const item = new vscode.CompletionItem(name, vscode.CompletionItemKind.Property);
      const detail = new vscode.MarkdownString();

      detail.appendMarkdown(`${ doc.description }\n\n`);
      detail.appendMarkdown(`**Values:** ${ doc.values }\n\n`);
      detail.appendCodeblock(doc.example, 'css');

      item.detail = 'MSO CSS property';
      item.documentation = detail;
      item.insertText = `${ name }: `;

      items.push(item);
    }

    return items;
  }
}

/**
 * Heuristic check for "is the cursor inside CSS?" within an HTML/PHP document.
 * Returns true when the cursor is inside a `<style>` block (no closing
 * `</style>` between the most recent opener and the cursor) or inside a
 * `style="..."` attribute value on the same line.
 *
 * @param document - The text document being inspected.
 * @param position - The cursor position.
 */
function isInCssContext(document: vscode.TextDocument, position: vscode.Position): boolean {
  if (isInsideStyleBlock(document, position)) {
    return true;
  }

  return isInsideStyleAttribute(document, position);
}

/**
 * Whether the cursor is currently inside a `<style>...</style>` block.
 *
 * @param document - The text document.
 * @param position - The cursor position.
 */
function isInsideStyleBlock(document: vscode.TextDocument, position: vscode.Position): boolean {
  const offset = document.offsetAt(position);
  const text = document.getText();

  let lastOpen = -1;

  STYLE_OPEN_RE.lastIndex = 0;

  let match: RegExpExecArray | null;

  while ((match = STYLE_OPEN_RE.exec(text)) !== null) {
    if (match.index >= offset) {
      break;
    }

    lastOpen = match.index + match[0].length;
  }

  if (lastOpen === -1 || lastOpen > offset) {
    return false;
  }

  STYLE_CLOSE_RE.lastIndex = lastOpen;

  const closeMatch = STYLE_CLOSE_RE.exec(text);

  if (closeMatch && closeMatch.index < offset) {
    return false;
  }

  return true;
}

/**
 * Whether the cursor is currently inside a `style="..."` or `style='...'`
 * attribute value on the same line as the cursor.
 *
 * @param document - The text document.
 * @param position - The cursor position.
 */
function isInsideStyleAttribute(document: vscode.TextDocument, position: vscode.Position): boolean {
  const lineText = document.lineAt(position.line).text;
  const before = lineText.slice(0, position.character);
  const styleMatch = /\bstyle\s*=\s*(["'])([^"']*)$/i.exec(before);

  return styleMatch !== null;
}
