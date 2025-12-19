# AI Instructions for STA Play

This file provides specific context and instructions for AI coding agents to
interact effectively with this web project.


## Project Overview

STA Play is a client-side web application for managing and displaying Star Trek Adventures TTRPG game information.


## Technologies and Dependencies

* **Languages**: ECMAScript, HTML, CSS
* **Primary Dependencies**: [fflate, idb, @google/model-viewer]
* **Web Platform Features**: [Shadow DOM, Custom Elements, IndexedDB, PWA]
* **Development Utilities**: [jsdoc, eslint, linthtml, stylelint]
* **Testing**: [@web/test-runner, @web/test-runner-playwright, @esm-bundle/chai]


## Project Structure

The repository is organized as follows:

* `/components/`: Contains all code for the standalone web components (primarily custom elements).
* `/gltf/`: Contains 3D models.
* `/img/`: Contains application images.
* `/js/`: Contains the application main javascript.
* `/js/database/`: Contains the database source code.
* `/themes/`: Contains the files to support application theming CSS and decoration structure HTML.
* `index.html`: The main HTML page.
* `index.js`: The entrypoint ECMAScript file.
* `index.css`: The base application-wide stylesheet.
* `package.json`: the NPM project file.
* `upload-to-itch.sh`: the script which deploys the application to the itch.io website.


## Development Commands

Use these commands to perform common development tasks:

* **Initial Setup** (required before first run):
  ```bash
  npm i                # Install NPM dependencies
  npm run copy-deps    # Copy third-party libraries to lib/
  npx playwright install chromium  # Install browser for testing (one-time setup)
  ```

* **Run the application locally**:
  ```bash
  npm run serve
  ```
  Access the application at `http://localhost:3000` (default port may vary).

* **Code Quality Checks**:
  ```bash
  npm run lint         # Run all linters (JavaScript, HTML, CSS)
  npm run lint-fix     # Automatically fix style errors where possible
  npm run eslint       # Run JavaScript linter only
  npm run htmllint     # Run HTML linter only
  npm run csslint      # Run CSS linter only
  ```

* **Testing**:
  ```bash
  npm test             # Run all tests once
  npm run test:watch   # Run tests in watch mode (auto-rerun on changes)
  npm run test:coverage # Run tests with coverage report
  ```
  Coverage reports are saved to the `coverage/` directory.

* **Custom Elements Manifest** (for IDE support):
  ```bash
  npm run cem          # Generate custom elements manifest for VSCode
  ```


## Code Style and Conventions

