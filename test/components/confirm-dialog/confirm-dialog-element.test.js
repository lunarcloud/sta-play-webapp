import { expect } from '@esm-bundle/chai'
import { ConfirmDialogElement } from '../../../components/confirm-dialog/confirm-dialog-element.js'

describe('ConfirmDialogElement', () => {
  let dialog

  beforeEach(() => {
    dialog = document.createElement('dialog', { is: 'confirm-dialog' })
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
      expect(customElements.get('confirm-dialog')).to.equal(ConfirmDialogElement)
    })

    it('should export a class constructor', () => {
      expect(ConfirmDialogElement).to.be.a('function')
      expect(ConfirmDialogElement.prototype).to.be.an.instanceof(HTMLDialogElement)
    })
  })

  describe('confirm method', () => {
    it('should display the message and show the dialog', () => {
      const message = 'Confirm this action?'
      dialog.confirm(message)

      expect(dialog.open).to.be.true
      const mainEl = dialog.querySelector('main')
      expect(mainEl.textContent).to.equal(message)
    })

    it('should resolve to true when confirm button is clicked', async () => {
      const confirmPromise = dialog.confirm('Confirm?')

      const confirmButton = dialog.querySelector('button.confirm')
      confirmButton.click()

      // Wait for the animation to complete
      await new Promise(resolve => setTimeout(resolve, 400))

      const result = await confirmPromise
      expect(result).to.be.true
    })

    it('should resolve to false when cancel button is clicked', async () => {
      const confirmPromise = dialog.confirm('Confirm?')

      const cancelButton = dialog.querySelector('button.cancel')
      cancelButton.click()

      // Wait for the animation to complete
      await new Promise(resolve => setTimeout(resolve, 400))

      const result = await confirmPromise
      expect(result).to.be.false
    })

    it('should resolve to false when close button is clicked', async () => {
      const confirmPromise = dialog.confirm('Confirm?')

      const closeButton = dialog.querySelector('button.close')
      closeButton.click()

      // Wait for the animation to complete
      await new Promise(resolve => setTimeout(resolve, 400))

      const result = await confirmPromise
      expect(result).to.be.false
    })
  })

  describe('close animation', () => {
    it('should animate when confirm button is clicked', (done) => {
      dialog.confirm('Test?')

      const confirmButton = dialog.querySelector('button.confirm')
      confirmButton.click()

      // Wait for animation to complete
      setTimeout(() => {
        expect(dialog.open).to.be.false
        done()
      }, 400)
    })

    it('should animate when cancel button is clicked', (done) => {
      dialog.confirm('Test?')

      const cancelButton = dialog.querySelector('button.cancel')
      cancelButton.click()

      // Wait for animation to complete
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

    it('should have footer with confirm and cancel buttons', () => {
      const footer = dialog.querySelector('footer')
      expect(footer).to.not.be.null

      const cancelButton = footer.querySelector('button.cancel')
      expect(cancelButton).to.not.be.null

      const confirmButton = footer.querySelector('button.confirm')
      expect(confirmButton).to.not.be.null
    })
  })
})
