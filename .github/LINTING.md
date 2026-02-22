# Linting Configuration Guide

This document explains the linting setup and configuration for the STA Play project.

## Overview

The project uses four linters to ensure code quality:
- **ESLint** for JavaScript
- **linthtml** for HTML
- **stylelint** for CSS
- **cspell** for spell checking

## Quick Start

```bash
# Run all linters
npm run lint

# Auto-fix issues (recommended)
npm run lint-fix

# Run individual linters
npm run eslint
npm run htmllint
npm run csslint
npm run spellcheck
```

## ESLint (JavaScript)

**Configuration:** `eslint.config.js`

### Base Configuration

Uses [neostandard](https://github.com/neostandard/neostandard) (modern StandardJS):
- Semicolons avoided except where required (e.g., for loops)
- 2-space indentation
- Single quotes for strings
- Browser environment globals

### JSDoc Validation

All functions, classes, and methods should have JSDoc comments:

```javascript
/**
 * Calculate the sum of two numbers
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} The sum
 */
function add(a, b) {
  return a + b
}
```

#### Custom JSDoc Tags

The project uses custom tags for web components:
- `@attr` - Document custom element attributes
- `@cssprop` - Document CSS custom properties
- `@tagname` - Document custom element tag name

Example:
```javascript
/**
 * A custom trait display component
 * @tagname trait-display
 * @attr {string} text - The trait text to display
 * @cssprop {color} --trait-color - The color of the trait
 */
class TraitDisplayElement extends HTMLElement {
  // ...
}
```

#### Known Types

These browser/Web Platform types are pre-defined:
- `NodeListOf` - For typed NodeLists
- `FileSystemFileHandle` - For File System Access API
- `FocusOptions` - For focus() options

### Test Files

Test files (`test/**/*.test.js`) have special rules:
- Mocha globals (`describe`, `it`, `before`, etc.) are available
- Chai assertions don't trigger "unused expression" warnings

## linthtml (HTML)

**Configuration:** `.linthtmlrc.json`

### Key Rules

- **Banned Attributes:** Old-style attributes like `align`, `bgcolor`, `width` are prohibited
- **Banned Tags:** Deprecated tags like `<marquee>`, `<font>`, `<center>` are not allowed
- **Accessibility:** Images require `alt` attributes
- **Modern HTML:** Enforces HTML5 doctype
- **Security:** Links require `rel="noopener"` when appropriate
- **Formatting:** 4-space indentation, no trailing whitespace

### Ignored Files

See `.linthtmlignore` for files that skip HTML linting (typically third-party code).

## stylelint (CSS)

**Configuration:** `.stylelintrc.json`

### Base Configuration

Extends `stylelint-config-standard` with modifications for this project.

### Disabled Rules (and Why)

#### Vendor Prefixes Allowed
```json
"property-no-vendor-prefix": null,
"value-no-vendor-prefix": null
```
**Why:** Cross-browser compatibility requires vendor prefixes for some modern CSS features. We target Chrome, Edge, Safari, and Firefox.

Example:
```css
.container {
  -webkit-appearance: none; /* Still needed for Safari */
  appearance: none;
}
```

#### Custom Elements Allowed
```json
"selector-type-no-unknown": null,
"selector-pseudo-class-no-unknown": null
```
**Why:** This is a web components project with custom elements like `<trait-display>` and custom pseudo-classes.

Example:
```css
trait-display {
  display: block;
}

dialog[is=confirm-dialog]::part(internal) {
  background: var(--dialog-bg);
}
```

#### Descending Specificity Allowed
```json
"no-descending-specificity": null
```
**Why:** The theming system and component-specific styles sometimes require descending specificity patterns.

### Ignored Files

See `.stylelintignore` for files that skip CSS linting.

## cspell (Spell Checking)

**Configuration:** `cspell.json`

### Overview

The project uses [cspell](https://cspell.org/) to catch spelling mistakes in JavaScript, HTML, CSS, Markdown, and JSON files.

Two custom dictionaries supplement the standard English dictionary:

- **sta-terms** (`.cspell/sta-terms.txt`): Star Trek canon words, STA game terminology, species names, ranks, and proper nouns from the Star Trek universe.
- **project-terms** (`.cspell/project-terms.txt`): Project-specific technical terms, dependency names, and code identifiers.

### Adding New Words

When the spell checker flags a legitimate word:

1. **Star Trek / STA terms** (species, ranks, ship names, game mechanics): Add to `.cspell/sta-terms.txt`
2. **Project-specific terms** (tool names, code identifiers, file formats): Add to `.cspell/project-terms.txt`

Keep each dictionary file sorted alphabetically within its categories.

### Ignored Files

The `cspell.json` configuration excludes:
- `node_modules/` and `js/lib/` (third-party code)
- Binary files (images, fonts, 3D models)
- `package-lock.json` and `.cem/` (generated files)

## Common Issues and Solutions

### ESLint

**Issue:** "Unexpected 'any' type"
```javascript
/** @param {any} value */
```
**Solution:** Be more specific with types:
```javascript
/** @param {string|number|object} value */
```

**Issue:** "Type 'CustomType' is undefined"
```javascript
/** @param {CustomType} value */
```
**Solution:** Import the type or add it to `definedTypes` in `eslint.config.js`.

### linthtml

**Issue:** "Attribute 'width' is banned"
```html
<img src="icon.png" width="32">
```
**Solution:** Use CSS instead:
```html
<img src="icon.png" style="width: 32px">
```

**Issue:** "img requires alt attribute"
```html
<img src="icon.png">
```
**Solution:** Always provide alt text:
```html
<img src="icon.png" alt="Application icon">
```

### stylelint

**Issue:** "Unexpected empty line before rule"
```css
.foo {
  color: red;

  background: blue;
}
```
**Solution:** Remove extra blank lines:
```css
.foo {
  color: red;
  background: blue;
}
```

### cspell

**Issue:** "Unknown word (Klingon)"
**Solution:** Add the word to the appropriate custom dictionary:
- Star Trek terms → `.cspell/sta-terms.txt`
- Project terms → `.cspell/project-terms.txt`

## CI/CD Integration

The GitHub Actions workflow (`.github/workflows/code-quality.yml`) runs all linters on every pull request. All checks must pass before merging.

The workflow runs:
1. `npm run eslint` - JavaScript linting
2. `npm run htmllint` - HTML linting  
3. `npm run csslint` - CSS linting
4. `npm run spellcheck` - Spell checking
5. `npm test` - Unit tests

## Editor Integration

### Visual Studio Code

Install these extensions for real-time linting:
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [stylelint](https://marketplace.visualstudio.com/items?itemName=stylelint.vscode-stylelint)
- [HTMLHint](https://marketplace.visualstudio.com/items?itemName=mkaufman.HTMLHint)

The `.vscode/settings.json` file configures VSCode to recognize custom elements.

### EditorConfig

The `.editorconfig` file ensures consistent formatting across all editors:
- 4-space indentation
- LF line endings
- UTF-8 encoding
- Trim trailing whitespace

## Disabling Rules

### When to Disable

Only disable linting rules when:
1. The rule produces a false positive
2. Following the rule would make code less maintainable
3. You've discussed it with the maintainer

### How to Disable

**Single line:**
```javascript
// eslint-disable-next-line rule-name
const x = something()
```

**Block:**
```javascript
/* eslint-disable rule-name */
const x = something()
const y = somethingElse()
/* eslint-enable rule-name */
```

**Always include a comment explaining why:**
```javascript
// eslint-disable-next-line no-unused-vars -- Used in HTML template
const templateVar = 'value'
```

## Resources

- [neostandard documentation](https://github.com/neostandard/neostandard)
- [ESLint rules reference](https://eslint.org/docs/latest/rules/)
- [linthtml documentation](https://linthtml.vercel.app/)
- [stylelint rules reference](https://stylelint.io/user-guide/rules)
- [JSDoc documentation](https://jsdoc.app/)
