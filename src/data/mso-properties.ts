/**
 * Documentation entry for an MSO CSS property.
 *
 * @param description - Human-readable summary of what the property does.
 * @param values - Example value formats accepted by the property.
 * @param example - A short usage example as a CSS declaration.
 */
export interface MsoPropertyDoc {
  description: string;
  values: string;
  example: string;
}

export const MSO_PROPERTIES: Record<string, MsoPropertyDoc> = {
  'mso-line-height-rule': {
    description: 'Controls how Outlook calculates `line-height`. `exactly` forces the line height to the declared value, ignoring ascender/descender heights - critical for predictable spacing in email.',
    values: '`exactly` | `at-least`',
    example: 'mso-line-height-rule: exactly;'
  },
  'mso-line-height-alt': {
    description: 'Alternative line-height value used by Outlook when the standard `line-height` would not be honoured. Often used to hold a row open with a non-breaking space.',
    values: 'length (px, pt)',
    example: 'mso-line-height-alt: 24px;'
  },
  'mso-text-raise': {
    description: 'Vertical text offset inside a `<v:textbox>` or table cell. Useful for fine-tuning button text alignment in Outlook.',
    values: 'length (px, pt) - positive raises, negative lowers',
    example: 'mso-text-raise: 4px;'
  },
  'mso-padding-alt': {
    description: 'Outlook-specific padding shorthand applied to a table cell. Overrides standard `padding` because Outlook 2007+ ignores HTML padding on certain elements.',
    values: 'top right bottom left (length values)',
    example: 'mso-padding-alt: 0 16px 0 16px;'
  },
  'mso-padding-top-alt': { description: 'Outlook-specific top padding override.', values: 'length', example: 'mso-padding-top-alt: 12px;' },
  'mso-padding-right-alt': { description: 'Outlook-specific right padding override.', values: 'length', example: 'mso-padding-right-alt: 16px;' },
  'mso-padding-bottom-alt': { description: 'Outlook-specific bottom padding override.', values: 'length', example: 'mso-padding-bottom-alt: 12px;' },
  'mso-padding-left-alt': { description: 'Outlook-specific left padding override.', values: 'length', example: 'mso-padding-left-alt: 16px;' },
  'mso-margin-top-alt': { description: 'Outlook-specific top margin override. Use to reset margins Outlook applies to `<p>` tags by default.', values: 'length | `auto`', example: 'mso-margin-top-alt: 0;' },
  'mso-margin-right-alt': { description: 'Outlook-specific right margin override.', values: 'length | `auto`', example: 'mso-margin-right-alt: 0;' },
  'mso-margin-bottom-alt': { description: 'Outlook-specific bottom margin override. Often set to `0` on `<p>` tags to remove the default 1em gap.', values: 'length | `auto`', example: 'mso-margin-bottom-alt: 0;' },
  'mso-margin-left-alt': { description: 'Outlook-specific left margin override.', values: 'length | `auto`', example: 'mso-margin-left-alt: 0;' },
  'mso-table-lspace': {
    description: 'Removes default left spacing Outlook applies to `<table>` elements. Almost always set to `0pt` in email resets.',
    values: 'length (typically `0pt`)',
    example: 'mso-table-lspace: 0pt;'
  },
  'mso-table-rspace': {
    description: 'Removes default right spacing Outlook applies to `<table>` elements. Almost always set to `0pt` in email resets.',
    values: 'length (typically `0pt`)',
    example: 'mso-table-rspace: 0pt;'
  },
  'mso-table-tspace': { description: 'Top spacing applied to a table by Outlook.', values: 'length', example: 'mso-table-tspace: 0pt;' },
  'mso-table-bspace': { description: 'Bottom spacing applied to a table by Outlook.', values: 'length', example: 'mso-table-bspace: 0pt;' },
  'mso-style-priority': {
    description: 'Controls the precedence of an embedded style declaration in Outlook 2007+. Lower numbers override Outlook defaults more aggressively.',
    values: 'integer 0-99',
    example: 'mso-style-priority: 99;'
  },
  'mso-style-name': { description: 'Names a style block so Outlook can reference it.', values: 'identifier', example: 'mso-style-name: "Heading 1";' },
  'mso-style-noshow': { description: 'Hides the style from the Word/Outlook style picker.', values: '`yes` | `no`', example: 'mso-style-noshow: yes;' },
  'mso-style-parent': { description: 'Declares the parent style this rule inherits from.', values: 'style name', example: 'mso-style-parent: "Normal";' },
  'mso-style-qformat': { description: 'Marks a style as Quick Format in Word.', values: '`yes` | `no`', example: 'mso-style-qformat: yes;' },
  'mso-style-type': { description: 'Declares the kind of style (paragraph, character, table, etc.).', values: '`paragraph` | `character` | `table` | `numbering` | `export-only`', example: 'mso-style-type: export-only;' },
  'mso-style-unhide': { description: 'Forces the style to be visible in the picker even if hidden.', values: '`yes` | `no`', example: 'mso-style-unhide: no;' },
  'mso-hide': {
    description: 'Hides the element from Word/Outlook display while keeping it in the document. Use `all` to fully hide.',
    values: '`screen` | `print` | `all` | `none`',
    example: 'mso-hide: all;'
  },
  'mso-element': {
    description: 'Declares the Word/Outlook element type. `frame` lets you create a positioned text frame.',
    values: '`frame` | `header` | `footer` | `field-begin` | `field-end` | etc.',
    example: 'mso-element: frame;'
  },
  'mso-element-anchor-horizontal': { description: 'Horizontal anchor for an `mso-element: frame`.', values: '`page` | `margin` | `column` | `text`', example: 'mso-element-anchor-horizontal: page;' },
  'mso-element-anchor-vertical': { description: 'Vertical anchor for an `mso-element: frame`.', values: '`page` | `margin` | `paragraph`', example: 'mso-element-anchor-vertical: paragraph;' },
  'mso-element-frame-height': { description: 'Frame height for an `mso-element: frame`.', values: 'length', example: 'mso-element-frame-height: 100px;' },
  'mso-element-frame-width': { description: 'Frame width for an `mso-element: frame`.', values: 'length', example: 'mso-element-frame-width: 200px;' },
  'mso-element-left': { description: 'Left position offset for an `mso-element: frame`.', values: 'length', example: 'mso-element-left: 0;' },
  'mso-element-top': { description: 'Top position offset for an `mso-element: frame`.', values: 'length', example: 'mso-element-top: 0;' },
  'mso-element-wrap': { description: 'Text wrapping mode around a frame.', values: '`auto` | `none` | `topAndBottom` | `tight`', example: 'mso-element-wrap: none;' },
  'mso-position-horizontal': { description: 'Horizontal alignment of a positioned element.', values: '`left` | `center` | `right` | length', example: 'mso-position-horizontal: center;' },
  'mso-position-horizontal-relative': { description: 'Reference frame for `mso-position-horizontal`.', values: '`page` | `margin` | `column` | `text`', example: 'mso-position-horizontal-relative: page;' },
  'mso-position-vertical': { description: 'Vertical alignment of a positioned element.', values: '`top` | `center` | `bottom` | length', example: 'mso-position-vertical: top;' },
  'mso-position-vertical-relative': { description: 'Reference frame for `mso-position-vertical`.', values: '`page` | `margin` | `paragraph`', example: 'mso-position-vertical-relative: paragraph;' },
  'mso-width-percent': { description: 'Width expressed as a percentage scaled by 10 (e.g. `1000` = 100%). Used in Word/Outlook table cells.', values: 'integer 0-1000', example: 'mso-width-percent: 1000;' },
  'mso-width-relative': { description: 'Reference for `mso-width-percent`.', values: '`page` | `margin` | `column`', example: 'mso-width-relative: margin;' },
  'mso-height-percent': { description: 'Height as a percentage scaled by 10.', values: 'integer 0-1000', example: 'mso-height-percent: 500;' },
  'mso-height-relative': { description: 'Reference for `mso-height-percent`.', values: '`page` | `margin`', example: 'mso-height-relative: page;' },
  'mso-special-format': { description: 'Special list/numbering format directive.', values: 'identifier', example: 'mso-special-format: bullet;' },
  'mso-level-number-format': { description: 'Number format for a list level.', values: '`bullet` | `decimal` | `roman-lower` | `alpha-upper` | etc.', example: 'mso-level-number-format: bullet;' },
  'mso-list': { description: 'Declares list metadata (level, list ID, ignore flag).', values: 'space-separated tokens', example: 'mso-list: l0 level1 lfo1;' },
  'mso-ascii-font-family': { description: 'ASCII font family override for Outlook.', values: 'font family name', example: 'mso-ascii-font-family: Calibri;' },
  'mso-fareast-font-family': { description: 'Far-East font family override for Outlook.', values: 'font family name', example: 'mso-fareast-font-family: "Times New Roman";' },
  'mso-fareast-language': { description: 'Far-East language tag for Outlook spell-checking.', values: 'BCP-47 tag', example: 'mso-fareast-language: ZH-CN;' },
  'mso-hansi-font-family': { description: 'High-ANSI font family override for Outlook.', values: 'font family name', example: 'mso-hansi-font-family: Calibri;' },
  'mso-bidi-font-family': { description: 'Bi-directional (RTL) font family override for Outlook.', values: 'font family name', example: 'mso-bidi-font-family: "Times New Roman";' },
  'mso-ansi-font-size': { description: 'ANSI font size override for Outlook.', values: 'length', example: 'mso-ansi-font-size: 11pt;' },
  'mso-font-alt': { description: 'Alternative font name when the primary is unavailable.', values: 'font family name', example: 'mso-font-alt: "Times New Roman";' },
  'mso-font-charset': { description: 'Font charset code.', values: 'integer', example: 'mso-font-charset: 0;' },
  'mso-font-kerning': { description: 'Minimum point size at which kerning is applied.', values: 'length', example: 'mso-font-kerning: 14pt;' },
  'mso-font-pitch': { description: 'Font pitch.', values: '`fixed` | `variable`', example: 'mso-font-pitch: variable;' },
  'mso-font-signature': { description: 'Hex font signature for charset coverage detection.', values: 'four hex pairs', example: 'mso-font-signature: 3 0 0 0 1 0;' },
  'mso-generic-font-family': { description: 'Generic CSS font-family fallback.', values: '`auto` | `roman` | `swiss` | `modern` | `script` | `decorative`', example: 'mso-generic-font-family: swiss;' },
  'mso-cellspacing': { description: 'Cell spacing applied between Outlook table cells.', values: 'length', example: 'mso-cellspacing: 0;' },
  'mso-border-alt': { description: 'Outlook-specific border shorthand override.', values: 'style width color', example: 'mso-border-alt: solid black 1pt;' },
  'mso-border-top-alt': { description: 'Outlook-specific top border override.', values: 'style width color', example: 'mso-border-top-alt: solid black 1pt;' },
  'mso-border-right-alt': { description: 'Outlook-specific right border override.', values: 'style width color', example: 'mso-border-right-alt: solid black 1pt;' },
  'mso-border-bottom-alt': { description: 'Outlook-specific bottom border override.', values: 'style width color', example: 'mso-border-bottom-alt: solid black 1pt;' },
  'mso-border-left-alt': { description: 'Outlook-specific left border override.', values: 'style width color', example: 'mso-border-left-alt: solid black 1pt;' }
};

/**
 * Returns the list of all known MSO property names.
 */
export function getKnownMsoProperties(): string[] {
  return Object.keys(MSO_PROPERTIES);
}
