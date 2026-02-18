import { expect } from '@esm-bundle/chai'
import { Database } from '../../../js/database/database.js'
import { BackupData } from '../../../js/database/backup-data.js'

/**
 * Example Files Import Tests
 * These tests verify that real .staplay files from the issue can be imported successfully
 * This prevents regression of the IDBKeyRange bug
 */
describe('Example Files Import', () => {
  let db

  beforeEach(async () => {
    db = new Database()
  })

  afterEach(async () => {
    // Clean up database after each test
    if (db) {
      const idb = await db.open()
      // Delete all data
      const tx = idb.transaction(['games', 'players', 'trackers', 'rollTables', 'scenes', 'traits'], 'readwrite')
      await tx.objectStore('games').clear()
      await tx.objectStore('players').clear()
      await tx.objectStore('trackers').clear()
      await tx.objectStore('rollTables').clear()
      await tx.objectStore('scenes').clear()
      await tx.objectStore('traits').clear()
      await tx.done
      idb.close()
    }
  })

  /**
   * Helper function to load a fixture file
   * @param {string} filename - Name of the file in test/fixtures/
   * @returns {Promise<File>} The file object
   */
  async function loadFixture (filename) {
    const response = await fetch(`/test/fixtures/${filename}`)
    if (!response.ok) {
      throw new Error(`Failed to load fixture ${filename}: ${response.statusText}`)
    }
    const blob = await response.blob()
    return new File([blob], filename, { type: 'application/staplay' })
  }

  it('should import "Example Campaign.staplay" without errors', async () => {
    const file = await loadFixture('Example Campaign.staplay')
    const backupData = await BackupData.import(file)

    const idb = await db.open()
    await db.import(backupData, idb)

    // Verify the game was imported
    const tx = idb.transaction('games', 'readonly')
    const games = await tx.store.getAll()
    await tx.done

    expect(games).to.have.lengthOf(1)
    expect(games[0]).to.have.property('name')
    expect(games[0].name).to.be.a('string')

    idb.close()
  })

  it('should import "Example Campaign 2.staplay" without errors', async () => {
    const file = await loadFixture('Example Campaign 2.staplay')
    const backupData = await BackupData.import(file)

    const idb = await db.open()
    await db.import(backupData, idb)

    // Verify the game was imported
    const tx = idb.transaction('games', 'readonly')
    const games = await tx.store.getAll()
    await tx.done

    expect(games).to.have.lengthOf(1)
    expect(games[0]).to.have.property('name')

    idb.close()
  })

  it('should import "Example Captains Log.staplay" without errors', async () => {
    const file = await loadFixture('Example Captains Log.staplay')
    const backupData = await BackupData.import(file)

    const idb = await db.open()
    await db.import(backupData, idb)

    // Verify the game was imported
    const tx = idb.transaction('games', 'readonly')
    const games = await tx.store.getAll()
    await tx.done

    expect(games).to.have.lengthOf(1)
    expect(games[0]).to.have.property('name')

    idb.close()
  })

  it('should import all example files and preserve data integrity', async () => {
    const files = [
      'Example Campaign.staplay',
      'Example Campaign 2.staplay',
      'Example Captains Log.staplay'
    ]

    for (const filename of files) {
      const file = await loadFixture(filename)
      const backupData = await BackupData.import(file)

      // Verify BackupData structure
      expect(backupData).to.have.property('GameInfo')
      expect(backupData).to.have.property('Players')
      expect(backupData).to.have.property('Scenes')
      expect(backupData).to.have.property('Trackers')
      expect(backupData).to.have.property('Traits')

      expect(backupData.GameInfo).to.have.property('name')
      expect(backupData.Players).to.be.an('array')
      expect(backupData.Scenes).to.be.an('array')
      expect(backupData.Trackers).to.be.an('array')

      const idb = await db.open()

      // Clear database before importing next file
      const clearTx = idb.transaction(['games', 'players', 'trackers', 'rollTables', 'scenes', 'traits'], 'readwrite')
      await clearTx.objectStore('games').clear()
      await clearTx.objectStore('players').clear()
      await clearTx.objectStore('trackers').clear()
      await clearTx.objectStore('rollTables').clear()
      await clearTx.objectStore('scenes').clear()
      await clearTx.objectStore('traits').clear()
      await clearTx.done

      // Import should not throw
      await db.import(backupData, idb)

      // Verify data was imported
      const tx = idb.transaction(['games', 'players', 'scenes', 'trackers'], 'readonly')
      const games = await tx.objectStore('games').getAll()
      const players = await tx.objectStore('players').getAll()
      const scenes = await tx.objectStore('scenes').getAll()
      const trackers = await tx.objectStore('trackers').getAll()
      await tx.done

      expect(games).to.have.lengthOf(1)
      expect(games[0].name).to.equal(backupData.GameInfo.name)
      expect(players).to.have.lengthOf(backupData.Players.length)
      expect(scenes).to.have.lengthOf(backupData.Scenes.length)
      expect(trackers).to.have.lengthOf(backupData.Trackers.length)

      idb.close()
    }
  })

  it('should preserve player data when importing example files', async () => {
    const file = await loadFixture('Example Campaign.staplay')
    const backupData = await BackupData.import(file)

    const idb = await db.open()
    await db.import(backupData, idb)

    const tx = idb.transaction('players', 'readonly')
    const players = await tx.store.getAll()
    await tx.done

    // Verify players have required fields
    for (const player of players) {
      expect(player).to.have.property('name')
      expect(player).to.have.property('game')
      expect(player).to.have.property('playerNumber')
      expect(player).to.have.property('currentStress')
      expect(player).to.have.property('maxStress')
      expect(player).to.have.property('pips')
      expect(player).to.have.property('borderColor')
      expect(player.name).to.be.a('string')
      expect(player.game).to.be.a('number')
    }

    idb.close()
  })

  it('should preserve scene data when importing example files', async () => {
    const file = await loadFixture('Example Campaign.staplay')
    const backupData = await BackupData.import(file)

    const idb = await db.open()
    await db.import(backupData, idb)

    const tx = idb.transaction('scenes', 'readonly')
    const scenes = await tx.store.getAll()
    await tx.done

    // Verify scenes have required fields
    for (const scene of scenes) {
      expect(scene).to.have.property('name')
      expect(scene).to.have.property('game')
      expect(scene).to.have.property('description')
      expect(scene.name).to.be.a('string')
      expect(scene.game).to.be.a('number')
    }

    idb.close()
  })

  it('should preserve tracker data when importing example files', async () => {
    const file = await loadFixture('Example Campaign.staplay')
    const backupData = await BackupData.import(file)

    const idb = await db.open()
    await db.import(backupData, idb)

    const tx = idb.transaction('trackers', 'readonly')
    const trackers = await tx.store.getAll()
    await tx.done

    // Verify trackers have required fields
    for (const tracker of trackers) {
      expect(tracker).to.have.property('name')
      expect(tracker).to.have.property('game')
      expect(tracker).to.have.property('progressTrack')
      expect(tracker).to.have.property('maxProgressTrack')
      expect(tracker.name).to.be.a('string')
      expect(tracker.game).to.be.a('number')
    }

    idb.close()
  })
})
