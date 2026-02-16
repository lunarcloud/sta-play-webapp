// @ts-ignore
import { openDB, deleteDB } from '../lib/idb.js'
import { DefaultGameName, GameInfo } from './game-info.js'
import { NamedInfo } from './named-info.js'
import { PlayerInfo } from './player-info.js'
import { TrackerInfo } from './tracker-info.js'
import { TraitInfo } from './trait-info.js'
import { SceneInfo } from './scene-info.js'
import { BackupData } from './backup-data.js'

/**
 * @typedef {IDBDatabase & {
 *  get, getKey, getAll, getAllKeys, count, put, add, delete, clear,
 *  getFromIndex, getKeyFromIndex, getAllFromIndex, getAllKeysFromIndex, countFromIndex
 * }} IDBPDatabase
 * From the IDB library
 */
/**
 * @typedef {IDBTransaction & {store, done}} IDBPTransaction
 * From the IDB library
 */

const DB_NAME = 'STAPlayApp'
const DB_VERSION = 13
const STORE = {
  GAMES: 'games',
  SCENES: 'scenes',
  TRAITS: 'traits',
  PLAYERS: 'players',
  TRACKERS: 'trackers'
}
const INDEX = {
  ID: 'id',
  NAME: 'name',
  GAME: 'game',
  SCENE: 'scene'
}

/**
 * Application Database Access.
 */
export class Database {
  /**
   * Clear the database.
   */
  async clear () {
    await deleteDB(DB_NAME)
  }

  /**
   * Open and return the database reference
   * @returns {Promise<IDBPDatabase>}    handle to the database
   */
  async open () {
    try {
      return await openDB(DB_NAME, DB_VERSION, { upgrade: async db => await this.#upgrade(db) })
    } catch (e) {
      console.error('Downgrade detected, wiping database', e)
      await this.clear()
      return await this.open()
    }
  }

  /**
   * Upgrade the database
   * @param {IDBPDatabase} db the database
   */
  async #upgrade (db) {
    // if (db.version === ??) {
    //    console.debug('add logic here for migration')
    //    return
    // }

    // fallback to wiping the database
    console.warn('clearing db for upgrade')
    await this.#create(db)
  }

  /**
   * Create the database
   * @param {IDBPDatabase} db the database
   */
  #create (db) {
    if (db.objectStoreNames.contains(STORE.GAMES)) {
      db.deleteObjectStore(STORE.GAMES)
    }
    if (db.objectStoreNames.contains(STORE.TRAITS)) {
      db.deleteObjectStore(STORE.TRAITS)
    }
    if (db.objectStoreNames.contains(STORE.PLAYERS)) {
      db.deleteObjectStore(STORE.PLAYERS)
    }
    if (db.objectStoreNames.contains(STORE.TRACKERS)) {
      db.deleteObjectStore(STORE.TRACKERS)
    }
    if (db.objectStoreNames.contains(STORE.SCENES)) {
      db.deleteObjectStore(STORE.SCENES)
    }

    console.warn('cleared db for upgrade')
    const gameStore = db.createObjectStore(STORE.GAMES, { keyPath: INDEX.ID, autoIncrement: true })
    gameStore.createIndex(INDEX.NAME, INDEX.NAME, { unique: true })

    const traitStore = db.createObjectStore(STORE.TRAITS, { keyPath: INDEX.ID, autoIncrement: true })
    traitStore.createIndex(INDEX.NAME, INDEX.NAME, { unique: true })
    traitStore.createIndex(INDEX.SCENE, INDEX.SCENE, { unique: false })

    const playerStore = db.createObjectStore(STORE.PLAYERS, { keyPath: INDEX.ID, autoIncrement: true })
    playerStore.createIndex(INDEX.NAME, INDEX.NAME, { unique: false })
    playerStore.createIndex(INDEX.GAME, INDEX.GAME, { unique: false })

    const trackerStore = db.createObjectStore(STORE.TRACKERS, { keyPath: INDEX.ID, autoIncrement: true })
    trackerStore.createIndex(INDEX.NAME, INDEX.NAME, { unique: true })
    trackerStore.createIndex(INDEX.GAME, INDEX.GAME, { unique: false })

    const sceneStore = db.createObjectStore(STORE.SCENES, { keyPath: INDEX.ID, autoIncrement: true })
    sceneStore.createIndex(INDEX.NAME, INDEX.NAME, { unique: false })
    sceneStore.createIndex(INDEX.GAME, INDEX.GAME, { unique: false })
  }

