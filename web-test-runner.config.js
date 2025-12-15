import { playwrightLauncher } from '@web/test-runner-playwright'

export default {
  files: 'test/**/*.test.js',
  nodeResolve: true,
  coverage: true,
  coverageConfig: {
    include: ['js/**/*.js', 'components/**/*.js'],
    exclude: ['node_modules/**', 'lib/**', 'test/**']
  },
  browsers: [
    playwrightLauncher({ product: 'chromium' })
  ],
  testFramework: {
    config: {
      timeout: 5000
    }
  }
}
