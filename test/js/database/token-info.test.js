import { expect } from '@esm-bundle/chai'
import { TokenInfo } from '../../../js/database/token-info.js'

describe('TokenInfo', () => {
  describe('constructor', () => {
    it('should create instance with all required parameters', () => {
      const info = new TokenInfo(1, 'Test Token')
      expect(info.game).to.equal(1)
      expect(info.name).to.equal('Test Token')
      expect(info.image).to.be.undefined
      expect(info.id).to.be.undefined
    })

    it('should accept image parameter', () => {
      const mockFile = new File(['content'], 'test.png', { type: 'image/png' })
      const info = new TokenInfo(1, 'Test', mockFile)
      expect(info.image).to.equal(mockFile)
    })

    it('should accept id parameter', () => {
      const info = new TokenInfo(1, 'Test', undefined, 5)
      expect(info.id).to.equal(5)
    })
  })

  describe('assign', () => {
    it('should create TokenInfo from object with all properties', () => {
      const obj = { id: 5, game: 1, name: 'Assigned Token' }
      const info = TokenInfo.assign(obj)
      expect(info.id).to.equal(5)
      expect(info.game).to.equal(1)
      expect(info.name).to.equal('Assigned Token')
    })

    it('should handle object without image property', () => {
      const obj = { game: 1, name: 'Test' }
      const info = TokenInfo.assign(obj)
      expect(info.image).to.be.undefined
    })

    it('should handle object with image property', () => {
      const mockFile = new File(['content'], 'test.png', { type: 'image/png' })
      const obj = { game: 1, name: 'Test', image: mockFile }
      const info = TokenInfo.assign(obj)
      expect(info.image).to.equal(mockFile)
    })
  })

  describe('validate', () => {
    it('should return true for valid data', () => {
      const info = new TokenInfo(1, 'Valid Token')
      expect(info.validate()).to.be.true
    })

    it('should return false when game is not a number', () => {
      const info = new TokenInfo(1, 'Test')
      info.game = 'not a number'
      expect(info.validate()).to.be.false
    })

    it('should return false when name is not a string', () => {
      const info = new TokenInfo(1, 'Test')
      info.name = 123
      expect(info.validate()).to.be.false
    })

    it('should return false when name is empty', () => {
      const info = new TokenInfo(1, 'Test')
      info.name = ''
      expect(info.validate()).to.be.false
    })

    it('should return false when image is not undefined or File', () => {
      const info = new TokenInfo(1, 'Test')
      info.image = 'not a file'
      expect(info.validate()).to.be.false
    })

    it('should return true when image is a File', () => {
      const mockFile = new File(['content'], 'test.png', { type: 'image/png' })
      const info = new TokenInfo(1, 'Test', mockFile)
      expect(info.validate()).to.be.true
    })
  })

  describe('instance behavior', () => {
    it('should be instanceof TokenInfo', () => {
      const info = new TokenInfo(1, 'Test')
      expect(info).to.be.instanceof(TokenInfo)
    })
  })
})
