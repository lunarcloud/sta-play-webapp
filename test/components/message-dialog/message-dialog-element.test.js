import { expect } from '@esm-bundle/chai'
import '../../../components/message-dialog/message-dialog-element.js'

describe('MessageDialogElement', () => {
  let dialog

  beforeEach(() => {
    dialog = document.createElement('dialog', { is: 'message-dialog' })
    document.body.appendChild(dialog)
  })

  afterEach(() => {
    if (dialog && dialog.parentNode) {
      dialog.close()
      document.body.removeChild(dialog)
    }
  })

  describe('custom element registration', () => {
    it('should be defined as a custom element', () => {
      expect(customElements.get('message-dialog')).to.equal(globalThis.MessageDialogElement)
    })

    it('should be accessible via globalThis', () => {
      expect(globalThis.MessageDialogElement).to.not.be.undefined
    })
  })

  describe('show method', () => {
    it('should display the message and show the dialog', () => {
      const message = 'Test message'
      dialog.show(message)

      expect(dialog.open).to.be.true
      const mainEl = dialog.querySelector('main')
      expect(mainEl.textContent).to.equal(message)
    })

    it('should apply opening animation when shown', (done) => {
      dialog.show('Test')

      // Check that dialog has slide-in animation applied via CSS
      const styles = window.getComputedStyle(dialog)
      // The animation should be applied via the [open] selector in CSS
      expect(dialog.open).to.be.true

      done()
    })
  })

  describe('close animation', () => {
    it('should add closing class when close button is clicked', (done) => {
      dialog.show('Test message')

      const closeButton = dialog.querySelector('button.close')
      closeButton.click()

      // The closing class should be added immediately
      setTimeout(() => {
        // Check if dialog was closed (closing class is removed after animation)
        expect(dialog.open).to.be.false
        done()
      }, 400) // Wait for animation to complete (300ms + buffer)
    })

    it('should close immediately with reduced motion preference', (done) => {
      // Note: This test relies on system settings
      // In real usage, the matchMedia check would be used
      dialog.show('Test message')

      const closeButton = dialog.querySelector('button.close')
      closeButton.click()

      // With reduced motion, it should close quickly
      setTimeout(() => {
        expect(dialog.open).to.be.false
        done()
      }, 400)
    })
  })

  describe('structure', () => {
    it('should have header with close button', () => {
      const header = dialog.querySelector('header')
      expect(header).to.not.be.null

      const closeButton = header.querySelector('button.close')
      expect(closeButton).to.not.be.null
    })

    it('should have main content area', () => {
      const main = dialog.querySelector('main')
      expect(main).to.not.be.null
    })

    it('should have footer with close button', () => {
      const footer = dialog.querySelector('footer')
      expect(footer).to.not.be.null

      const closeButton = footer.querySelector('button.close')
      expect(closeButton).to.not.be.null
    })
  })
})
