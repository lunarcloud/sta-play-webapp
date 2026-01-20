# Creating a New Component

This guide walks through creating a new Web Component for the STA Play project.

## Table of Contents
- [Before You Start](#before-you-start)
- [Component Types](#component-types)
- [Step-by-Step Guide](#step-by-step-guide)
- [Testing Your Component](#testing-your-component)
- [Integration](#integration)
- [Common Patterns](#common-patterns)

## Before You Start

### Prerequisites
- Read [ARCHITECTURE.md](ARCHITECTURE.md) to understand component architecture
- Look at existing components for reference:
  - **Simple component:** `components/trait-display/` (display with events)
  - **Complex component:** `components/task-tracker/` (state, interactions)
  - **Dialog component:** `components/message-dialog/` (extends HTMLDialogElement)

### Choose Component Type

| Type | When to Use | Example |
|------|-------------|---------|
| **Standard Element** | New custom display/input | `<trait-display>` |
| **Extended Built-in** | Enhance native dialog | `<dialog is="my-dialog">` |

## Component Types

### Type 1: Standard Custom Element

Use when creating a new UI component from scratch.

**Characteristics:**
- Extends `HTMLElement`
- Uses Shadow DOM
- External CSS file
- Custom tag name

### Type 2: Customized Built-in Element

Use when extending native HTML elements (currently only dialogs in this project).

**Characteristics:**
- Extends `HTMLDialogElement`
- No Shadow DOM (uses light DOM)
- HTML content loaded from file
- Uses `is` attribute: `<dialog is="my-dialog">`

## Step-by-Step Guide

### Step 1: Create Directory Structure

```bash
mkdir -p components/my-component
touch components/my-component/my-component-element.js
touch components/my-component/my-component.css
```

### Step 2: Write Component JavaScript

Choose your template:

#### Template A: Standard Custom Element

```javascript
import { snakeToCamel } from '../../js/string-utils.js'

/**
 * Description of what this component does
 * @tagname my-component
 * @attr {string} my-attribute - Description of attribute
 * @cssprop {color} --my-color - Description of CSS custom property
 */
export class MyComponentElement extends HTMLElement {
  /**
   * Attributes this component observes for changes
   * @returns {string[]} Array of attribute names (kebab-case)
   */
  static get observedAttributes() {
    return ['my-attribute']
  }

  // Private fields for encapsulation
  #myData = ''
  #containerEl = null

  constructor() {
    super()
    
    // Create Shadow DOM
    const shadow = this.attachShadow({ mode: 'open' })
    
    // Load external CSS
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'components/my-component/my-component.css'
    shadow.appendChild(link)
    
    // Build DOM structure
    const container = document.createElement('div')
    container.className = 'container'
    shadow.appendChild(container)
    
    // Setup event listeners
    container.addEventListener('click', () => this.#handleClick())
    
    // Store references
    this.#containerEl = container
  }

  /**
   * Called when observed attributes change
   * @param {string} name - Attribute name
   * @param {string} oldValue - Previous value
   * @param {string} newValue - New value
   */
  attributeChangedCallback(name, oldValue, newValue) {
    // Auto-convert attribute name to property (my-attribute → myAttribute)
    this[snakeToCamel(name)] = newValue
  }

  /**
   * Gets the component's data
   * @returns {string} The data
   */
  get myAttribute() {
    return this.#myData
  }

  /**
   * Sets the component's data
   * @param {string} value - The new data
   */
  set myAttribute(value) {
    if (this.#myData === value) return
    this.#myData = value
    this.#render()
  }

  /**
   * Updates the DOM based on current state
   * @private
   */
  #render() {
    if (!this.#containerEl) return
    this.#containerEl.textContent = this.#myData
  }

  /**
   * Handles click events
   * @private
   */
  #handleClick() {
    // Dispatch custom event
    this.dispatchEvent(new CustomEvent('my-event', {
      detail: { data: this.#myData },
      bubbles: true,
      composed: true
    }))
  }
}

// Register custom element
customElements.define('my-component', MyComponentElement)

// Export to globalThis for testing and external access
globalThis.MyComponentElement = MyComponentElement
```

#### Template B: Dialog Component

```javascript
import { animateClose } from '../../js/dialog-utils.js'
import { loadElementFromFile } from '../../js/load-file-element.js'

/**
 * Setup function for async initialization
 */
const setup = async () => {
  // Load HTML content
  const dialogEl = await loadElementFromFile(
    './components/my-dialog/my-dialog.html',
    'dialog'
  )

  /**
   * Description of dialog
   * @tagname my-dialog
   */
  class MyDialogElement extends HTMLDialogElement {
    constructor() {
      super()
      
      // Inject HTML content
      this.innerHTML = dialogEl.innerHTML
      
      // Setup close buttons
      this.querySelectorAll('button.close').forEach(el => {
        el.addEventListener('click', () => animateClose(this))
      })
      
      // Setup other elements
      const submitBtn = this.querySelector('button.submit')
      submitBtn.addEventListener('click', () => this.#handleSubmit())
    }

    /**
     * Shows the dialog
     */
    show() {
      this.showModal()
    }

    /**
     * Handles form submission
     * @private
     */
    #handleSubmit() {
      const result = {
        // Collect form data
      }
      
      this.dispatchEvent(new CustomEvent('submit', {
        detail: result,
        bubbles: true
      }))
      
      animateClose(this)
    }
  }

  // Register dialog (note the third parameter)
  customElements.define('my-dialog', MyDialogElement, { extends: 'dialog' })
  globalThis.MyDialogElement = MyDialogElement
}

await setup()
```

### Step 3: Create HTML File (Dialogs Only)

For dialog components, create `my-dialog.html`:

```html
<div class="dialog-content">
  <h2>Dialog Title</h2>
  
  <form>
    <label for="input1">Input Label:</label>
    <input type="text" id="input1" name="input1">
    
    <div class="buttons">
      <button type="button" class="close">Cancel</button>
      <button type="button" class="submit primary">OK</button>
    </div>
  </form>
</div>
```

### Step 4: Create CSS File

```css
/* my-component.css */

/* Host element styles */
:host {
  display: block;
  position: relative;
  
  /* CSS custom properties for theming */
  --my-color: var(--primary-color, blue);
  --my-spacing: 1rem;
}

/* Container styles */
.container {
  padding: var(--my-spacing);
  color: var(--my-color);
}

/* Responsive design */
@media (max-width: 768px) {
  .container {
    padding: calc(var(--my-spacing) / 2);
  }
}

/* State-based styles */
:host([disabled]) {
  opacity: 0.5;
  pointer-events: none;
}
```

### Step 5: Register Component

Add import to `index.html`:

```html
<!-- Add to existing imports section -->
<script type="module" src="components/my-component/my-component-element.js"></script>
```

### Step 6: Use Component

```html
<!-- Standard element -->
<my-component my-attribute="value"></my-component>

<!-- Dialog -->
<dialog is="my-dialog"></dialog>
```

```javascript
// JavaScript usage
const component = document.createElement('my-component')
component.myAttribute = 'value'
component.addEventListener('my-event', (e) => {
  console.log('Event:', e.detail)
})
document.body.appendChild(component)
```

## Testing Your Component

### Step 1: Create Test File

```bash
mkdir -p test/components/my-component
touch test/components/my-component/my-component-element.test.js
```

### Step 2: Write Tests

```javascript
import { expect } from '@esm-bundle/chai'
import { MyComponentElement } from '../../../components/my-component/my-component-element.js'

describe('MyComponentElement', () => {
  describe('custom element registration', () => {
    it('should be defined as a custom element', () => {
      expect(customElements.get('my-component')).to.equal(MyComponentElement)
    })

    it('should be accessible via globalThis', () => {
      expect(globalThis.MyComponentElement).to.equal(MyComponentElement)
    })
  })

  describe('constructor', () => {
    it('should create element', () => {
      const element = new MyComponentElement()
      expect(element).to.be.instanceof(MyComponentElement)
      expect(element).to.be.instanceof(HTMLElement)
    })

    it('should create shadow root', () => {
      const element = new MyComponentElement()
      expect(element.shadowRoot).to.not.be.null
    })

    it('should have mode open', () => {
      const element = new MyComponentElement()
      expect(element.shadowRoot.mode).to.equal('open')
    })
  })

  describe('attributes', () => {
    it('should observe my-attribute', () => {
      const observed = MyComponentElement.observedAttributes
      expect(observed).to.include('my-attribute')
    })
  })

  describe('myAttribute property', () => {
    it('should get and set attribute', () => {
      const element = new MyComponentElement()
      element.myAttribute = 'test value'
      expect(element.myAttribute).to.equal('test value')
    })

    it('should handle empty string', () => {
      const element = new MyComponentElement()
      element.myAttribute = ''
      expect(element.myAttribute).to.equal('')
    })

    it('should update DOM when set', () => {
      const element = new MyComponentElement()
      element.myAttribute = 'test'
      const container = element.shadowRoot.querySelector('.container')
      expect(container.textContent).to.equal('test')
    })
  })

  describe('events', () => {
    it('should dispatch my-event on click', (done) => {
      const element = new MyComponentElement()
      document.body.appendChild(element)

      element.addEventListener('my-event', (e) => {
        expect(e).to.be.instanceof(CustomEvent)
        expect(e.detail).to.have.property('data')
        document.body.removeChild(element)
        done()
      })

      const container = element.shadowRoot.querySelector('.container')
      container.click()
    })
  })

  describe('shadow DOM structure', () => {
    it('should contain container element', () => {
      const element = new MyComponentElement()
      const container = element.shadowRoot.querySelector('.container')
      expect(container).to.not.be.null
    })

    it('should link CSS file', () => {
      const element = new MyComponentElement()
      const link = element.shadowRoot.querySelector('link[rel="stylesheet"]')
      expect(link).to.not.be.null
      expect(link.getAttribute('href')).to.include('my-component.css')
    })
  })
})
```

### Step 3: Run Tests

```bash
npm test
# or for watch mode
npm run test:watch
```

## Integration

### Add to IndexController

If your component needs coordination with other components:

```javascript
// In index.js (IndexController)

setupMyComponent() {
  const component = document.getElementById('my-component')
  
  // Listen to component events
  component.addEventListener('my-event', (e) => {
    const { data } = e.detail
    
    // Update database
    this.database.updateSomething(data)
    
    // Update other components
    this.updateOtherComponents()
  })
  
  // Initialize component from database
  const initialData = this.database.getSomething()
  component.myAttribute = initialData
}
```

### Add Database Support

If your component needs persistence:

1. Create Info class in `js/database/my-info.js`
2. Add database methods in `js/database/database.js`
3. Update database schema if needed
4. Add validation in Info class

See [ARCHITECTURE.md](ARCHITECTURE.md#database-layer) for details.

## Common Patterns

### Pattern 1: ContentEditable Input

```javascript
constructor() {
  super()
  const shadow = this.attachShadow({ mode: 'open' })
  
  const input = document.createElement('div')
  // Try modern API first, fallback to old
  input.contentEditable = 'plaintext-only' // Safari needs 'true'
  input.addEventListener('input', () => this.#handleInput())
  
  shadow.appendChild(input)
  this.#inputEl = input
}

#handleInput() {
  const value = this.#inputEl.textContent
  this.dispatchEvent(new CustomEvent('change', {
    detail: { value },
    bubbles: true
  }))
}
```

### Pattern 2: Remove Button

```javascript
constructor() {
  super()
  const shadow = this.attachShadow({ mode: 'open' })
  
  const removeBtn = document.createElement('button')
  removeBtn.textContent = '×'
  removeBtn.className = 'remove'
  removeBtn.addEventListener('click', () => this.#handleRemove())
  
  shadow.appendChild(removeBtn)
}

#handleRemove() {
  this.dispatchEvent(new CustomEvent('removed', {
    detail: { id: this.id },
    bubbles: true
  }))
}
```

### Pattern 3: Number Input with Mousewheel

```javascript
import { setupNumberInputScrollForParent } from '../../js/scrollable-inputs.js'

constructor() {
  super()
  const shadow = this.attachShadow({ mode: 'open' })
  
  const input = document.createElement('input')
  input.type = 'number'
  input.min = '0'
  input.max = '100'
  
  shadow.appendChild(input)
  
  // Enable mousewheel scrolling
  setupNumberInputScrollForParent(this)
}
```

### Pattern 4: Configuration Constants

```javascript
// At top of file, before class
const OPTIONS = ['Option 1', 'Option 2', 'Option 3']
const DEFAULT_VALUE = 'Option 1'
const MAX_ITEMS = 10

export class MyComponentElement extends HTMLElement {
  constructor() {
    super()
    // Use constants
    OPTIONS.forEach(option => {
      // Build UI from configuration
    })
  }
}
```

### Pattern 5: Drag and Drop

```javascript
import { setupDropOnly } from '../../js/drop-nodrag-setup.js'

constructor() {
  super()
  const shadow = this.attachShadow({ mode: 'open' })
  
  const dropZone = document.createElement('div')
  dropZone.className = 'drop-zone'
  
  shadow.appendChild(dropZone)
  
  // Setup drop handler (prevent dragging out)
  setupDropOnly(this, (file) => {
    console.log('File dropped:', file.name)
  })
}
```

## Checklist

Before submitting your component:

### Code Quality
- [ ] JSDoc comments on all public methods/properties
- [ ] Private fields use `#` prefix
- [ ] Follows existing component patterns
- [ ] No console.log statements (use proper error handling)
- [ ] Passes all linters (`npm run lint`)

### Functionality
- [ ] Observed attributes declared
- [ ] Attribute ↔ property sync works
- [ ] Events dispatched with correct details
- [ ] Shadow DOM structure complete
- [ ] CSS properly loaded
- [ ] Handles edge cases (empty, null, invalid values)

### Testing
- [ ] Test file created
- [ ] Registration tests pass
- [ ] Constructor tests pass
- [ ] Attribute tests pass
- [ ] Property tests pass
- [ ] Event tests pass
- [ ] Shadow DOM tests pass
- [ ] All tests pass (`npm test`)

### Integration
- [ ] Imported in index.html
- [ ] Added to IndexController if needed
- [ ] Database support added if needed
- [ ] Works with existing components
- [ ] No breaking changes

### Documentation
- [ ] Updated ARCHITECTURE.md if pattern differs
- [ ] Comments explain complex logic
- [ ] Example usage provided

## Resources

- [Web Components MDN](https://developer.mozilla.org/en-US/docs/Web/Web_Components)
- [Shadow DOM](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM)
- [Custom Elements](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements)
- [Example: trait-display](../../components/trait-display/trait-display-element.js)
- [Example: message-dialog](../../components/message-dialog/message-dialog-element.js)
- [ARCHITECTURE.md](ARCHITECTURE.md)
- [TESTING.md](TESTING.md)
