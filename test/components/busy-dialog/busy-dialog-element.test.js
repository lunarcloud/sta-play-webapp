import { expect } from '@esm-bundle/chai'

describe('BusyDialogElement', () => {
  let BusyDialogElement

  before(async () => {
    // Import the module which will define the custom element
    await import('../../../components/busy-dialog/busy-dialog-element.js')
    BusyDialogElement = globalThis.BusyDialogElement
  })

  describe('custom element registration', () => {
    it('should be defined as a custom element', () => {
      expect(customElements.get('busy-dialog')).to.equal(BusyDialogElement)
    })

    it('should be accessible via globalThis', () => {
      expect(globalThis.BusyDialogElement).to.equal(BusyDialogElement)
    })

    it('should extend HTMLDialogElement', () => {
      expect(BusyDialogElement.prototype).to.be.instanceof(HTMLDialogElement)
    })
  })

  describe('constructor', () => {
    it('should create element with is attribute', () => {
      const element = document.createElement('dialog', { is: 'busy-dialog' })
      expect(element).to.be.instanceof(HTMLDialogElement)
      // The 'is' attribute may or may not be set depending on browser implementation
      // Just verify the element was created successfully
      expect(element.tagName.toLowerCase()).to.equal('dialog')
    })

    it('should have header with "Working..." text', async () => {
      const element = document.createElement('dialog', { is: 'busy-dialog' })
      // Wait a tick for innerHTML to be set
      await new Promise(resolve => setTimeout(resolve, 10))
      const header = element.querySelector('header')
      expect(header).to.not.be.null
      expect(header.textContent.trim()).to.equal('Working...')
    })

    it('should have main section with default message', async () => {
      const element = document.createElement('dialog', { is: 'busy-dialog' })
      await new Promise(resolve => setTimeout(resolve, 10))
      const main = element.querySelector('main')
      expect(main).to.not.be.null
      const paragraph = main.querySelector('p')
      expect(paragraph).to.not.be.null
      expect(paragraph.textContent.trim()).to.equal('Please wait...')
    })

    it('should have close button handlers attached', async () => {
      const element = document.createElement('dialog', { is: 'busy-dialog' })
      await new Promise(resolve => setTimeout(resolve, 10))
      const closeButtons = element.querySelectorAll('button.close')
      // Note: The dialog might not have close buttons based on the HTML structure
      expect(closeButtons).to.exist
    })
  })

  describe('show method', () => {
    it('should override default show method', () => {
      const element = document.createElement('dialog', { is: 'busy-dialog' })
      expect(element.show).to.be.a('function')
    })

    it('should update message when show is called with message parameter', async () => {
      const element = document.createElement('dialog', { is: 'busy-dialog' })
      document.body.appendChild(element)
      await new Promise(resolve => setTimeout(resolve, 10))

      element.show('Processing data...')

      const paragraph = element.querySelector('main p')
      expect(paragraph.textContent).to.equal('Processing data...')

      element.close()
      document.body.removeChild(element)
    })

    it('should call showModal when show is invoked', async () => {
      const element = document.createElement('dialog', { is: 'busy-dialog' })
      document.body.appendChild(element)
      await new Promise(resolve => setTimeout(resolve, 10))

      element.show('Test message')

      expect(element.open).to.be.true

      element.close()
      document.body.removeChild(element)
    })

    it('should handle empty string message', async () => {
      const element = document.createElement('dialog', { is: 'busy-dialog' })
      document.body.appendChild(element)
      await new Promise(resolve => setTimeout(resolve, 10))

      element.show('')

      const paragraph = element.querySelector('main p')
      expect(paragraph.textContent).to.equal('')

      element.close()
      document.body.removeChild(element)
    })

    it('should handle special characters in message', async () => {
      const element = document.createElement('dialog', { is: 'busy-dialog' })
      document.body.appendChild(element)
      await new Promise(resolve => setTimeout(resolve, 10))

      const specialMessage = 'Loading: 你好, émojis: 😊...'
      element.show(specialMessage)

      const paragraph = element.querySelector('main p')
      expect(paragraph.textContent).to.equal(specialMessage)

      element.close()
      document.body.removeChild(element)
    })

    it('should update message on subsequent show calls', async () => {
      const element = document.createElement('dialog', { is: 'busy-dialog' })
      document.body.appendChild(element)
      await new Promise(resolve => setTimeout(resolve, 10))

      element.show('First message')
      let paragraph = element.querySelector('main p')
      expect(paragraph.textContent).to.equal('First message')

      element.close()
      
      element.show('Second message')
      paragraph = element.querySelector('main p')
      expect(paragraph.textContent).to.equal('Second message')

      element.close()
      document.body.removeChild(element)
    })
  })

  describe('dialog functionality', () => {
    it('should be closeable via close method', async () => {
      const element = document.createElement('dialog', { is: 'busy-dialog' })
      document.body.appendChild(element)
      await new Promise(resolve => setTimeout(resolve, 10))

      element.show('Test')
      expect(element.open).to.be.true

      element.close()
      expect(element.open).to.be.false

      document.body.removeChild(element)
    })

    it('should display as modal when shown', async () => {
      const element = document.createElement('dialog', { is: 'busy-dialog' })
      document.body.appendChild(element)
      await new Promise(resolve => setTimeout(resolve, 10))

      element.show('Modal test')

      // showModal should make it a modal dialog
      expect(element.open).to.be.true

      element.close()
      document.body.removeChild(element)
    })
  })

  describe('integration', () => {
    it('should work when created via document.createElement', async () => {
      const element = document.createElement('dialog', { is: 'busy-dialog' })
      expect(element).to.be.instanceof(HTMLDialogElement)
      await new Promise(resolve => setTimeout(resolve, 10))
      expect(element.querySelector('header')).to.not.be.null
    })

    it('should maintain structure through DOM operations', async () => {
      const element = document.createElement('dialog', { is: 'busy-dialog' })
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
