import BgAudioManager from './bg-audio-page.js'
import '../input-progress/input-progress-element.js'
// @ts-ignore
import { openDB, deleteDB, wrap, unwrap } from 'https://cdn.jsdelivr.net/npm/idb@8/+esm';
/**
 * @typedef {IDBDatabase & {
 *  get, getKey, getAll, getAllKeys, count, put, add, delete, clear,
 *  getFromIndex, getKeyFromIndex, getAllFromIndex, getAllKeysFromIndex, countFromIndex
 * }} IDBDatabaseEntended
 * @note From the IDB library
 */


const DefaultShipUrl = 'gltf/starfleet-generic.glb'

const DefaultPlayerImages = [
    'img/player/voy.webp',
    'img/player/ds9.webp',
    'img/player/tng.webp',
    'img/player/ent.webp',
    'img/player/tos-movies.webp',
    'img/player/tng-cadet.webp'
]

const AlertConditions = [
    'condition-yellow',
    'condition-red',
    'condition-blue',
    'condition-black'
]

export default class IndexController {
    /**
     * Background Audio & Mute Manager
     * @type {BgAudioManager}
     */
    audioManager = new BgAudioManager()

    /**
     * Constructor.
     */
    constructor () {

        // Wire up audio
        const okAudio = document.getElementById('beep-ok-audio')
        const cancelAudio = document.getElementById('beep-cancel-audio')

        if (okAudio instanceof HTMLAudioElement === false || cancelAudio instanceof HTMLAudioElement === false)
            throw new Error('This page is wrong')

        const buttonEffects = (evtName, el, muted) => {
            // Audio
            if (muted)
                return
            const audioEl = evtName === 'click' ? okAudio : cancelAudio
            audioEl.currentTime = 0
            audioEl.play()
        }
        this.audioManager.setupElements('a[hover]', buttonEffects, undefined, buttonEffects)

        // Wire up buttons to their actions
        document.getElementById('alert-toggle').addEventListener('click', () => this.toggleAlerts())
        document.getElementById('extended-task-add').addEventListener('click', () => this.addExtendedTask())
        document.getElementById('player-add').addEventListener('click', () => this.addPlayer())
        document.getElementById('trait-add').addEventListener('click', () => this.addTrait())

        // Wire up the settings dialog
        const settingsDialog = document.getElementById('settings-dialog')
        if (settingsDialog instanceof HTMLDialogElement)
            this.#setupSettings(settingsDialog)

        this.#loadDBInfo()
        this.#loadCacheData()

        const modelViewers = document.getElementsByTagName('model-viewer')
        for (const viewer of modelViewers)
            IndexController.setupDragOnlyTarget(viewer, event => {
                if (!event.dataTransfer.items?.[0].type.startsWith('model/gltf') ||
                    !event.dataTransfer.files?.[0])
                   return false
                   
                this.onShipModelDropped(event.dataTransfer.files?.[0])
                return true
            })

        const players = document.querySelectorAll('ul.players li')
        for (const player of players) 
            IndexController.setupDragOnlyTarget(player, event => {
                if (player instanceof HTMLElement === false ||
                    !event.dataTransfer.items?.[0].type.startsWith('image') ||
                    !event.dataTransfer.files?.[0])
                    return false

                this.onPlayerImageDropped(player, event.dataTransfer.files?.[0])
                return true
            })
    }

    /**
     * 
     * @param {HTMLElement|any} el Element to set up drop but not drag for
     * @param {function(DragEvent):boolean} onDrop 
     */
    static setupDragOnlyTarget(el, onDrop) {
        if (el instanceof HTMLElement === false)
            throw new Error("Cannot use 'el' as HTMLElement argument!")

        el.addEventListener('dragenter', event => event.preventDefault())
        el.addEventListener('dragover', event => event.preventDefault())
        el.addEventListener('dragleave', event => event.preventDefault())
        el.addEventListener('drop', event => {
            if (event instanceof DragEvent === false || !onDrop(event))
                return

            event.preventDefault()
            event.stopPropagation()
        })
    }

    /**
     * Wire up all the settings
     * @param {HTMLDialogElement} dialogEl settings dialog element
     */
    #setupSettings(dialogEl) {
        document.getElementById('settings-btn').addEventListener('click', () => dialogEl.showModal())
        dialogEl.querySelector('button.close').addEventListener('click', () => dialogEl.close())
        dialogEl.querySelector('button.clear-ship').addEventListener('click', () => 
            this.clearCache('ship').then(() => this.#loadCacheData())
        )
        dialogEl.querySelector('button.clear-all').addEventListener('click', () => 
            this.clearCache().then(() => this.#loadCacheData())
        )
    }

    /**
     * @param {IDBDatabaseEntended} db
     */
    #createDB(db) {
        if (db.objectStoreNames.contains('general')) {
            db.deleteObjectStore('general')
            console.warn('cleared db for upgrade')
        }
        const store = db.createObjectStore('general', {
            keyPath: 'id',
            autoIncrement: false
        });
    }

    async #loadDBInfo() {
        /** @type {IDBDatabaseEntended} db */
        const db = await openDB('STAPlayApp-Test', 4, {
            upgrade: db => this.#createDB(db)
          });
        
