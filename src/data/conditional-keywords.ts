/**
 * Documentation entry for a conditional-comment keyword.
 *
 * @param description - Human-readable summary.
 * @param example - Short usage example.
 */
export interface ConditionalKeywordDoc {
  description: string;
  example: string;
}

export const CONDITIONAL_KEYWORDS: Record<string, ConditionalKeywordDoc> = {
  'mso': {
    description: 'Targets Microsoft Outlook (Word-based rendering engine, 2007+).',
    example: '<!--[if mso]> Outlook only <![endif]-->'
  },
  'IE': {
    description: 'Targets Internet Explorer. Legacy - IE conditional comments only work up to IE9.',
    example: '<!--[if IE]> IE only <![endif]-->'
  },
  'gte': {
    description: 'Greater-than-or-equal-to. Matches the specified version and any later version.',
    example: '<!--[if gte mso 9]> Outlook 2007 and later <![endif]-->'
  },
  'lte': {
    description: 'Less-than-or-equal-to. Matches the specified version and any earlier version.',
    example: '<!--[if lte mso 11]> Outlook 2003 and earlier <![endif]-->'
  },
  'gt': {
    description: 'Greater-than. Matches versions strictly later than the specified one.',
    example: '<!--[if gt mso 9]> Outlook 2010 and later <![endif]-->'
  },
  'lt': {
    description: 'Less-than. Matches versions strictly earlier than the specified one.',
    example: '<!--[if lt mso 12]> Outlook 2007 and earlier <![endif]-->'
  },
  'if': {
    description: 'Begins a conditional comment expression. Followed by an optional `!`, comparator (`gte`/`lte`/`gt`/`lt`), target (`mso`/`IE`), and version number.',
    example: '<!--[if mso]> ... <![endif]-->'
  },
  'endif': {
    description: 'Closes a conditional comment expression.',
    example: '<![endif]-->'
  }
};

export const MSO_VERSION_NOTES: Record<string, string> = {
  '9': 'Outlook 2000 / 2002 / 2003 (also IE5/6 era)',
  '10': 'Outlook 2002',
  '11': 'Outlook 2003',
  '12': 'Outlook 2007',
  '14': 'Outlook 2010',
  '15': 'Outlook 2013',
  '16': 'Outlook 2016 / 2019 / 365 (Windows desktop)'
};

/**
 * Returns a human-readable note for a given mso version, or null if unknown.
 *
 * @param version - The numeric version string (e.g. `9`, `12`).
 */
export function getMsoVersionNote(version: string): string | null {
  return MSO_VERSION_NOTES[version] ?? null;
}
