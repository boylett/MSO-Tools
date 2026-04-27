import * as vscode from 'vscode';
import { lintConditionalComments } from './conditional-comments';
import { lintMsoProperties } from './mso-properties';
import { lintVml } from './vml';
import { lintTableRole } from './table-role';

const DEBOUNCE_MS = 250;
const SUPPORTED_LANGUAGES = new Set([ 'html', 'php', 'css' ]);

/**
 * Coordinates running every diagnostic linter over a document and publishing
 * the combined result to a single `DiagnosticCollection`. Debounces document
 * changes so we don't re-lint on every keystroke.
 *
 * @example
 * const manager = new DiagnosticsManager();
 * context.subscriptions.push(manager);
 * manager.activate();
 */
export class DiagnosticsManager implements vscode.Disposable {
  private readonly collection: vscode.DiagnosticCollection;
  private readonly debounceTimers: Map<string, NodeJS.Timeout> = new Map();
  private readonly subscriptions: vscode.Disposable[] = [];

  constructor() {
    this.collection = vscode.languages.createDiagnosticCollection('mso-tools');
  }

  /**
   * Wires up document listeners and runs an initial pass over already-open
   * documents. Should be called once during extension activation.
   */
  activate(): void {
    for (const document of vscode.workspace.textDocuments) {
      this.scheduleLint(document);
    }

    this.subscriptions.push(
      vscode.workspace.onDidOpenTextDocument(doc => this.scheduleLint(doc)),
      vscode.workspace.onDidChangeTextDocument(event => this.scheduleLint(event.document)),
      vscode.workspace.onDidCloseTextDocument(doc => this.clear(doc))
    );
  }

  /**
   * Cleans up the diagnostic collection and all event subscriptions.
   */
  dispose(): void {
    for (const sub of this.subscriptions) {
      sub.dispose();
    }

    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer);
    }

    this.debounceTimers.clear();
    this.collection.dispose();
  }

  /**
   * Queues a debounced re-lint of the given document. Repeat calls during the
   * debounce window cancel the prior pending run.
   *
   * @param document - The document to schedule.
   */
  private scheduleLint(document: vscode.TextDocument): void {
    if (!SUPPORTED_LANGUAGES.has(document.languageId)) {
      return;
    }

    const key = document.uri.toString();
    const existing = this.debounceTimers.get(key);

    if (existing) {
      clearTimeout(existing);
    }

    const timer = setTimeout(() => {
      this.debounceTimers.delete(key);
      this.runLinters(document);
    }, DEBOUNCE_MS);

    this.debounceTimers.set(key, timer);
  }

  /**
   * Runs every applicable linter over the document and publishes diagnostics.
   * CSS-only documents skip the conditional/VML linters since those constructs
   * cannot exist there.
   *
   * @param document - The document to lint.
   */
  private runLinters(document: vscode.TextDocument): void {
    const diagnostics: vscode.Diagnostic[] = [];

    diagnostics.push(...lintMsoProperties(document));

    if (document.languageId !== 'css') {
      diagnostics.push(...lintConditionalComments(document));
      diagnostics.push(...lintVml(document));
      diagnostics.push(...lintTableRole(document));
    }

    this.collection.set(document.uri, diagnostics);
  }

  /**
   * Clears any pending debounce and any published diagnostics for the document.
   *
   * @param document - The document being closed.
   */
  private clear(document: vscode.TextDocument): void {
    const key = document.uri.toString();
    const timer = this.debounceTimers.get(key);

    if (timer) {
      clearTimeout(timer);
      this.debounceTimers.delete(key);
    }

    this.collection.delete(document.uri);
  }
}
