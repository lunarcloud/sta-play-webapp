import { expect } from '@esm-bundle/chai'
import { setupDropOnly } from '../../js/drop-nodrag-setup.js'

describe('drop-nodrag-setup', () => {
  describe('setupDropOnly', () => {
    let element

    beforeEach(() => {
      element = document.createElement('div')
      document.body.appendChild(element)
    })

    afterEach(() => {
      if (element && element.parentNode) {
        document.body.removeChild(element)
      }
    })

    it('should throw error when element is not HTMLElement', () => {
      expect(() => setupDropOnly(null, () => {})).to.throw("Cannot use 'el' as HTMLElement argument!")
      expect(() => setupDropOnly(undefined, () => {})).to.throw("Cannot use 'el' as HTMLElement argument!")
      expect(() => setupDropOnly({}, () => {})).to.throw("Cannot use 'el' as HTMLElement argument!")
      expect(() => setupDropOnly('string', () => {})).to.throw("Cannot use 'el' as HTMLElement argument!")
    })

    it('should setup element with drop event listeners', () => {
      const onDropCalled = []
      const onDrop = (event) => {
        onDropCalled.push(event)
        return true
      }

      setupDropOnly(element, onDrop)

      // Verify element has event listeners by dispatching events
      const dragstartEvent = new DragEvent('dragstart', { dataTransfer: new DataTransfer() })
      element.dispatchEvent(dragstartEvent)

      const dragenterEvent = new DragEvent('dragenter')
      const dragenterSpy = { prevented: false }
      dragenterEvent.preventDefault = () => { dragenterSpy.prevented = true }
      element.dispatchEvent(dragenterEvent)
      expect(dragenterSpy.prevented).to.be.true

      const dragoverEvent = new DragEvent('dragover')
      const dragoverSpy = { prevented: false }
      dragoverEvent.preventDefault = () => { dragoverSpy.prevented = true }
      element.dispatchEvent(dragoverEvent)
      expect(dragoverSpy.prevented).to.be.true

      const dragleaveEvent = new DragEvent('dragleave')
      const dragleaveSpy = { prevented: false }
      dragleaveEvent.preventDefault = () => { dragleaveSpy.prevented = true }
      element.dispatchEvent(dragleaveEvent)
      expect(dragleaveSpy.prevented).to.be.true
    })

    it('should call onDrop callback when drop event occurs', () => {
      let dropCallbackCalled = false
      const onDrop = (event) => {
        dropCallbackCalled = true
        return true
      }

      setupDropOnly(element, onDrop)

      const dropEvent = new DragEvent('drop', { dataTransfer: new DataTransfer() })
      element.dispatchEvent(dropEvent)

      expect(dropCallbackCalled).to.be.true
    })

    it('should prevent default and stop propagation when onDrop returns true', () => {
      const onDrop = () => true

      setupDropOnly(element, onDrop)

      const dropEvent = new DragEvent('drop', { dataTransfer: new DataTransfer() })
      let preventDefaultCalled = false
      let stopPropagationCalled = false

      dropEvent.preventDefault = () => { preventDefaultCalled = true }
      dropEvent.stopPropagation = () => { stopPropagationCalled = true }

      element.dispatchEvent(dropEvent)

      expect(preventDefaultCalled).to.be.true
      expect(stopPropagationCalled).to.be.true
    })

    it('should not prevent default when onDrop returns false', () => {
      const onDrop = () => false

      setupDropOnly(element, onDrop)

      const dropEvent = new DragEvent('drop', { dataTransfer: new DataTransfer() })
      let preventDefaultCalled = false
      let stopPropagationCalled = false

      dropEvent.preventDefault = () => { preventDefaultCalled = true }
      dropEvent.stopPropagation = () => { stopPropagationCalled = true }

      element.dispatchEvent(dropEvent)

      expect(preventDefaultCalled).to.be.false
      expect(stopPropagationCalled).to.be.false
    })

    it('should handle non-DragEvent in drop listener', () => {
      const onDrop = () => true

      setupDropOnly(element, onDrop)

      // Create a regular Event instead of DragEvent
      const nonDragEvent = new Event('drop')
      let preventDefaultCalled = false

      nonDragEvent.preventDefault = () => { preventDefaultCalled = true }

      element.dispatchEvent(nonDragEvent)

      expect(preventDefaultCalled).to.be.false
    })
  })
})
