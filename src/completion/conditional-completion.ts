import * as vscode from 'vscode';

interface ConditionalTemplate {
  label: string;
  detail: string;
  description: string;
  body: string;
}

const TEMPLATES: ConditionalTemplate[] = [
  {
    label: '<!--[if mso]>',
    detail: 'Outlook only',
    description: 'Wrap content so it only renders in Outlook (downlevel-hidden conditional comment).',
    body: '<!--[if mso]>\n\t$0\n<![endif]-->'
  },
  {
    label: '<!--[if !mso]><!-->',
    detail: 'Non-Outlook only',
    description: 'Wrap content so it only renders in non-Outlook clients (downlevel-revealed conditional comment).',
    body: '<!--[if !mso]><!-->\n\t$0\n<!--<![endif]-->'
  },
  {
    label: '<!--[if gte mso 9]>',
    detail: 'Outlook 2007 and later',
    description: 'Outlook 2007+ only (`mso` version 9 corresponds to Outlook 2000-2003; `gte mso 9` reliably targets Word-rendered Outlook).',
    body: '<!--[if gte mso 9]>\n\t$0\n<![endif]-->'
  },
  {
    label: '<!--[if lte mso 11]>',
    detail: 'Outlook 2003 and earlier',
    description: 'Outlook 2003 and earlier only.',
    body: '<!--[if lte mso 11]>\n\t$0\n<![endif]-->'
  },
  {
    label: '<!--[if IE]>',
    detail: 'Internet Explorer only',
    description: 'Internet Explorer only (legacy - up to IE9 only).',
    body: '<!--[if IE]>\n\t$0\n<![endif]-->'
  }
];

/**
 * Completion provider that surfaces MSO conditional comment templates when
 * the user starts typing `<!--` or `<!` inside an HTML or PHP document.
 *
 * Snippets cover the same templates via word-prefix triggers (`mso-if`,
 * `mso-ifnot`, etc.); this provider makes them discoverable through the
 * usual "type the start of a comment" flow.
 *
 * @example
 * vscode.languages.registerCompletionItemProvider(
 *   [ { language: 'html' }, { language: 'php' } ],
 *   new ConditionalCompletionProvider(),
 *   '!', '['
 * );
 */
export class ConditionalCompletionProvider implements vscode.CompletionItemProvider {
  /**
   * Returns conditional-comment completion items when the cursor is at a
   * position immediately following `<!--` or `<!--[`. Returns `undefined`
   * elsewhere so unrelated typing doesn't surface these templates.
   *
   * @param document - The active text document.
   * @param position - The cursor position.
   */
  provideCompletionItems(document: vscode.TextDocument, position: vscode.Position): vscode.CompletionItem[] | undefined {
    const lineText = document.lineAt(position.line).text;
    const before = lineText.slice(0, position.character);
    const trigger = /<!-{0,2}\[?$/.exec(before);

    if (!trigger) {
      return undefined;
    }

    const replaceStart = position.translate(0, -trigger[0].length);
    const replaceRange = new vscode.Range(replaceStart, position);

    return TEMPLATES.map(template => this.buildItem(template, replaceRange));
  }

  /**
   * Builds a completion item from a template definition.
   *
   * @param template - The template to convert into a CompletionItem.
   * @param replaceRange - The range to replace when the item is accepted.
   */
  private buildItem(template: ConditionalTemplate, replaceRange: vscode.Range): vscode.CompletionItem {
    const item = new vscode.CompletionItem(template.label, vscode.CompletionItemKind.Snippet);

    item.detail = template.detail;
    item.documentation = new vscode.MarkdownString(template.description);
    item.insertText = new vscode.SnippetString(template.body);
    item.range = replaceRange;
    item.sortText = `0_${ template.label }`;

    return item;
  }
}
