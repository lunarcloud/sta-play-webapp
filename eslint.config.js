import neostandard, { resolveIgnoresFromGitignore } from 'neostandard'
import { jsdoc } from 'eslint-plugin-jsdoc'

/**
 * ESLint Configuration
 *
 * This configuration uses neostandard (modern StandardJS) with JSDoc validation.
 *
 * Key features:
 * - StandardJS code style rules
 * - JSDoc comment validation
 * - Browser environment globals
 * - Test-specific rules for Chai assertions
 *
 * Commands:
 *   npm run eslint      - Run linter
 *   npm run eslint-fix  - Auto-fix issues
 */

const config = [
  // Base neostandard configuration for browser environment
  ...neostandard({
    env: ['browser'],
    ts: false,
    ignores: resolveIgnoresFromGitignore(),
    files: ['*.js']
  }),

  // JSDoc validation plugin
  jsdoc({
    config: 'flat/recommended',
    rules: {
      // Allow "any" type in JSDoc (sometimes necessary)
      'jsdoc/reject-any-type': ['off'],

      // Define browser and Web Platform types that JSDoc doesn't know about
      'jsdoc/no-undefined-types': [1, {
        definedTypes: [
          'NodeListOf',
          'FileSystemFileHandle',
          'FocusOptions'
        ]
      }],

      // Allow custom JSDoc tags used for web components
      'jsdoc/check-tag-names': [1, {
        definedTags: ['attr', 'cssprop', 'tagname']
      }]
    }
  }),

  // Special configuration for test files
  {
    files: ['test/**/*.test.js'],
    languageOptions: {
      globals: {
        // Mocha/BDD test globals
        describe: 'readonly',
        it: 'readonly',
        before: 'readonly',
        after: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly'
      }
    },
    rules: {
      // Chai assertions like `expect(foo).to.be.true` look like unused expressions
      'no-unused-expressions': 'off',
      '@stylistic/no-unused-expressions': 'off'
    }
  }
]

export default config
