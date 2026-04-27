import * as vscode from 'vscode';
import { findConditionalPairs } from '../util/conditional-pairs';

const SUPPORTED_LANGUAGES = new Set([ 'html', 'php' ]);
const DEBOUNCE_MS = 100;

/**
 * Applies italic styling to the content inside MSO conditional comments
 * (between an open marker and its matching close marker) via a
 * `TextEditorDecorationType`. Refreshes when the active editor changes or
 * the document is edited.
 *
 * @example
 * const italics = new ConditionalItalicDecorator();
 * italics.activate(context);
 */
export class ConditionalItalicDecorator implements vscode.Disposable {
  private readonly decorationType: vscode.TextEditorDecorationType;
  private readonly debounceTimers: Map<string, NodeJS.Timeout> = new Map();
  private readonly subscriptions: vscode.Disposable[] = [];

  constructor() {
    this.decorationType = vscode.window.createTextEditorDecorationType({ fontStyle: 'italic' });
  }

  /**
   * Wires up listeners for editor activation and document edits, and decorates
   * any already-visible editors immediately.
   */
  activate(): void {
    for (const editor of vscode.window.visibleTextEditors) {
      this.refresh(editor);
    }

    this.subscriptions.push(
      vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor) {
          this.refresh(editor);
        }
      }),
      vscode.workspace.onDidChangeTextDocument(event => {
        for (const editor of vscode.window.visibleTextEditors) {
          if (editor.document === event.document) {
            this.scheduleRefresh(editor);
          }
        }
      }),
      vscode.window.onDidChangeVisibleTextEditors(editors => {
        for (const editor of editors) {
          this.refresh(editor);
        }
      })
    );
  }

  /**
   * Cleans up the decoration type and all subscriptions.
   */
  dispose(): void {
    for (const sub of this.subscriptions) {
      sub.dispose();
    }

    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer);
    }

    this.debounceTimers.clear();
    this.decorationType.dispose();
  }

  /**
   * Debounced wrapper around `refresh` so a stream of edits doesn't trigger a
   * pass-per-keystroke.
   *
   * @param editor - The text editor to refresh.
   */
  private scheduleRefresh(editor: vscode.TextEditor): void {
    const key = editor.document.uri.toString();
    const existing = this.debounceTimers.get(key);

    if (existing) {
      clearTimeout(existing);
    }

    const timer = setTimeout(() => {
      this.debounceTimers.delete(key);
      this.refresh(editor);
    }, DEBOUNCE_MS);

    this.debounceTimers.set(key, timer);
  }

  /**
   * Applies italic decorations to every (open, close) pair in the editor's
   * document. Decorates the range between the markers, exclusive of the
   * markers themselves so the bracket punctuation keeps its own styling.
   *
   * @param editor - The text editor whose document should be re-scanned.
   */
  private refresh(editor: vscode.TextEditor): void {
    if (!SUPPORTED_LANGUAGES.has(editor.document.languageId)) {
      editor.setDecorations(this.decorationType, []);

      return;
    }

    const pairs = findConditionalPairs(editor.document);
    const ranges = pairs.map(({ open, close }) => new vscode.Range(open.end, close.start));

    editor.setDecorations(this.decorationType, ranges);
  }
}