  /**
   * Get the game info from the database
   * @param {string|number}  [nameOrId]           the name of the game to load
   * @param {IDBPDatabase|undefined} [db]         the database (else we'll open a new one)
   * @returns {Promise<GameInfo|undefined>}       the general database information
   */
  async getGameInfo (nameOrId = DefaultGameName, db = undefined) {
    const andClose = typeof (db) === 'undefined'
    db ??= await this.open()

    const index = typeof (nameOrId) === 'number' ? INDEX.ID : INDEX.NAME

    const row = await db.count(STORE.GAMES) !== 0 // has info
      ? await db.getFromIndex(STORE.GAMES, index, nameOrId)
      : undefined

    /** @type {GameInfo|undefined} */
    let generalInfo
    if (typeof (row) !== 'undefined') {
      generalInfo = Object.create(GameInfo.prototype)
      Object.assign(generalInfo, row)
    }

    if (andClose) db.close()
    return generalInfo
  }

  /**
   * Get the scene traits from the database
   * @param {number}  [gameId]                    the id of the game to filter by
   * @param {IDBPDatabase|undefined} [db]         the database (else we'll open a new one)
   * @returns {Promise<SceneInfo[]>}              the list of scenes
   */
  async getScenes (gameId, db = undefined) {
    const andClose = typeof (db) === 'undefined'
    db ??= await this.open()

    const rows = await db.getAllFromIndex(STORE.SCENES, INDEX.GAME, gameId)
    if (andClose) db.close()
    /** @type {SceneInfo[]} */
    const data = rows.map(e => {
      /** @type {SceneInfo} */
      const item = Object.create(SceneInfo.prototype)
      Object.assign(item, e)
      return item
    })
    return data
  }

  /**
   * Get the scene traits from the database
   * @param {number}  [sceneId]                   the id of the scene to filter by
   * @param {IDBPDatabase|undefined} [db]         the database (else we'll open a new one)
   * @returns {Promise<string[]>}                 the list of scene traits
   */
  async getTraits (sceneId, db = undefined) {
    const andClose = typeof (db) === 'undefined'
    db ??= await this.open()

    /** @type {NamedInfo[]} */
    const rows = await db.getAllFromIndex(STORE.TRAITS, INDEX.SCENE, sceneId)
    const traits = rows.map(e => e.name)
    if (andClose) db.close()
    return traits
  }

  /**
   * Get the players from the database
   * @param {number}  [gameId]                    the id of the game to filter by
   * @param {IDBPDatabase|undefined} [db]         the database (else we'll open a new one)
   * @returns {Promise<PlayerInfo[]>}             the information for all players
   */
  async getPlayers (gameId, db = undefined) {
    const andClose = typeof (db) === 'undefined'
    db ??= await this.open()

    const rows = await db.getAllFromIndex(STORE.PLAYERS, INDEX.GAME, gameId)
    if (andClose) db.close()
    /** @type {PlayerInfo[]} */
    const data = rows.map(e => {
      /** @type {PlayerInfo} */
      const item = Object.create(PlayerInfo.prototype)
      Object.assign(item, e)
      return item
    })
    // Sort by order field (which defaults to playerNumber if not set)
    data.sort((a, b) => (a.order ?? a.playerNumber) - (b.order ?? b.playerNumber))
    return data
  }

  /**
   * Get the trackers from the database
   * @param {number}  [gameId]                    the id of the game to filter by
   * @param {IDBPDatabase|undefined} [db]         the database (else we'll open a new one)
   * @returns {Promise<TrackerInfo[]>}            the information for all trackers
   */
  async getTrackers (gameId, db = undefined) {
    const andClose = typeof (db) === 'undefined'
    db ??= await this.open()

    const rows = await db.getAllFromIndex(STORE.TRACKERS, INDEX.GAME, gameId)
    if (andClose) db.close()
    /** @type {TrackerInfo[]} */
    const data = rows.map(e => {
      /** @type {TrackerInfo} */
      const item = Object.create(TrackerInfo.prototype)
      Object.assign(item, e)
      return item
    })
    return data
  }

  /**
   * Save the game info to the database
   * @param {GameInfo} info                   data to save
   * @param {IDBPDatabase|undefined} [db]     the database (else we'll open a new one)
   * @returns {Promise<number|undefined>} game id, or undefined if validation fails
   */
  async saveGameInfo (info, db = undefined) {
    if (!info.validate()) {
      console.error('Invalid info, will not save!')
      return undefined
    }
    const andClose = typeof (db) === 'undefined'
    db ??= await this.open()

    if (info.id === undefined) {
      delete info.id
    }

    const id = await db.put(STORE.GAMES, info)
    if (andClose) db.close()
    return id
  }

