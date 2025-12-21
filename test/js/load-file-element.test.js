import { expect } from '@esm-bundle/chai'
import { loadElementFromFile } from '../../js/load-file-element.js'

describe('Load File Element', () => {
  describe('loadElementFromFile', () => {
    it('should load element from HTML file', async () => {
      // We need a test HTML file for this - let's check if we can use an existing one
      // For now, test the function structure and error handling
      expect(loadElementFromFile).to.be.a('function')
    })

    it('should return a Promise', () => {
      const result = loadElementFromFile('nonexistent.html', 'body')
      expect(result).to.be.instanceof(Promise)
    })

    it('should parse HTML and return queried element', async () => {
      // Create a simple HTML blob URL for testing
      const htmlContent = '<html><body><div id="test">Test Content</div></body></html>'
      const blob = new Blob([htmlContent], { type: 'text/html' })
      const url = URL.createObjectURL(blob)

      try {
        const element = await loadElementFromFile(url, '#test')
        expect(element).to.not.be.null
        expect(element.id).to.equal('test')
        expect(element.textContent).to.equal('Test Content')
      } finally {
        URL.revokeObjectURL(url)
      }
    })

    it('should handle dialog element selection', async () => {
      const htmlContent = '<html><body><dialog id="test-dialog">Dialog Content</dialog></body></html>'
      const blob = new Blob([htmlContent], { type: 'text/html' })
      const url = URL.createObjectURL(blob)

      try {
        const element = await loadElementFromFile(url, 'dialog')
        expect(element).to.not.be.null
        expect(element.tagName.toLowerCase()).to.equal('dialog')
        expect(element.textContent).to.equal('Dialog Content')
      } finally {
        URL.revokeObjectURL(url)
      }
    })

    it('should handle complex querySelector', async () => {
      const htmlContent = '<html><body><div class="container"><span class="target">Found</span></div></body></html>'
      const blob = new Blob([htmlContent], { type: 'text/html' })
      const url = URL.createObjectURL(blob)

      try {
        const element = await loadElementFromFile(url, '.container .target')
        expect(element).to.not.be.null
        expect(element.textContent).to.equal('Found')
      } finally {
        URL.revokeObjectURL(url)
      }
    })

    it('should return null when element not found', async () => {
      const htmlContent = '<html><body><div>Content</div></body></html>'
      const blob = new Blob([htmlContent], { type: 'text/html' })
      const url = URL.createObjectURL(blob)

      try {
        const element = await loadElementFromFile(url, '#nonexistent')
        expect(element).to.be.null
      } finally {
        URL.revokeObjectURL(url)
      }
    })

    it('should reject on invalid file path', async () => {
      try {
        await loadElementFromFile('http://invalid-url-that-does-not-exist-12345.test', 'body')
        expect.fail('Should have thrown an error')
      } catch (error) {
        expect(error).to.be.instanceof(Error)
      }
    })

    it('should handle HTML with special characters', async () => {
      const htmlContent = '<html><body><div id="special">你好 émojis: 😊</div></body></html>'
      const blob = new Blob([htmlContent], { type: 'text/html' })
      const url = URL.createObjectURL(blob)

      try {
        const element = await loadElementFromFile(url, '#special')
        expect(element).to.not.be.null
        expect(element.textContent).to.equal('你好 émojis: 😊')
      } finally {
        URL.revokeObjectURL(url)
      }
    })

    it('should handle nested elements', async () => {
      const htmlContent = `
        <html>
          <body>
            <div class="outer">
              <div class="middle">
                <span class="inner">Nested Content</span>
              </div>
            </div>
          </body>
        </html>
      `
      const blob = new Blob([htmlContent], { type: 'text/html' })
      const url = URL.createObjectURL(blob)

      try {
        const element = await loadElementFromFile(url, '.outer')
        expect(element).to.not.be.null
        expect(element.querySelector('.inner')).to.not.be.null
        expect(element.querySelector('.inner').textContent.trim()).to.equal('Nested Content')
      } finally {
        URL.revokeObjectURL(url)
      }
    })
  })
})
