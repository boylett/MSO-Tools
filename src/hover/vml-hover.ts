import * as vscode from 'vscode';
import { VML_TAGS } from '../data/vml-tags';
import { VML_ATTRIBUTES } from '../data/vml-attributes';
import { findEnclosingTagStart, isTagNamePosition } from '../util/text-scan';

const VML_TAG_RE = /[vow]:[A-Za-z][A-Za-z0-9_-]*|xml/;
const VML_ATTR_RE = /[A-Za-z_][A-Za-z0-9_-]*(?::[A-Za-z_][A-Za-z0-9_-]*)?/;

/**
 * Hover provider for VML. Resolves either a VML tag name or an attribute name
 * (when the cursor is inside an open VML tag) to documentation.
 */
export class VmlHoverProvider implements vscode.HoverProvider {
  /**
   * Provides hover info for a VML tag or attribute at the cursor.
   *
   * @param document - The active text document.
   * @param position - The position the user is hovering over.
   */
  provideHover(document: vscode.TextDocument, position: vscode.Position): vscode.ProviderResult<vscode.Hover> {
    const tagHover = this.resolveTagHover(document, position);

    if (tagHover) {
      return tagHover;
    }

    return this.resolveAttributeHover(document, position);
  }

  /**
   * Returns a hover for a VML tag name at the cursor, or null if not on one.
   *
   * @param document - The active text document.
   * @param position - The position the user is hovering over.
   */
  private resolveTagHover(document: vscode.TextDocument, position: vscode.Position): vscode.Hover | null {
    const range = document.getWordRangeAtPosition(position, VML_TAG_RE);

    if (!range) {
      return null;
    }

    const word = document.getText(range);
    const doc = VML_TAGS[word];

    if (!doc) {
      return null;
    }

    if (!isTagNamePosition(document, range)) {
      return null;
    }

    const md = new vscode.MarkdownString();

    md.appendMarkdown(`**\`<${ word }>\`** *(VML tag)*\n\n`);
    md.appendMarkdown(`${ doc.description }\n\n`);

    if (doc.attributes.length > 0) {
      md.appendMarkdown(`**Common attributes:** ${ doc.attributes.map(a => `\`${ a }\``).join(', ') }\n\n`);
    }

    md.appendCodeblock(doc.example, 'html');

    return new vscode.Hover(md, range);
  }

  /**
   * Returns a hover for a VML attribute name when the cursor is inside an open
   * VML tag. Returns null if the cursor is not inside a VML tag context, or if
   * the word under the cursor is not a known VML attribute.
   *
   * @param document - The active text document.
   * @param position - The position the user is hovering over.
   */
  private resolveAttributeHover(document: vscode.TextDocument, position: vscode.Position): vscode.Hover | null {
    const range = document.getWordRangeAtPosition(position, VML_ATTR_RE);

    if (!range) {
      return null;
    }

    const word = document.getText(range);
    const doc = VML_ATTRIBUTES[word];

    if (!doc) {
      return null;
    }

    const tagStart = findEnclosingTagStart(document, position);

    if (tagStart === null) {
      return null;
    }

    const tagPrefix = document.getText(new vscode.Range(document.positionAt(tagStart), position));

    if (!/^<[vow]:/.test(tagPrefix) && word !== 'xmlns:v' && word !== 'xmlns:o' && word !== 'xmlns:w') {
      return null;
    }

    const md = new vscode.MarkdownString();

    md.appendMarkdown(`**\`${ word }\`** *(VML attribute)*\n\n`);
    md.appendMarkdown(`${ doc.description }\n\n`);
    md.appendMarkdown(`**Values:** ${ doc.values }\n\n`);

    if (doc.validOn.length > 0) {
      md.appendMarkdown(`**Used on:** ${ doc.validOn.map(t => `\`<${ t }>\``).join(', ') }`);
    }

    return new vscode.Hover(md, range);
  }
}
