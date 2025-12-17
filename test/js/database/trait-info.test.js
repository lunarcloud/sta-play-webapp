import { expect } from '@esm-bundle/chai'
import { TraitInfo } from '../../../js/database/trait-info.js'

describe('TraitInfo', () => {
  describe('constructor', () => {
    it('should create instance with scene and name', () => {
      const info = new TraitInfo(1, 'Test Trait')
      expect(info.scene).to.equal(1)
      expect(info.name).to.equal('Test Trait')
    })

    it('should create instance with scene only', () => {
      const info = new TraitInfo(5)
      expect(info.scene).to.equal(5)
      expect(info.name).to.be.undefined
    })

    it('should accept numeric scene id of 0', () => {
      const info = new TraitInfo(0, 'Trait Name')
      expect(info.scene).to.equal(0)
      expect(info.name).to.equal('Trait Name')
    })

    it('should inherit from NamedInfo', () => {
      const info = new TraitInfo(1, 'Test Trait')
      expect(info).to.have.property('name')
      expect(info).to.have.property('id')
    })
  })

  describe('validate', () => {
    it('should return true for valid data', () => {
      const info = new TraitInfo(1, 'Valid Trait')
      expect(info.validate()).to.be.true
    })

    it('should return false when scene is not a number', () => {
      const info = new TraitInfo(1, 'Test')
      info.scene = 'not a number'
      expect(info.validate()).to.be.false
    })

    it('should return false when name is not a string', () => {
      const info = new TraitInfo(1, 'Test')
      info.name = 123
      expect(info.validate()).to.be.false
    })

    it('should return false when scene is undefined', () => {
      const info = new TraitInfo(1, 'Test')
      info.scene = undefined
      expect(info.validate()).to.be.false
    })

    it('should return false when name is undefined', () => {
      const info = new TraitInfo(1, 'Test')
      info.name = undefined
      expect(info.validate()).to.be.false
    })
  })

  describe('property access', () => {
    it('should allow scene modification', () => {
      const info = new TraitInfo(1, 'Trait')
      info.scene = 2
      expect(info.scene).to.equal(2)
    })

    it('should allow name modification', () => {
      const info = new TraitInfo(1, 'Original')
      info.name = 'Modified'
      expect(info.name).to.equal('Modified')
    })
  })

  describe('instance behavior', () => {
    it('should create independent instances', () => {
      const info1 = new TraitInfo(1, 'First Trait')
      const info2 = new TraitInfo(2, 'Second Trait')

      expect(info1.scene).to.equal(1)
      expect(info1.name).to.equal('First Trait')
      expect(info2.scene).to.equal(2)
      expect(info2.name).to.equal('Second Trait')
    })

    it('should be instanceof TraitInfo', () => {
      const info = new TraitInfo(1, 'Test')
      expect(info).to.be.instanceof(TraitInfo)
    })
  })
})
