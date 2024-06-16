// @ts-ignore
import { openDB, deleteDB } from 'https://cdn.jsdelivr.net/npm/idb@8/+esm'
import { GameInfo } from './game-info.js'
import { NamedInfo } from './named-info.js'
import { PlayerInfo } from './player-info.js'
import { TrackerInfo } from './tracker-info.js'

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
const DB_VERSION = 5
const STORE = {
    GAMES: 'games',
    SCENES: 'scenes',
    TRAITS: 'traits',
    PLAYERS: 'players',
    TRACKERS: 'trackers'
}
const INDEX = {
    ID: 'id',
    NAME: 'name'
}

export class Database {
    async clear () {
        await deleteDB(DB_NAME)
    }

    /**
     * Open and return the database reference
     * @returns {Promise<IDBPDatabase>}    handle to the database
     */
    async open () {
        return await openDB(DB_NAME, DB_VERSION, { upgrade: db => this.#upgrade(db) })
    }

    /**
     * Upgrade the database
     * @param {IDBPDatabase} db the database
     */
    #upgrade (db) {
        this.#create(db) // currently, no fancy upgrade logic, just replace
    }

    /**
     * Create the database
     * @param {IDBPDatabase} db the database
     */
    #create (db) {
        if (db.objectStoreNames.contains(STORE.GAMES))
            db.deleteObjectStore(STORE.GAMES)
        if (db.objectStoreNames.contains(STORE.TRAITS))
            db.deleteObjectStore(STORE.TRAITS)
        if (db.objectStoreNames.contains(STORE.PLAYERS))
            db.deleteObjectStore(STORE.PLAYERS)
        if (db.objectStoreNames.contains(STORE.TRACKERS))
            db.deleteObjectStore(STORE.TRACKERS)

        console.warn('cleared db for upgrade')
        db.createObjectStore(STORE.GAMES, { keyPath: INDEX.ID, autoIncrement: false })

        const traitStore = db.createObjectStore(STORE.TRAITS, { keyPath: INDEX.ID, autoIncrement: true })
        traitStore.createIndex(INDEX.NAME, INDEX.NAME, { unique: true })

        const playerStore = db.createObjectStore(STORE.PLAYERS, { keyPath: INDEX.ID, autoIncrement: true })
        playerStore.createIndex(INDEX.NAME, INDEX.NAME, { unique: false })

        const trackerStore = db.createObjectStore(STORE.TRACKERS, { keyPath: INDEX.ID, autoIncrement: true })
        trackerStore.createIndex(INDEX.NAME, INDEX.NAME, { unique: true })
    }

    /**
     * Get the game info from the database
     * @param {IDBPDatabase|undefined} db           the database (else we'll open a new one)
     * @returns {Promise<GameInfo|undefined>}       the general database information
     */
    async getGameInfo (db = undefined) {
        const andClose = typeof (db) === 'undefined'
        db ??= await openDB(DB_NAME, DB_VERSION, { upgrade: db => this.#upgrade(db) })

        const row = await db.count(STORE.GAMES) !== 0 // has info
            ? await db.get(STORE.GAMES, 0)
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
     * @param {IDBPDatabase|undefined} db   the database (else we'll open a new one)
     * @returns {Promise<string[]>}         the list of scene traits
     */
    async getTraits (db = undefined) {
        const andClose = typeof (db) === 'undefined'
        db ??= await openDB(DB_NAME, DB_VERSION, { upgrade: db => this.#upgrade(db) })

        /** @type {NamedInfo[]} */
        const rows = await db.getAll(STORE.TRAITS)
        const traits = rows.map(e => e.name)
        if (andClose) db.close()
        return traits
    }

    /**
     * Get the players from the database
     * @param {IDBPDatabase|undefined} db   the database (else we'll open a new one)
     * @returns {Promise<PlayerInfo[]>}     the information for all players
     */
    async getPlayers (db = undefined) {
        const andClose = typeof (db) === 'undefined'
        db ??= await openDB(DB_NAME, DB_VERSION, { upgrade: db => this.#upgrade(db) })

        const rows = await db.getAll(STORE.PLAYERS)
        if (andClose) db.close()
        /** @type {PlayerInfo[]} */
        const data = rows.map(e => {
            /** @type {PlayerInfo} */
            const item = Object.create(PlayerInfo.prototype)
            Object.assign(item, e)
            return item
        })
        return data
    }

    /**
     * Get the trackers from the database
     * @param {IDBPDatabase|undefined} db   the database (else we'll open a new one)
     * @returns {Promise<TrackerInfo[]>}    the information for all trackers
     */
    async getTrackers (db = undefined) {
        const andClose = typeof (db) === 'undefined'
        db ??= await openDB(DB_NAME, DB_VERSION, { upgrade: db => this.#upgrade(db) })

        const rows = await db.getAll(STORE.TRACKERS)
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
     * Get the game info from the database
     * @param {GameInfo} info  data to save
     * @param {IDBPDatabase|undefined} db the database (else we'll open a new one)
     */
    async saveGameInfo (info, db = undefined) {
        if (!info.validate()) {
            console.error("Invalid info, will not save!")
        }

        const andClose = typeof (db) === 'undefined'
        db ??= await openDB(DB_NAME, DB_VERSION, { upgrade: db => this.#upgrade(db) })

        info.id = 0 // enforce only a single row
        db.put(STORE.GAMES, info)
        if (andClose) db.close()
    }

    /**
     * Replace data of a store in the database with new ones
     * @param {string} storeName                Name of the store
     * @param {string} clearIndex               the name of the index to clear
     * @param {any[]} data                      array of info to add
     * @param {IDBPDatabase|IDBDatabase} [db]   the database
     */
    async #replaceData (storeName, clearIndex = INDEX.NAME, data = [], db = undefined) {
        const andClose = typeof (db) === 'undefined'
        db ??= await openDB(DB_NAME, DB_VERSION, { upgrade: db => this.#upgrade(db) })

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
        for (const info of data)
            adds.push(transaction.store.add(info))
        adds.push(transaction.done)
        await Promise.all(adds)
        if (andClose) db.close()
    }

    /**
     * Replace the traits in the database with new ones
     * @param {string[]} traitNames     names of all the traits
     * @param {IDBPDatabase|IDBDatabase} [db] the database
     */
    async replaceTraits (traitNames = [], db = undefined) {
        const traits = traitNames.map(e => new NamedInfo(e))
        this.#replaceData(STORE.TRAITS, INDEX.NAME, traits, db)
    }

    /**
     * Replace the trackers in the database with new ones
     * @param {TrackerInfo[]} trackers all the current tracker infos
     * @param {IDBPDatabase|IDBDatabase} [db] the database
     */
    async replaceTrackers (trackers = [], db = undefined) {

        const validTrackers = trackers.filter(t => t.validate())
        if (validTrackers.length !== trackers.length)
        {
            console.error("Invalid trackers provided: %o", trackers.filter(t => !t.validate()));
        }

        this.#replaceData(STORE.TRACKERS, INDEX.NAME, validTrackers, db)
    }

    /**
     * Replace the players in the database with new ones
     * @param {PlayerInfo[]} players all the current player infos
     * @param {IDBPDatabase|IDBDatabase} [db] the database
     */
    async replacePlayers (players = [], db = undefined) {
        this.#replaceData(STORE.PLAYERS, INDEX.NAME, players, db)
    }
}