  /**
   * Save the scene info to the database
   * @param {SceneInfo} info                   data to save
   * @param {IDBPDatabase|undefined} [db]     the database (else we'll open a new one)
   * @returns {Promise<number|undefined>} scene id, or undefined if validation fails
   */
  async saveSceneInfo (info, db = undefined) {
    if (!info.validate()) {
      console.error('Invalid info, will not save!')
      return undefined
    }
    const andClose = typeof (db) === 'undefined'
    db ??= await this.open()

    if (info.id === undefined) {
      delete info.id
    }

    const id = await db.put(STORE.SCENES, info)
    if (andClose) db.close()
    return id
  }

  /**
   * Replace data of a store in the database with new ones
   * @param {string} storeName                Name of the store
   * @param {string} [clearIndex]             the name of the index to clear
   * @param {any[]} [data]                    array of info to add
   * @param {IDBPDatabase|IDBDatabase} [db]   the database
   */
  async #replaceData (storeName, clearIndex = INDEX.NAME, data = [], db = undefined) {
    const andClose = typeof (db) === 'undefined'
    db ??= await this.open()

    /** @type {IDBPTransaction} */
    // @ts-ignore
    const transaction = db.transaction(storeName, 'readwrite')

    // clear traits
    const index = transaction.store.index(clearIndex)
    const pdestroy = index.openCursor()
    await pdestroy.then(async cursor => {
      while (cursor) {
        cursor.delete()
        cursor = await cursor.continue()
      }
    })

    // Add all current traits
    const adds = []
    for (const info of data) {
      adds.push(transaction.store.add(info))
    }
    adds.push(transaction.done)
    await Promise.all(adds)
    if (andClose) db.close()
  }

  /**
   * Replace the traits in the database with new ones
   * @param {number}   sceneId                id of the scene
   * @param {string[]} [traitNames]           names of all the traits
   * @param {IDBPDatabase|IDBDatabase} [db]   the database
   */
  async replaceTraits (sceneId, traitNames = [], db = undefined) {
    const traits = traitNames
      .map(e => {
        const info = new TraitInfo(sceneId, e)
        delete info.id
        return info
      })
    await this.#replaceData(STORE.TRAITS, INDEX.NAME, traits, db)
  }

  /**
   * Replace the trackers in the database with new ones
   * @param {TrackerInfo[]} trackers          all the current tracker infos
   * @param {IDBPDatabase|IDBDatabase} [db]   the database
   */
  async replaceTrackers (trackers = [], db = undefined) {
    const invalidTrackers = trackers.filter(t => !t.validate())
    if (invalidTrackers.length > 0) {
      console.error('Invalid trackers provided: %o', invalidTrackers)
      return
    }

    trackers.forEach(t => { if (t.id === undefined) delete t.id })
    await this.#replaceData(STORE.TRACKERS, INDEX.NAME, trackers, db)
  }

  /**
   * Replace the players in the database with new ones
   * @param {PlayerInfo[]} [players]          all the current player infos
   * @param {IDBPDatabase|IDBDatabase} [db]   the database
   */
  async replacePlayers (players = [], db = undefined) {
    players.forEach(p => { if (p.id === undefined) delete p.id })
    await this.#replaceData(STORE.PLAYERS, INDEX.NAME, players, db)
  }

  /**
   * Export the database info for a  game to a backup data object.
   * @param {string|number}  [nameOrId]   the name of the game to load
   * @param {IDBPDatabase} [db]           the database
   * @returns {Promise<Blob>}       backup data
   */
  async export (nameOrId = DefaultGameName, db = undefined) {
    const andClose = typeof (db) === 'undefined'
    db ??= await this.open()

    const gameInfo = await this.getGameInfo(nameOrId, db)

    const players = await this.getPlayers(gameInfo.id, db)
    const trackers = await this.getTrackers(gameInfo.id, db)
    const scenes = await this.getScenes(gameInfo.id, db)
    const traits = new Map()

    for (const scene of scenes) {
      traits[scene.id] = await this.getTraits(scene.id, db)
    }

    const data = new BackupData(gameInfo, players, scenes, trackers, traits)

    if (andClose) db.close()
    return data.getZip()
  }

  /**
   * Import game data from a backup file.
   * @param {BackupData} data backup to import
   * @param {IDBPDatabase} [db]   the database
   */
  async import (data, db = undefined) {
    const andClose = typeof (db) === 'undefined'
    db ??= await this.open()

    // save the data
    await this.saveGameInfo(data.GameInfo, db)
    await this.replacePlayers(data.Players, db)
    await this.replaceTrackers(data.Trackers, db)

    for (const scene of data.Scenes) {
      await this.saveSceneInfo(scene, db)
      await this.replaceTraits(scene.id, data.Traits[scene.id], db)
    }

    if (andClose) db.close()
  }
}
