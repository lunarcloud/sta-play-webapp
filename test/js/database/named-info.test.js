import { expect } from '@esm-bundle/chai'
import { NamedInfo } from '../../../js/database/named-info.js'

describe('NamedInfo', () => {
  describe('constructor', () => {
    it('should create instance with name and id', () => {
      const info = new NamedInfo('TestName', 42)
      expect(info.name).to.equal('TestName')
      expect(info.id).to.equal(42)
    })

    it('should create instance with name only (id undefined)', () => {
      const info = new NamedInfo('TestName')
      expect(info.name).to.equal('TestName')
      expect(info.id).to.be.undefined
    })

    it('should accept id as undefined explicitly', () => {
      const info = new NamedInfo('TestName', undefined)
      expect(info.name).to.equal('TestName')
      expect(info.id).to.be.undefined
    })

    it('should accept numeric id of 0', () => {
      const info = new NamedInfo('TestName', 0)
      expect(info.name).to.equal('TestName')
      expect(info.id).to.equal(0)
    })

    it('should reject empty string as name', () => {
      expect(() => new NamedInfo('', 1)).to.throw(Error, 'Name cannot be an empty string')
    })

    it('should store large id numbers', () => {
      const info = new NamedInfo('TestName', 999999999)
      expect(info.name).to.equal('TestName')
      expect(info.id).to.equal(999999999)
    })
  })

  describe('property access', () => {
    it('should allow name modification', () => {
      const info = new NamedInfo('Original', 1)
      info.name = 'Modified'
      expect(info.name).to.equal('Modified')
    })

    it('should allow id modification', () => {
      const info = new NamedInfo('TestName', 1)
      info.id = 99
      expect(info.id).to.equal(99)
    })

    it('should allow setting id to undefined after creation', () => {
      const info = new NamedInfo('TestName', 1)
      info.id = undefined
      expect(info.id).to.be.undefined
    })
  })

  describe('instance behavior', () => {
    it('should create independent instances', () => {
      const info1 = new NamedInfo('First', 1)
      const info2 = new NamedInfo('Second', 2)

      expect(info1.name).to.equal('First')
      expect(info1.id).to.equal(1)
      expect(info2.name).to.equal('Second')
      expect(info2.id).to.equal(2)
    })

    it('should be instanceof NamedInfo', () => {
      const info = new NamedInfo('TestName', 1)
      expect(info).to.be.instanceof(NamedInfo)
    })
  })
})
