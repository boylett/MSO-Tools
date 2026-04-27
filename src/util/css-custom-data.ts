import * as vscode from 'vscode';
import * as path from 'path';

const CSS_CUSTOM_DATA_FILE = 'css-data/mso-properties.json';
const SETTING_KEY = 'customData';
const SECTION = 'css';

/**
 * Adds the extension's CSS custom-data file to the user's `css.customData`
 * setting so VSCode's built-in CSS language service treats `mso-*` properties
 * as known. Writes to whichever scope already has a value (workspace folder >
 * workspace > global) so a project-level override takes precedence over a
 * stale user setting; falls back to global if no scope has set the value.
 *
 * Idempotent - if our path is already present in the resolved scope, no
 * write happens.
 *
 * @param context - The extension context, used to resolve the absolute path.
 */
export async function registerCssCustomData(context: vscode.ExtensionContext): Promise<void> {
  const targetPath = path.join(context.extensionPath, CSS_CUSTOM_DATA_FILE);
  const config = vscode.workspace.getConfiguration(SECTION);
  const inspect = config.inspect<string[]>(SETTING_KEY);
  const scope = pickWritableScope(inspect);
  const existing = readScopeValue(inspect, scope) ?? [];

  if (existing.includes(targetPath)) {
    return;
  }

  await config.update(SETTING_KEY, [ ...existing, targetPath ], scope);
}

/**
 * Removes the extension's CSS custom-data file from any scope of `css.customData`
 * that contains it. Called on deactivation so an uninstall leaves no stale entry.
 *
 * @param context - The extension context, used to resolve the absolute path.
 */
export async function unregisterCssCustomData(context: vscode.ExtensionContext): Promise<void> {
  const targetPath = path.join(context.extensionPath, CSS_CUSTOM_DATA_FILE);
  const config = vscode.workspace.getConfiguration(SECTION);
  const inspect = config.inspect<string[]>(SETTING_KEY);

  if (!inspect) {
    return;
  }

  const scopes: Array<{ scope: vscode.ConfigurationTarget; value: string[] | undefined }> = [
    { scope: vscode.ConfigurationTarget.WorkspaceFolder, value: inspect.workspaceFolderValue },
    { scope: vscode.ConfigurationTarget.Workspace, value: inspect.workspaceValue },
    { scope: vscode.ConfigurationTarget.Global, value: inspect.globalValue }
  ];

  for (const { scope, value } of scopes) {
    if (!value || !value.includes(targetPath)) {
      continue;
    }

    const filtered = value.filter(entry => entry !== targetPath);
    const next = filtered.length === 0 ? undefined : filtered;

    await config.update(SETTING_KEY, next, scope);
  }
}

/**
 * Picks the configuration scope to write to. Prefers the most specific scope
 * that already has a value (so we extend an existing list rather than adding
 * a global entry that would be shadowed). Falls back to global when no scope
 * has set the value yet.
 *
 * @param inspect - The result of `config.inspect`.
 */
function pickWritableScope(inspect: ReturnType<vscode.WorkspaceConfiguration['inspect']>): vscode.ConfigurationTarget {
  if (inspect?.workspaceFolderValue !== undefined) {
    return vscode.ConfigurationTarget.WorkspaceFolder;
  }

  if (inspect?.workspaceValue !== undefined) {
    return vscode.ConfigurationTarget.Workspace;
  }

  return vscode.ConfigurationTarget.Global;
}

/**
 * Reads the current value of the chosen scope from the inspect result.
 *
 * @param inspect - The result of `config.inspect`.
 * @param scope - The chosen configuration target.
 */
function readScopeValue(
  inspect: ReturnType<vscode.WorkspaceConfiguration['inspect']>,
  scope: vscode.ConfigurationTarget
): string[] | undefined {
  switch (scope) {
    case vscode.ConfigurationTarget.WorkspaceFolder: {
      return inspect?.workspaceFolderValue as string[] | undefined;
    }

    case vscode.ConfigurationTarget.Workspace: {
      return inspect?.workspaceValue as string[] | undefined;
    }

    case vscode.ConfigurationTarget.Global: {
      return inspect?.globalValue as string[] | undefined;
    }

    default: {
      return undefined;
    }
  }
}
