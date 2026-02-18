import { expect } from '@esm-bundle/chai'
import { BusyDialogElement } from '../../../components/busy-dialog/busy-dialog-element.js'

describe('BusyDialogElement', () => {
  let dialog

  beforeEach(() => {
    dialog = document.createElement('dialog', { is: 'busy-dialog' })
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
      expect(customElements.get('busy-dialog')).to.equal(BusyDialogElement)
    })

    it('should export a class constructor', () => {
      expect(BusyDialogElement).to.be.a('function')
      expect(BusyDialogElement.prototype).to.be.an.instanceof(HTMLDialogElement)
    })
  })

  describe('show method', () => {
    it('should display the message and show the dialog', () => {
      const message = 'Processing...'
      dialog.show(message)

      expect(dialog.open).to.be.true
      const messageEl = dialog.querySelector('main p')
      expect(messageEl.textContent).to.equal(message)
    })

    it('should update message on subsequent calls', () => {
      dialog.show('First message')
      expect(dialog.querySelector('main p').textContent).to.equal('First message')

      dialog.show('Second message')
      expect(dialog.querySelector('main p').textContent).to.equal('Second message')
    })

    it('should handle empty string message', () => {
      dialog.show('')
      expect(dialog.open).to.be.true
      expect(dialog.querySelector('main p').textContent).to.equal('')
    })
  })

  describe('close method', () => {
    it('should close the dialog', () => {
      dialog.show('Test message')
      expect(dialog.open).to.be.true

      dialog.close()
      expect(dialog.open).to.be.false
    })
  })

  describe('structure', () => {
    it('should have header', () => {
      const header = dialog.querySelector('header')
      expect(header).to.not.be.null
      expect(header.textContent).to.include('Working')
    })

    it('should have main content area with paragraph', () => {
      const main = dialog.querySelector('main')
      expect(main).to.not.be.null

      const paragraph = main.querySelector('p')
      expect(paragraph).to.not.be.null
    })

    it('should not have a close button', () => {
      const closeButton = dialog.querySelector('button.close')
      expect(closeButton).to.be.null
    })
  })
})
