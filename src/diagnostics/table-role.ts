import * as vscode from 'vscode';
import { findAllMatches } from '../util/text-scan';

const TABLE_OPEN_TAG_RE = /<table\b[^>]*>/gi;
const HAS_PRESENTATION_ROLE_RE = /\brole\s*=\s*["'](?:presentation|none)["']/i;

export const TABLE_MISSING_ROLE_CODE = 'mso.table.missing-role';

/**
 * Linter for `<table>` elements without an accessibility role. In HTML email
 * every table is layout, never data, so each `<table>` must declare
 * `role="presentation"` (or the synonym `role="none"`) so screen readers skip
 * its grid semantics.
 *
 * Reports a Warning whose range covers the entire `<table ...>` open tag so
 * the underline visually highlights the whole offending element opener.
 *
 * @param document - The text document to lint.
 */
export function lintTableRole(document: vscode.TextDocument): vscode.Diagnostic[] {
  const matches = findAllMatches(document, TABLE_OPEN_TAG_RE);
  const diagnostics: vscode.Diagnostic[] = [];

  for (const { match, range } of matches) {
    if (HAS_PRESENTATION_ROLE_RE.test(match[0])) {
      continue;
    }

    const diag = new vscode.Diagnostic(
      range,
      '`<table>` is missing `role="presentation"`. In HTML email every table is layout, so screen readers should skip its grid semantics.',
      vscode.DiagnosticSeverity.Warning
    );

    diag.source = 'mso-tools';
    diag.code = TABLE_MISSING_ROLE_CODE;

    diagnostics.push(diag);
  }

  return diagnostics;
}
