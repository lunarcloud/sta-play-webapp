import { expect } from '@esm-bundle/chai'
import { TrackerInfo } from '../../../js/database/tracker-info.js'

describe('TrackerInfo', () => {
  describe('constructor', () => {
    it('should create instance with all required parameters', () => {
      const info = new TrackerInfo(1, 'Test Tracker', 'Control', 'Command', 'Weapons', 'Security', 5, 10)
      expect(info.game).to.equal(1)
      expect(info.name).to.equal('Test Tracker')
      expect(info.attribute).to.equal('Control')
      expect(info.department).to.equal('Command')
      expect(info.shipSystem).to.equal('Weapons')
      expect(info.shipDepartment).to.equal('Security')
      expect(info.progressTrack).to.equal(5)
      expect(info.maxProgressTrack).to.equal(10)
      expect(info.resistance).to.equal(0)
      expect(info.complicationRange).to.equal(0)
      expect(info.breakthroughs).to.equal(0)
    })

    it('should accept optional parameters', () => {
      const info = new TrackerInfo(1, 'Tracker', 'Fitness', 'Science', 'Computers', 'Conn', 3, 8, 2, 15, 1)
      expect(info.resistance).to.equal(2)
      expect(info.complicationRange).to.equal(15)
      expect(info.breakthroughs).to.equal(1)
    })

    it('should convert string numbers to integers', () => {
      const info = new TrackerInfo(1, 'Tracker', 'Control', 'Command', 'Weapons', 'Security', '5', '10', '2', '15', '1')
      expect(info.progressTrack).to.equal(5)
      expect(info.maxProgressTrack).to.equal(10)
      expect(info.resistance).to.equal(2)
      expect(info.complicationRange).to.equal(15)
      expect(info.breakthroughs).to.equal(1)
    })

    it('should accept progressTrack of 0', () => {
      const info = new TrackerInfo(1, 'Tracker', 'Control', 'Command', 'Weapons', 'Security', 0, 10)
      expect(info.progressTrack).to.equal(0)
    })

    it('should accept resistance of 0', () => {
      const info = new TrackerInfo(1, 'Tracker', 'Control', 'Command', 'Weapons', 'Security', 5, 10, 0)
      expect(info.resistance).to.equal(0)
    })
  })

  describe('assign', () => {
    it('should create TrackerInfo from object with all properties', () => {
      const obj = {
        game: 1,
        name: 'Assigned Tracker',
        attribute: 'Daring',
        department: 'Engineering',
        shipSystem: 'Engines',
        shipDepartment: 'Engineering',
        progressTrack: 7,
        maxProgressTrack: 12,
        resistance: 3,
        complicationRange: 18,
        breakthroughs: 2
      }
      const info = TrackerInfo.assign(obj)
      expect(info.game).to.equal(1)
      expect(info.name).to.equal('Assigned Tracker')
      expect(info.attribute).to.equal('Daring')
      expect(info.department).to.equal('Engineering')
      expect(info.shipSystem).to.equal('Engines')
      expect(info.shipDepartment).to.equal('Engineering')
      expect(info.progressTrack).to.equal(7)
      expect(info.maxProgressTrack).to.equal(12)
      expect(info.resistance).to.equal(3)
      expect(info.complicationRange).to.equal(18)
      expect(info.breakthroughs).to.equal(2)
    })

    it('should use default values when optional properties not in object', () => {
      const obj = {
        game: 1,
        name: 'Tracker',
        attribute: 'Control',
        department: 'Command',
        shipSystem: 'Weapons',
        shipDepartment: 'Security',
        progressTrack: 5
      }
      const info = TrackerInfo.assign(obj)
      expect(info.resistance).to.equal(0)
      expect(info.complicationRange).to.equal(0)
      expect(info.breakthroughs).to.equal(0)
    })

    it('should use progressTrack for maxProgressTrack when not provided', () => {
      const obj = {
        game: 1,
        name: 'Tracker',
        attribute: 'Control',
        department: 'Command',
        shipSystem: 'Weapons',
        shipDepartment: 'Security',
        progressTrack: 8
      }
      const info = TrackerInfo.assign(obj)
      expect(info.maxProgressTrack).to.equal(8)
    })
  })

  describe('validate', () => {
    it('should return true for valid data', () => {
      const info = new TrackerInfo(1, 'Valid Tracker', 'Control', 'Command', 'Weapons', 'Security', 5, 10)
      expect(info.validate()).to.be.true
    })

    it('should return false when game is not a number', () => {
      const info = new TrackerInfo(1, 'Tracker', 'Control', 'Command', 'Weapons', 'Security', 5, 10)
      info.game = 'not a number'
      expect(info.validate()).to.be.false
    })

    it('should return false when name is not a string', () => {
      const info = new TrackerInfo(1, 'Tracker', 'Control', 'Command', 'Weapons', 'Security', 5, 10)
      info.name = 123
      expect(info.validate()).to.be.false
    })

    it('should return false when name is empty string', () => {
      const info = new TrackerInfo(1, 'Tracker', 'Control', 'Command', 'Weapons', 'Security', 5, 10)
      info.name = ''
      expect(info.validate()).to.be.false
    })

    it('should return false when attribute is not a string', () => {
      const info = new TrackerInfo(1, 'Tracker', 'Control', 'Command', 'Weapons', 'Security', 5, 10)
      info.attribute = 123
      expect(info.validate()).to.be.false
    })

    it('should return false when attribute is empty string', () => {
      const info = new TrackerInfo(1, 'Tracker', 'Control', 'Command', 'Weapons', 'Security', 5, 10)
      info.attribute = ''
      expect(info.validate()).to.be.false
    })

    it('should return false when department is not a string', () => {
      const info = new TrackerInfo(1, 'Tracker', 'Control', 'Command', 'Weapons', 'Security', 5, 10)
      info.department = 123
      expect(info.validate()).to.be.false
    })

    it('should return false when department is empty string', () => {
      const info = new TrackerInfo(1, 'Tracker', 'Control', 'Command', 'Weapons', 'Security', 5, 10)
      info.department = ''
      expect(info.validate()).to.be.false
    })

    it('should return false when shipSystem is not a string', () => {
      const info = new TrackerInfo(1, 'Tracker', 'Control', 'Command', 'Weapons', 'Security', 5, 10)
      info.shipSystem = 123
      expect(info.validate()).to.be.false
    })

    it('should return false when shipSystem is empty string', () => {
      const info = new TrackerInfo(1, 'Tracker', 'Control', 'Command', 'Weapons', 'Security', 5, 10)
      info.shipSystem = ''
      expect(info.validate()).to.be.false
    })

    it('should return false when shipDepartment is not a string', () => {
      const info = new TrackerInfo(1, 'Tracker', 'Control', 'Command', 'Weapons', 'Security', 5, 10)
      info.shipDepartment = 123
      expect(info.validate()).to.be.false
    })

    it('should return false when shipDepartment is empty string', () => {
      const info = new TrackerInfo(1, 'Tracker', 'Control', 'Command', 'Weapons', 'Security', 5, 10)
      info.shipDepartment = ''
      expect(info.validate()).to.be.false
    })

    it('should return false when progressTrack is not a number', () => {
      const info = new TrackerInfo(1, 'Tracker', 'Control', 'Command', 'Weapons', 'Security', 5, 10)
      info.progressTrack = 'not a number'
      expect(info.validate()).to.be.false
    })

    it('should return false when maxProgressTrack is not a number', () => {
      const info = new TrackerInfo(1, 'Tracker', 'Control', 'Command', 'Weapons', 'Security', 5, 10)
      info.maxProgressTrack = 'not a number'
      expect(info.validate()).to.be.false
    })

    it('should return false when resistance is not a number', () => {
      const info = new TrackerInfo(1, 'Tracker', 'Control', 'Command', 'Weapons', 'Security', 5, 10)
      info.resistance = 'not a number'
      expect(info.validate()).to.be.false
    })

    it('should return false when complicationRange is not a number', () => {
      const info = new TrackerInfo(1, 'Tracker', 'Control', 'Command', 'Weapons', 'Security', 5, 10)
      info.complicationRange = 'not a number'
      expect(info.validate()).to.be.false
    })

    it('should return false when breakthroughs is not a number', () => {
      const info = new TrackerInfo(1, 'Tracker', 'Control', 'Command', 'Weapons', 'Security', 5, 10)
      info.breakthroughs = 'not a number'
      expect(info.validate()).to.be.false
    })
  })

  describe('instance behavior', () => {
    it('should create independent instances', () => {
      const info1 = new TrackerInfo(1, 'Tracker One', 'Control', 'Command', 'Weapons', 'Security', 5, 10)
      const info2 = new TrackerInfo(2, 'Tracker Two', 'Daring', 'Engineering', 'Engines', 'Engineering', 3, 8)

      expect(info1.game).to.equal(1)
      expect(info1.name).to.equal('Tracker One')
      expect(info2.game).to.equal(2)
      expect(info2.name).to.equal('Tracker Two')
    })

    it('should be instanceof TrackerInfo', () => {
      const info = new TrackerInfo(1, 'Tracker', 'Control', 'Command', 'Weapons', 'Security', 5, 10)
      expect(info).to.be.instanceof(TrackerInfo)
    })
  })
})
