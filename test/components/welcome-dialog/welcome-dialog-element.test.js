import { expect } from '@esm-bundle/chai'

describe('WelcomeDialogElement', () => {
  let WelcomeDialogElement

  before(async () => {
    // Import the module which will define the custom element
    await import('../../../components/welcome-dialog/welcome-dialog-element.js')
    WelcomeDialogElement = globalThis.WelcomeDialogElement
  })

  describe('custom element registration', () => {
    it('should be defined as a custom element', () => {
      expect(customElements.get('welcome-dialog')).to.equal(WelcomeDialogElement)
    })

    it('should be accessible via globalThis', () => {
      expect(globalThis.WelcomeDialogElement).to.equal(WelcomeDialogElement)
    })

    it('should extend HTMLDialogElement', () => {
      expect(WelcomeDialogElement.prototype).to.be.instanceof(HTMLDialogElement)
    })
  })

  describe('constructor', () => {
    it('should create element', () => {
      const element = document.createElement('dialog', { is: 'welcome-dialog' })
      expect(element).to.be.instanceof(HTMLDialogElement)
      expect(element.tagName.toLowerCase()).to.equal('dialog')
    })

    it('should have header with "Welcome" text', async () => {
      const element = document.createElement('dialog', { is: 'welcome-dialog' })
      await new Promise(resolve => setTimeout(resolve, 10))
      const header = element.querySelector('header')
      expect(header).to.not.be.null
      expect(header.textContent).to.include('Welcome')
    })

    it('should have close buttons', async () => {
      const element = document.createElement('dialog', { is: 'welcome-dialog' })
      await new Promise(resolve => setTimeout(resolve, 10))
      const closeButtons = element.querySelectorAll('button.close')
      expect(closeButtons.length).to.be.at.least(1)
    })

    it('should have main section with content', async () => {
      const element = document.createElement('dialog', { is: 'welcome-dialog' })
      await new Promise(resolve => setTimeout(resolve, 10))
      const main = element.querySelector('main')
      expect(main).to.not.be.null
    })

    it('should have footer with close button', async () => {
      const element = document.createElement('dialog', { is: 'welcome-dialog' })
      await new Promise(resolve => setTimeout(resolve, 10))
      const footer = element.querySelector('footer')
      expect(footer).to.not.be.null
      const closeButton = footer.querySelector('button.close')
      expect(closeButton).to.not.be.null
    })

    it('should have embedded styles', async () => {
      const element = document.createElement('dialog', { is: 'welcome-dialog' })
      await new Promise(resolve => setTimeout(resolve, 10))
      const style = element.querySelector('style')
      expect(style).to.not.be.null
    })
  })

  describe('content sections', () => {
    it('should have information about Star Trek Adventures', async () => {
      const element = document.createElement('dialog', { is: 'welcome-dialog' })
      await new Promise(resolve => setTimeout(resolve, 10))
      const content = element.textContent
      expect(content).to.include('Star Trek Adventures')
    })

    it('should have player customization information', async () => {
      const element = document.createElement('dialog', { is: 'welcome-dialog' })
      await new Promise(resolve => setTimeout(resolve, 10))
      const customizations = element.querySelector('#player-customizations')
      expect(customizations).to.not.be.null
      expect(customizations.textContent).to.include('customized')
    })

    it('should have keyboard shortcuts table', async () => {
      const element = document.createElement('dialog', { is: 'welcome-dialog' })
      await new Promise(resolve => setTimeout(resolve, 10))
      const shortcuts = element.querySelector('#keyboard-shortcuts')
      expect(shortcuts).to.not.be.null
      expect(shortcuts.tagName.toLowerCase()).to.equal('table')
    })

    it('should list keyboard shortcuts', async () => {
      const element = document.createElement('dialog', { is: 'welcome-dialog' })
      await new Promise(resolve => setTimeout(resolve, 10))
      const shortcuts = element.querySelector('#keyboard-shortcuts')
      const rows = shortcuts.querySelectorAll('tbody tr')
      expect(rows.length).to.be.at.least(5)
    })

    it('should have Ctrl+S shortcut listed', async () => {
      const element = document.createElement('dialog', { is: 'welcome-dialog' })
      await new Promise(resolve => setTimeout(resolve, 10))
      const content = element.textContent
      expect(content).to.include('Ctrl + S')
      expect(content).to.include('Save Changes')
    })

    it('should have Escape shortcut listed', async () => {
      const element = document.createElement('dialog', { is: 'welcome-dialog' })
      await new Promise(resolve => setTimeout(resolve, 10))
      const content = element.textContent
      expect(content).to.include('Escape')
      expect(content).to.include('Hide any dialog')
    })

    it('should have link to GitHub repository', async () => {
      const element = document.createElement('dialog', { is: 'welcome-dialog' })
      await new Promise(resolve => setTimeout(resolve, 10))
      const links = element.querySelectorAll('a')
      const githubLink = Array.from(links).find(link => 
        link.href.includes('github.com')
      )
      expect(githubLink).to.not.be.undefined
    })

    it('should have copyright notice', async () => {
      const element = document.createElement('dialog', { is: 'welcome-dialog' })
      await new Promise(resolve => setTimeout(resolve, 10))
      const content = element.textContent
      expect(content).to.include('Sam Sarette')
    })

    it('should have columns section', async () => {
      const element = document.createElement('dialog', { is: 'welcome-dialog' })
      await new Promise(resolve => setTimeout(resolve, 10))
      const columns = element.querySelector('columns')
      expect(columns).to.not.be.null
    })

    it('should have bottom section', async () => {
      const element = document.createElement('dialog', { is: 'welcome-dialog' })
      await new Promise(resolve => setTimeout(resolve, 10))
      const bottom = element.querySelector('bottom')
      expect(bottom).to.not.be.null
    })
  })

  describe('dialog functionality', () => {
    it('should be openable via showModal', async () => {
      const element = document.createElement('dialog', { is: 'welcome-dialog' })
      document.body.appendChild(element)
      await new Promise(resolve => setTimeout(resolve, 10))

      element.showModal()
      expect(element.open).to.be.true

      element.close()
      document.body.removeChild(element)
    })

    it('should be closeable via close method', async () => {
      const element = document.createElement('dialog', { is: 'welcome-dialog' })
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
      const element = document.createElement('dialog', { is: 'welcome-dialog' })
      expect(element).to.be.instanceof(HTMLDialogElement)
      await new Promise(resolve => setTimeout(resolve, 10))
      expect(element.querySelector('header')).to.not.be.null
    })

    it('should maintain structure through DOM operations', async () => {
      const element = document.createElement('dialog', { is: 'welcome-dialog' })
      await new Promise(resolve => setTimeout(resolve, 10))
      
      document.body.appendChild(element)
      const headerBefore = element.querySelector('header')
      document.body.removeChild(element)

      document.body.appendChild(element)
      const headerAfter = element.querySelector('header')
      expect(headerAfter).to.equal(headerBefore)

      document.body.removeChild(element)
    })

    it('should preserve embedded styles', async () => {
      const element = document.createElement('dialog', { is: 'welcome-dialog' })
      await new Promise(resolve => setTimeout(resolve, 10))
      
      document.body.appendChild(element)
      const styleBefore = element.querySelector('style')
      document.body.removeChild(element)

      document.body.appendChild(element)
      const styleAfter = element.querySelector('style')
      expect(styleAfter).to.equal(styleBefore)

      document.body.removeChild(element)
    })
  })
})
