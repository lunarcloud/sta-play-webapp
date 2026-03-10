import { playwrightLauncher } from '@web/test-runner-playwright'

/**
 * Web Test Runner Configuration
 *
 * This configuration runs browser-native ES module tests using Playwright.
 * Tests run in real Chromium browser environments for accurate results.
 *
 * Commands:
 * npm test              - Run tests once
 * npm run test:watch    - Run tests in watch mode
 * npm run test:coverage - Run tests with coverage report
 * @see https://modern-web.dev/docs/test-runner/overview/
 */
export default {
  // Test file pattern - all .test.js files in test/ directory
  files: 'test/**/*.test.js',

  // Enable ES module resolution from node_modules
  nodeResolve: true,

  // Enable code coverage collection
  coverage: true,

  // Coverage configuration
  coverageConfig: {
    // Include these directories in coverage
    include: ['js/**/*.js', 'components/**/*.js'],
    // Exclude these from coverage
    exclude: ['node_modules/**', 'js/lib/**', 'test/**']
  },

  // Browser configuration - using Chromium via Playwright
  browsers: [
    playwrightLauncher({
      product: 'chromium',
      // Reduce motion to skip CSS animations in tests, avoiding
      // pending setTimeout delays from animateRemove/animateClose
      // and preventing browser session hangs from animation timers.
      createBrowserContext: ({ browser }) => browser.newContext({
        reducedMotion: 'reduce'
      })
    })
  ],

  // Maximum time for a test file to finish after all tests complete
  testsFinishTimeout: 60000,

  // Test framework configuration
  testFramework: {
    config: {
      // Default timeout for each test (5 seconds)
      timeout: 5000
    }
  }
}
