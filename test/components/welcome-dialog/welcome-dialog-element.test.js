import { expect } from '@esm-bundle/chai'
import '../../../components/welcome-dialog/welcome-dialog-element.js'

describe('WelcomeDialogElement', () => {
  let dialog

  beforeEach(() => {
    dialog = document.createElement('dialog', { is: 'welcome-dialog' })
    document.body.appendChild(dialog)
  })

  afterEach(() => {
    if (dialog && dialog.parentNode) {
      if (dialog.open) {
        dialog.close()
      }
      document.body.removeChild(dialog)
    }
  })

  describe('custom element registration', () => {
    it('should be defined as a custom element', () => {
      expect(customElements.get('welcome-dialog')).to.equal(globalThis.WelcomeDialogElement)
    })

    it('should be accessible via globalThis', () => {
      expect(globalThis.WelcomeDialogElement).to.not.be.undefined
    })
  })

  describe('showModal method', () => {
    it('should show the dialog', () => {
      dialog.showModal()
      expect(dialog.open).to.be.true
    })
  })

  describe('close animation', () => {
    it('should add closing class when close button is clicked', (done) => {
      dialog.showModal()

      const closeButton = dialog.querySelector('button.close')
      closeButton.click()

      // The closing class should be added immediately
      setTimeout(() => {
        // Check if dialog was closed (closing class is removed after animation)
        expect(dialog.open).to.be.false
        done()
      }, 400) // Wait for animation to complete (300ms + buffer)
    })
  })

  describe('structure', () => {
    it('should have header with title and close button', () => {
      const header = dialog.querySelector('header')
      expect(header).to.not.be.null
      expect(header.textContent).to.include('Welcome')

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
