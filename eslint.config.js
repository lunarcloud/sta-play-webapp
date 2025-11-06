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
          'JSZip',
          'FocusOptions'
        ]
      }],
      'jsdoc/check-tag-names': [1, {
        definedTags: ['attr', 'cssprop', 'tagname']
      }]
    }
  })
]

export default config
