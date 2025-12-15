[<img src="img/icon.webp" width="32" />](/img/icon.webp)
Play App for Star Trek Adventures
=============================================================================================

[![app](https://img.shields.io/badge/app-Itch.io-red)](https://samsarette.itch.io/sta-play)
[![GitHub License](https://img.shields.io/github/license/lunarcloud/sta-play-webapp)](https://github.com/lunarcloud/sta-play-webapp/blob/main/LICENSE)
[![GitHub top language](https://img.shields.io/github/languages/top/lunarcloud/sta-play-webapp)](https://github.com/lunarcloud/sta-play-webapp/pulse)
[![environment](https://img.shields.io/badge/env-Browser-green)](https://developer.mozilla.org/en-US/docs/Glossary/Browser)

![Code Quality](https://github.com/lunarcloud/sta-play-webapp/actions/workflows/code-quality.yml/badge.svg)

A utility for GMs running a game of Star Trek Adventures TTRPG or players of the Captain's Log Solo RPG to display high-level player information during a game session.

## Development Setup
```sh
npm i
npm run copy-deps
npm serve
```

## Testing
The project uses [@web/test-runner](https://modern-web.dev/docs/test-runner/overview/) for unit testing with browser-native ES modules support.

```sh
# Run tests once
npm test

# Run tests in watch mode (reruns on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

Test files are located in the `test/` directory and follow the `*.test.js` naming convention.

## Code Quality Tools
The project has linters for the HTML, CSS, and JavaScript all setup and configured.
Simply run `npm run lint-fix` to run all of them in "fix what you can automatically" mode.
