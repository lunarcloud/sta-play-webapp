import { expect } from '@esm-bundle/chai'
import { setupDropOnly } from '../../js/drop-nodrag-setup.js'

describe('Drop NoDrag Setup', () => {
  describe('setupDropOnly', () => {
    it('should throw error when element is not HTMLElement', () => {
      expect(() => setupDropOnly(null, () => {})).to.throw('Cannot use \'el\' as HTMLElement argument!')
      expect(() => setupDropOnly(undefined, () => {})).to.throw('Cannot use \'el\' as HTMLElement argument!')
      expect(() => setupDropOnly('not an element', () => {})).to.throw('Cannot use \'el\' as HTMLElement argument!')
      expect(() => setupDropOnly(42, () => {})).to.throw('Cannot use \'el\' as HTMLElement argument!')
    })

    it('should setup drop handlers on valid HTMLElement', () => {
      const element = document.createElement('div')
      const onDrop = () => true

      expect(() => setupDropOnly(element, onDrop)).to.not.throw()
    })

    it('should prevent default on dragenter event', () => {
      const element = document.createElement('div')
      document.body.appendChild(element)

      let preventDefaultCalled = false
      setupDropOnly(element, () => true)

      const event = new DragEvent('dragenter', { bubbles: true, cancelable: true })
      const originalPreventDefault = event.preventDefault
      event.preventDefault = function () {
        preventDefaultCalled = true
        originalPreventDefault.call(this)
      }

      element.dispatchEvent(event)
      expect(preventDefaultCalled).to.be.true

      document.body.removeChild(element)
    })

    it('should prevent default on dragover event', () => {
      const element = document.createElement('div')
      document.body.appendChild(element)

      let preventDefaultCalled = false
      setupDropOnly(element, () => true)

      const event = new DragEvent('dragover', { bubbles: true, cancelable: true })
      const originalPreventDefault = event.preventDefault
      event.preventDefault = function () {
        preventDefaultCalled = true
        originalPreventDefault.call(this)
      }

      element.dispatchEvent(event)
      expect(preventDefaultCalled).to.be.true

      document.body.removeChild(element)
    })

    it('should prevent default on dragleave event', () => {
      const element = document.createElement('div')
      document.body.appendChild(element)

      let preventDefaultCalled = false
      setupDropOnly(element, () => true)

      const event = new DragEvent('dragleave', { bubbles: true, cancelable: true })
      const originalPreventDefault = event.preventDefault
      event.preventDefault = function () {
        preventDefaultCalled = true
        originalPreventDefault.call(this)
      }

      element.dispatchEvent(event)
      expect(preventDefaultCalled).to.be.true

      document.body.removeChild(element)
    })

    it('should call onDrop callback when drop event occurs', () => {
      const element = document.createElement('div')
      document.body.appendChild(element)

      let onDropCalled = false
      setupDropOnly(element, () => {
        onDropCalled = true
        return true
      })

      const event = new DragEvent('drop', { bubbles: true, cancelable: true })
      element.dispatchEvent(event)

      expect(onDropCalled).to.be.true

      document.body.removeChild(element)
    })

    it('should prevent default and stop propagation when onDrop returns true', () => {
      const element = document.createElement('div')
      document.body.appendChild(element)

      let preventDefaultCalled = false
      let stopPropagationCalled = false

      setupDropOnly(element, () => true)

      const event = new DragEvent('drop', { bubbles: true, cancelable: true })
      const originalPreventDefault = event.preventDefault
      const originalStopPropagation = event.stopPropagation

      event.preventDefault = function () {
        preventDefaultCalled = true
        originalPreventDefault.call(this)
      }

      event.stopPropagation = function () {
        stopPropagationCalled = true
        originalStopPropagation.call(this)
      }

      element.dispatchEvent(event)

      expect(preventDefaultCalled).to.be.true
      expect(stopPropagationCalled).to.be.true

      document.body.removeChild(element)
    })

    it('should not prevent default when onDrop returns false', () => {
      const element = document.createElement('div')
      document.body.appendChild(element)

      let preventDefaultCalled = false

      setupDropOnly(element, () => false)

      const event = new DragEvent('drop', { bubbles: true, cancelable: true })
      const originalPreventDefault = event.preventDefault

      event.preventDefault = function () {
        preventDefaultCalled = true
        originalPreventDefault.call(this)
      }

      element.dispatchEvent(event)

      expect(preventDefaultCalled).to.be.false

      document.body.removeChild(element)
    })

    it('should handle dragstart event for Firefox compatibility', () => {
      const element = document.createElement('div')
      document.body.appendChild(element)

      setupDropOnly(element, () => true)

      const event = new DragEvent('dragstart', { 
        bubbles: true, 
        cancelable: true,
        dataTransfer: new DataTransfer()
      })

      expect(() => element.dispatchEvent(event)).to.not.throw()

      document.body.removeChild(element)
    })
  })
})
