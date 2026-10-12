import { expect } from '@esm-bundle/chai'
import { Database } from '../../../js/database/database.js'
import { PlayerInfo } from '../../../js/database/player-info.js'
import { TrackerInfo } from '../../../js/database/tracker-info.js'
import { RollTableInfo } from '../../../js/database/roll-table-info.js'
import { TokenInfo } from '../../../js/database/token-info.js'
import { GameInfo } from '../../../js/database/game-info.js'
import { SceneInfo } from '../../../js/database/scene-info.js'
import { BackupData } from '../../../js/database/backup-data.js'
import { openDB, deleteDB } from '../../../js/lib/idb.js'

const DB_NAME = 'STAPlayApp'

/**
 * Database integration tests
 * These tests verify database operations work correctly
 */
describe('Database', () => {
  let db

  beforeEach(async () => {
    db = new Database()
  })

  afterEach(async () => {
    // Clean up database after each test
    if (db) {
      const idb = await db.open()
      // Delete all data
      const tx = idb.transaction(['games', 'players', 'trackers', 'rollTables', 'tokens'], 'readwrite')
      await tx.objectStore('games').clear()
      await tx.objectStore('players').clear()
      await tx.objectStore('trackers').clear()
      await tx.objectStore('rollTables').clear()
      await tx.objectStore('tokens').clear()
      await tx.done
      idb.close()
    }
  })

  describe('replacePlayers', () => {
    it('should replace players in database', async () => {
      const idb = await db.open()

      // Create a game first
      const gameInfo = new GameInfo(undefined, 'Test Game', 'USS Test')
      delete gameInfo.id
      const gameTx = idb.transaction('games', 'readwrite')
      const gameId = await gameTx.store.add(gameInfo)
      await gameTx.done

      // Add initial players
      const initialPlayers = [
        new PlayerInfo(gameId, 1, 'Initial Player 1', 5, 10, 'gold', 'blue'),
        new PlayerInfo(gameId, 2, 'Initial Player 2', 3, 12, 'silver', 'red')
      ]
      initialPlayers.forEach(p => delete p.id)

      const tx1 = idb.transaction('players', 'readwrite')
      for (const player of initialPlayers) {
        await tx1.store.add(player)
      }
      await tx1.done

      // Verify initial players were added
      const tx2 = idb.transaction('players', 'readonly')
      const initialCount = await tx2.store.count()
      await tx2.done
      expect(initialCount).to.equal(2)

      // Now replace with new players
      const newPlayers = [
        new PlayerInfo(gameId, 1, 'New Player 1', 7, 10, 'gold', 'green'),
        new PlayerInfo(gameId, 2, 'New Player 2', 2, 12, 'silver', 'yellow'),
        new PlayerInfo(gameId, 3, 'New Player 3', 4, 11, 'gold', 'purple')
      ]

      await db.replacePlayers(newPlayers, idb)

      // Verify new players are in database
      const tx3 = idb.transaction('players', 'readonly')
      const players = await tx3.store.getAll()
      await tx3.done

      expect(players).to.have.lengthOf(3)
      expect(players[0].name).to.equal('New Player 1')
      expect(players[0].currentStress).to.equal(7)
      expect(players[1].name).to.equal('New Player 2')
      expect(players[2].name).to.equal('New Player 3')

      idb.close()
    })

    it('should clear all existing players before adding new ones', async () => {
      const idb = await db.open()

      // Create a game
      const gameInfo = new GameInfo(undefined, 'Test Game', 'USS Test')
      delete gameInfo.id
      const gameTx = idb.transaction('games', 'readwrite')
      const gameId = await gameTx.store.add(gameInfo)
      await gameTx.done

      // Add old players
      const oldPlayers = [
        new PlayerInfo(gameId, 1, 'Old Player', 5, 10, 'gold', 'blue')
      ]
      oldPlayers.forEach(p => delete p.id)

      const tx1 = idb.transaction('players', 'readwrite')
      for (const player of oldPlayers) {
        await tx1.store.add(player)
      }
      await tx1.done

      // Replace with empty array
      await db.replacePlayers([], idb)

      // Verify all players were removed
      const tx2 = idb.transaction('players', 'readonly')
      const count = await tx2.store.count()
      await tx2.done
      expect(count).to.equal(0)

      idb.close()
    })

    it('should handle players without id property', async () => {
      const idb = await db.open()

      const gameInfo = new GameInfo(undefined, 'Test Game', 'USS Test')
      delete gameInfo.id
      const gameTx = idb.transaction('games', 'readwrite')
      const gameId = await gameTx.store.add(gameInfo)
      await gameTx.done

      const players = [
        new PlayerInfo(gameId, 1, 'Player', 5, 10, 'gold', 'blue')
      ]
      // Explicitly set id to undefined to test the deletion logic
      players[0].id = undefined

      await db.replacePlayers(players, idb)

      const tx = idb.transaction('players', 'readonly')
      const result = await tx.store.getAll()
      await tx.done
      expect(result).to.have.lengthOf(1)

      idb.close()
    })
  })

  describe('replaceTrackers', () => {
    it('should replace trackers in database', async () => {
      const idb = await db.open()

      // Add initial trackers
      const initialTrackers = [
        new TrackerInfo(1, 'Initial Tracker', 'Control', 'Command', 'Weapons', 'Security', 5, 10)
      ]
      initialTrackers.forEach(t => delete t.id)

      const tx1 = idb.transaction('trackers', 'readwrite')
      for (const tracker of initialTrackers) {
        await tx1.store.add(tracker)
      }
      await tx1.done

      // Replace with new trackers
      const newTrackers = [
        new TrackerInfo(1, 'New Tracker 1', 'Daring', 'Conn', 'Sensors', 'Science', 3, 8),
        new TrackerInfo(1, 'New Tracker 2', 'Fitness', 'Security', 'Phasers', 'Engineering', 7, 12)
      ]

      await db.replaceTrackers(newTrackers, idb)

      // Verify new trackers are in database
      const tx2 = idb.transaction('trackers', 'readonly')
      const trackers = await tx2.store.getAll()
      await tx2.done

      expect(trackers).to.have.lengthOf(2)
      expect(trackers[0].name).to.equal('New Tracker 1')
      expect(trackers[1].name).to.equal('New Tracker 2')

      idb.close()
    })

    it('should reject invalid trackers', async () => {
      const idb = await db.open()

      // Create an invalid tracker by manipulating it after construction
      const invalidTracker = new TrackerInfo(1, 'Valid Name', 'Control', 'Command', 'Weapons', 'Security', 5, 10)
      invalidTracker.name = '' // Make it invalid

      const invalidTrackers = [invalidTracker]

      await db.replaceTrackers(invalidTrackers, idb)

      // Verify trackers were NOT added due to validation failure
      const tx = idb.transaction('trackers', 'readonly')
      const count = await tx.store.count()
      await tx.done
      expect(count).to.equal(0)

      idb.close()
    })
  })

  describe('replaceRollTables', () => {
    it('should replace roll tables in database', async () => {
      const idb = await db.open()

      // Create a game first
      const gameInfo = new GameInfo(undefined, 'Test Game', 'USS Test')
      delete gameInfo.id
      const gameTx = idb.transaction('games', 'readwrite')
      const gameId = await gameTx.store.add(gameInfo)
      await gameTx.done

      // Add initial roll tables
      const initialTables = [
        new RollTableInfo(gameId, 'Initial Table', [{ result: 'Initial Result' }])
      ]
      initialTables.forEach(t => delete t.id)

      const tx1 = idb.transaction('rollTables', 'readwrite')
      for (const table of initialTables) {
        await tx1.store.add(table)
      }
      await tx1.done

      // Replace with new tables
      const newTables = [
        new RollTableInfo(gameId, 'New Table 1', [{ result: 'New Result 1' }]),
        new RollTableInfo(gameId, 'New Table 2', [{ result: 'New Result 2' }])
      ]

      await db.replaceRollTables(newTables, idb)

      // Verify new tables are in database
      const tx2 = idb.transaction('rollTables', 'readonly')
      const tables = await tx2.store.getAll()
      await tx2.done

      expect(tables).to.have.lengthOf(2)
      expect(tables[0].name).to.equal('New Table 1')
      expect(tables[1].name).to.equal('New Table 2')

      idb.close()
    })

    it('should reject invalid roll tables', async () => {
      const idb = await db.open()

      // Create a game first
      const gameInfo = new GameInfo(undefined, 'Test Game', 'USS Test')
      delete gameInfo.id
      const gameTx = idb.transaction('games', 'readwrite')
      const gameId = await gameTx.store.add(gameInfo)
      await gameTx.done

      const invalidTables = [
        new RollTableInfo(gameId, '', [{ result: 'Result' }]) // Empty name is invalid
      ]

      await db.replaceRollTables(invalidTables, idb)

      // Verify tables were NOT added due to validation failure
      const tx = idb.transaction('rollTables', 'readonly')
      const count = await tx.store.count()
      await tx.done
      expect(count).to.equal(0)

      idb.close()
    })

    it('should clear all existing roll tables before adding new ones', async () => {
      const idb = await db.open()

      // Create a game first
      const gameInfo = new GameInfo(undefined, 'Test Game', 'USS Test')
      delete gameInfo.id
      const gameTx = idb.transaction('games', 'readwrite')
      const gameId = await gameTx.store.add(gameInfo)
      await gameTx.done

      // Add old tables
      const oldTables = [
        new RollTableInfo(gameId, 'Old Table', [{ result: 'Old' }])
      ]
      oldTables.forEach(t => delete t.id)

      const tx1 = idb.transaction('rollTables', 'readwrite')
      for (const table of oldTables) {
        await tx1.store.add(table)
      }
      await tx1.done

      // Replace with empty array
      await db.replaceRollTables([], idb)

      // Verify all tables were removed
      const tx2 = idb.transaction('rollTables', 'readonly')
      const count = await tx2.store.count()
      await tx2.done
      expect(count).to.equal(0)

      idb.close()
    })
  })

  describe('replaceTokens', () => {
    it('should replace tokens in database', async () => {
      const idb = await db.open()

      // Create a game first
      const gameInfo = new GameInfo(undefined, 'Test Game', 'USS Test')
      delete gameInfo.id
      const gameTx = idb.transaction('games', 'readwrite')
      const gameId = await gameTx.store.add(gameInfo)
      await gameTx.done

      // Add initial tokens
      const initialTokens = [
        new TokenInfo(gameId, 'Initial Token')
      ]
      initialTokens.forEach(t => delete t.id)

      const tx1 = idb.transaction('tokens', 'readwrite')
      for (const token of initialTokens) {
        await tx1.store.add(token)
      }
      await tx1.done

      // Replace with new tokens
      const newTokens = [
        new TokenInfo(gameId, 'New Token 1'),
        new TokenInfo(gameId, 'New Token 2')
      ]

      await db.replaceTokens(newTokens, idb)

      // Verify new tokens are in database
      const tx2 = idb.transaction('tokens', 'readonly')
      const tokens = await tx2.store.getAll()
      await tx2.done

      expect(tokens).to.have.lengthOf(2)
      expect(tokens[0].name).to.equal('New Token 1')
      expect(tokens[1].name).to.equal('New Token 2')

      idb.close()
    })

    it('should reject invalid tokens', async () => {
      const idb = await db.open()

      // Create a game first
      const gameInfo = new GameInfo(undefined, 'Test Game', 'USS Test')
      delete gameInfo.id
      const gameTx = idb.transaction('games', 'readwrite')
      const gameId = await gameTx.store.add(gameInfo)
      await gameTx.done

      const invalidTokens = [
        new TokenInfo(gameId, 'Temp Name')
      ]
      invalidTokens[0].name = '' // Empty name is invalid

      await db.replaceTokens(invalidTokens, idb)

      // Verify tokens were NOT added due to validation failure
      const tx = idb.transaction('tokens', 'readonly')
      const count = await tx.store.count()
      await tx.done
      expect(count).to.equal(0)

      idb.close()
    })

    it('should clear all existing tokens before adding new ones', async () => {
      const idb = await db.open()

      // Create a game first
      const gameInfo = new GameInfo(undefined, 'Test Game', 'USS Test')
      delete gameInfo.id
      const gameTx = idb.transaction('games', 'readwrite')
      const gameId = await gameTx.store.add(gameInfo)
      await gameTx.done

      // Add old tokens
      const oldTokens = [
        new TokenInfo(gameId, 'Old Token')
      ]
      oldTokens.forEach(t => delete t.id)

      const tx1 = idb.transaction('tokens', 'readwrite')
      for (const token of oldTokens) {
        await tx1.store.add(token)
      }
      await tx1.done

      // Replace with empty array
      await db.replaceTokens([], idb)

      // Verify all tokens were removed
      const tx2 = idb.transaction('tokens', 'readonly')
      const count = await tx2.store.count()
      await tx2.done
      expect(count).to.equal(0)

      idb.close()
    })
  })

  describe('migration from v14 to v16', () => {
    afterEach(async () => {
      // The outer afterEach doesn't clear `traits`, which only this suite populates
      const idb = await db.open()
      await idb.clear('traits')
      idb.close()
    })

    /**
     * Build a legacy v14 database with some existing data, matching the schema that was
     * in place before the traits' name index was changed from unique to non-unique.
     * @returns {Promise<{sceneId: number}>} ids of the seeded records
     */
    async function seedLegacyV14Database () {
      await deleteDB(DB_NAME)

      const legacyDb = await openDB(DB_NAME, 14, {
        upgrade (legacyDbInstance) {
          const gameStore = legacyDbInstance.createObjectStore('games', { keyPath: 'id', autoIncrement: true })
          gameStore.createIndex('name', 'name', { unique: true })

          const traitStore = legacyDbInstance.createObjectStore('traits', { keyPath: 'id', autoIncrement: true })
          traitStore.createIndex('name', 'name', { unique: true })
          traitStore.createIndex('scene', 'scene', { unique: false })

          const playerStore = legacyDbInstance.createObjectStore('players', { keyPath: 'id', autoIncrement: true })
          playerStore.createIndex('name', 'name', { unique: false })
          playerStore.createIndex('game', 'game', { unique: false })

          const trackerStore = legacyDbInstance.createObjectStore('trackers', { keyPath: 'id', autoIncrement: true })
          trackerStore.createIndex('name', 'name', { unique: true })
          trackerStore.createIndex('game', 'game', { unique: false })

          const sceneStore = legacyDbInstance.createObjectStore('scenes', { keyPath: 'id', autoIncrement: true })
          sceneStore.createIndex('name', 'name', { unique: false })
          sceneStore.createIndex('game', 'game', { unique: false })

          const rollTablesStore = legacyDbInstance.createObjectStore('rollTables', { keyPath: 'id', autoIncrement: true })
          rollTablesStore.createIndex('name', 'name', { unique: false })
          rollTablesStore.createIndex('game', 'game', { unique: false })
        }
      })

      const sceneTx = legacyDb.transaction('traits', 'readwrite')
      const sceneId = await sceneTx.store.add({ scene: 1, name: 'Duplicate Trait' })
      await sceneTx.done

      legacyDb.close()

      return { sceneId }
    }

    it('should loosen the traits name index to non-unique without deleting existing data', async () => {
      const { sceneId } = await seedLegacyV14Database()

      // Opening with the current Database class triggers the 14 -> 18 upgrade
      db = new Database()
      const idb = await db.open()

      const traitStoreIndexes = idb.transaction('traits', 'readonly').store.indexNames
      expect(Array.from(traitStoreIndexes)).to.include('name')

      const traits = await idb.transaction('traits', 'readonly').store.getAll()
      expect(traits).to.have.lengthOf(1)
      expect(traits[0].id).to.equal(sceneId)
      expect(traits[0].name).to.equal('Duplicate Trait')

      idb.close()
    })

    it('should allow adding a trait with a duplicate name after migrating', async () => {
      await seedLegacyV14Database()

      db = new Database()
      const idb = await db.open()

      // Before the fix, a second trait with the same name would throw a ConstraintError
      const tx = idb.transaction('traits', 'readwrite')
      await tx.store.add({ scene: 2, name: 'Duplicate Trait' })
      await tx.done

      const traits = await idb.transaction('traits', 'readonly').store.getAll()
      expect(traits).to.have.lengthOf(2)

      idb.close()
    })
  })

  describe('migration from v17 to v18', () => {
    afterEach(async () => {
      // The outer afterEach doesn't clear `scenes`, which only this suite populates
      const idb = await db.open()
      await idb.clear('scenes')
      idb.close()
    })

    /**
     * Build a legacy (pre-tokens) v17 database with some existing data, matching the
     * schema that was in place before the "tokens" store and SceneInfo.tokenPositions
     * field were introduced.
     * @returns {Promise<{gameId: number, sceneId: number}>} ids of the seeded records
     */
    async function seedLegacyV17Database () {
      await deleteDB(DB_NAME)

      const legacyDb = await openDB(DB_NAME, 17, {
        upgrade (legacyDbInstance) {
          const gameStore = legacyDbInstance.createObjectStore('games', { keyPath: 'id', autoIncrement: true })
          gameStore.createIndex('name', 'name', { unique: true })

          const traitStore = legacyDbInstance.createObjectStore('traits', { keyPath: 'id', autoIncrement: true })
          traitStore.createIndex('name', 'name', { unique: false })
          traitStore.createIndex('scene', 'scene', { unique: false })

          const playerStore = legacyDbInstance.createObjectStore('players', { keyPath: 'id', autoIncrement: true })
          playerStore.createIndex('name', 'name', { unique: false })
          playerStore.createIndex('game', 'game', { unique: false })

          const trackerStore = legacyDbInstance.createObjectStore('trackers', { keyPath: 'id', autoIncrement: true })
          trackerStore.createIndex('name', 'name', { unique: true })
          trackerStore.createIndex('game', 'game', { unique: false })

          const sceneStore = legacyDbInstance.createObjectStore('scenes', { keyPath: 'id', autoIncrement: true })
          sceneStore.createIndex('name', 'name', { unique: false })
          sceneStore.createIndex('game', 'game', { unique: false })

          const rollTablesStore = legacyDbInstance.createObjectStore('rollTables', { keyPath: 'id', autoIncrement: true })
          rollTablesStore.createIndex('name', 'name', { unique: false })
          rollTablesStore.createIndex('game', 'game', { unique: false })
        }
      })

      const gameTx = legacyDb.transaction('games', 'readwrite')
      const gameId = await gameTx.store.add({ name: 'Legacy Game', shipName: 'USS Legacy' })
      await gameTx.done

      // Legacy scene row has no `tokenPositions` field at all
      const sceneTx = legacyDb.transaction('scenes', 'readwrite')
      const sceneId = await sceneTx.store.add({ game: gameId, name: 'Legacy Scene', description: 'Old scene', missionTrack: [], activeAlert: '' })
      await sceneTx.done

      legacyDb.close()

      return { gameId, sceneId }
    }

    it('should add the tokens store without deleting existing data', async () => {
      const { gameId, sceneId } = await seedLegacyV17Database()

      // Opening with the current Database class triggers the 17 -> 18 upgrade
      db = new Database()
      const idb = await db.open()

      expect(idb.objectStoreNames.contains('tokens')).to.be.true

      const games = await idb.transaction('games', 'readonly').store.getAll()
      expect(games).to.have.lengthOf(1)
      expect(games[0].id).to.equal(gameId)
      expect(games[0].name).to.equal('Legacy Game')

      const scenes = await idb.transaction('scenes', 'readonly').store.getAll()
      expect(scenes).to.have.lengthOf(1)
      expect(scenes[0].id).to.equal(sceneId)
      expect(scenes[0].name).to.equal('Legacy Scene')

      idb.close()
    })

    it('should treat a migrated scene without tokenPositions as having none placed', async () => {
      const { gameId } = await seedLegacyV17Database()

      db = new Database()
      const idb = await db.open()

      const scenes = await db.getScenes(gameId, idb)
      const scene = scenes.find(s => s.name === 'Legacy Scene')

      expect(scene.tokenPositions).to.be.undefined
      // SceneInfo.assign() fills in the default, as index.js does when reading scenes
      expect(SceneInfo.assign(scene).tokenPositions).to.deep.equal({})

      idb.close()
    })

    it('should allow saving tokens for a migrated game', async () => {
      const { gameId } = await seedLegacyV17Database()

      db = new Database()
      const idb = await db.open()

      await db.replaceTokens([new TokenInfo(gameId, 'Migrated Token')], idb)

      const tokens = await db.getTokens(gameId, idb)
      expect(tokens).to.have.lengthOf(1)
      expect(tokens[0].name).to.equal('Migrated Token')

      idb.close()
    })
  })

  describe('import/export integration', () => {
    it('should successfully import exported data with players and roll tables', async () => {
      // This test verifies the bug fix - import should work without IDBKeyRange errors

      const idb = await db.open()

      // Create a game with data
      const gameInfo = new GameInfo(undefined, 'Export Test', 'USS Export')
      delete gameInfo.id
      const gameTx = idb.transaction('games', 'readwrite')
      await gameTx.store.add(gameInfo)
      await gameTx.done

      // Export the data
      const blob = await db.export('Export Test', idb)

      // Convert Blob to File for BackupData.import
      const file = new File([blob], 'export-test.staplay', { type: 'application/staplay' })
      const backupData = await BackupData.import(file)

      // Now import it back (this would fail with the bug)
      await db.import(backupData, idb)

      // Verify the import succeeded
      const tx = idb.transaction('games', 'readonly')
      const games = await tx.store.getAll()
      await tx.done

      expect(games).to.have.lengthOf(1)
      expect(games[0].name).to.equal('Export Test')

      idb.close()
    })

    it('should successfully import data with players', async () => {
      const idb = await db.open()

      // Create game and players
      const gameInfo = new GameInfo(undefined, 'Player Test', 'USS Player')
      delete gameInfo.id
      const gameTx = idb.transaction('games', 'readwrite')
      const gameId = await gameTx.store.add(gameInfo)
      await gameTx.done

      const players = [
        new PlayerInfo(gameId, 1, 'Test Player 1', 5, 10, 'gold', 'blue'),
        new PlayerInfo(gameId, 2, 'Test Player 2', 3, 12, 'silver', 'red')
      ]
      players.forEach(p => delete p.id)

      const tx1 = idb.transaction('players', 'readwrite')
      for (const player of players) {
        await tx1.store.add(player)
      }
      await tx1.done

      // Export
      const blob = await db.export('Player Test', idb)
      const file = new File([blob], 'player-test.staplay', { type: 'application/staplay' })
      const backupData = await BackupData.import(file)

      // Clear database
      const clearTx = idb.transaction(['games', 'players'], 'readwrite')
      await clearTx.objectStore('games').clear()
      await clearTx.objectStore('players').clear()
      await clearTx.done

      // Import back
      await db.import(backupData, idb)

      // Verify players were imported
      const tx2 = idb.transaction('players', 'readonly')
      const importedPlayers = await tx2.store.getAll()
      await tx2.done

      expect(importedPlayers).to.have.lengthOf(2)
      expect(importedPlayers[0].name).to.equal('Test Player 1')
      expect(importedPlayers[1].name).to.equal('Test Player 2')

      idb.close()
    })

    it('should export and import both ship models', async () => {
      const idb = await db.open()

      // Create a game with two ship models
      const shipModel1 = new File(['model1 data'], 'ship1.glb', { type: 'model/gltf-binary' })
      const shipModel2 = new File(['model2 data'], 'ship2.glb', { type: 'model/gltf-binary' })
      const gameInfo = new GameInfo(undefined, 'Ship Model Test', 'USS Two Ships', 0, 0, '', 'lcars-24', '2', shipModel1, false, false, shipModel2)
      delete gameInfo.id
      const gameTx = idb.transaction('games', 'readwrite')
      await gameTx.store.add(gameInfo)
      await gameTx.done

      // Export
      const blob = await db.export('Ship Model Test', idb)
      const file = new File([blob], 'ship-model-test.staplay', { type: 'application/staplay' })
      const backupData = await BackupData.import(file)

      // Verify both ship models are present in the backup data
      expect(backupData.GameInfo.shipModel).to.be.instanceOf(File)
      expect(backupData.GameInfo.shipModel.name).to.equal('ship1.glb')
      expect(backupData.GameInfo.shipModel2).to.be.instanceOf(File)
      expect(backupData.GameInfo.shipModel2.name).to.equal('ship2.glb')

      // Clear and re-import
      const clearTx = idb.transaction(['games'], 'readwrite')
      await clearTx.objectStore('games').clear()
      await clearTx.done

      await db.import(backupData, idb)

      const tx2 = idb.transaction('games', 'readonly')
      const importedGames = await tx2.store.getAll()
      await tx2.done

      expect(importedGames).to.have.lengthOf(1)
      expect(importedGames[0].shipModel).to.be.instanceOf(File)
      expect(importedGames[0].shipModel.name).to.equal('ship1.glb')
      expect(importedGames[0].shipModel2).to.be.instanceOf(File)
      expect(importedGames[0].shipModel2.name).to.equal('ship2.glb')

      idb.close()
    })

    it('should successfully import data with roll tables', async () => {
      const idb = await db.open()

      // Create game and roll tables
      const gameInfo = new GameInfo(undefined, 'Tables Test', 'USS Tables')
      delete gameInfo.id
      const gameTx = idb.transaction('games', 'readwrite')
      const gameId = await gameTx.store.add(gameInfo)
      await gameTx.done

      const tables = [
        new RollTableInfo(gameId, 'Test Table 1', [{ result: 'Result 1' }]),
        new RollTableInfo(gameId, 'Test Table 2', [{ result: 'Result 2' }])
      ]
      tables.forEach(t => delete t.id)

      const tx1 = idb.transaction('rollTables', 'readwrite')
      for (const table of tables) {
        await tx1.store.add(table)
      }
      await tx1.done

      // Export
      const blob = await db.export('Tables Test', idb)
      const file = new File([blob], 'tables-test.staplay', { type: 'application/staplay' })
      const backupData = await BackupData.import(file)

      // Clear database
      const clearTx = idb.transaction(['games', 'rollTables'], 'readwrite')
      await clearTx.objectStore('games').clear()
      await clearTx.objectStore('rollTables').clear()
      await clearTx.done

      // Import back
      await db.import(backupData, idb)

      // Verify roll tables were imported
      const tx2 = idb.transaction('rollTables', 'readonly')
      const importedTables = await tx2.store.getAll()
      await tx2.done

      expect(importedTables).to.have.lengthOf(2)
      expect(importedTables[0].name).to.equal('Test Table 1')
      expect(importedTables[1].name).to.equal('Test Table 2')

      idb.close()
    })

    it('should successfully import data with tokens', async () => {
      const idb = await db.open()

      // Create game and tokens
      const gameInfo = new GameInfo(undefined, 'Tokens Test', 'USS Tokens')
      delete gameInfo.id
      const gameTx = idb.transaction('games', 'readwrite')
      const gameId = await gameTx.store.add(gameInfo)
      await gameTx.done

      const tokens = [
        new TokenInfo(gameId, 'Test Token 1'),
        new TokenInfo(gameId, 'Test Token 2')
      ]
      tokens.forEach(t => delete t.id)

      const tx1 = idb.transaction('tokens', 'readwrite')
      for (const token of tokens) {
        await tx1.store.add(token)
      }
      await tx1.done

      // Export
      const blob = await db.export('Tokens Test', idb)
      const file = new File([blob], 'tokens-test.staplay', { type: 'application/staplay' })
      const backupData = await BackupData.import(file)

      // Clear database
      const clearTx = idb.transaction(['games', 'tokens'], 'readwrite')
      await clearTx.objectStore('games').clear()
      await clearTx.objectStore('tokens').clear()
      await clearTx.done

      // Import back
      await db.import(backupData, idb)

      // Verify tokens were imported
      const tx2 = idb.transaction('tokens', 'readonly')
      const importedTokens = await tx2.store.getAll()
      await tx2.done

      expect(importedTokens).to.have.lengthOf(2)
      expect(importedTokens[0].name).to.equal('Test Token 1')
      expect(importedTokens[1].name).to.equal('Test Token 2')

      idb.close()
    })
  })
})
