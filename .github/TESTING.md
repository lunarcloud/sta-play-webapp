# Testing Guide

This document provides comprehensive guidance on writing and running tests for the STA Play project.

## Overview

The project uses [@web/test-runner](https://modern-web.dev/docs/test-runner/overview/) for browser-native ES module testing with [Chai](https://www.chaijs.com/) for assertions.

## Quick Start

```bash
# One-time setup
npx playwright install chromium
npm i
npm run copy-deps

# Run tests
npm test                  # Run once
npm run test:watch        # Watch mode (auto-rerun on changes)
npm run test:coverage     # Generate coverage report
```

## Test Structure

### Directory Layout

```
test/
├── components/           # Component tests
│   ├── trait-display/
│   │   └── trait-display-element.test.js
│   ├── message-dialog/
│   │   └── message-dialog-element.test.js
│   └── ...
└── js/                   # Utility module tests
    ├── math-utils.test.js
    ├── dialog-utils.test.js
    └── ...
```

### Test File Naming

- Test files must end with `.test.js`
- Place tests in the same directory structure as source files (under `test/`)
- Example: `components/trait-display/trait-display-element.js` → `test/components/trait-display/trait-display-element.test.js`

## Writing Tests

### Basic Test Structure

```javascript
import { expect } from '@esm-bundle/chai'
import { MyComponent } from '../../components/my-component/my-component-element.js'

describe('MyComponent', () => {
  describe('feature group', () => {
    it('should do something specific', () => {
      // Arrange - Set up test data
      const element = new MyComponent()
      
      // Act - Perform the action
      element.doSomething()
      
      // Assert - Verify the result
      expect(element.result).to.equal('expected')
    })
  })
})
```

### Testing Web Components

Components should test the following aspects:

#### 1. Registration

```javascript
describe('custom element registration', () => {
  it('should be defined as a custom element', () => {
    expect(customElements.get('my-component')).to.equal(MyComponent)
  })

  it('should be accessible via globalThis', () => {
    expect(globalThis.MyComponent).to.equal(MyComponent)
  })
})
```

#### 2. Constructor and Shadow DOM

```javascript
describe('constructor', () => {
  it('should create element', () => {
    const element = new MyComponent()
    expect(element).to.be.instanceof(MyComponent)
    expect(element).to.be.instanceof(HTMLElement)
  })

  it('should create shadow root', () => {
    const element = new MyComponent()
    expect(element.shadowRoot).to.not.be.null
  })
})
```

#### 3. Attributes and Properties

```javascript
describe('attributes', () => {
  it('should observe text attribute', () => {
    const observed = MyComponent.observedAttributes
    expect(observed).to.include('text')
  })
})

describe('text property', () => {
  it('should get and set text', () => {
    const element = new MyComponent()
    element.text = 'Test Value'
    expect(element.text).to.equal('Test Value')
  })

  it('should handle empty string', () => {
    const element = new MyComponent()
    element.text = ''
    expect(element.text).to.equal('')
  })
})
```

#### 4. Shadow DOM Structure

```javascript
describe('shadow DOM structure', () => {
  it('should contain expected elements', () => {
    const element = new MyComponent()
    const heading = element.shadowRoot.querySelector('h1')
    expect(heading).to.not.be.null
  })

  it('should link CSS file', () => {
    const element = new MyComponent()
    const link = element.shadowRoot.querySelector('link[rel="stylesheet"]')
    expect(link).to.not.be.null
    expect(link.getAttribute('href')).to.include('my-component.css')
  })
})
```

#### 5. Events

```javascript
describe('custom events', () => {
  it('should dispatch event when action occurs', (done) => {
    const element = new MyComponent()
    document.body.appendChild(element)

    element.addEventListener('myevent', (e) => {
      expect(e).to.be.instanceof(CustomEvent)
      expect(e.detail).to.deep.equal({ value: 'test' })
      document.body.removeChild(element)
      done()
    })

    element.triggerAction()
  })
})
```

#### 6. User Interactions

```javascript
describe('user interactions', () => {
  it('should update when button is clicked', () => {
    const element = new MyComponent()
    document.body.appendChild(element)

    const button = element.shadowRoot.querySelector('button')
    button.click()

    expect(element.value).to.equal('clicked')
    document.body.removeChild(element)
  })
})
```

### Testing Utility Functions

```javascript
import { expect } from '@esm-bundle/chai'
import { myFunction } from '../../js/my-utils.js'

describe('myFunction', () => {
  it('should return expected value for normal input', () => {
    expect(myFunction(5, 10)).to.equal(15)
  })

  it('should handle edge case: zero', () => {
    expect(myFunction(0, 0)).to.equal(0)
  })

  it('should handle edge case: negative numbers', () => {
    expect(myFunction(-5, 10)).to.equal(5)
  })

  it('should throw error for invalid input', () => {
    expect(() => myFunction(null, 10)).to.throw()
  })
})
```

## Chai Assertions

### Common Assertions

```javascript
// Equality
expect(value).to.equal(5)              // Strict equality (===)
expect(value).to.deep.equal({ a: 1 })  // Deep equality for objects

// Truthiness
expect(value).to.be.true
expect(value).to.be.false
expect(value).to.be.null
expect(value).to.be.undefined
expect(value).to.exist

// Type checking
expect(value).to.be.a('string')
expect(value).to.be.instanceof(MyClass)

// Comparisons
expect(value).to.be.above(5)
expect(value).to.be.below(10)
expect(value).to.be.within(5, 10)

// Strings and arrays
expect(string).to.include('substring')
expect(array).to.include.members([1, 2, 3])
expect(array).to.have.lengthOf(5)

// Properties
expect(obj).to.have.property('name')
expect(obj).to.have.property('name', 'value')

// Exceptions
expect(() => dangerous()).to.throw()
expect(() => dangerous()).to.throw(TypeError)
expect(() => dangerous()).to.throw('error message')

// Negation
expect(value).to.not.equal(5)
```

### Chainable Assertions

Chai assertions are chainable for readability:

```javascript
expect(element)
  .to.be.instanceof(HTMLElement)
  .and.have.property('shadowRoot')
  .that.is.not.null
```

## Test Patterns

### Setup and Teardown

```javascript
describe('MyComponent', () => {
  let element

  beforeEach(() => {
    // Run before each test
    element = new MyComponent()
    document.body.appendChild(element)
  })

  afterEach(() => {
    // Run after each test
    if (element.parentNode) {
      document.body.removeChild(element)
    }
  })

  it('should work correctly', () => {
    // element is already set up
    expect(element).to.exist
  })
})
```

### Async Tests

For asynchronous operations:

```javascript
it('should load data asynchronously', async () => {
  const element = new MyComponent()
  await element.loadData()
  expect(element.data).to.not.be.null
})

// Or with callbacks
it('should handle callback', (done) => {
  const element = new MyComponent()
  element.onComplete = () => {
    expect(element.isComplete).to.be.true
    done()
  }
  element.start()
})
```

### Testing DOM Interactions

```javascript
it('should respond to focus', () => {
  const element = new MyComponent()
  document.body.appendChild(element)
  
  element.focus()
  expect(document.activeElement).to.equal(element)
  
  document.body.removeChild(element)
})
```

## Coverage Requirements

### Current Coverage

Run `npm run test:coverage` to see current coverage. Reports are saved to `coverage/` directory.

### What to Cover

**Must have tests:**
- All custom elements (components)
- All exported utility functions
- All public methods and properties
- Edge cases and error conditions

**Currently missing tests:**
- `busy-dialog` component
- `mission-tracker` component
- `player-display` component
- `settings-dialog` component
- `task-tracker` component
- `welcome-dialog` component

### Coverage Goals

- **Statements:** Aim for >80%
- **Branches:** Cover all conditional paths
- **Functions:** Test all exported functions
- **Lines:** Aim for >80%

## Running Tests

### Watch Mode

Watch mode is ideal during development:

```bash
npm run test:watch
```

This will:
- Run tests when you save files
- Show results in terminal
- Re-run only changed tests (when possible)

### Debugging Tests

#### Using Console Logs

```javascript
it('should do something', () => {
  const element = new MyComponent()
  console.log('Element:', element)
  console.log('Shadow root:', element.shadowRoot)
  // ...
})
```

#### Using Debugger

```javascript
it('should do something', () => {
  const element = new MyComponent()
  debugger // Execution will pause here if DevTools are open
  element.doSomething()
})
```

Then run tests with `--debug` flag and open the provided URL in your browser with DevTools.

### Test Filtering

Run specific test files:

```bash
npx web-test-runner test/components/trait-display/trait-display-element.test.js
```

Use `describe.only()` or `it.only()` to run specific tests:

```javascript
describe.only('MyComponent', () => {
  it.only('should test one thing', () => {
    // Only this test will run
  })
})
```

## Best Practices

### Do's

✅ **Write descriptive test names**
```javascript
it('should dispatch removed event when remove button is clicked', () => {})
```

✅ **Test one thing per test**
```javascript
// Good
it('should set text property', () => { /* ... */ })
it('should update DOM when text changes', () => { /* ... */ })

// Bad - testing two things
it('should set text and update DOM', () => { /* ... */ })
```

✅ **Clean up after tests**
```javascript
afterEach(() => {
  if (element.parentNode) {
    document.body.removeChild(element)
  }
})
```

✅ **Test edge cases**
```javascript
it('should handle empty string', () => {})
it('should handle null value', () => {})
it('should handle very long strings', () => {})
```

✅ **Use meaningful assertions**
```javascript
// Good
expect(element.text).to.equal('expected text')

// Bad - too vague
expect(element.text).to.exist
```

### Don'ts

❌ **Don't test implementation details**
```javascript
// Bad - testing private method
it('should call _privateMethod', () => {
  element._privateMethod()
})

// Good - test public behavior
it('should update display when value changes', () => {
  element.value = 'new'
  expect(element.shadowRoot.textContent).to.include('new')
})
```

❌ **Don't make tests dependent on each other**
```javascript
// Bad - test depends on previous test
describe('MyComponent', () => {
  let sharedElement
  
  it('should initialize', () => {
    sharedElement = new MyComponent()
  })
  
  it('should have value', () => {
    // Depends on previous test running first!
    expect(sharedElement.value).to.exist
  })
})
```

❌ **Don't use arbitrary timeouts**
```javascript
// Bad
it('should eventually update', (done) => {
  element.startLoading()
  setTimeout(() => {
    expect(element.loaded).to.be.true
    done()
  }, 500) // What if it takes longer?
})

// Good
it('should update when promise resolves', async () => {
  await element.startLoading()
  expect(element.loaded).to.be.true
})
```

## CI Integration

Tests run automatically on all pull requests via GitHub Actions (`.github/workflows/code-quality.yml`).

The CI workflow:
1. Installs dependencies
2. Copies third-party libraries
3. Installs Playwright browsers
4. Runs tests with coverage
5. Uploads coverage report as artifact

All tests must pass before a PR can be merged.

## Troubleshooting

### "Browser failed to start"

**Problem:** Playwright browser not installed.

**Solution:**
```bash
npx playwright install chromium
```

### "Module not found"

**Problem:** Import path is incorrect or dependencies not copied.

**Solution:**
```bash
npm run copy-deps
```

Check that import paths use relative paths:
```javascript
// Good
import { util } from '../../js/utils.js'

// Bad
import { util } from 'js/utils.js'
```

### "Test timeout"

**Problem:** Test takes longer than 5 seconds (default timeout).

**Solution:** Make async operations properly awaitable:
```javascript
it('should load data', async () => {
  await element.loadData() // Wait for promise
  expect(element.data).to.exist
})
```

Or increase timeout for specific test:
```javascript
it('should handle long operation', async function() {
  this.timeout(10000) // 10 seconds
  await element.longOperation()
})
```

## Resources

- [Web Test Runner Documentation](https://modern-web.dev/docs/test-runner/overview/)
- [Chai Assertion Library](https://www.chaijs.com/api/bdd/)
- [Playwright Documentation](https://playwright.dev/)
- [Web Components Testing Guide](https://open-wc.org/docs/testing/testing-package/)