        let hasInfo = await db.count('general') !== 0
        if (hasInfo) {
            /** @type {object} */
            let generalInfo = await db.get('general', 0)
            document.getElementById('general-text').innerHTML = generalInfo.text;
            document.getElementsByTagName('alert')[0].className = generalInfo.activeAlert;
        }
    }

    async saveDBInfo() {
        /** @type {IDBDatabaseEntended} db */
        const db = await openDB('STAPlayApp-Test', 4, {
            upgrade: db => this.#createDB(db)
          });
        
          await db.put('general', {
            id: 0, // Only One Row
            text: document.getElementById('general-text').innerHTML,
            activeAlert: document.getElementsByTagName('alert')[0].classList[0],
          });
    }

    async #loadCacheData() {
        let dirHandle = await navigator.storage.getDirectory()
        let shipDir = await dirHandle.getDirectoryHandle('ship', {create: true})
        let playersDir = await dirHandle.getDirectoryHandle('players', {create: true})

        // Load cached ship, if available
        try {
            let handle = await shipDir.getFileHandle('ship.glb', {create: false})
            let shipFile = await handle.getFile()
            this.#setShipModel(URL.createObjectURL(shipFile))
        }
        catch (ex)
        {
            // fallback to default
            this.#setShipModel(DefaultShipUrl)
        }

        const playerEls = document.querySelectorAll('ul.players li')
        for (const playerEl of playerEls)
        {
            if (playerEl instanceof HTMLElement === false)
                return;
            let i = playerEl.getAttribute('player-index');

            // Load cached player image, if available
            try {
                let handle = await playersDir.getFileHandle(`${i}`, {create: false})
                let playerFile = await handle.getFile()
                const url = URL.createObjectURL(playerFile)
                playerEl.style.backgroundImage = `url('${url}')`
            }
            catch (ex)
            {
                // fallback to default
                playerEl.style.backgroundImage = `url('${DefaultPlayerImages[i]}')`
            }
        }
    }

    /**
     * Cycle between the alert types and none.
     */
    toggleAlerts () {
        const alert = document.querySelector('alert')
        if (alert instanceof HTMLElement === false) 
            return

        const lastType = AlertConditions[AlertConditions.length - 1]
        if (alert.classList.contains(lastType)) {
            alert.classList.remove(lastType)
        }
        else if (alert.className === "") {
            alert.classList.add(AlertConditions[0])
        }
        else for (let i = 0; i < AlertConditions.length - 1; i++) {
            if (alert.classList.contains(AlertConditions[i])) {
                alert.classList.replace(AlertConditions[i], AlertConditions[i+1])
                break;
            }
        }

        const alertAudioEl = document.getElementById('beep-ok-audio') // TODO actual alert sound! that loops
        if (alertAudioEl instanceof HTMLAudioElement === false) return

        if (alert.classList.contains('condition-red')) {
            alertAudioEl.currentTime = 0
            alertAudioEl.play()
        } else alertAudioEl.pause()
    }

    /**
     * Add a new Combat / Extended task tracker to the page.
     */
    addExtendedTask () {
        const template = document.getElementById('extended-task-template')
        if (template instanceof HTMLTemplateElement === false)
            return

        const clone = document.importNode(template.content, true)
        template.parentElement.insertBefore(clone, template)
    }

    addTrait() {
        const template = document.querySelector('traits template')
        if (template instanceof HTMLTemplateElement === false)
            return

        const clone = document.importNode(template.content, true)
        template.parentElement.insertBefore(clone, template)
    }
    
    addPlayer() {
        throw new Error('Method not implemented.')
    }

    /**
     * Handler for new ship model drop
     * @param {File} modelFile  GLTF/GLB model file
     */
    async onShipModelDropped (modelFile) {
        let cacheFile = await this.cacheFile(modelFile, 'ship.glb', 'ship')
        const url = URL.createObjectURL(cacheFile)

        this.#setShipModel(url)
    }

    #setShipModel(url) {
        const modelViewers = document.getElementsByTagName('model-viewer')
        for (const viewer of modelViewers) {
            if ('src' in viewer)
                viewer.src = url
        }
    }

    /**
     * Handler for new ship model drop
     * @param {HTMLElement} playerEl    player element to change the background of
     * @param {File} imageFile          image to change player element background to
     */
    async onPlayerImageDropped (playerEl, imageFile) {
        let cacheFile = await this.cacheFile(imageFile, `${playerEl.getAttribute('player-index')}`, 'players')
        const url = URL.createObjectURL(cacheFile)
        playerEl.style.backgroundImage = `url('${url}')`
    }

    /**
     * Create and return a cached copy of a file
     * @param {File} inputFile file to cache
     * @param {string} newName filename for the cached copy
     * @param {string} folderName Name of the sub-folder to store it in
     * @returns cached file
     */
    async cacheFile(inputFile, newName = inputFile.name, folderName = 'default') {
        let dirHandle = await navigator.storage.getDirectory()
        let dir = await dirHandle.getDirectoryHandle(folderName, {create: true})
        let handle = await dir.getFileHandle(newName, {create: true})
        let writeable = await handle.createWritable()
        await writeable.write(inputFile)
        await writeable.close()

        return await handle.getFile()
    }
    
    async clearCache(folderName = undefined) {
        let dirHandle = await navigator.storage.getDirectory()

        if (folderName === undefined)
        {
            this.clearCache('default')
            this.clearCache('ship')
            this.clearCache('players')
        }
        else
            dirHandle.removeEntry(folderName, {recursive: true})
    }
}

globalThis.App ??= { Page: undefined }
globalThis.App.Page = new IndexController()
