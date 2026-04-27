import * as vscode from 'vscode';
import { MsoCssHoverProvider } from './hover/mso-css-hover';
import { VmlHoverProvider } from './hover/vml-hover';
import { ConditionalHoverProvider } from './hover/conditional-hover';
import { DiagnosticsManager } from './diagnostics';
import { ConditionalItalicDecorator } from './decorations/conditional-italic';
import { MsoFoldingProvider } from './folding';
import { MsoMatchingHighlightProvider } from './highlight';
import { TableRoleCodeActionProvider } from './code-actions/table-role';
import { registerCssCustomData, unregisterCssCustomData } from './util/css-custom-data';

const HTML_LANGUAGES: vscode.DocumentSelector = [
  { language: 'html', scheme: 'file' },
  { language: 'html', scheme: 'untitled' },
  { language: 'php', scheme: 'file' },
  { language: 'php', scheme: 'untitled' }
];

const CSS_LANGUAGES: vscode.DocumentSelector = [
  { language: 'css', scheme: 'file' },
  { language: 'css', scheme: 'untitled' },
  { language: 'html', scheme: 'file' },
  { language: 'html', scheme: 'untitled' },
  { language: 'php', scheme: 'file' },
  { language: 'php', scheme: 'untitled' }
];

let activeContext: vscode.ExtensionContext | null = null;

/**
 * Extension entry point. Registers hover providers, the diagnostics manager,
 * the italic decorator, the folding provider, the code-action provider, and
 * the MSO CSS custom-data file.
 *
 * @param context - The extension context provided by VSCode.
 */
export function activate(context: vscode.ExtensionContext): void {
  activeContext = context;

  const diagnostics = new DiagnosticsManager();
  const italics = new ConditionalItalicDecorator();

  diagnostics.activate();
  italics.activate();

  context.subscriptions.push(
    diagnostics,
    italics,
    vscode.languages.registerHoverProvider(CSS_LANGUAGES, new MsoCssHoverProvider()),
    vscode.languages.registerHoverProvider(HTML_LANGUAGES, new VmlHoverProvider()),
    vscode.languages.registerHoverProvider(HTML_LANGUAGES, new ConditionalHoverProvider()),
    vscode.languages.registerFoldingRangeProvider(HTML_LANGUAGES, new MsoFoldingProvider()),
    vscode.languages.registerDocumentHighlightProvider(HTML_LANGUAGES, new MsoMatchingHighlightProvider()),
    vscode.languages.registerCodeActionsProvider(
      HTML_LANGUAGES,
      new TableRoleCodeActionProvider(),
      { providedCodeActionKinds: TableRoleCodeActionProvider.providedKinds }
    )
  );

  void registerCssCustomData(context);
}

/**
 * Extension deactivation hook. Removes the MSO CSS custom-data path from the
 * user's settings so an uninstall leaves no stale entry behind.
 */
export function deactivate(): Thenable<void> | undefined {
  if (!activeContext) {
    return undefined;
  }

  const context = activeContext;

  activeContext = null;

  return unregisterCssCustomData(context);
}
