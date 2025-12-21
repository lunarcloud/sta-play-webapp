import { expect } from '@esm-bundle/chai'

describe('SettingsDialogElement', () => {
  let SettingsDialogElement

  before(async () => {
    // Import the module which will define the custom element
    await import('../../../components/settings-dialog/settings-dialog-element.js')
    SettingsDialogElement = globalThis.SettingsDialogElement
  })

  describe('custom element registration', () => {
    it('should be defined as a custom element', () => {
      expect(customElements.get('settings-dialog')).to.equal(SettingsDialogElement)
    })

    it('should be accessible via globalThis', () => {
      expect(globalThis.SettingsDialogElement).to.equal(SettingsDialogElement)
    })

    it('should extend HTMLDialogElement', () => {
      expect(SettingsDialogElement.prototype).to.be.instanceof(HTMLDialogElement)
    })
  })

  describe('constructor', () => {
    it('should create element', () => {
      const element = document.createElement('dialog', { is: 'settings-dialog' })
      expect(element).to.be.instanceof(HTMLDialogElement)
      expect(element.tagName.toLowerCase()).to.equal('dialog')
    })

    it('should have header with "Settings" text', async () => {
      const element = document.createElement('dialog', { is: 'settings-dialog' })
      await new Promise(resolve => setTimeout(resolve, 10))
      const header = element.querySelector('header')
      expect(header).to.not.be.null
      expect(header.textContent).to.include('Settings')
    })

    it('should have close buttons', async () => {
      const element = document.createElement('dialog', { is: 'settings-dialog' })
      await new Promise(resolve => setTimeout(resolve, 10))
      const closeButtons = element.querySelectorAll('button.close')
      expect(closeButtons.length).to.be.at.least(1)
    })

    it('should have main section with settings', async () => {
      const element = document.createElement('dialog', { is: 'settings-dialog' })
      await new Promise(resolve => setTimeout(resolve, 10))
      const main = element.querySelector('main')
      expect(main).to.not.be.null
    })

    it('should have footer with close button', async () => {
      const element = document.createElement('dialog', { is: 'settings-dialog' })
      await new Promise(resolve => setTimeout(resolve, 10))
      const footer = element.querySelector('footer')
      expect(footer).to.not.be.null
      const closeButton = footer.querySelector('button.close')
      expect(closeButton).to.not.be.null
    })
  })

  describe('settings controls', () => {
    it('should have theme selector', async () => {
      const element = document.createElement('dialog', { is: 'settings-dialog' })
      await new Promise(resolve => setTimeout(resolve, 10))
      const themeSelect = element.querySelector('#select-theme')
      expect(themeSelect).to.not.be.null
      expect(themeSelect.tagName.toLowerCase()).to.equal('select')
    })

    it('should have edition selector', async () => {
      const element = document.createElement('dialog', { is: 'settings-dialog' })
      await new Promise(resolve => setTimeout(resolve, 10))
      const editionSelect = element.querySelector('#select-edition')
      expect(editionSelect).to.not.be.null
      expect(editionSelect.tagName.toLowerCase()).to.equal('select')
    })

    it('should have clear database button', async () => {
      const element = document.createElement('dialog', { is: 'settings-dialog' })
      await new Promise(resolve => setTimeout(resolve, 10))
      const clearButton = element.querySelector('button.clear-info')
      expect(clearButton).to.not.be.null
    })

    it('should have show welcome button', async () => {
      const element = document.createElement('dialog', { is: 'settings-dialog' })
      await new Promise(resolve => setTimeout(resolve, 10))
      const welcomeButton = element.querySelector('button.show-welcome')
      expect(welcomeButton).to.not.be.null
    })

    it('should have export game button', async () => {
      const element = document.createElement('dialog', { is: 'settings-dialog' })
      await new Promise(resolve => setTimeout(resolve, 10))
      const exportButton = element.querySelector('button.export-game')
      expect(exportButton).to.not.be.null
    })

    it('should have import game file input', async () => {
      const element = document.createElement('dialog', { is: 'settings-dialog' })
      await new Promise(resolve => setTimeout(resolve, 10))
      const importInput = element.querySelector('input.import-game-file')
      expect(importInput).to.not.be.null
      expect(importInput.type).to.equal('file')
    })

    it('should have ship model controls', async () => {
      const element = document.createElement('dialog', { is: 'settings-dialog' })
      await new Promise(resolve => setTimeout(resolve, 10))
      const shipInput = element.querySelector('input.select-ship')
      const setShipButton = element.querySelector('button.set-ship')
      const clearShipButton = element.querySelector('button.clear-ship')
      expect(shipInput).to.not.be.null
      expect(setShipButton).to.not.be.null
      expect(clearShipButton).to.not.be.null
    })

    it('should have player image upload controls', async () => {
      const element = document.createElement('dialog', { is: 'settings-dialog' })
      await new Promise(resolve => setTimeout(resolve, 10))
      const playerImageInput = element.querySelector('.player-image-upload input.select')
      const setButton = element.querySelector('.player-image-upload button.set')
      const indexInput = element.querySelector('.player-image-upload input.index')
      expect(playerImageInput).to.not.be.null
      expect(setButton).to.not.be.null
      expect(indexInput).to.not.be.null
    })

    it('should have legacy task tracker toggle', async () => {
      const element = document.createElement('dialog', { is: 'settings-dialog' })
      await new Promise(resolve => setTimeout(resolve, 10))
      const legacyToggle = element.querySelector('#legacy-task-tracker-toggle')
      expect(legacyToggle).to.not.be.null
      expect(legacyToggle.type).to.equal('checkbox')
    })

    it('should have alternate font toggle', async () => {
      const element = document.createElement('dialog', { is: 'settings-dialog' })
      await new Promise(resolve => setTimeout(resolve, 10))
      const altFontToggle = element.querySelector('#alt-font-toggle')
      expect(altFontToggle).to.not.be.null
      expect(altFontToggle.type).to.equal('checkbox')
    })
  })

  describe('dialog functionality', () => {
    it('should be openable via showModal', async () => {
      const element = document.createElement('dialog', { is: 'settings-dialog' })
      document.body.appendChild(element)
      await new Promise(resolve => setTimeout(resolve, 10))

      element.showModal()
      expect(element.open).to.be.true

      element.close()
      document.body.removeChild(element)
    })

    it('should be closeable via close method', async () => {
      const element = document.createElement('dialog', { is: 'settings-dialog' })
      document.body.appendChild(element)
      await new Promise(resolve => setTimeout(resolve, 10))

      element.showModal()
      expect(element.open).to.be.true

      element.close()
      expect(element.open).to.be.false

      document.body.removeChild(element)
    })
  })

  describe('integration', () => {
    it('should work when created via document.createElement', async () => {
      const element = document.createElement('dialog', { is: 'settings-dialog' })
      expect(element).to.be.instanceof(HTMLDialogElement)
      await new Promise(resolve => setTimeout(resolve, 10))
      expect(element.querySelector('header')).to.not.be.null
    })

    it('should maintain structure through DOM operations', async () => {
      const element = document.createElement('dialog', { is: 'settings-dialog' })
      await new Promise(resolve => setTimeout(resolve, 10))
      
      document.body.appendChild(element)
      const headerBefore = element.querySelector('header')
      document.body.removeChild(element)

      document.body.appendChild(element)
      const headerAfter = element.querySelector('header')
      expect(headerAfter).to.equal(headerBefore)

      document.body.removeChild(element)
    })
  })
})
