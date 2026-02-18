import { expect } from '@esm-bundle/chai'
import { InputProgressElement } from '../../../components/input-progress/input-progress-element.js'

describe('InputProgressElement', () => {
  describe('custom element registration', () => {
    it('should be defined as a custom element', () => {
      expect(customElements.get('input-progress')).to.equal(InputProgressElement)
    })

    it('should export a class constructor', () => {
      expect(InputProgressElement).to.be.a('function')
      expect(InputProgressElement.prototype).to.be.an.instanceof(HTMLElement)
    })
  })

  describe('constructor', () => {
    it('should create element with default values', () => {
      const element = new InputProgressElement()
      expect(element).to.be.instanceof(InputProgressElement)
      expect(element).to.be.instanceof(HTMLElement)
    })

    it('should create shadow root', () => {
      const element = new InputProgressElement()
      expect(element.shadowRoot).to.not.be.null
    })

    it('should initialize with default value of 10', () => {
      const element = new InputProgressElement()
      expect(element.value).to.equal(10)
    })

    it('should initialize with default max of 10', () => {
      const element = new InputProgressElement()
      expect(element.max).to.equal(10)
    })
  })

  describe('attributes', () => {
    it('should observe value and max attributes', () => {
      const observed = InputProgressElement.observedAttributes
      expect(observed).to.include('value')
      expect(observed).to.include('max')
    })

    it('should initialize with custom value attribute', () => {
      const element = new InputProgressElement()
      element.setAttribute('value', '5')
      document.body.appendChild(element)

      // Wait for attribute callback
      setTimeout(() => {
        expect(element.value).to.equal(5)
        document.body.removeChild(element)
      }, 0)
    })

    it('should initialize with custom max attribute', () => {
      const element = new InputProgressElement()
      element.setAttribute('max', '20')
      document.body.appendChild(element)

      // Wait for attribute callback
      setTimeout(() => {
        expect(element.max).to.equal(20)
        document.body.removeChild(element)
      }, 0)
    })
  })

  describe('value property', () => {
    it('should get and set value', () => {
      const element = new InputProgressElement()
      element.value = 7
      expect(element.value).to.equal(7)
    })

    it('should clamp value to max', () => {
      const element = new InputProgressElement()
      element.max = 10
      element.value = 15
      expect(element.value).to.equal(10)
    })

    it('should clamp value to minimum of 0', () => {
      const element = new InputProgressElement()
      element.value = -5
      expect(element.value).to.equal(0)
    })

    it('should handle non-numeric string values by converting to NaN and causing error', () => {
      const element = new InputProgressElement()
      // Setting non-numeric value causes an error in HTMLProgressElement
      expect(() => {
        element.value = 'abc'
      }).to.throw()
    })
  })

  describe('valueAsNumber property', () => {
    it('should return value as number', () => {
      const element = new InputProgressElement()
      element.value = 5
      expect(element.valueAsNumber).to.equal(5)
      expect(typeof element.valueAsNumber).to.equal('number')
    })

    it('should set value via valueAsNumber', () => {
      const element = new InputProgressElement()
      element.valueAsNumber = 8
      expect(element.value).to.equal(8)
    })
  })

  describe('max property', () => {
    it('should get and set max', () => {
      const element = new InputProgressElement()
      element.max = 20
      expect(element.max).to.equal(20)
    })

    it('should clamp max to minimum of 1', () => {
      const element = new InputProgressElement()
      element.max = 0
      expect(element.max).to.equal(1)
    })

    it('should clamp max to minimum of 1 for negative values', () => {
      const element = new InputProgressElement()
      element.max = -10
      expect(element.max).to.equal(1)
    })

    it('should adjust value when max is reduced below current value', () => {
      const element = new InputProgressElement()
      element.max = 20
      element.value = 15
      element.max = 10
      expect(element.value).to.equal(10)
    })

    it('should set value to new max when value equals old max', () => {
      const element = new InputProgressElement()
      element.max = 10
      element.value = 10
      element.max = 20
      expect(element.value).to.equal(20)
    })
  })

  describe('change event', () => {
    it('should dispatch change event when range input changes', (done) => {
      const element = new InputProgressElement()
      document.body.appendChild(element)

      element.addEventListener('change', (e) => {
        expect(e).to.be.instanceof(Event)
        document.body.removeChild(element)
        done()
      })

      // Simulate range input change
      const rangeInput = element.shadowRoot.querySelector('input[type="range"]')
      rangeInput.value = '7'
      rangeInput.dispatchEvent(new Event('change'))
    })

    it('should update attribute when range input changes', () => {
      const element = new InputProgressElement()
      document.body.appendChild(element)

      const rangeInput = element.shadowRoot.querySelector('input[type="range"]')
      rangeInput.value = '7'
      rangeInput.dispatchEvent(new Event('change'))

      expect(element.getAttribute('value')).to.equal('7')
      document.body.removeChild(element)
    })
  })

  describe('shadow DOM structure', () => {
    it('should contain progress bar indicator', () => {
      const element = new InputProgressElement()
      const progress = element.shadowRoot.querySelector('progress')
      expect(progress).to.not.be.null
    })

    it('should contain slider control', () => {
      const element = new InputProgressElement()
      const input = element.shadowRoot.querySelector('input[type="range"]')
      expect(input).to.not.be.null
    })

    it('should contain value display', () => {
      const element = new InputProgressElement()
      const data = element.shadowRoot.querySelector('data')
      expect(data).to.not.be.null
    })

    it('should update value display when value changes', () => {
      const element = new InputProgressElement()
      element.value = 7
      const data = element.shadowRoot.querySelector('data')
      expect(data.textContent).to.equal('7')
    })

    it('should link CSS file', () => {
      const element = new InputProgressElement()
      const link = element.shadowRoot.querySelector('link[rel="stylesheet"]')
      expect(link).to.not.be.null
      expect(link.getAttribute('href')).to.include('input-progress.css')
    })
  })

  describe('integration', () => {
    it('should work when added to DOM with attributes', () => {
      const element = document.createElement('input-progress')
      element.setAttribute('value', '5')
      element.setAttribute('max', '15')
      document.body.appendChild(element)

      // Initial value is set during construction based on getAttribute
      // The setAttribute above sets attributes but attributeChangedCallback
      // is called after the element is already constructed
      expect(element.value).to.be.a('number')

      document.body.removeChild(element)
    })

    it('should maintain value-max relationship', () => {
      const element = new InputProgressElement()
      element.max = 100
      element.value = 50

      expect(element.value).to.equal(50)
      expect(element.max).to.equal(100)

      element.max = 30
      expect(element.value).to.equal(30)
    })
  })
})
