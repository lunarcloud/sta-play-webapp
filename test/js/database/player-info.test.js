import { expect } from '@esm-bundle/chai'
import { PlayerInfo } from '../../../js/database/player-info.js'

describe('PlayerInfo', () => {
  describe('constructor', () => {
    it('should create instance with all required parameters', () => {
      const info = new PlayerInfo(1, 1, 'Test Player', 5, 10, 'gold', 'blue')
      expect(info.game).to.equal(1)
      expect(info.playerNumber).to.equal(1)
      expect(info.name).to.equal('Test Player')
      expect(info.currentStress).to.equal(5)
      expect(info.maxStress).to.equal(10)
      expect(info.pips).to.equal('gold')
      expect(info.borderColor).to.equal('blue')
      expect(info.image).to.be.undefined
    })

    it('should accept string numbers and convert to integers', () => {
      const info = new PlayerInfo(1, '2', 'Test', '3', '10', 'gold', 'red')
      expect(info.playerNumber).to.equal(2)
      expect(info.currentStress).to.equal(3)
      expect(info.maxStress).to.equal(10)
    })

    it('should accept image parameter', () => {
      const mockFile = new File(['content'], 'test.png', { type: 'image/png' })
      const info = new PlayerInfo(1, 1, 'Test', 5, 10, 'gold', 'blue', mockFile)
      expect(info.image).to.equal(mockFile)
    })

    it('should accept playerNumber of 0', () => {
      const info = new PlayerInfo(1, 0, 'Test', 5, 10, 'gold', 'blue')
      expect(info.playerNumber).to.equal(0)
    })

    it('should accept currentStress of 0', () => {
      const info = new PlayerInfo(1, 1, 'Test', 0, 10, 'gold', 'blue')
      expect(info.currentStress).to.equal(0)
    })
  })

  describe('assign', () => {
    it('should create PlayerInfo from object with all properties', () => {
      const obj = {
        game: 1,
        playerNumber: 2,
        name: 'Assigned Player',
        currentStress: 7,
        maxStress: 12,
        pips: 'silver',
        borderColor: 'green'
      }
      const info = PlayerInfo.assign(obj)
      expect(info.game).to.equal(1)
      expect(info.playerNumber).to.equal(2)
      expect(info.name).to.equal('Assigned Player')
      expect(info.currentStress).to.equal(7)
      expect(info.maxStress).to.equal(12)
      expect(info.pips).to.equal('silver')
      expect(info.borderColor).to.equal('green')
    })

    it('should handle object without image property', () => {
      const obj = {
        game: 1,
        playerNumber: 1,
        name: 'Test',
        currentStress: 5,
        maxStress: 10,
        pips: 'gold',
        borderColor: 'blue'
      }
      const info = PlayerInfo.assign(obj)
      expect(info.image).to.be.undefined
    })

    it('should handle object with image property', () => {
      const mockFile = new File(['content'], 'test.png', { type: 'image/png' })
      const obj = {
        game: 1,
        playerNumber: 1,
        name: 'Test',
        currentStress: 5,
        maxStress: 10,
        pips: 'gold',
        borderColor: 'blue',
        image: mockFile
      }
      const info = PlayerInfo.assign(obj)
      expect(info.image).to.equal(mockFile)
    })
  })

  describe('validate', () => {
    it('should return true for valid data', () => {
      const info = new PlayerInfo(1, 1, 'Valid Player', 5, 10, 'gold', 'blue')
      expect(info.validate()).to.be.true
    })

    it('should return false when game is not a number', () => {
      const info = new PlayerInfo(1, 1, 'Test', 5, 10, 'gold', 'blue')
      info.game = 'not a number'
      expect(info.validate()).to.be.false
    })

    it('should return false when name is not a string', () => {
      const info = new PlayerInfo(1, 1, 'Test', 5, 10, 'gold', 'blue')
      info.name = 123
      expect(info.validate()).to.be.false
    })

    it('should return false when playerNumber is not a number', () => {
      const info = new PlayerInfo(1, 1, 'Test', 5, 10, 'gold', 'blue')
      info.playerNumber = 'not a number'
      expect(info.validate()).to.be.false
    })

    it('should return false when currentStress is not a number', () => {
      const info = new PlayerInfo(1, 1, 'Test', 5, 10, 'gold', 'blue')
      info.currentStress = 'not a number'
      expect(info.validate()).to.be.false
    })

    it('should return false when maxStress is not a number', () => {
      const info = new PlayerInfo(1, 1, 'Test', 5, 10, 'gold', 'blue')
      info.maxStress = 'not a number'
      expect(info.validate()).to.be.false
    })

    it('should return false when pips is not a string', () => {
      const info = new PlayerInfo(1, 1, 'Test', 5, 10, 'gold', 'blue')
      info.pips = 123
      expect(info.validate()).to.be.false
    })

    it('should return false when borderColor is not a string', () => {
      const info = new PlayerInfo(1, 1, 'Test', 5, 10, 'gold', 'blue')
      info.borderColor = 123
      expect(info.validate()).to.be.false
    })

    it('should return false when image is not undefined or File', () => {
      const info = new PlayerInfo(1, 1, 'Test', 5, 10, 'gold', 'blue')
      info.image = 'not a file'
      expect(info.validate()).to.be.false
    })

    it('should return true when image is undefined', () => {
      const info = new PlayerInfo(1, 1, 'Test', 5, 10, 'gold', 'blue', undefined)
      expect(info.validate()).to.be.true
    })

    it('should return true when image is a File', () => {
      const mockFile = new File(['content'], 'test.png', { type: 'image/png' })
      const info = new PlayerInfo(1, 1, 'Test', 5, 10, 'gold', 'blue', mockFile)
      expect(info.validate()).to.be.true
    })
  })

  describe('instance behavior', () => {
    it('should create independent instances', () => {
      const info1 = new PlayerInfo(1, 1, 'Player One', 3, 10, 'gold', 'blue')
      const info2 = new PlayerInfo(2, 2, 'Player Two', 5, 12, 'silver', 'red')

      expect(info1.game).to.equal(1)
      expect(info1.name).to.equal('Player One')
      expect(info2.game).to.equal(2)
      expect(info2.name).to.equal('Player Two')
    })

    it('should be instanceof PlayerInfo', () => {
      const info = new PlayerInfo(1, 1, 'Test', 5, 10, 'gold', 'blue')
      expect(info).to.be.instanceof(PlayerInfo)
    })
  })
})
