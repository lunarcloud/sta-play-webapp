import { expect } from '@esm-bundle/chai'
import { BackupData } from '../../../js/database/backup-data.js'
import { GameInfo } from '../../../js/database/game-info.js'
import { PlayerInfo } from '../../../js/database/player-info.js'
import { SceneInfo } from '../../../js/database/scene-info.js'
import { TrackerInfo } from '../../../js/database/tracker-info.js'

// Load JSZip library from the global bundle
before(async () => {
  if (!globalThis.JSZip) {
    // Load the JSZip script
    const script = document.createElement('script')
    script.src = '/lib/jszip.min.js'
    await new Promise((resolve, reject) => {
      script.onload = resolve
      script.onerror = reject
      document.head.appendChild(script)
    })
  }
})

describe('BackupData', () => {
  describe('constructor', () => {
    it('should create instance with all required parameters', () => {
      const gameInfo = new GameInfo(1, 'Test Game', 'USS Enterprise')
      const players = [
        new PlayerInfo(1, 1, 'Player One', 5, 10, 'gold', 'blue'),
        new PlayerInfo(1, 2, 'Player Two', 3, 12, 'silver', 'red')
      ]
      const scenes = [
        new SceneInfo(1, 1, 'Scene One', 'Description One'),
        new SceneInfo(2, 1, 'Scene Two', 'Description Two')
      ]
      const trackers = [
        new TrackerInfo(1, 'Tracker One', 'Control', 'Command', 'Weapons', 'Security', 5, 10)
      ]
      const traits = { 1: ['trait1', 'trait2'] }

      const backup = new BackupData(gameInfo, players, scenes, trackers, traits)

      expect(backup.GameInfo).to.equal(gameInfo)
      expect(backup.Players).to.equal(players)
      expect(backup.Scenes).to.equal(scenes)
      expect(backup.Trackers).to.equal(trackers)
      expect(backup.Traits).to.equal(traits)
    })

    it('should accept empty arrays and maps', () => {
      const gameInfo = new GameInfo(1, 'Test Game', 'USS Enterprise')
      const backup = new BackupData(gameInfo, [], [], [], {})

      expect(backup.GameInfo).to.equal(gameInfo)
      expect(backup.Players).to.be.an('array').that.is.empty
      expect(backup.Scenes).to.be.an('array').that.is.empty
      expect(backup.Trackers).to.be.an('array').that.is.empty
      expect(backup.Traits).to.be.an('object')
      expect(Object.keys(backup.Traits)).to.be.empty
    })
  })

  describe('getZip', () => {
    it('should generate a zip blob without files', async () => {
      const gameInfo = new GameInfo(1, 'Test Game', 'USS Enterprise', 5, 3)
      const players = [new PlayerInfo(1, 1, 'Player One', 5, 10, 'gold', 'blue')]
      const scenes = [new SceneInfo(1, 1, 'Scene One', 'Description')]
      const trackers = [new TrackerInfo(1, 'Tracker', 'Control', 'Command', 'Weapons', 'Security', 5, 10)]
      const traits = { 1: ['trait1'] }

      const backup = new BackupData(gameInfo, players, scenes, trackers, traits)
      const blob = await backup.getZip()

      expect(blob).to.be.instanceOf(Blob)
      expect(blob.type).to.equal('application/staplay')
      expect(blob.size).to.be.greaterThan(0)
    })

    it('should generate a zip blob with ship model file', async () => {
      const shipModel = new File(['mock 3d model data'], 'ship.glb', { type: 'model/gltf-binary' })
      const gameInfo = new GameInfo(1, 'Test Game', 'USS Enterprise', 5, 3, '', 'lcars-24', '2', shipModel)
      const players = []
      const scenes = []
      const trackers = []
      const traits = {}

      const backup = new BackupData(gameInfo, players, scenes, trackers, traits)
      const blob = await backup.getZip()

      expect(blob).to.be.instanceOf(Blob)
      expect(blob.size).to.be.greaterThan(0)
    })

    it('should generate a zip blob with player image files', async () => {
      const gameInfo = new GameInfo(1, 'Test Game', 'USS Enterprise')
      const playerImage = new File(['mock image data'], 'player.png', { type: 'image/png' })
      const players = [
        new PlayerInfo(1, 1, 'Player One', 5, 10, 'gold', 'blue', playerImage)
      ]
      const scenes = []
      const trackers = []
      const traits = {}

      const backup = new BackupData(gameInfo, players, scenes, trackers, traits)
      const blob = await backup.getZip()

      expect(blob).to.be.instanceOf(Blob)
      expect(blob.size).to.be.greaterThan(0)
    })

    it('should generate a zip blob with both ship model and player images', async () => {
      const shipModel = new File(['mock 3d model'], 'ship.glb', { type: 'model/gltf-binary' })
      const gameInfo = new GameInfo(1, 'Test Game', 'USS Enterprise', 5, 3, '', 'lcars-24', '2', shipModel)
      const playerImage1 = new File(['mock image 1'], 'player1.png', { type: 'image/png' })
      const playerImage2 = new File(['mock image 2'], 'player2.jpg', { type: 'image/jpeg' })
      const players = [
        new PlayerInfo(1, 1, 'Player One', 5, 10, 'gold', 'blue', playerImage1),
        new PlayerInfo(1, 2, 'Player Two', 3, 12, 'silver', 'red', playerImage2)
      ]
      const scenes = [new SceneInfo(1, 1, 'Scene', 'Desc')]
      const trackers = [new TrackerInfo(1, 'Tracker', 'Control', 'Command', 'Weapons', 'Security', 5, 10)]
      const traits = { 1: ['trait1', 'trait2'] }

      const backup = new BackupData(gameInfo, players, scenes, trackers, traits)
      const blob = await backup.getZip()

      expect(blob).to.be.instanceOf(Blob)
      expect(blob.size).to.be.greaterThan(0)
    })

    it('should handle players without images', async () => {
      const gameInfo = new GameInfo(1, 'Test Game', 'USS Enterprise')
      const players = [
        new PlayerInfo(1, 1, 'Player One', 5, 10, 'gold', 'blue'),
        new PlayerInfo(1, 2, 'Player Two', 3, 12, 'silver', 'red')
      ]
      const scenes = []
      const trackers = []
      const traits = {}

      const backup = new BackupData(gameInfo, players, scenes, trackers, traits)
      const blob = await backup.getZip()

      expect(blob).to.be.instanceOf(Blob)
      expect(blob.size).to.be.greaterThan(0)
    })
  })

  describe('import', () => {
    it('should import backup data without files', async () => {
      // Create original backup
      const gameInfo = new GameInfo(1, 'Test Game', 'USS Enterprise', 5, 3, 'red', 'lcars-24', '2')
      const players = [
        new PlayerInfo(1, 1, 'Player One', 5, 10, 'gold', 'blue'),
        new PlayerInfo(1, 2, 'Player Two', 3, 12, 'silver', 'red')
      ]
      const scenes = [
        new SceneInfo(1, 1, 'Scene One', 'Description One'),
        new SceneInfo(2, 1, 'Scene Two', 'Description Two')
      ]
      const trackers = [
        new TrackerInfo(1, 'Tracker One', 'Control', 'Command', 'Weapons', 'Security', 5, 10)
      ]
      const traits = { 1: ['trait1', 'trait2'] }

      const originalBackup = new BackupData(gameInfo, players, scenes, trackers, traits)
      const blob = await originalBackup.getZip()
      const file = new File([blob], 'test-backup.staplay', { type: 'application/staplay' })

      // Import the backup
      const importedBackup = await BackupData.import(file)

      // Verify GameInfo
      expect(importedBackup.GameInfo).to.be.instanceOf(GameInfo)
      expect(importedBackup.GameInfo.name).to.equal('Test Game')
      expect(importedBackup.GameInfo.shipName).to.equal('USS Enterprise')
      expect(importedBackup.GameInfo.momentum).to.equal(5)
      expect(importedBackup.GameInfo.threat).to.equal(3)
      expect(importedBackup.GameInfo.activeAlert).to.equal('red')
      expect(importedBackup.GameInfo.theme).to.equal('lcars-24')
      expect(importedBackup.GameInfo.edition).to.equal('2')

      // Verify Players
      expect(importedBackup.Players).to.be.an('array').with.lengthOf(2)
      expect(importedBackup.Players[0]).to.be.instanceOf(PlayerInfo)
      expect(importedBackup.Players[0].name).to.equal('Player One')
      expect(importedBackup.Players[0].currentStress).to.equal(5)
      expect(importedBackup.Players[0].maxStress).to.equal(10)
      expect(importedBackup.Players[1]).to.be.instanceOf(PlayerInfo)
      expect(importedBackup.Players[1].name).to.equal('Player Two')

      // Verify Scenes
      expect(importedBackup.Scenes).to.be.an('array').with.lengthOf(2)
      expect(importedBackup.Scenes[0]).to.be.instanceOf(SceneInfo)
      expect(importedBackup.Scenes[0].name).to.equal('Scene One')
      expect(importedBackup.Scenes[1]).to.be.instanceOf(SceneInfo)
      expect(importedBackup.Scenes[1].name).to.equal('Scene Two')

      // Verify Trackers
      expect(importedBackup.Trackers).to.be.an('array').with.lengthOf(1)
      expect(importedBackup.Trackers[0]).to.be.instanceOf(TrackerInfo)
      expect(importedBackup.Trackers[0].name).to.equal('Tracker One')
      expect(importedBackup.Trackers[0].progressTrack).to.equal(5)

      // Verify Traits
      expect(importedBackup.Traits).to.be.an('object')
      expect(importedBackup.Traits['1']).to.deep.equal(['trait1', 'trait2'])
    })

    it('should import backup data with ship model', async () => {
      const shipModel = new File(['mock 3d model data'], 'ship.glb', { type: 'model/gltf-binary' })
      const gameInfo = new GameInfo(1, 'Test Game', 'USS Enterprise', 0, 0, '', 'lcars-24', '2', shipModel)
      const originalBackup = new BackupData(gameInfo, [], [], [], {})

      const blob = await originalBackup.getZip()
      const file = new File([blob], 'test-backup.staplay', { type: 'application/staplay' })

      const importedBackup = await BackupData.import(file)

      expect(importedBackup.GameInfo.shipModel).to.be.instanceOf(File)
      expect(importedBackup.GameInfo.shipModel.name).to.equal('ship.glb')
      expect(importedBackup.GameInfo.shipModel.type).to.equal('model/gltf-binary')
    })

    it('should import backup data with player images', async () => {
      const gameInfo = new GameInfo(1, 'Test Game', 'USS Enterprise')
      const playerImage = new File(['mock image data'], 'player.png', { type: 'image/png' })
      const players = [
        new PlayerInfo(1, 1, 'Player One', 5, 10, 'gold', 'blue', playerImage)
      ]
      const originalBackup = new BackupData(gameInfo, players, [], [], {})

      const blob = await originalBackup.getZip()
      const file = new File([blob], 'test-backup.staplay', { type: 'application/staplay' })

      const importedBackup = await BackupData.import(file)

      expect(importedBackup.Players[0].image).to.be.instanceOf(File)
      expect(importedBackup.Players[0].image.name).to.equal('player.png')
      expect(importedBackup.Players[0].image.type).to.equal('image/png')
    })

    it('should handle empty backup data', async () => {
      const gameInfo = new GameInfo(undefined, 'Empty Game', 'Ship')
      const originalBackup = new BackupData(gameInfo, [], [], [], {})

      const blob = await originalBackup.getZip()
      const file = new File([blob], 'test-backup.staplay', { type: 'application/staplay' })

      const importedBackup = await BackupData.import(file)

      expect(importedBackup.GameInfo.name).to.equal('Empty Game')
      expect(importedBackup.Players).to.be.an('array').that.is.empty
      expect(importedBackup.Scenes).to.be.an('array').that.is.empty
      expect(importedBackup.Trackers).to.be.an('array').that.is.empty
    })
  })

  describe('roundtrip consistency', () => {
    it('should maintain data integrity through export and import cycle', async () => {
      const shipModel = new File(['3d model'], 'enterprise.glb', { type: 'model/gltf-binary' })
      const gameInfo = new GameInfo(5, 'Original Game', 'USS Voyager', 10, 7, 'yellow', 'lcars-24', '2', shipModel, true, false)

      const playerImage1 = new File(['image1'], 'captain.png', { type: 'image/png' })
      const players = [
        new PlayerInfo(5, 1, 'Captain', 2, 10, 'gold', 'blue', playerImage1),
        new PlayerInfo(5, 2, 'Engineer', 5, 12, 'gold', 'red')
      ]

      const scenes = [
        new SceneInfo(10, 5, 'Bridge Scene', 'On the bridge', ['mission-a']),
        new SceneInfo(11, 5, 'Engineering', 'In engineering bay')
      ]

      const trackers = [
        new TrackerInfo(5, 'Combat Tracker', 'Control', 'Command', 'Weapons', 'Security', 3, 10, 2, 15, 1)
      ]

      const traits = {
        10: ['alert', 'danger'],
        11: ['calm', 'technical']
      }

      const originalBackup = new BackupData(gameInfo, players, scenes, trackers, traits)
      const blob = await originalBackup.getZip()
      const file = new File([blob], 'roundtrip.staplay', { type: 'application/staplay' })

      const importedBackup = await BackupData.import(file)

      // Verify all data is preserved
      expect(importedBackup.GameInfo.id).to.equal(5)
      expect(importedBackup.GameInfo.name).to.equal('Original Game')
      expect(importedBackup.GameInfo.shipName).to.equal('USS Voyager')
      expect(importedBackup.GameInfo.momentum).to.equal(10)
      expect(importedBackup.GameInfo.threat).to.equal(7)
      expect(importedBackup.GameInfo.activeAlert).to.equal('yellow')
      expect(importedBackup.GameInfo.altFont).to.equal(true)
      expect(importedBackup.GameInfo.shipModel).to.be.instanceOf(File)

      expect(importedBackup.Players).to.have.lengthOf(2)
      expect(importedBackup.Players[0].name).to.equal('Captain')
      expect(importedBackup.Players[0].image).to.be.instanceOf(File)
      expect(importedBackup.Players[1].name).to.equal('Engineer')
      expect(importedBackup.Players[1].image).to.be.undefined

      expect(importedBackup.Scenes).to.have.lengthOf(2)
      expect(importedBackup.Scenes[0].name).to.equal('Bridge Scene')
      expect(importedBackup.Scenes[0].missionTrack).to.deep.equal(['mission-a'])

      expect(importedBackup.Trackers).to.have.lengthOf(1)
      expect(importedBackup.Trackers[0].breakthroughs).to.equal(1)

      // Verify Traits
      expect(importedBackup.Traits).to.be.an('object')
      expect(importedBackup.Traits['10']).to.deep.equal(['alert', 'danger'])
      expect(importedBackup.Traits['11']).to.deep.equal(['calm', 'technical'])
    })
  })

  describe('instance behavior', () => {
    it('should create independent instances', () => {
      const gameInfo1 = new GameInfo(1, 'Game One', 'Ship One')
      const gameInfo2 = new GameInfo(2, 'Game Two', 'Ship Two')

      const backup1 = new BackupData(gameInfo1, [], [], [], {})
      const backup2 = new BackupData(gameInfo2, [], [], [], {})

      expect(backup1.GameInfo.name).to.equal('Game One')
      expect(backup2.GameInfo.name).to.equal('Game Two')
    })

    it('should be instanceof BackupData', () => {
      const gameInfo = new GameInfo(1, 'Test', 'Ship')
      const backup = new BackupData(gameInfo, [], [], [], {})
      expect(backup).to.be.instanceof(BackupData)
    })
  })
})
