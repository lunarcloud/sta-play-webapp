import { expect } from '@esm-bundle/chai'
import { SceneInfo, DefaultSceneName, DefaultSceneDescription } from '../../../js/database/scene-info.js'

describe('SceneInfo', () => {
  describe('constructor', () => {
    it('should create instance with all parameters', () => {
      const info = new SceneInfo(1, 2, 'Custom Scene', 'Custom description', ['mission1', 'mission2'])
      expect(info.id).to.equal(1)
      expect(info.game).to.equal(2)
      expect(info.name).to.equal('Custom Scene')
      expect(info.description).to.equal('Custom description')
      expect(info.missionTrack).to.deep.equal(['mission1', 'mission2'])
    })

    it('should use default name when not provided', () => {
      const info = new SceneInfo(1, 2)
      expect(info.name).to.equal(DefaultSceneName)
    })

    it('should use default description when not provided', () => {
      const info = new SceneInfo(1, 2)
      expect(info.description).to.equal(DefaultSceneDescription)
    })

    it('should use empty array for missionTrack when not provided', () => {
      const info = new SceneInfo(1, 2)
      expect(info.missionTrack).to.deep.equal([])
    })

    it('should accept undefined as id', () => {
      const info = new SceneInfo(undefined, 2, 'Scene')
      expect(info.id).to.be.undefined
    })

    it('should accept numeric id of 0', () => {
      const info = new SceneInfo(0, 2, 'Scene')
      expect(info.id).to.equal(0)
    })
  })

  describe('assign', () => {
    it('should create SceneInfo from object with all properties', () => {
      const obj = {
        id: 5,
        game: 10,
        name: 'Assigned Scene',
        description: 'Assigned description',
        missionTrack: ['track1', 'track2']
      }
      const info = SceneInfo.assign(obj)
      expect(info.id).to.equal(5)
      expect(info.game).to.equal(10)
      expect(info.name).to.equal('Assigned Scene')
      expect(info.description).to.equal('Assigned description')
      expect(info.missionTrack).to.deep.equal(['track1', 'track2'])
    })

    it('should use default name when not in object', () => {
      const obj = { id: 1, game: 2 }
      const info = SceneInfo.assign(obj)
      expect(info.name).to.equal(DefaultSceneName)
    })

    it('should use default description when not in object', () => {
      const obj = { id: 1, game: 2 }
      const info = SceneInfo.assign(obj)
      expect(info.description).to.equal(DefaultSceneDescription)
    })

    it('should use empty array when missionTrack not in object', () => {
      const obj = { id: 1, game: 2 }
      const info = SceneInfo.assign(obj)
      expect(info.missionTrack).to.deep.equal([])
    })
  })

  describe('validate', () => {
    it('should return true for valid data', () => {
      const info = new SceneInfo(1, 2, 'Valid Scene', 'Valid description')
      expect(info.validate()).to.be.true
    })

    it('should return false when game is not a number', () => {
      const info = new SceneInfo(1, 2, 'Scene', 'Description')
      info.game = 'not a number'
      expect(info.validate()).to.be.false
    })

    it('should return false when name is not a string', () => {
      const info = new SceneInfo(1, 2, 'Scene', 'Description')
      info.name = 123
      expect(info.validate()).to.be.false
    })

    it('should return false when description is not a string', () => {
      const info = new SceneInfo(1, 2, 'Scene', 'Description')
      info.description = 123
      expect(info.validate()).to.be.false
    })

    it('should return true when game is 0', () => {
      const info = new SceneInfo(1, 0, 'Scene', 'Description')
      expect(info.validate()).to.be.true
    })

    it('should return true with default values', () => {
      const info = new SceneInfo(1, 2)
      expect(info.validate()).to.be.true
    })
  })

  describe('property access', () => {
    it('should allow game modification', () => {
      const info = new SceneInfo(1, 2, 'Scene')
      info.game = 5
      expect(info.game).to.equal(5)
    })

    it('should allow name modification', () => {
      const info = new SceneInfo(1, 2, 'Original')
      info.name = 'Modified'
      expect(info.name).to.equal('Modified')
    })

    it('should allow description modification', () => {
      const info = new SceneInfo(1, 2, 'Scene', 'Original')
      info.description = 'Modified'
      expect(info.description).to.equal('Modified')
    })

    it('should allow missionTrack modification', () => {
      const info = new SceneInfo(1, 2, 'Scene', 'Desc', [])
      info.missionTrack = ['new1', 'new2']
      expect(info.missionTrack).to.deep.equal(['new1', 'new2'])
    })
  })

  describe('instance behavior', () => {
    it('should create independent instances', () => {
      const info1 = new SceneInfo(1, 1, 'Scene One', 'Desc One')
      const info2 = new SceneInfo(2, 2, 'Scene Two', 'Desc Two')

      expect(info1.id).to.equal(1)
      expect(info1.name).to.equal('Scene One')
      expect(info2.id).to.equal(2)
      expect(info2.name).to.equal('Scene Two')
    })

    it('should be instanceof SceneInfo', () => {
      const info = new SceneInfo(1, 2, 'Scene')
      expect(info).to.be.instanceof(SceneInfo)
    })
  })
})