* Follow StandardJS conventions for ECMAScript, and the default style rules enforced by all lint utilities.
* CSS uses nesting to specify and scope styles.
* **CSS Maintainability**: Use CSS variables to reduce code duplication. When multiple rules share the same color, size, shadow, or border-radius values, extract them into reusable CSS variables.
* Avoid syntax that requires any pre-processing or compilation of the code. It should run in a browser directly after the third-party libraries have been copied via the "copy-deps" script.
* Avoid any language that suggests ownership or rights over the Star Trek or Star Trek Adventures licenses.
* Avoid usage of any artwork or other resources from outside of the application. CC0 artwork may be utilized for theme textures.
* No AI generated artwork is allowed.
* Changes to the application should be backwards-compatible with existing "*.staplay" files, and the database should migrate users if there is any schema change.
* All code features (ECMAScript, HTML, and CSS) must be compatible with all current versions of Chrome, Edge, Safari, and Firefox. This information is available at [caniuse.com](https://caniuse.com).
* Components should use CSS that is isolated either via specific identifier (i.e. "dialog[is=special-dialog] { ... }) or shadow DOM styling.
* **Accessibility**: All text must maintain sufficient contrast with backgrounds for readability. Follow WCAG AA contrast guidelines at minimum.
* **Validation**: Input validation should reject invalid values (e.g., empty strings where meaningful values are required) and throw appropriate errors.
* **Module Structure**: JavaScript should use ES modules, classes, and async/await where applicable.
* **Image Optimization**: Images should be well-optimized, modern formats (webp, svg, avif).
* **Dependencies**: Avoid relying on CDNs and minimize adding new dependencies. All dependencies should be vendored via the copy-deps script.


## Quality Tools and Practices

* **Code Analysis**: The project uses lint analyzers to enforce code quality:
  - **ESLint** for JavaScript (configured in `eslint.config.js`)
    - Uses neostandard configuration
    - Includes JSDoc validation
    - Special rules for test files to allow Chai assertions
  - **linthtml** for HTML (configured in `.linthtmlrc.json`)
    - Validates HTML structure and attributes
    - Enforces accessibility requirements (alt text, labels)
    - Prohibits deprecated tags
  - **stylelint** for CSS (configured in `.stylelintrc.json`)
    - Uses standard CSS configuration
    - Allows vendor prefixes (needed for cross-browser support)
    - Allows custom elements and pseudo-classes

* **Unit Testing**: The project uses Web Test Runner with Playwright for browser-native ES module testing:
  - Tests are located in the `test/` directory
  - Test files follow the `*.test.js` naming convention
  - Uses `@esm-bundle/chai` for assertions
  - Tests run in actual browser environments (Chromium via Playwright)
  - Configuration in `web-test-runner.config.js`
  - **All new code should include corresponding unit tests**
  - **Test Coverage Requirements**:
    - Components: Test registration, shadow DOM structure, attributes, properties, events, and methods
    - Utilities: Test all exported functions with edge cases
    - Current test coverage includes ~5 components and ~5 utility modules
    - Missing tests: busy-dialog, mission-tracker, player-display, settings-dialog, task-tracker, welcome-dialog components

* **EditorConfig**: The `.editorconfig` file enforces consistent code style across IDEs:
  - LF line endings
  - 4-space indentation
  - UTF-8 encoding for source files
  - Trailing whitespace removal

* **JSDoc**: All ECMAScript methods, classes, fields, and typing information shall be documented via JSDoc syntax:
  - Use `@param`, `@returns`, `@throws` tags
  - Document all public methods and properties
  - Custom JSDoc tags: `@attr`, `@cssprop`, `@tagname` for web components

* **Custom Elements Manifest**: Generated metadata for IDE support:
  - Run `npm run cem` to generate manifest
  - VSCode configuration in `.vscode/settings.json` uses manifest for autocomplete

### Running Quality Checks Locally

Before committing code, developers should run:

```bash
# Initial setup (one-time)
npm i
npm run copy-deps
npx playwright install chromium

# Before each commit
npm run lint-fix    # Auto-fix style issues
npm test            # Run all unit tests

# Review and fix any remaining issues reported
```

### CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/code-quality.yml`) runs on all pull requests:
1. Installs dependencies
2. Copies third-party libraries
3. Installs Playwright browser
4. Runs all three linters (JavaScript, HTML, CSS)
5. Runs unit tests with coverage
6. Uploads coverage report as artifact

All checks must pass before merging.

## Boundaries and Guardrails

* **NEVER** modify files within the `/node_modules/`, `/export/` or `/lib/` directories.
* **NEVER** commit secrets, API keys, or sensitive configuration data.
* **NEVER** disable lint warnings in the code without proper justification and review.
* **NEVER** introduce a preprocessor (such as LESS, SCSS) or compilation step (such as using TypeScript).
* **ASK FIRST** before introducing a new CSS or HTML library.
* **ASK FIRST** before making significant architectural changes to the application logic.


## Working with Feedback and Iteration

* When receiving feedback on PRs, expect iterative refinement through multiple rounds of changes.
* Common feedback areas include:
  - **Visual design**: Color contrast, text readability, UI element visibility
  - **Layout**: Grid positioning (e.g., `grid-row: 2 / 4`), element alignment, spacing
  - **Code quality**: Reducing duplication through CSS variables, improving maintainability
  - **User experience**: Element positioning for accessibility, responsive sizing
* Address feedback incrementally without reverting previous approved changes unless explicitly requested.
* Always include screenshots for UI changes in PR descriptions to facilitate review.
* Always include at least one screenshot of two traits, two player cards, condition red alert, and a tracker for new theme PR descriptions to facilitate review layout and styling. 
* When making theme or styling changes, preserve the original aesthetic unless specifically asked to change it.


## UI and Visual Design Best Practices

* **Screenshots are mandatory** for any PR that includes UI or visual changes.
* **Iterative refinement**: Be prepared to adjust colors, positions, and sizes based on maintainer feedback.
* **Theme decorations**: Ensure theme elements don't take up layout space or interfere with main content positioning.
* **Element positioning**: Pay attention to specific positioning values like `grid-row` spans - verify they match the parent grid structure.
* **Layout issues**: Watch for unintended layout shifts or elements pushing content down - decorative elements should use absolute positioning or grid placement that doesn't disrupt flow.
* **Menu and navigation**: Ensure UI controls (buttons, icons, labels) have sufficient visibility and are appropriately sized for their importance.


## Common Pitfalls to Avoid

* **Grid positioning errors**: Double-check `grid-row` and `grid-column` values match the parent grid template. For example, if the body has 4 rows, `grid-row: 2 / 4` spans rows 2-3, while `grid-row: 3` only occupies row 3.
* **Forgotten setup steps**: Remember to run `npm run copy-deps` after `npm i` before attempting to run the application locally.
* **Over-correcting feedback**: When asked to enhance specific UI elements for visibility, don't make global changes that affect the entire theme - target only the specified elements.
* **Ignoring existing patterns**: Look at how similar components are structured and styled before creating new patterns.
* **Missing component tests**: When adding or modifying custom elements, include tests that demonstrate registration, shadow DOM structure, attributes, properties, and events.
