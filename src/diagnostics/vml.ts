import * as vscode from 'vscode';
import { findAllMatches, suggestClosest } from '../util/text-scan';
import { VML_TAGS, getKnownVmlTags } from '../data/vml-tags';
import { VML_ATTRIBUTES, getKnownVmlAttributes } from '../data/vml-attributes';

const VML_OPEN_TAG_RE = /<([vow]:[A-Za-z][A-Za-z0-9_-]*)([^>]*)>/g;
const ATTRIBUTE_RE = /([A-Za-z_][A-Za-z0-9_-]*(?::[A-Za-z_][A-Za-z0-9_-]*)?)\s*(?:=\s*(?:"[^"]*"|'[^']*'))?/g;
const HTML_TAG_RE = /<html\b([^>]*)>/i;

/**
 * Linter for VML markup. Reports:
 * - VML tags used without an `xmlns:v` declaration on the `<html>` element.
 * - Unknown attribute names on known VML tags, with did-you-mean suggestions.
 *
 * Skips warnings entirely on documents that contain no VML tags.
 *
 * @param document - The text document to lint.
 */
export function lintVml(document: vscode.TextDocument): vscode.Diagnostic[] {
  const text = document.getText();
  const tagMatches = findAllMatches(document, VML_OPEN_TAG_RE);

  if (tagMatches.length === 0) {
    return [];
  }

  const diagnostics: vscode.Diagnostic[] = [];
  const knownTags = getKnownVmlTags();
  const knownAttrs = getKnownVmlAttributes();

  const namespaces = detectNamespaces(text);

  for (const { match, range } of tagMatches) {
    const tagName = match[1];
    const attributesText = match[2];
    const namespace = tagName.split(':')[0];
    const requiredXmlns = `xmlns:${ namespace }`;

    if (!namespaces.has(namespace)) {
      const tagStart = range.start;
      const tagNameEnd = tagStart.translate(0, 1 + tagName.length);
      const tagNameRange = new vscode.Range(tagStart, tagNameEnd);

      const diag = new vscode.Diagnostic(
        tagNameRange,
        `\`<${ tagName }>\` requires \`${ requiredXmlns }\` to be declared on the \`<html>\` element.`,
        vscode.DiagnosticSeverity.Warning
      );

      diag.source = 'mso-tools';
      diag.code = 'mso.vml.missing-namespace';

      diagnostics.push(diag);
    }

    if (VML_TAGS[tagName]) {
      diagnostics.push(...lintAttributes(document, range, tagName, attributesText, knownAttrs));
    }

    else {
      const suggestion = suggestClosest(tagName, knownTags, 2);

      if (suggestion) {
        const tagStart = range.start.translate(0, 1);
        const tagNameRange = new vscode.Range(tagStart, tagStart.translate(0, tagName.length));

        const diag = new vscode.Diagnostic(
          tagNameRange,
          `Unknown VML tag \`<${ tagName }>\`. Did you mean \`<${ suggestion }>\`?`,
          vscode.DiagnosticSeverity.Information
        );

        diag.source = 'mso-tools';
        diag.code = 'mso.vml.unknown-tag';

        diagnostics.push(diag);
      }
    }
  }

  return diagnostics;
}

/**
 * Returns the set of XML namespace prefixes declared on the document's
 * `<html>` element. Returns an empty set if there is no `<html>` tag, in which
 * case the linter cannot verify namespaces and stays quiet.
 *
 * @param text - The full document text.
 */
function detectNamespaces(text: string): Set<string> {
  const htmlMatch = HTML_TAG_RE.exec(text);

  if (!htmlMatch) {
    return new Set([ 'v', 'o', 'w' ]);
  }

  const attrs = htmlMatch[1];
  const namespaces = new Set<string>();
  const xmlnsRe = /xmlns:([a-z]+)\s*=/gi;

  let attrMatch: RegExpExecArray | null;

  while ((attrMatch = xmlnsRe.exec(attrs)) !== null) {
    namespaces.add(attrMatch[1].toLowerCase());
  }

  return namespaces;
}

/**
 * Walks the attribute portion of a VML open tag and reports unknown attributes
 * (with a did-you-mean suggestion when one is close enough).
 *
 * @param document - The text document being linted.
 * @param tagRange - The full range of the open tag (`<v:tag ...>`).
 * @param tagName - The VML tag name (e.g. `v:rect`).
 * @param attributesText - The substring between the tag name and the closing `>`.
 * @param knownAttrs - List of all known VML attribute names.
 */
function lintAttributes(
  document: vscode.TextDocument,
  tagRange: vscode.Range,
  tagName: string,
  attributesText: string,
  knownAttrs: string[]
): vscode.Diagnostic[] {
  const diagnostics: vscode.Diagnostic[] = [];
  const tagStartOffset = document.offsetAt(tagRange.start);
  const attrsStartOffset = tagStartOffset + 1 + tagName.length;

  ATTRIBUTE_RE.lastIndex = 0;

  let match: RegExpExecArray | null;

  while ((match = ATTRIBUTE_RE.exec(attributesText)) !== null) {
    const attrName = match[1];

    if (VML_ATTRIBUTES[attrName] || isStandardHtmlAttribute(attrName)) {
      continue;
    }

    const attrOffset = attrsStartOffset + match.index;
    const attrStart = document.positionAt(attrOffset);
    const attrEnd = document.positionAt(attrOffset + attrName.length);
    const attrRange = new vscode.Range(attrStart, attrEnd);

    const suggestion = suggestClosest(attrName, knownAttrs, 2);
    const message = suggestion
      ? `Unknown VML attribute \`${ attrName }\` on \`<${ tagName }>\`. Did you mean \`${ suggestion }\`?`
      : `Unknown VML attribute \`${ attrName }\` on \`<${ tagName }>\`.`;

    const diag = new vscode.Diagnostic(attrRange, message, vscode.DiagnosticSeverity.Warning);

    diag.source = 'mso-tools';
    diag.code = 'mso.vml.unknown-attribute';

    diagnostics.push(diag);
  }

  return diagnostics;
}

const STANDARD_HTML_ATTRS = new Set([
  'id', 'class', 'style', 'title', 'lang', 'dir', 'hidden', 'tabindex', 'role',
  'alt', 'src', 'href', 'target', 'rel', 'name', 'value', 'type'
]);

/**
 * Whether the given attribute name is a standard HTML attribute that VML tags
 * may also legally use (so we don't flag `id`, `class`, `style`, etc.).
 *
 * @param name - The attribute name to test.
 */
function isStandardHtmlAttribute(name: string): boolean {
  if (STANDARD_HTML_ATTRS.has(name.toLowerCase())) {
    return true;
  }

  if (name.toLowerCase().startsWith('data-') || name.toLowerCase().startsWith('aria-')) {
    return true;
  }

  return false;
}
