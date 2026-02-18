import { expect } from '@esm-bundle/chai'
import { InputDialogElement } from '../../../components/input-dialog/input-dialog-element.js'

describe('InputDialogElement', () => {
  let dialog

  beforeEach(() => {
    dialog = document.createElement('dialog', { is: 'input-dialog' })
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
      expect(customElements.get('input-dialog')).to.equal(InputDialogElement)
    })

    it('should export a class constructor', () => {
      expect(InputDialogElement).to.be.a('function')
      expect(InputDialogElement.prototype).to.be.an.instanceof(HTMLDialogElement)
    })
  })

  describe('prompt method', () => {
    it('should display the message and show the dialog', () => {
      const message = 'Enter your name:'
      dialog.prompt(message)

      expect(dialog.open).to.be.true
      const labelEl = dialog.querySelector('label')
      expect(labelEl.textContent).to.equal(message)
    })

    it('should set default value in the input field', () => {
      const defaultValue = 'Default Name'
      dialog.prompt('Enter name:', defaultValue)

      const inputEl = dialog.querySelector('input')
      expect(inputEl.value).to.equal(defaultValue)
    })

    it('should use empty string when no default value provided', () => {
      dialog.prompt('Enter name:')

      const inputEl = dialog.querySelector('input')
      expect(inputEl.value).to.equal('')
    })

    it('should resolve to input value when confirm button is clicked', async () => {
      const promptPromise = dialog.prompt('Enter name:', 'Test')

      const inputEl = dialog.querySelector('input')
      inputEl.value = 'New Value'

      const confirmButton = dialog.querySelector('button.confirm')
      confirmButton.click()

      // Wait for the animation to complete
      await new Promise(resolve => setTimeout(resolve, 400))

      const result = await promptPromise
      expect(result).to.equal('New Value')
    })

    it('should resolve to null when cancel button is clicked', async () => {
      const promptPromise = dialog.prompt('Enter name:')

      const cancelButton = dialog.querySelector('button.cancel')
      cancelButton.click()

      // Wait for the animation to complete
      await new Promise(resolve => setTimeout(resolve, 400))

      const result = await promptPromise
      expect(result).to.be.null
    })

    it('should resolve to null when close button is clicked', async () => {
      const promptPromise = dialog.prompt('Enter name:')

      const closeButton = dialog.querySelector('button.close')
      closeButton.click()

      // Wait for the animation to complete
      await new Promise(resolve => setTimeout(resolve, 400))

      const result = await promptPromise
      expect(result).to.be.null
    })
  })

  describe('keyboard shortcuts', () => {
    it('should confirm on Enter key press', async () => {
      const promptPromise = dialog.prompt('Enter name:', 'Test Value')

      const inputEl = dialog.querySelector('input')
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
      inputEl.dispatchEvent(enterEvent)

      // Wait for the animation to complete
      await new Promise(resolve => setTimeout(resolve, 400))

      const result = await promptPromise
      expect(result).to.equal('Test Value')
    })

    it('should cancel on Escape key press', async () => {
      const promptPromise = dialog.prompt('Enter name:')

      const inputEl = dialog.querySelector('input')
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
      inputEl.dispatchEvent(escapeEvent)

      // Wait for the animation to complete
      await new Promise(resolve => setTimeout(resolve, 400))

      const result = await promptPromise
      expect(result).to.be.null
    })
  })

  describe('close animation', () => {
    it('should animate when confirm button is clicked', (done) => {
      dialog.prompt('Test?')

      const confirmButton = dialog.querySelector('button.confirm')
      confirmButton.click()

      // Wait for animation to complete
      setTimeout(() => {
        expect(dialog.open).to.be.false
        done()
      }, 400)
    })

    it('should animate when cancel button is clicked', (done) => {
      dialog.prompt('Test?')

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

    it('should have main content area with label and input', () => {
      const main = dialog.querySelector('main')
      expect(main).to.not.be.null

      const label = main.querySelector('label')
      expect(label).to.not.be.null

      const input = main.querySelector('input')
      expect(input).to.not.be.null
      expect(input.type).to.equal('text')
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
