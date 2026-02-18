import { expect } from '@esm-bundle/chai'
import { TraitDisplayElement } from '../../../components/trait-display/trait-display-element.js'

describe('TraitDisplayElement', () => {
  describe('custom element registration', () => {
    it('should be defined as a custom element', () => {
      expect(customElements.get('trait-display')).to.equal(TraitDisplayElement)
    })

    it('should export a class constructor', () => {
      expect(TraitDisplayElement).to.be.a('function')
      expect(TraitDisplayElement.prototype).to.be.an.instanceof(HTMLElement)
    })
  })

  describe('constructor', () => {
    it('should create element', () => {
      const element = new TraitDisplayElement()
      expect(element).to.be.instanceof(TraitDisplayElement)
      expect(element).to.be.instanceof(HTMLElement)
    })

    it('should create shadow root', () => {
      const element = new TraitDisplayElement()
      expect(element.shadowRoot).to.not.be.null
    })

    it('should initialize with empty text', () => {
      const element = new TraitDisplayElement()
      expect(element.text).to.equal('')
    })
  })

  describe('attributes', () => {
    it('should observe text attribute', () => {
      const observed = TraitDisplayElement.observedAttributes
      expect(observed).to.include('text')
    })
  })

  describe('text property', () => {
    it('should get and set text', () => {
      const element = new TraitDisplayElement()
      element.text = 'Test Trait'
      expect(element.text).to.equal('Test Trait')
    })

    it('should trim whitespace when getting text', () => {
      const element = new TraitDisplayElement()
      const textEl = element.shadowRoot.querySelector('.name')
      textEl.textContent = '  Test Trait  '
      expect(element.text).to.equal('Test Trait')
    })

    it('should handle empty string', () => {
      const element = new TraitDisplayElement()
      element.text = ''
      expect(element.text).to.equal('')
    })

    it('should handle special characters', () => {
      const element = new TraitDisplayElement()
      element.text = 'Special: 你好, émojis: 😊'
      expect(element.text).to.equal('Special: 你好, émojis: 😊')
    })

    it('should not update if text content is already the same', () => {
      const element = new TraitDisplayElement()
      element.text = 'Same Text'
      const textEl = element.shadowRoot.querySelector('.name')
      const originalContent = textEl.textContent
      element.text = 'Same Text'
      expect(textEl.textContent).to.equal(originalContent)
    })
  })

  describe('shadow DOM structure', () => {
    it('should contain element for the name text', () => {
      const element = new TraitDisplayElement()
      const nameElement = element.shadowRoot.querySelector('.name')
      expect(nameElement).to.not.be.null
    })

    it('should contain remove button', () => {
      const element = new TraitDisplayElement()
      const button = element.shadowRoot.querySelector('button.close')
      expect(button).to.not.be.null
      expect(button.textContent).to.equal('⤫')
    })

    it('should link CSS file', () => {
      const element = new TraitDisplayElement()
      const link = element.shadowRoot.querySelector('link[rel="stylesheet"]')
      expect(link).to.not.be.null
      expect(link.getAttribute('href')).to.include('trait-display.css')
    })

    it('should have internal element with part attribute', () => {
      const element = new TraitDisplayElement()
      const internal = element.shadowRoot.querySelector('[part="internal"]')
      expect(internal).to.not.be.null
    })

    it('should make the name text editable', () => {
      const element = new TraitDisplayElement()
      const nameElement = element.shadowRoot.querySelector('.name')
      expect(nameElement.contentEditable).to.be.oneOf(['plaintext-only', 'true'])
    })
  })

  describe('removed event', () => {
    it('should dispatch removed event when remove button is clicked', (done) => {
      const element = new TraitDisplayElement()
      document.body.appendChild(element)

      element.addEventListener('removed', (e) => {
        expect(e).to.be.instanceof(CustomEvent)
        done()
      })

      const removeButton = element.shadowRoot.querySelector('button.close')
      removeButton.click()
    })

    it('should remove element from DOM when remove button is clicked', () => {
      const element = new TraitDisplayElement()
      document.body.appendChild(element)

      const removeButton = element.shadowRoot.querySelector('button.close')
      removeButton.click()

      expect(element.parentNode).to.be.null
    })
  })

  describe('text editing', () => {
    it('should update attribute when text is edited', (done) => {
      const element = new TraitDisplayElement()
      document.body.appendChild(element)

      const textSpan = element.shadowRoot.querySelector('.name')
      textSpan.textContent = 'Edited Text'
      textSpan.dispatchEvent(new Event('input'))

      // Wait for event to process
      setTimeout(() => {
        expect(element.getAttribute('text')).to.equal('Edited Text')
        document.body.removeChild(element)
        done()
      }, 10)
    })

    it('should handle multiple edits', (done) => {
      const element = new TraitDisplayElement()
      document.body.appendChild(element)

      const textSpan = element.shadowRoot.querySelector('.name')

      textSpan.textContent = 'First Edit'
      textSpan.dispatchEvent(new Event('input'))

      setTimeout(() => {
        textSpan.textContent = 'Second Edit'
        textSpan.dispatchEvent(new Event('input'))

        setTimeout(() => {
          expect(element.getAttribute('text')).to.equal('Second Edit')
          document.body.removeChild(element)
          done()
        }, 10)
      }, 10)
    })
  })

  describe('focus method', () => {
    it('should focus the name text field', () => {
      const element = new TraitDisplayElement()
      document.body.appendChild(element)

      element.focus()

      expect(document.activeElement).to.equal(element)

      document.body.removeChild(element)
    })

    it('should accept focus options', () => {
      const element = new TraitDisplayElement()
      document.body.appendChild(element)

      // Should not throw error
      expect(() => element.focus({ preventScroll: true })).to.not.throw()

      document.body.removeChild(element)
    })
  })

  describe('attributeChangedCallback', () => {
    it('should update text when attribute changes', () => {
      const element = new TraitDisplayElement()
      element.attributeChangedCallback('text', null, 'New Text')
      expect(element.text).to.equal('New Text')
    })

    it('should handle text attribute via setAttribute', () => {
      const element = new TraitDisplayElement()
      element.setAttribute('text', 'Attribute Text')
      // Manually trigger callback as it's called automatically by the browser
      element.attributeChangedCallback('text', null, 'Attribute Text')
      expect(element.text).to.equal('Attribute Text')
    })
  })

  describe('browser compatibility', () => {
    it('should handle browsers without plaintext-only support', () => {
      const element = new TraitDisplayElement()
      const textSpan = element.shadowRoot.querySelector('.name')

      // Element should work with either plaintext-only or true
      expect(textSpan.contentEditable).to.be.oneOf(['plaintext-only', 'true'])
    })

    it('should remove internal br elements when not using plaintext-only', () => {
      const element = new TraitDisplayElement()
      const textSpan = element.shadowRoot.querySelector('.name')

      if (textSpan.contentEditable === 'true') {
        // Add some br elements
        textSpan.appendChild(document.createElement('br'))
        textSpan.appendChild(document.createElement('br'))

        // Set text which should clean up internal brs
        element.text = 'Clean Text'

        // Should only have one br (the last one)
        const brs = textSpan.querySelectorAll('br')
        expect(brs.length).to.be.at.most(1)
      }
    })
  })

  describe('integration', () => {
    it('should work when added to DOM with attribute', () => {
      const element = document.createElement('trait-display')
      element.setAttribute('text', 'Initial Text')
      document.body.appendChild(element)

      expect(element.text).to.be.a('string')

      document.body.removeChild(element)
    })

    it('should maintain text content through DOM operations', () => {
      const element = new TraitDisplayElement()
      element.text = 'Persistent Text'

      document.body.appendChild(element)
      const textBefore = element.text
      document.body.removeChild(element)

      document.body.appendChild(element)
      expect(element.text).to.equal(textBefore)

      document.body.removeChild(element)
    })
  })
})
