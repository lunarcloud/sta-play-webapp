# Quick Reference Guide

This is a quick reference for common development tasks.

## Initial Setup

```bash
npm i                              # Install dependencies
npm run copy-deps                  # Copy third-party libraries
npx playwright install chromium    # Install browser for testing (one-time)
```

## Daily Development

```bash
npm run serve                      # Start dev server (http://localhost:3000)
npm run lint-fix                   # Fix code style issues
npm test                           # Run all tests
npm run test:watch                 # Run tests in watch mode
```

## Before Committing

```bash
npm run lint-fix                   # Auto-fix style issues
npm test                           # Verify all tests pass
```

## Dependency Management

```bash
npm run outdated                   # Check all package updates
npm run outdated:minor             # Check minor updates only
npm run outdated:patch             # Check patch updates only
```

**Important:** Review `version-constraints` in `package.json` before upgrading packages.

## Common Issues

### Tests Fail: "Executable doesn't exist"
**Solution:** Install Playwright browser
```bash
npx playwright install chromium
```

### Application Won't Load: "Cannot find module"
**Solution:** Copy dependencies
```bash
npm run copy-deps
```

### Linter Errors After npm install
**Solution:** Run auto-fix
```bash
npm run lint-fix
```

## File Structure Quick Reference

```
components/           # Web components (custom elements)
  {name}/
    {name}-element.js
    {name}.css
    {name}.html       # (optional, for dialogs)
js/                   # Utilities and database
  database/           # Database and data models
  lib/                # Third-party libraries (gitignored, copied by copy-deps)
test/                 # Tests mirror source structure
  components/
  js/
themes/               # Theme CSS and decorations
```

## Testing Patterns

### Component Test Template
```javascript
import { expect } from '@esm-bundle/chai'
import { MyComponent } from '../../components/my-component/my-component-element.js'

describe('MyComponent', () => {
  describe('registration', () => {
    it('should be defined as a custom element', () => {
      expect(customElements.get('my-component')).to.equal(MyComponent)
    })
  })
})
```

### Dialog Component Test Pattern
See `test/components/dice-dialog/dice-dialog-element.test.js` for testing components that use `loadElementFromFile()`.

## Documentation Structure

- **README.md** - Getting started, basic commands
- **CONTRIBUTING.md** - How to contribute, testing guidelines
- **.github/ARCHITECTURE.md** - System architecture and patterns
- **.github/COMPONENT_TEMPLATE.md** - Creating new components
- **.github/CODE_REVIEW_GUIDE.md** - Addressing review feedback
- **.github/LINTING.md** - Linting rules and configuration
- **.github/TESTING.md** - Comprehensive testing guide
- **.github/QUICK_REFERENCE.md** - This file!
- **.github/copilot-instructions.md** - AI coding agent instructions
- **.github/agents/** - Custom Copilot agent profiles (game reviewer, code quality, test writer, component builder)

## NPM Scripts Reference

| Script | Description |
|--------|-------------|
| `serve` | Start development server |
| `lint` | Run all linters (JS, HTML, CSS) |
| `lint-fix` | Auto-fix linting issues |
| `eslint` | Run JavaScript linter only |
| `htmllint` | Run HTML linter only |
| `csslint` | Run CSS linter only |
| `test` | Run tests once |
| `test:watch` | Run tests in watch mode |
| `test:coverage` | Generate coverage report |
| `copy-deps` | Copy third-party libraries to js/lib/ |
| `cem` | Generate custom elements manifest |
| `outdated` | Check for package updates |
| `outdated:minor` | Check for minor updates |
| `outdated:patch` | Check for patch updates |

## Browser Compatibility

All code must work in current versions of:
- Chrome
- Edge
- Safari
- Firefox

Check compatibility at [caniuse.com](https://caniuse.com)

## Key Conventions

- **Attributes:** `kebab-case` (e.g., `my-attribute`)
- **Properties:** `camelCase` (e.g., `myProperty`)
- **Private fields:** `#prefix` (e.g., `#privateField`)
- **Indentation:** 4 spaces (enforced by .editorconfig)
- **Line endings:** LF (enforced by .editorconfig)
- **JSDoc:** Required for all public methods/classes

## Component Communication Pattern

1. User interacts with component
2. Component dispatches custom event
3. IndexController (in index.js) listens to event
4. IndexController updates database
5. IndexController updates other components
6. Components re-render

**Never:** Direct component-to-component communication (except via IndexController)

## Save Behavior

- **Manual save only** - User must click Save button (💾) or press Ctrl+S
- **Never** auto-save in response to user interactions
- Changes are held in memory (DOM state) until explicitly saved

## Security Note

`npm audit` may report vulnerabilities in dev dependencies that don't affect the production application (which is client-side only). See [npm audit: Broken by Design](https://overreacted.io/npm-audit-broken-by-design/) for context.
