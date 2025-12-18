import { expect } from '@esm-bundle/chai'
import { saveBlob, saveText } from '../../js/save-file-utils.js'

/**
 * Helper to setup mocks for URL and click
 * @returns {object} mocks object with original functions and tracking properties
 */
function setupFileMocks () {
  const mocks = {
    originalCreateObjectURL: URL.createObjectURL,
    originalRevokeObjectURL: URL.revokeObjectURL,
    originalClick: HTMLAnchorElement.prototype.click,
    createdURL: null,
    revokedURL: null,
    clickCalled: false
  }

  URL.createObjectURL = (blob) => {
    mocks.createdURL = 'blob:mock-url'
    return mocks.createdURL
  }

  URL.revokeObjectURL = (url) => {
    mocks.revokedURL = url
  }

  HTMLAnchorElement.prototype.click = function () {
    mocks.clickCalled = true
  }

  return mocks
}

/**
 * Helper to restore mocks
 * @param {object} mocks - The mocks object containing original functions to restore
 */
function restoreMocks (mocks) {
  URL.createObjectURL = mocks.originalCreateObjectURL
  URL.revokeObjectURL = mocks.originalRevokeObjectURL
  HTMLAnchorElement.prototype.click = mocks.originalClick
}

describe('Save File Utils', () => {
  describe('saveBlob', () => {
    it('should create and click download link', (done) => {
      const testData = new Blob(['test content'], { type: 'text/plain' })
      const filename = 'test.txt'

      const mocks = setupFileMocks()

      // Override click to verify link attributes
      HTMLAnchorElement.prototype.click = function () {
        mocks.clickCalled = true
        expect(this.download).to.equal(filename)
        expect(this.href).to.equal(mocks.createdURL)
      }

      saveBlob(filename, testData).then(() => {
        expect(mocks.clickCalled).to.be.true
        expect(mocks.createdURL).to.not.be.null
        expect(mocks.revokedURL).to.equal(mocks.createdURL)

        restoreMocks(mocks)
        done()
      }).catch(done)
    })

    it('should handle different blob types', (done) => {
      const testData = new Blob(['{"key": "value"}'], { type: 'application/json' })
      const filename = 'data.json'

      const mocks = setupFileMocks()

      saveBlob(filename, testData).then(() => {
        restoreMocks(mocks)
        done()
      }).catch(done)
    })
  })

  describe('saveText', () => {
    it('should save text as blob', (done) => {
      const text = 'Hello, World!'
      const filename = 'hello.txt'

      const mocks = setupFileMocks()

      // Override createObjectURL to verify blob properties
      URL.createObjectURL = (blob) => {
        expect(blob).to.be.instanceof(Blob)
        expect(blob.type).to.equal('text/plain;charset=utf-8')
        mocks.createdURL = 'blob:mock-url'
        return mocks.createdURL
      }

      // Override click to verify filename
      HTMLAnchorElement.prototype.click = function () {
        mocks.clickCalled = true
        expect(this.download).to.equal(filename)
      }

      saveText(filename, text).then(() => {
        expect(mocks.clickCalled).to.be.true
        restoreMocks(mocks)
        done()
      }).catch(done)
    })

    it('should handle empty text', (done) => {
      const text = ''
      const filename = 'empty.txt'

      const mocks = setupFileMocks()

      saveText(filename, text).then(() => {
        restoreMocks(mocks)
        done()
      }).catch(done)
    })

    it('should handle multi-line text', (done) => {
      const text = 'Line 1\nLine 2\nLine 3'
      const filename = 'multiline.txt'

      const mocks = setupFileMocks()

      saveText(filename, text).then(() => {
        restoreMocks(mocks)
        done()
      }).catch(done)
    })

    it('should handle special characters', (done) => {
      const text = 'Special: 你好, émojis: 😊, symbols: ©®™'
      const filename = 'special.txt'

      const mocks = setupFileMocks()

      saveText(filename, text).then(() => {
        restoreMocks(mocks)
        done()
      }).catch(done)
    })
  })
})
