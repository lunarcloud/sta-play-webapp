# AI Instructions for STA Play

This file provides specific context and instructions for AI coding agents to
interact effectively with this web project.


## Project Overview

STA Play is a client-side web application for managing and displaying Star Trek Adventures TTRPG game information.


## Technologies and Dependencies

* **Languages**: ECMAScript, HTML, CSS
* **Primary Dependencies**: [jszip, idb, @google/model-viewer]
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

* **Restore NPM Tools**:
  ```bash
  npm i
  ```

* **Set up the third-party libraries for use**:
  ```bash
  npm run copy-deps
  ```

* **Run the application locally**:
  ```bash
  npm serve
  ```

* **Check the application for style errors**:
  ```bash
  npm run lint
  ```

* **Perform automatic fixes for common style errors**:
  ```bash
  npm run lint-fix
  ```

* **Run unit tests**:
  ```bash
  npm test
  ```

* **Run unit tests in watch mode**:
  ```bash
  npm run test:watch
  ```

* **Run unit tests with coverage**:
  ```bash
  npm run test:coverage
  ```


## Code Style and Conventions

* Follow StandardJS conventions for ECMAScript, and the default style rules enforced by all lint utilities.
* CSS uses nesting to specify and scope styles.
* Avoid syntax that requires any pre-processing or compilation of the code. It should run in a browser directly after the third-party libraries have been copied via the "copy-deps" script.
* Avoid any language that suggests ownership or rights over the Star Trek or Star Trek Adventures licenses.
* Avoid usage of any artwork or other resources from outside of the application. CC0 artwork may be utilized for theme textures.
* No AI generated artwork is allowed.
* Changes to the application should be backwards-compatible with existing "*.staplay" files, and the database should migrate users if there is any schema change.
* All code features (ECMAScript, HTML, and CSS) must be compatible with all current versions of Chrome, Edge, Safari, and Firefox. This information is available at [caniuse.com](caniuse.com).
* Components should use CSS that is isolated either via specific identifier (i.e. "dialog[is=special-dialog] { ... }) or shadow DOM styling.


## Quality Tools and Practices

* **Code Analysis**: The project uses "lint" analyzers configured via "package.json":
  - eslint for javascript
  - linthtml for HTML 
  - stylelint for CSS
* **Unit Testing**: The project uses Web Test Runner with Playwright for browser-native ES module testing:
  - Tests are located in the `test/` directory
  - Test files follow the `*.test.js` naming convention
  - Uses Chai for assertions
  - Tests run in actual browser environments (Chromium via Playwright)
  - All new code should include corresponding unit tests
* **EditorConfig**: The .editorconfig file enforces consistent code style across IDEs
* **JSDoc**: All ECMAScript methods, classes, fields, and typing information shall be documented via the jsdoc syntax.

### Running Quality Checks Locally

Before committing code, developers should run:

```bash
# Restore dependencies
npm i

# Run the Lint analyzers, automatically fixing some errors
npm run lint-fix

# Run unit tests
npm test
```

And correct any remaining issues reported.

## Boundaries and Guardrails

* **NEVER** modify files within the `/node_modules/`, `/export/` or `/lib/` directories.
* **NEVER** commit secrets, API keys, or sensitive configuration data.
* **NEVER** disable lint warnings in the code without proper justification and review.
* **NEVER** introduce a preprocessor (such as LESS, SCSS) or compilation step (such as using TypeScript).
* **ASK FIRST** before introducing a new CSS or HTML library.
* **ASK FIRST** before making significant architectural changes to the application logic.
