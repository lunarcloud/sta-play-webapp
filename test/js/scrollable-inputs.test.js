import { expect } from '@esm-bundle/chai'
import {
  NumberInputTypes,
  setupNumberInputScrollForParent,
  setupNumberInputScroll,
  removeNumberInputScroll,
  handleScrollOnNumberInput
} from '../../js/scrollable-inputs.js'

describe('scrollable-inputs', () => {
  describe('NumberInputTypes', () => {
    it('should include HTMLInputElement', () => {
      expect(NumberInputTypes).to.include(HTMLInputElement)
    })

    it('should have at least one element type', () => {
      expect(NumberInputTypes.length).to.be.greaterThan(0)
    })
  })

  describe('setupNumberInputScrollForParent', () => {
    let parentElement

    beforeEach(() => {
      parentElement = document.createElement('div')
      document.body.appendChild(parentElement)
    })

    afterEach(() => {
      if (parentElement && parentElement.parentNode) {
        document.body.removeChild(parentElement)
      }
    })

    it('should setup scroll for number inputs', () => {
      const numberInput = document.createElement('input')
      numberInput.type = 'number'
      parentElement.appendChild(numberInput)

      setupNumberInputScrollForParent(parentElement)

      expect(numberInput.inputScrollSetup).to.be.true
    })

    it('should setup scroll for range inputs', () => {
      const rangeInput = document.createElement('input')
      rangeInput.type = 'range'
      parentElement.appendChild(rangeInput)

      setupNumberInputScrollForParent(parentElement)

      expect(rangeInput.inputScrollSetup).to.be.true
    })

    it('should handle parent with no number inputs', () => {
      const textInput = document.createElement('input')
      textInput.type = 'text'
      parentElement.appendChild(textInput)

      expect(() => setupNumberInputScrollForParent(parentElement)).to.not.throw()
    })

    it('should handle multiple number inputs', () => {
      const input1 = document.createElement('input')
      input1.type = 'number'
      const input2 = document.createElement('input')
      input2.type = 'number'
      parentElement.appendChild(input1)
      parentElement.appendChild(input2)

      setupNumberInputScrollForParent(parentElement)

      expect(input1.inputScrollSetup).to.be.true
      expect(input2.inputScrollSetup).to.be.true
    })
  })

  describe('setupNumberInputScroll', () => {
    let numberInput

    beforeEach(() => {
      numberInput = document.createElement('input')
      numberInput.type = 'number'
      document.body.appendChild(numberInput)
    })

    afterEach(() => {
      if (numberInput && numberInput.parentNode) {
        document.body.removeChild(numberInput)
      }
    })

    it('should set inputScrollSetup flag', () => {
      setupNumberInputScroll(numberInput)
      expect(numberInput.inputScrollSetup).to.be.true
    })

    it('should not setup again if already setup', () => {
      setupNumberInputScroll(numberInput)
      const firstSetup = numberInput.inputScrollSetup

      // Try to setup again
      setupNumberInputScroll(numberInput)

      expect(numberInput.inputScrollSetup).to.equal(firstSetup)
    })

    it('should warn for invalid element types', () => {
      const textInput = document.createElement('input')
      textInput.type = 'text'

      // The function logs a warning but doesn't throw or fail
      // Just verify it doesn't throw an error
      expect(() => setupNumberInputScroll(textInput)).to.not.throw()
    })
  })

  describe('removeNumberInputScroll', () => {
    let numberInput

    beforeEach(() => {
      numberInput = document.createElement('input')
      numberInput.type = 'number'
      document.body.appendChild(numberInput)
    })

    afterEach(() => {
      if (numberInput && numberInput.parentNode) {
        document.body.removeChild(numberInput)
      }
    })

    it('should set inputScrollSetup flag to false', () => {
      setupNumberInputScroll(numberInput)
      expect(numberInput.inputScrollSetup).to.be.true

      removeNumberInputScroll(numberInput)
      expect(numberInput.inputScrollSetup).to.be.false
    })

    it('should not throw error if called without setup', () => {
      expect(() => removeNumberInputScroll(numberInput)).to.not.throw()
    })
  })

  describe('handleScrollOnNumberInput', () => {
    let numberInput

    beforeEach(() => {
      numberInput = document.createElement('input')
      numberInput.type = 'number'
      numberInput.value = '5'
      numberInput.min = '0'
      numberInput.max = '10'
      document.body.appendChild(numberInput)
    })

    afterEach(() => {
      if (numberInput && numberInput.parentNode) {
        document.body.removeChild(numberInput)
      }
    })

    it('should increment value on positive wheel delta', () => {
      // Note: deltaY and wheelDelta have opposite signs
      // Positive wheelDelta (scroll up) should increment
      const evt = new WheelEvent('wheel', { deltaY: -1 })
      Object.defineProperty(evt, 'wheelDelta', { value: 120 }) // Positive = scroll up
      Object.defineProperty(evt, 'target', { value: numberInput })

      handleScrollOnNumberInput(evt)

      expect(numberInput.valueAsNumber).to.equal(6)
    })

    it('should decrement value on negative wheel delta', () => {
      // Note: deltaY and wheelDelta have opposite signs
      // Negative wheelDelta (scroll down) should decrement
      const evt = new WheelEvent('wheel', { deltaY: 1 })
      Object.defineProperty(evt, 'wheelDelta', { value: -120 }) // Negative = scroll down
      Object.defineProperty(evt, 'target', { value: numberInput })

      handleScrollOnNumberInput(evt)

      expect(numberInput.valueAsNumber).to.equal(4)
    })

    it('should clamp value to min', () => {
      numberInput.value = '0'
      const evt = new WheelEvent('wheel', { deltaY: 1 })
      Object.defineProperty(evt, 'wheelDelta', { value: -120 })
      Object.defineProperty(evt, 'target', { value: numberInput })

      handleScrollOnNumberInput(evt)

      expect(numberInput.valueAsNumber).to.equal(0)
    })

    it('should clamp value to max', () => {
      numberInput.value = '10'
      const evt = new WheelEvent('wheel', { deltaY: -1 })
      Object.defineProperty(evt, 'wheelDelta', { value: 120 })
      Object.defineProperty(evt, 'target', { value: numberInput })

      handleScrollOnNumberInput(evt)

      expect(numberInput.valueAsNumber).to.equal(10)
    })

    it('should handle NaN value by setting to 0', () => {
      numberInput.value = ''
      const evt = new WheelEvent('wheel', { deltaY: -1 })
      Object.defineProperty(evt, 'wheelDelta', { value: 120 })
      Object.defineProperty(evt, 'target', { value: numberInput })

      handleScrollOnNumberInput(evt)

      expect(numberInput.valueAsNumber).to.equal(1)
    })

    it('should dispatch change event', () => {
      let changeEventFired = false
      numberInput.addEventListener('change', () => {
        changeEventFired = true
      })

      const evt = new WheelEvent('wheel', { deltaY: -1 })
      Object.defineProperty(evt, 'wheelDelta', { value: 120 })
      Object.defineProperty(evt, 'target', { value: numberInput })

      handleScrollOnNumberInput(evt)

      expect(changeEventFired).to.be.true
    })

    it('should handle target parameter', () => {
      const evt = new WheelEvent('wheel', { deltaY: -1 })
      Object.defineProperty(evt, 'wheelDelta', { value: 120 })

      handleScrollOnNumberInput(evt, numberInput)

      expect(numberInput.valueAsNumber).to.equal(6)
    })

    it('should return early for non-WheelEvent', () => {
      const evt = new Event('click')
      const originalValue = numberInput.valueAsNumber

      handleScrollOnNumberInput(evt)

      expect(numberInput.valueAsNumber).to.equal(originalValue)
    })

    it('should handle input without min attribute', () => {
      numberInput.removeAttribute('min')
      numberInput.value = '5'

      const evt = new WheelEvent('wheel', { deltaY: 1 })
      Object.defineProperty(evt, 'wheelDelta', { value: -120 })
      Object.defineProperty(evt, 'target', { value: numberInput })

      handleScrollOnNumberInput(evt)

      expect(numberInput.valueAsNumber).to.equal(4)
    })

    it('should handle input without max attribute', () => {
      numberInput.removeAttribute('max')
      numberInput.value = '5'

      const evt = new WheelEvent('wheel', { deltaY: -1 })
      Object.defineProperty(evt, 'wheelDelta', { value: 120 })
      Object.defineProperty(evt, 'target', { value: numberInput })

      handleScrollOnNumberInput(evt)

      expect(numberInput.valueAsNumber).to.equal(6)
    })
  })
})
