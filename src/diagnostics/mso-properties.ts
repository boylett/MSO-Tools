import * as vscode from 'vscode';
import { findAllMatches, suggestClosest } from '../util/text-scan';
import { MSO_PROPERTIES, getKnownMsoProperties } from '../data/mso-properties';

const MSO_DECLARATION_RE = /\b(mso-[a-z][a-z0-9-]*)\s*:/g;

/**
 * Linter for unknown `mso-*` CSS property names. Walks every `mso-*:` declaration
 * in the document and warns when the property name is not in the known list,
 * suggesting the closest known property name within a small edit distance.
 *
 * @param document - The text document to lint.
 */
export function lintMsoProperties(document: vscode.TextDocument): vscode.Diagnostic[] {
  const known = getKnownMsoProperties();
  const matches = findAllMatches(document, MSO_DECLARATION_RE);
  const diagnostics: vscode.Diagnostic[] = [];

  for (const { match, range } of matches) {
    const propertyName = match[1];

    if (MSO_PROPERTIES[propertyName]) {
      continue;
    }

    const propertyEnd = range.start.translate(0, propertyName.length);
    const propertyRange = new vscode.Range(range.start, propertyEnd);

    const suggestion = suggestClosest(propertyName, known, 3);
    const message = suggestion
      ? `Unknown MSO property \`${ propertyName }\`. Did you mean \`${ suggestion }\`?`
      : `Unknown MSO property \`${ propertyName }\`.`;

    const diag = new vscode.Diagnostic(propertyRange, message, vscode.DiagnosticSeverity.Warning);

    diag.source = 'mso-tools';
    diag.code = 'mso.css.unknown-property';

    diagnostics.push(diag);
  }

  return diagnostics;
}
