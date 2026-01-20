# How to contribute

This is mostly a one-dev show, but I've made this open-source for two reasons:
 * So that others may learn and steal from the techniques I've employed here.
 * So the possibility of a community-provided feature or fix is open. 

## Submitting changes

I reserve the right to accept or reject any and all pull requests. 
Ideally, you should be solving an open issue and including as many **screenshots** as is needed to demonstrate the new feature or fix.

### Pull Request Requirements

* All code must pass the linters (run `npm run lint`)
* All tests must pass (run `npm test`)
* New features should include unit tests
* UI changes must include screenshots in the PR description
* For new themes: Include screenshots of traits, player cards, condition red alert, and a tracker

### Development Workflow

1. Fork the repository and create a feature branch
2. Install dependencies: `npm i && npm run copy-deps`
3. Install Playwright browser (one-time): `npx playwright install chromium`
4. Make your changes
5. Run quality checks: `npm run lint-fix && npm test`
6. Commit your changes with clear commit messages
7. Push to your fork and create a pull request

## Coding conventions

  * Run and accept the linter's judgement as much as humanly possible.
  * We use JSDoc for our typing. Many editors support and are more useful because of it.
  * Avoid CSS or javascript in all HTML files. Separate responsibilities allow flexibility like the theming system.
  * This is open source software. Consider the people who will read your code, and make it look nice for them. Document as much as possible and use a neutral, objective tone.
  * Don't rely on CDNs and avoid adding dependencies as much as possible.
  * JavaScript should be using modules, classes, async where applicable
  * Images should be well-optimized, modern formats (webp, svg, avif)
  * Follow browser compatibility guidelines - all features must work in Chrome, Edge, Safari, and Firefox
  * Maintain backwards compatibility with existing `.staplay` save files

📘 **See also:**
- [ARCHITECTURE.md](.github/ARCHITECTURE.md) - Architecture, patterns, and data flow
- [COMPONENT_TEMPLATE.md](.github/COMPONENT_TEMPLATE.md) - Step-by-step guide for creating components
- [CODE_REVIEW_GUIDE.md](.github/CODE_REVIEW_GUIDE.md) - Common review feedback and how to address it
- [LINTING.md](.github/LINTING.md) - Detailed linting rules and configuration
- [TESTING.md](.github/TESTING.md) - Comprehensive testing guide

## Architecture and Patterns

Before making changes, familiarize yourself with the project architecture:

* **Component Pattern:** All components follow the Web Components standard with Shadow DOM
* **Data Flow:** Unidirectional flow from user interaction → component event → IndexController → database
* **State Management:** Three-layer architecture (component, controller, database)
* **Communication:** Components communicate via events, never direct access

See [ARCHITECTURE.md](.github/ARCHITECTURE.md) for detailed architecture documentation.

## Creating New Components

When adding new components, follow the established patterns:

1. **Use the template:** See [COMPONENT_TEMPLATE.md](.github/COMPONENT_TEMPLATE.md) for step-by-step instructions
2. **Reference examples:** Look at `trait-display` (simple) or `task-tracker` (complex)
3. **Follow conventions:** 
   - Attributes use `kebab-case`
   - Properties use `camelCase`
   - Private fields use `#prefix`
   - Use `snakeToCamel()` for attribute-property sync

## Testing Guidelines

### When to Write Tests

* **Always** write tests for new components
* **Always** write tests for new utility functions
* Update existing tests when modifying behavior
* Add regression tests when fixing bugs

### Priority Testing Areas

The following components need comprehensive test coverage:
- `task-tracker-element.js` (723 lines, complex logic) - **HIGH PRIORITY**
- `mission-tracker-element.js` - **HIGH PRIORITY**
- `busy-dialog`, `settings-dialog`, `welcome-dialog` - **MEDIUM PRIORITY**

### What to Test

**For Web Components:**
* Custom element registration (`customElements.get()`)
* Shadow DOM structure exists and is correct
* Observed attributes are correct
* Property getters and setters work
* Events are dispatched correctly
* User interactions work as expected
* Edge cases and error handling

**For Utility Modules:**
* All exported functions
* Edge cases (null, undefined, empty values)
* Error conditions and exceptions
* Various input data types

### Test Structure

Use the existing test patterns:
```javascript
import { expect } from '@esm-bundle/chai'

describe('MyComponent', () => {
  describe('feature group', () => {
    it('should do something specific', () => {
      // Arrange
      const element = new MyComponent()
      
      // Act
      element.doSomething()
      
      // Assert
      expect(element.result).to.equal('expected')
    })
  })
})
```

See `test/components/trait-display/trait-display-element.test.js` for a comprehensive example.

For a complete testing guide, see [TESTING.md](.github/TESTING.md).

## Code Review Process

* All PRs are reviewed before merging
* Expect iterative feedback on:
  - Visual design (color contrast, readability, positioning)
  - Code quality (duplication, maintainability)
  - User experience (accessibility, responsive sizing)
* Address feedback incrementally
* CI checks must pass (linting, tests)

**See [CODE_REVIEW_GUIDE.md](.github/CODE_REVIEW_GUIDE.md) for detailed guidance on:**
- Common feedback patterns
- How to address specific types of feedback
- Visual design and code quality checklists
- Tips for smooth reviews

Thanks,
Sam
