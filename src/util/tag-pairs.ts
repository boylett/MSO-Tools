import * as vscode from 'vscode';

const TAG_NAME = '(?:[vow]:[A-Za-z][A-Za-z0-9_-]*|xml)';
const OPEN_TAG_RE = new RegExp(`<(${ TAG_NAME })\\b[^>]*?(?<!/)>`, 'g');
const CLOSE_TAG_RE = new RegExp(`</(${ TAG_NAME })\\s*>`, 'g');
const SELF_CLOSING_TAG_RE = new RegExp(`<(${ TAG_NAME })\\b[^>]*?/>`, 'g');

/**
 * A matched tag pair. The `name` ranges are the tag-name spans within each
 * tag (e.g. just `v:rect` of `<v:rect class="foo">`); the `full` ranges cover
 * the whole tag including angle brackets and attributes.
 *
 * @param openFull - Full range of the opening tag.
 * @param openName - Range of the tag name within the opening tag.
 * @param closeFull - Full range of the closing tag.
 * @param closeName - Range of the tag name within the closing tag.
 * @param name - The tag name (lowercased).
 */
export interface TagPair {
  openFull: vscode.Range;
  openName: vscode.Range;
  closeFull: vscode.Range;
  closeName: vscode.Range;
  name: string;
}

/**
 * A self-closing tag occurrence (e.g. `<o:AllowPNG/>`).
 *
 * @param full - Full range of the tag including angle brackets and `/>`.
 * @param name - Range of just the tag name.
 */
export interface SelfClosingTag {
  full: vscode.Range;
  name: vscode.Range;
}

interface TagEvent {
  kind: 'open' | 'close';
  name: string;
  full: vscode.Range;
  nameRange: vscode.Range;
  index: number;
}

/**
 * Walks a document for VML / Office namespace tags (`<v:*>`, `<o:*>`, `<w:*>`)
 * and the bare `<xml>` island used inside MSO conditional comments. Pairs
 * each open tag with its matching close using a name-aware balanced stack;
 * self-closing tags (`<v:fill/>`) are excluded by the open regex, so they
 * never enter the pairing process.
 *
 * @param document - The document to scan.
 *
 * @example
 * for (const { openName, closeName } of findTagPairs(document)) {
 *   highlights.push(new vscode.DocumentHighlight(openName));
 *   highlights.push(new vscode.DocumentHighlight(closeName));
 * }
 */
export function findTagPairs(document: vscode.TextDocument): TagPair[] {
  const text = document.getText();
  const events: TagEvent[] = [];

  collectMatches(document, text, OPEN_TAG_RE, 'open', 1, events);
  collectMatches(document, text, CLOSE_TAG_RE, 'close', 2, events);

  events.sort((a, b) => a.index - b.index);

  const pairs: TagPair[] = [];
  const stack: TagEvent[] = [];

  for (const event of events) {
    if (event.kind === 'open') {
      stack.push(event);

      continue;
    }

    const matchIdx = findLastIndex(stack, entry => entry.name === event.name);

    if (matchIdx === -1) {
      continue;
    }

    const open = stack[matchIdx];

    stack.splice(matchIdx, 1);

    pairs.push({
      openFull: open.full,
      openName: open.nameRange,
      closeFull: event.full,
      closeName: event.nameRange,
      name: open.name
    });
  }

  return pairs;
}

/**
 * Walks a document for self-closing VML / Office / `<xml>` tags (e.g.
 * `<v:fill/>`, `<o:AllowPNG/>`). These are intentionally excluded from the
 * paired-tag finder, but VSCode still wants a self-highlight when the cursor
 * is on one - so this gives the highlight provider a parallel source.
 *
 * @param document - The document to scan.
 */
export function findSelfClosingTags(document: vscode.TextDocument): SelfClosingTag[] {
  const text = document.getText();
  const results: SelfClosingTag[] = [];

  SELF_CLOSING_TAG_RE.lastIndex = 0;

  let match: RegExpExecArray | null;

  while ((match = SELF_CLOSING_TAG_RE.exec(text)) !== null) {
    const fullStart = match.index;
    const fullEnd = fullStart + match[0].length;
    const nameStart = fullStart + 1;
    const nameEnd = nameStart + match[1].length;

    results.push({
      full: new vscode.Range(document.positionAt(fullStart), document.positionAt(fullEnd)),
      name: new vscode.Range(document.positionAt(nameStart), document.positionAt(nameEnd))
    });

    if (match[0].length === 0) {
      SELF_CLOSING_TAG_RE.lastIndex++;
    }
  }

  return results;
}

/**
 * Pushes all matches of a regex into the events list. Computes both the full
 * tag range (the entire `<...>` match) and the tag-name range (just the tag
 * name's characters) for each hit.
 *
 * @param document - The document being scanned.
 * @param text - The full document text (avoids repeated `getText` calls).
 * @param regex - A global regex with the tag name in capture group 1.
 * @param kind - Whether the regex matches opens or closes.
 * @param nameOffset - Offset from match.index to the start of the tag name (1 for `<`, 2 for `</`).
 * @param events - The event list to push results into.
 */
function collectMatches(
  document: vscode.TextDocument,
  text: string,
  regex: RegExp,
  kind: 'open' | 'close',
  nameOffset: number,
  events: TagEvent[]
): void {
  regex.lastIndex = 0;

  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const fullStart = match.index;
    const fullEnd = fullStart + match[0].length;
    const nameStart = fullStart + nameOffset;
    const nameEnd = nameStart + match[1].length;

    events.push({
      kind,
      name: match[1].toLowerCase(),
      full: new vscode.Range(document.positionAt(fullStart), document.positionAt(fullEnd)),
      nameRange: new vscode.Range(document.positionAt(nameStart), document.positionAt(nameEnd)),
      index: fullStart
    });

    if (match[0].length === 0) {
      regex.lastIndex++;
    }
  }
}

/**
 * Finds the last index in an array matching a predicate.
 *
 * @param array - The array to search.
 * @param predicate - A boolean test for each element.
 */
function findLastIndex<T>(array: T[], predicate: (value: T) => boolean): number {
  for (let i = array.length - 1; i >= 0; i--) {
    if (predicate(array[i])) {
      return i;
    }
  }

  return -1;
}
