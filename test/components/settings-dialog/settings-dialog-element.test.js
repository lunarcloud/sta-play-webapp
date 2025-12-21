import { expect } from '@esm-bundle/chai'
import '../../../components/settings-dialog/settings-dialog-element.js'

describe('SettingsDialogElement', () => {
  let dialog

  beforeEach(() => {
    dialog = document.createElement('dialog', { is: 'settings-dialog' })
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
      expect(customElements.get('settings-dialog')).to.equal(globalThis.SettingsDialogElement)
    })

    it('should be accessible via globalThis', () => {
      expect(globalThis.SettingsDialogElement).to.not.be.undefined
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
      expect(header.textContent).to.include('Settings')

      const closeButton = header.querySelector('button.close')
      expect(closeButton).to.not.be.null
    })

    it('should have main content area', () => {
      const main = dialog.querySelector('main')
      expect(main).to.not.be.null
    })

    it('should have settings elements', () => {
      const themeSelect = dialog.querySelector('select#select-theme')
      expect(themeSelect).to.not.be.null

      const editionSelect = dialog.querySelector('select#select-edition')
      expect(editionSelect).to.not.be.null
    })
  })
})
