import neostandard, { resolveIgnoresFromGitignore } from 'neostandard'
import { jsdoc } from 'eslint-plugin-jsdoc'

const config = [
  ...neostandard({
    env: ['browser'],
    ts: false,
    ignores: resolveIgnoresFromGitignore(),
    files: ['*.js']
  }),
  jsdoc({
    config: 'flat/recommended',
    rules: {
      'jsdoc/reject-any-type': ['off'],
      'jsdoc/no-undefined-types': [1, {
        definedTypes: [
          'NodeListOf',
          'FileSystemFileHandle',
          'FocusOptions'
        ]
      }],
      'jsdoc/check-tag-names': [1, {
        definedTags: ['attr', 'cssprop', 'tagname']
      }]
    }
  }),
  {
    files: ['test/**/*.test.js'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        before: 'readonly',
        after: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly'
      }
    },
    rules: {
      'no-unused-expressions': 'off',
      '@stylistic/no-unused-expressions': 'off'
    }
  }
]

export default config
