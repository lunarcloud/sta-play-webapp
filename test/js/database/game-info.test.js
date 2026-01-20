import { expect } from '@esm-bundle/chai'
import { GameInfo, DefaultGameName } from '../../../js/database/game-info.js'

describe('GameInfo', () => {
  describe('constructor', () => {
    it('should create instance with required parameters', () => {
      const gameInfo = new GameInfo(1, 'Test Game', 'Enterprise')
      expect(gameInfo).to.be.instanceof(GameInfo)
      expect(gameInfo.id).to.equal(1)
      expect(gameInfo.name).to.equal('Test Game')
      expect(gameInfo.shipName).to.equal('Enterprise')
    })

    it('should use default values for optional parameters', () => {
      const gameInfo = new GameInfo(undefined, undefined, 'Voyager')
      expect(gameInfo.name).to.equal(DefaultGameName)
      expect(gameInfo.momentum).to.equal(0)
      expect(gameInfo.threat).to.equal(0)
      expect(gameInfo.activeAlert).to.equal('')
      expect(gameInfo.theme).to.equal('lcars-24')
      expect(gameInfo.edition).to.equal('2')
      expect(gameInfo.altFont).to.be.false
      expect(gameInfo.legacyTrackers).to.be.false
    })

    it('should set momentum from number', () => {
      const gameInfo = new GameInfo(1, 'Test', 'Ship', 5)
      expect(gameInfo.momentum).to.equal(5)
    })

    it('should parse momentum from string', () => {
      const gameInfo = new GameInfo(1, 'Test', 'Ship', '10')
      expect(gameInfo.momentum).to.equal(10)
    })

    it('should set threat from number', () => {
      const gameInfo = new GameInfo(1, 'Test', 'Ship', 0, 7)
      expect(gameInfo.threat).to.equal(7)
    })

    it('should parse threat from string', () => {
      const gameInfo = new GameInfo(1, 'Test', 'Ship', 0, '15')
      expect(gameInfo.threat).to.equal(15)
    })

    it('should set activeAlert', () => {
      const gameInfo = new GameInfo(1, 'Test', 'Ship', 0, 0, 'red')
      expect(gameInfo.activeAlert).to.equal('red')
    })

    it('should set theme', () => {
      const gameInfo = new GameInfo(1, 'Test', 'Ship', 0, 0, '', 'custom-theme')
      expect(gameInfo.theme).to.equal('custom-theme')
    })

    it('should set edition to 1', () => {
      const gameInfo = new GameInfo(1, 'Test', 'Ship', 0, 0, '', 'lcars-24', '1')
      expect(gameInfo.edition).to.equal('1')
    })

    it('should set edition to 2', () => {
      const gameInfo = new GameInfo(1, 'Test', 'Ship', 0, 0, '', 'lcars-24', '2')
      expect(gameInfo.edition).to.equal('2')
    })

    it('should set edition to captains-log', () => {
      const gameInfo = new GameInfo(1, 'Test', 'Ship', 0, 0, '', 'lcars-24', 'captains-log')
      expect(gameInfo.edition).to.equal('captains-log')
    })

    it('should default to edition 2 for invalid edition', () => {
      const gameInfo = new GameInfo(1, 'Test', 'Ship', 0, 0, '', 'lcars-24', 'invalid')
      expect(gameInfo.edition).to.equal('2')
    })

    it('should set shipModel', () => {
      const mockFile = new File([''], 'model.glb')
      const gameInfo = new GameInfo(1, 'Test', 'Ship', 0, 0, '', 'lcars-24', '2', mockFile)
      expect(gameInfo.shipModel).to.equal(mockFile)
    })

    it('should set altFont', () => {
      const gameInfo = new GameInfo(1, 'Test', 'Ship', 0, 0, '', 'lcars-24', '2', undefined, true)
      expect(gameInfo.altFont).to.be.true
    })

    it('should set legacyTrackers', () => {
      const gameInfo = new GameInfo(1, 'Test', 'Ship', 0, 0, '', 'lcars-24', '2', undefined, false, true)
      expect(gameInfo.legacyTrackers).to.be.true
    })
  })

  describe('assign', () => {
    it('should create GameInfo from plain object with all properties', () => {
      const obj = {
        id: 1,
        name: 'Test Game',
        shipName: 'Enterprise',
        momentum: 5,
        threat: 3,
        activeAlert: 'yellow',
        theme: 'custom-theme',
        edition: '1',
        altFont: true,
        legacyTrackers: true
      }

      const gameInfo = GameInfo.assign(obj)

      expect(gameInfo.id).to.equal(1)
      expect(gameInfo.name).to.equal('Test Game')
      expect(gameInfo.shipName).to.equal('Enterprise')
      expect(gameInfo.momentum).to.equal(5)
      expect(gameInfo.threat).to.equal(3)
      expect(gameInfo.activeAlert).to.equal('yellow')
      expect(gameInfo.theme).to.equal('custom-theme')
      expect(gameInfo.edition).to.equal('1')
      expect(gameInfo.altFont).to.be.true
      expect(gameInfo.legacyTrackers).to.be.true
    })

    it('should use defaults for missing optional properties', () => {
      const obj = {
        id: 2,
        name: 'Minimal Game',
        shipName: 'Defiant'
      }

      const gameInfo = GameInfo.assign(obj)

      expect(gameInfo.momentum).to.equal(0)
      expect(gameInfo.threat).to.equal(0)
      expect(gameInfo.activeAlert).to.equal('')
      expect(gameInfo.theme).to.equal('lcars-24')
      expect(gameInfo.edition).to.equal('2')
      expect(gameInfo.altFont).to.be.false
      expect(gameInfo.legacyTrackers).to.be.false
    })

    it('should handle shipModel in object', () => {
      const mockFile = new File([''], 'model.glb')
      const obj = {
        id: 3,
        name: 'Test',
        shipName: 'Ship',
        shipModel: mockFile
      }

      const gameInfo = GameInfo.assign(obj)

      expect(gameInfo.shipModel).to.equal(mockFile)
    })
  })

  describe('setEdition', () => {
    it('should set edition to 1', () => {
      const gameInfo = new GameInfo(1, 'Test', 'Ship')
      gameInfo.setEdition('1')
      expect(gameInfo.edition).to.equal('1')
    })

    it('should set edition to 2', () => {
      const gameInfo = new GameInfo(1, 'Test', 'Ship')
      gameInfo.setEdition('2')
      expect(gameInfo.edition).to.equal('2')
    })

    it('should set edition to captains-log', () => {
      const gameInfo = new GameInfo(1, 'Test', 'Ship')
      gameInfo.setEdition('captains-log')
      expect(gameInfo.edition).to.equal('captains-log')
    })

    it('should default to edition 2 for invalid value', () => {
      const gameInfo = new GameInfo(1, 'Test', 'Ship')
      gameInfo.setEdition('invalid')
      expect(gameInfo.edition).to.equal('2')
    })

    it('should default to edition 2 for empty string', () => {
      const gameInfo = new GameInfo(1, 'Test', 'Ship')
      gameInfo.setEdition('')
      expect(gameInfo.edition).to.equal('2')
    })

    it('should default to edition 2 for null', () => {
      const gameInfo = new GameInfo(1, 'Test', 'Ship')
      gameInfo.setEdition(null)
      expect(gameInfo.edition).to.equal('2')
    })
  })

  describe('validate', () => {
    it('should return true for valid GameInfo', () => {
      const gameInfo = new GameInfo(1, 'Test Game', 'Enterprise', 5, 3, 'yellow', 'lcars-24', '2')
      expect(gameInfo.validate()).to.be.true
    })

    it('should return true with minimal valid data', () => {
      const gameInfo = new GameInfo(undefined, 'Game', 'Ship', 0, 0, '', 'theme', '2')
      expect(gameInfo.validate()).to.be.true
    })

    it('should return true for edition 1', () => {
      const gameInfo = new GameInfo(1, 'Test', 'Ship', 0, 0, '', 'theme', '1')
      expect(gameInfo.validate()).to.be.true
    })

    it('should return true for edition captains-log', () => {
      const gameInfo = new GameInfo(1, 'Test', 'Ship', 0, 0, '', 'theme', 'captains-log')
      expect(gameInfo.validate()).to.be.true
    })

    it('should return false for invalid name type', () => {
      const gameInfo = new GameInfo(1, 123, 'Ship')
      expect(gameInfo.validate()).to.be.false
    })

    it('should return false for invalid activeAlert type', () => {
      const gameInfo = new GameInfo(1, 'Test', 'Ship', 0, 0, 123)
      expect(gameInfo.validate()).to.be.false
    })

    it('should return false for invalid theme type', () => {
      const gameInfo = new GameInfo(1, 'Test', 'Ship', 0, 0, '', 123)
      expect(gameInfo.validate()).to.be.false
    })

    it('should default invalid edition to 2 in constructor', () => {
      const gameInfo = new GameInfo(1, 'Test', 'Ship', 0, 0, '', 'theme', 'invalid')
      // Constructor calls setEdition which defaults to '2'
      expect(gameInfo.edition).to.equal('2')
      expect(gameInfo.validate()).to.be.true
    })

    it('should return false when edition is manually set to invalid value', () => {
      const gameInfo = new GameInfo(1, 'Test', 'Ship', 0, 0, '', 'theme', '2')
      // Manually set to invalid value bypassing setEdition
      gameInfo.edition = 'invalid'
      expect(gameInfo.validate()).to.be.false
    })

    it('should return false for undefined momentum', () => {
      const gameInfo = new GameInfo(1, 'Test', 'Ship')
      gameInfo.momentum = undefined
      expect(gameInfo.validate()).to.be.false
    })

    it('should return false for undefined threat', () => {
      const gameInfo = new GameInfo(1, 'Test', 'Ship')
      gameInfo.threat = undefined
      expect(gameInfo.validate()).to.be.false
    })
  })

  describe('DefaultGameName', () => {
    it('should be defined', () => {
      expect(DefaultGameName).to.be.a('string')
      expect(DefaultGameName.length).to.be.greaterThan(0)
    })

    it('should be used when name is undefined', () => {
      const gameInfo = new GameInfo(1, undefined, 'Ship')
      expect(gameInfo.name).to.equal(DefaultGameName)
    })
  })
})
