import * as vscode from 'vscode';
import { findAllMatches } from '../util/text-scan';

const OPEN_MARKER_RE = /<!--\s*\[if\b[^\]]*\]>(?:<!-->)?/g;
const CLOSE_MARKER_RE = /(?:<!--\s*)?<!\s*\[endif\]\s*-->/g;

/**
 * Linter for MSO conditional comments. Reports unmatched `<!--[if ...]>` opens
 * and stray `<![endif]-->` closes by walking opens and closes in document order
 * and pairing them as a balanced stack.
 *
 * @param document - The text document to lint.
 */
export function lintConditionalComments(document: vscode.TextDocument): vscode.Diagnostic[] {
  const opens = findAllMatches(document, OPEN_MARKER_RE);
  const closes = findAllMatches(document, CLOSE_MARKER_RE);

  const events = [
    ...opens.map(o => ({ kind: 'open' as const, ...o })),
    ...closes.map(c => ({ kind: 'close' as const, ...c }))
  ].sort((a, b) => a.match.index - b.match.index);

  const diagnostics: vscode.Diagnostic[] = [];
  const stack: typeof events = [];

  for (const event of events) {
    if (event.kind === 'open') {
      stack.push(event);
    }

    else {
      if (stack.length === 0) {
        const diag = new vscode.Diagnostic(
          event.range,
          'Stray `<![endif]-->` - no matching `<!--[if ...]>` opens before it.',
          vscode.DiagnosticSeverity.Warning
        );

        diag.source = 'mso-tools';
        diag.code = 'mso.conditional.stray-close';

        diagnostics.push(diag);
      }

      else {
        stack.pop();
      }
    }
  }

  for (const unmatchedOpen of stack) {
    const diag = new vscode.Diagnostic(
      unmatchedOpen.range,
      'Unmatched conditional comment - no `<![endif]-->` found before end of file.',
      vscode.DiagnosticSeverity.Warning
    );

    diag.source = 'mso-tools';
    diag.code = 'mso.conditional.unmatched-open';

    diagnostics.push(diag);
  }

  return diagnostics;
}
