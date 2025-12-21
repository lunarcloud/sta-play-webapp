import { expect } from '@esm-bundle/chai'
import { 
  NumberInputTypes,
  setupNumberInputScrollForParent, 
  setupNumberInputScroll, 
  removeNumberInputScroll,
  handleScrollOnNumberInput 
} from '../../js/scrollable-inputs.js'

describe('Scrollable Inputs', () => {
  describe('NumberInputTypes', () => {
    it('should export NumberInputTypes array', () => {
      expect(NumberInputTypes).to.be.an('array')
      expect(NumberInputTypes.length).to.be.at.least(1)
    })

    it('should include HTMLInputElement in NumberInputTypes', () => {
      expect(NumberInputTypes).to.include(HTMLInputElement)
    })
  })

  describe('setupNumberInputScroll', () => {
    it('should setup scroll handler on number input', () => {
      const input = document.createElement('input')
      input.type = 'number'
      document.body.appendChild(input)

      setupNumberInputScroll(input)
      expect(input.inputScrollSetup).to.be.true

      document.body.removeChild(input)
    })

    it('should not setup scroll twice on same element', () => {
      const input = document.createElement('input')
      input.type = 'number'
      document.body.appendChild(input)

      setupNumberInputScroll(input)
      const firstSetup = input.inputScrollSetup

      // Try to setup again
      setupNumberInputScroll(input)
      expect(input.inputScrollSetup).to.equal(firstSetup)

      document.body.removeChild(input)
    })

    it('should warn when trying to setup on non-number input', () => {
      const div = document.createElement('div')
      const originalWarn = console.warn
      let warnCalled = false

      console.warn = () => { warnCalled = true }
      setupNumberInputScroll(div)
      console.warn = originalWarn

      expect(warnCalled).to.be.true
    })

    it('should handle range input type', () => {
      const input = document.createElement('input')
      input.type = 'range'
      document.body.appendChild(input)

      setupNumberInputScroll(input)
      expect(input.inputScrollSetup).to.be.true

      document.body.removeChild(input)
    })
  })

  describe('removeNumberInputScroll', () => {
    it('should remove scroll handler from element', () => {
      const input = document.createElement('input')
      input.type = 'number'
      document.body.appendChild(input)

      setupNumberInputScroll(input)
      expect(input.inputScrollSetup).to.be.true

      removeNumberInputScroll(input)
      expect(input.inputScrollSetup).to.be.false

      document.body.removeChild(input)
    })

    it('should not throw when removing from element without setup', () => {
      const input = document.createElement('input')
      input.type = 'number'

      expect(() => removeNumberInputScroll(input)).to.not.throw()
    })
  })

  describe('setupNumberInputScrollForParent', () => {
    it('should setup scroll on all number inputs in parent', () => {
      const parent = document.createElement('div')
      const input1 = document.createElement('input')
      input1.type = 'number'
      const input2 = document.createElement('input')
      input2.type = 'number'

      parent.appendChild(input1)
      parent.appendChild(input2)
      document.body.appendChild(parent)

      setupNumberInputScrollForParent(parent)

      expect(input1.inputScrollSetup).to.be.true
      expect(input2.inputScrollSetup).to.be.true

      document.body.removeChild(parent)
    })

    it('should setup scroll on range inputs in parent', () => {
      const parent = document.createElement('div')
      const input = document.createElement('input')
      input.type = 'range'

      parent.appendChild(input)
      document.body.appendChild(parent)

      setupNumberInputScrollForParent(parent)

      expect(input.inputScrollSetup).to.be.true

      document.body.removeChild(parent)
    })

    it('should handle nested elements', () => {
      const parent = document.createElement('div')
      const nested = document.createElement('div')
      const input = document.createElement('input')
      input.type = 'number'

      nested.appendChild(input)
      parent.appendChild(nested)
      document.body.appendChild(parent)

      setupNumberInputScrollForParent(parent)

      expect(input.inputScrollSetup).to.be.true

      document.body.removeChild(parent)
    })

    it('should ignore non-number inputs', () => {
      const parent = document.createElement('div')
      const textInput = document.createElement('input')
      textInput.type = 'text'
      const numberInput = document.createElement('input')
      numberInput.type = 'number'

      parent.appendChild(textInput)
      parent.appendChild(numberInput)
      document.body.appendChild(parent)

      setupNumberInputScrollForParent(parent)

      expect(textInput.inputScrollSetup).to.be.undefined
      expect(numberInput.inputScrollSetup).to.be.true

      document.body.removeChild(parent)
    })
  })

  describe('handleScrollOnNumberInput', () => {
    it('should increment value on positive wheel delta', () => {
      const input = document.createElement('input')
      input.type = 'number'
      input.value = '5'
      document.body.appendChild(input)

      const evt = new WheelEvent('wheel', { 
        deltaY: -100,
        bubbles: true,
        cancelable: true
      })
      // Add wheelDelta property for compatibility
      Object.defineProperty(evt, 'wheelDelta', { value: 100 })

      handleScrollOnNumberInput(evt, input)

      expect(input.valueAsNumber).to.equal(6)

      document.body.removeChild(input)
    })

    it('should decrement value on negative wheel delta', () => {
      const input = document.createElement('input')
      input.type = 'number'
      input.value = '5'
      document.body.appendChild(input)

      const evt = new WheelEvent('wheel', { 
        deltaY: 100,
        bubbles: true,
        cancelable: true
      })
      Object.defineProperty(evt, 'wheelDelta', { value: -100 })

      handleScrollOnNumberInput(evt, input)

      expect(input.valueAsNumber).to.equal(4)

      document.body.removeChild(input)
    })

    it('should respect min value', () => {
      const input = document.createElement('input')
      input.type = 'number'
      input.min = '0'
      input.value = '0'
      document.body.appendChild(input)

      const evt = new WheelEvent('wheel', { 
        deltaY: 100,
        bubbles: true,
        cancelable: true
      })
      Object.defineProperty(evt, 'wheelDelta', { value: -100 })

      handleScrollOnNumberInput(evt, input)

      expect(input.valueAsNumber).to.equal(0)

      document.body.removeChild(input)
    })

    it('should respect max value', () => {
      const input = document.createElement('input')
      input.type = 'number'
      input.max = '10'
      input.value = '10'
      document.body.appendChild(input)

      const evt = new WheelEvent('wheel', { 
        deltaY: -100,
        bubbles: true,
        cancelable: true
      })
      Object.defineProperty(evt, 'wheelDelta', { value: 100 })

      handleScrollOnNumberInput(evt, input)

      expect(input.valueAsNumber).to.equal(10)

      document.body.removeChild(input)
    })

    it('should handle NaN value by setting to 0', () => {
      const input = document.createElement('input')
      input.type = 'number'
      input.value = ''
      document.body.appendChild(input)

      const evt = new WheelEvent('wheel', { 
        deltaY: -100,
        bubbles: true,
        cancelable: true
      })
      Object.defineProperty(evt, 'wheelDelta', { value: 100 })

      handleScrollOnNumberInput(evt, input)

      expect(input.valueAsNumber).to.equal(1)

      document.body.removeChild(input)
    })

    it('should dispatch change event after value update', (done) => {
      const input = document.createElement('input')
      input.type = 'number'
      input.value = '5'
      document.body.appendChild(input)

      input.addEventListener('change', () => {
        expect(input.valueAsNumber).to.equal(6)
        document.body.removeChild(input)
        done()
      })

      const evt = new WheelEvent('wheel', { 
        deltaY: -100,
        bubbles: true,
        cancelable: true
      })
      Object.defineProperty(evt, 'wheelDelta', { value: 100 })

      handleScrollOnNumberInput(evt, input)
    })

    it('should use event target when target parameter not provided', () => {
      const input = document.createElement('input')
      input.type = 'number'
      input.value = '5'
      document.body.appendChild(input)

      const evt = new WheelEvent('wheel', { 
        deltaY: -100,
        bubbles: true,
        cancelable: true
      })
      Object.defineProperty(evt, 'wheelDelta', { value: 100 })
      Object.defineProperty(evt, 'target', { value: input })

      handleScrollOnNumberInput(evt)

      expect(input.valueAsNumber).to.equal(6)

      document.body.removeChild(input)
    })

    it('should not process non-WheelEvent', () => {
      const input = document.createElement('input')
      input.type = 'number'
      input.value = '5'
      document.body.appendChild(input)

      const evt = new Event('click')
      
      handleScrollOnNumberInput(evt, input)

      expect(input.valueAsNumber).to.equal(5)

      document.body.removeChild(input)
    })
  })
})
