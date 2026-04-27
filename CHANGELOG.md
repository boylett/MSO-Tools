# Changelog

All notable changes to MSO Tools will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.1] - 2026-04-27

### Fixed

- Match highlighting for `@media screen yahoo { ... }` blocks. VSCode's CSS word-occurrence highlighter aborts at the next `;` after the malformed media query and skips later occurrences; the extension now provides its own highlights covering each entire block (with brace balancing that skips strings and comments) when the cursor is in the prelude.

## [1.0.0] - 2026-04-27

### Added

- Syntax highlighting for MSO conditional comments (`<!--[if mso]>`, `<!--[if !mso]><!-->`, `<![endif]-->`, `<!--<![endif]-->`) including `gte`/`lte`/`gt`/`lt` comparators, version numbers, and `IE` variants.
- Syntax highlighting for `mso-*` CSS properties inside `<style>` blocks and standalone CSS.
- Syntax highlighting for VML and Office namespace tags (`<v:*>`, `<o:*>`, `<w:*>`, `<xml>`) and their attributes.
- Syntax highlighting for HTML "marker" comments (`<!-- * Block Name -->` and `<!-- * // Block Name -->`).
- Syntax highlighting for the `yahoo` keyword in `@media screen yahoo` Yahoo Mail conditional CSS.
- Italic styling for content inside MSO conditional comments to visually distinguish Outlook-only blocks.
- Hover documentation for 60+ MSO CSS properties, VML and Office tags including `<xml>`, VML attributes, conditional-comment keywords, MSO version numbers, and the Yahoo Mail conditional media query.
- Code folding for MSO conditional blocks and HTML marker blocks. The closing tag remains visible on its own line below the fold so it stays syntax-highlighted when collapsed.
- Match highlighting for MSO conditional open/close pairs, HTML marker open/close pairs, paired VML/Office/`<xml>` tags, and self-closing VML/Office tags.
- Diagnostic for unmatched `<!--[if ...]>` markers.
- Diagnostic for stray `<![endif]-->` markers without a preceding open.
- Diagnostic for unknown `mso-*` properties with did-you-mean suggestions.
- Diagnostic for VML tags used without an `xmlns:v` declaration on `<html>`.
- Diagnostic for unknown VML attributes with did-you-mean suggestions.
- Diagnostic for unknown VML tags with did-you-mean suggestions.
- Diagnostic for `<table>` elements missing `role="presentation"`.
- Quick fix to insert `role="presentation"` on flagged `<table>` openers.
- Snippets for MSO conditional blocks (`mso-if`, `mso-ifnot`, `mso-if-gte9`), bulletproof VML buttons (`mso-button`), VML background images (`mso-bg`), and Outlook-show/hide wrappers (`mso-hide-mso`, `mso-hide-non-mso`).
- Automatic registration of the bundled MSO CSS custom data file with VSCode's CSS language service so `mso-*` properties get autocomplete and hover documentation in standalone `.css` files. The entry is removed on uninstall.
- Default `css.lint.unknownProperties: "ignore"` and `html.validate.styles: false` to silence false-positive CSS warnings for email-specific syntax. Both can be overridden in user settings.
