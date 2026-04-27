import * as vscode from 'vscode';
import { TABLE_MISSING_ROLE_CODE } from '../diagnostics/table-role';

const TABLE_TAG_NAME_RE = /^<table\b/i;

/**
 * Quick-fix provider for the `mso.table.missing-role` diagnostic. Offers a
 * single code action: insert ` role="presentation"` immediately after the
 * `<table` tag name.
 *
 * @example
 * vscode.languages.registerCodeActionsProvider(
 *   [ { language: 'html' }, { language: 'php' } ],
 *   new TableRoleCodeActionProvider(),
 *   { providedCodeActionKinds: TableRoleCodeActionProvider.providedKinds }
 * );
 */
export class TableRoleCodeActionProvider implements vscode.CodeActionProvider {
  static readonly providedKinds = [ vscode.CodeActionKind.QuickFix ];

  /**
   * Returns code actions for the given range. Filters the diagnostics in
   * `context` to ones produced by our table-role linter, then offers an
   * insertion edit for each one.
   *
   * @param document - The active document.
   * @param _range - The range or selection where the code action was requested.
   * @param context - The code action context, including diagnostics at this position.
   */
  provideCodeActions(
    document: vscode.TextDocument,
    _range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext
  ): vscode.CodeAction[] {
    const actions: vscode.CodeAction[] = [];

    for (const diagnostic of context.diagnostics) {
      if (diagnostic.code !== TABLE_MISSING_ROLE_CODE) {
        continue;
      }

      const action = this.buildInsertAction(document, diagnostic);

      if (action) {
        actions.push(action);
      }
    }

    return actions;
  }

  /**
   * Builds a quick-fix action that inserts ` role="presentation"` just after
   * the `<table` tag name. Returns null if the diagnostic's range no longer
   * covers a `<table` opener (e.g. the document has changed since the
   * diagnostic was issued).
   *
   * @param document - The active document.
   * @param diagnostic - The diagnostic to fix.
   */
  private buildInsertAction(document: vscode.TextDocument, diagnostic: vscode.Diagnostic): vscode.CodeAction | null {
    const tagText = document.getText(diagnostic.range);

    if (!TABLE_TAG_NAME_RE.test(tagText)) {
      return null;
    }

    const insertPosition = diagnostic.range.start.translate(0, '<table'.length);
    const action = new vscode.CodeAction('Add `role="presentation"`', vscode.CodeActionKind.QuickFix);
    const edit = new vscode.WorkspaceEdit();

    edit.insert(document.uri, insertPosition, ' role="presentation"');

    action.edit = edit;
    action.diagnostics = [ diagnostic ];
    action.isPreferred = true;

    return action;
  }
}
