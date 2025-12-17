import { expect } from '@esm-bundle/chai'
import { saveBlob, saveText } from '../../js/save-file-utils.js'

describe('Save File Utils', () => {
  describe('saveBlob', () => {
    it('should create and click download link', (done) => {
      const testData = new Blob(['test content'], { type: 'text/plain' })
      const filename = 'test.txt'

      // Mock URL methods
      const originalCreateObjectURL = URL.createObjectURL
      const originalRevokeObjectURL = URL.revokeObjectURL
      let createdURL = null
      let revokedURL = null

      URL.createObjectURL = (blob) => {
        createdURL = 'blob:mock-url'
        return createdURL
      }

      URL.revokeObjectURL = (url) => {
        revokedURL = url
      }

      // Mock click
      const originalClick = HTMLAnchorElement.prototype.click
      let clickCalled = false
      HTMLAnchorElement.prototype.click = function () {
        clickCalled = true
        // Verify link attributes
        expect(this.download).to.equal(filename)
        expect(this.href).to.equal(createdURL)
      }

      saveBlob(filename, testData).then(() => {
        expect(clickCalled).to.be.true
        expect(createdURL).to.not.be.null
        expect(revokedURL).to.equal(createdURL)

        // Restore original methods
        URL.createObjectURL = originalCreateObjectURL
        URL.revokeObjectURL = originalRevokeObjectURL
        HTMLAnchorElement.prototype.click = originalClick

        done()
      }).catch(done)
    })

    it('should handle different blob types', (done) => {
      const testData = new Blob(['{"key": "value"}'], { type: 'application/json' })
      const filename = 'data.json'

      const originalCreateObjectURL = URL.createObjectURL
      const originalRevokeObjectURL = URL.revokeObjectURL
      const originalClick = HTMLAnchorElement.prototype.click

      URL.createObjectURL = () => 'blob:mock-url'
      URL.revokeObjectURL = () => {}
      HTMLAnchorElement.prototype.click = function () {}

      saveBlob(filename, testData).then(() => {
        URL.createObjectURL = originalCreateObjectURL
        URL.revokeObjectURL = originalRevokeObjectURL
        HTMLAnchorElement.prototype.click = originalClick
        done()
      }).catch(done)
    })
  })

  describe('saveText', () => {
    it('should save text as blob', (done) => {
      const text = 'Hello, World!'
      const filename = 'hello.txt'

      const originalCreateObjectURL = URL.createObjectURL
      const originalRevokeObjectURL = URL.revokeObjectURL
      const originalClick = HTMLAnchorElement.prototype.click

      let clickCalled = false

      URL.createObjectURL = (blob) => {
        // Verify blob properties
        expect(blob).to.be.instanceof(Blob)
        expect(blob.type).to.equal('text/plain;charset=utf-8')
        return 'blob:mock-url'
      }

      URL.revokeObjectURL = () => {}

      HTMLAnchorElement.prototype.click = function () {
        clickCalled = true
        expect(this.download).to.equal(filename)
      }

      saveText(filename, text).then(() => {
        expect(clickCalled).to.be.true

        URL.createObjectURL = originalCreateObjectURL
        URL.revokeObjectURL = originalRevokeObjectURL
        HTMLAnchorElement.prototype.click = originalClick

        done()
      }).catch(done)
    })

    it('should handle empty text', (done) => {
      const text = ''
      const filename = 'empty.txt'

      const originalCreateObjectURL = URL.createObjectURL
      const originalRevokeObjectURL = URL.revokeObjectURL
      const originalClick = HTMLAnchorElement.prototype.click

      URL.createObjectURL = () => 'blob:mock-url'
      URL.revokeObjectURL = () => {}
      HTMLAnchorElement.prototype.click = function () {}

      saveText(filename, text).then(() => {
        URL.createObjectURL = originalCreateObjectURL
        URL.revokeObjectURL = originalRevokeObjectURL
        HTMLAnchorElement.prototype.click = originalClick
        done()
      }).catch(done)
    })

    it('should handle multi-line text', (done) => {
      const text = 'Line 1\nLine 2\nLine 3'
      const filename = 'multiline.txt'

      const originalCreateObjectURL = URL.createObjectURL
      const originalRevokeObjectURL = URL.revokeObjectURL
      const originalClick = HTMLAnchorElement.prototype.click

      URL.createObjectURL = () => 'blob:mock-url'
      URL.revokeObjectURL = () => {}
      HTMLAnchorElement.prototype.click = function () {}

      saveText(filename, text).then(() => {
        URL.createObjectURL = originalCreateObjectURL
        URL.revokeObjectURL = originalRevokeObjectURL
        HTMLAnchorElement.prototype.click = originalClick
        done()
      }).catch(done)
    })

    it('should handle special characters', (done) => {
      const text = 'Special: 你好, émojis: 😊, symbols: ©®™'
      const filename = 'special.txt'

      const originalCreateObjectURL = URL.createObjectURL
      const originalRevokeObjectURL = URL.revokeObjectURL
      const originalClick = HTMLAnchorElement.prototype.click

      URL.createObjectURL = () => 'blob:mock-url'
      URL.revokeObjectURL = () => {}
      HTMLAnchorElement.prototype.click = function () {}

      saveText(filename, text).then(() => {
        URL.createObjectURL = originalCreateObjectURL
        URL.revokeObjectURL = originalRevokeObjectURL
        HTMLAnchorElement.prototype.click = originalClick
        done()
      }).catch(done)
    })
  })
})
