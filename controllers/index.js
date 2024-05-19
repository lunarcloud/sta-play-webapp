import BgAudioManager from './bg-audio-page.js'
import '../input-progress/input-progress-element.js'
import {Database, GeneralInfo, PlayerInfo, TrackerInfo} from './database.js'

const DefaultShipUrl = 'gltf/starfleet-generic.glb'

const DefaultPlayerImages = [
    'img/player/ds9.webp',
    'img/player/voy.webp',
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

export class IndexController {
    /**
     * Background Audio & Mute Manager
     * @type {BgAudioManager}
     */
    audioManager = new BgAudioManager()

    dbLoadedCorrectly = false
    
    db = new Database()

    fallbackText

    fallbackShipName


    /**
     * Constructor.
     */
    constructor () {

        // Get default to fallback to
        this.fallbackText = document.getElementById('general-text').innerHTML
        this.fallbackShipName = document.getElementById('shipname').innerHTML

        // Wire up audio
        const okAudio = document.getElementById('beep-ok-audio')
        const cancelAudio = document.getElementById('beep-cancel-audio')

        if (okAudio instanceof HTMLAudioElement === false || cancelAudio instanceof HTMLAudioElement === false)
            throw new Error('This page is wrong')

        const buttonEffects = (evtName, _el, muted) => {
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
        document.getElementById('task-tracker-add').addEventListener('click', () => this.addExtendedTask())
        document.getElementById('player-add').addEventListener('click', () => this.addPlayer())
        document.getElementById('trait-add').addEventListener('click', () => this.addTrait())

        // Wire up the settings dialog
        const settingsDialog = document.getElementById('settings-dialog')
        if (settingsDialog instanceof HTMLDialogElement)
            this.#setupSettings(settingsDialog)

        // Load Images from Cache/Database
        this.#loadDBInfo()
        this.#loadShipFromCache()

        // Wire up Saving the DB on page close
        window.addEventListener("beforeunload", (event) => {
            // Stop loading anything more in the DOM (like images)
            window.stop();

            // Setup a boolean used in the "sleep"
            let canExit = false

            this.saveDBInfo().finally(() => canExit = true)

            // This nasty loop is because you can't actually 'await' the save
            let start = new Date().getTime();
            for (let i = 0; i < 1e7 && !canExit; i++) 
                if ((new Date().getTime() - start) > 2000) {
                    event.preventDefault()
                    break;
                }
        }, { capture: true, passive: false, once: false });

        // Setup Dropping 3D model on the Ship
        const modelViewers = document.getElementsByTagName('model-viewer')
        for (const viewer of modelViewers)
            IndexController.setupDragOnlyTarget(viewer, event => {
                if (!event.dataTransfer.items?.[0].type.startsWith('model/gltf') ||
                    !event.dataTransfer.files?.[0])
                   return false
                   
                this.onShipModelDropped(event.dataTransfer.files?.[0])
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
        dialogEl.querySelector('button.clear-ship').addEventListener('click', async () => {
            await this.clearCache('ship')
            this.#loadShipFromCache()
        })
        dialogEl.querySelector('button.clear-player-images').addEventListener('click', async () => {
            await this.clearCache('players')
            this.#loadShipFromCache()
        })
        dialogEl.querySelector('button.clear-info').addEventListener('click', async () => {
            await this.db.clear()
            this.#loadDBInfo()
        })
    }

    /**
     * Load information from the database into the page
     */
    async #loadDBInfo() {
        let dbToken = await this.db.open()

        let generalInfo = await this.db.getInfo(dbToken)
        
        let momentumEl = document.getElementById('momentum-pool');
        if (momentumEl instanceof HTMLInputElement === false)
            throw new Error("page setup incorrectly!");

        document.getElementById('general-text').innerHTML = generalInfo?.text ?? this.fallbackText
        document.getElementById('shipname').textContent = (generalInfo?.shipName ?? this.fallbackShipName).trim()
        momentumEl.value = `${(generalInfo?.momentum ?? 0)}`
        document.getElementsByTagName('alert')[0].className = (generalInfo?.activeAlert ?? '').trim();

        // remove existing traits
        document.querySelectorAll('traits trait').forEach(el => el.parentNode.removeChild(el))
        // Get all traits
        let traits = await this.db.getTraits(dbToken)
        for (let trait of traits)
            this.addTrait(trait)

        // remove existing players
        document.querySelectorAll('.players li').forEach(el => el.parentNode.removeChild(el))
        // Get all players
        let players = await this.db.getPlayers(dbToken)
        for (let player of players)
            this.addPlayer(player)

        // remove existing trackers
        document.querySelectorAll('task-tracker').forEach(el => el.parentNode.removeChild(el))
        // Get all trackers
        let trackers = await this.db.getTrackers(dbToken)
        for (let tracker of trackers)
            this.addExtendedTask(tracker)

        this.db.close(dbToken)
        this.dbLoadedCorrectly = true
    }

    /**
     * Save information from the page to the database
     */
    async saveDBInfo() {        
        if (!this.dbLoadedCorrectly)
            return

        let dbToken = await this.db.open()

        let momentumEl = document.getElementById('momentum-pool');
        if (momentumEl instanceof HTMLInputElement === false)
            throw new Error("page setup incorrectly!");

        await this.db.saveInfo(new GeneralInfo(
            document.getElementById('general-text').innerHTML,
            document.getElementById('shipname').textContent.trim(),
            momentumEl.value,
            document.getElementsByTagName('alert')[0].className.trim(),
        ), dbToken)


        const traits = 
            [...document.querySelectorAll('traits > trait > .name')]
            .map(e => e.textContent.trim())
            .filter((v, i, a) => a.indexOf(v) === i) // unique
        await this.db.replaceTraits(traits, dbToken)

        const players = [...document.querySelectorAll('.players > li')]
                .map((/** @type HTMLLIElement */ e) => {
                    let el = e
                    /** @type HTMLSelectElement */
                    const colorSelect = el.querySelector('select.color')
                    /** @type HTMLSelectElement */
                    const pipsSelect = el.querySelector('select.rank')
                    const stressEl = el.querySelector('input-progress')
                    
                    let info = new PlayerInfo(
                        parseInt(el.getAttribute('player-index')),
                        el.querySelector('.name').textContent,
                        parseInt(stressEl.getAttribute('value')),
                        parseInt(stressEl.getAttribute('max')),
                        pipsSelect.value,
                        colorSelect.value.trim()
                    )
                    return info
                })
        await this.db.replacePlayers(players, dbToken)

        const trackers = [...document.querySelectorAll('task-tracker')]
                .map(e => {
                    /** @type HTMLSelectElement */
                    let attributeSelect = e.querySelector('.attribute')
                    /** @type HTMLSelectElement */
                    let departmentSelect = e.querySelector('.department')
                    /** @type HTMLInputElement */
                    let resistanceInput = e.querySelector('.resistance')
                    /** @type HTMLInputElement */
                    let complicationRangeInput = e.querySelector('.complication-range')
                    /** @type HTMLInputElement */
                    let progressInput = e.querySelector('.progress')

                    
                    let info = new TrackerInfo(
                        e.querySelector('.name').textContent,
                        attributeSelect.value,
                        departmentSelect.value,
                        progressInput.value,
                        resistanceInput.value,
                        complicationRangeInput.value
                    )
                    return info
                })
        await this.db.replaceTrackers(trackers, dbToken)

        await this.db.close(dbToken)
    }

    async #loadShipFromCache() {
        let dirHandle = await navigator.storage.getDirectory()
        let shipDir = await dirHandle.getDirectoryHandle('ship', {create: true})

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
    }

    /**
     * Loads the image for the player
     * @param {number} playerIndex player-index value
     */
    async #loadPlayerImageFromCache(playerIndex, playerEl) {
        playerEl ??= document.querySelector(`player-${playerIndex}`)
        if (playerEl instanceof HTMLElement === false)
            throw new Error(`Player #${playerIndex} not found`)

        // Load cached player image, if available
        try {
            let dirHandle = await navigator.storage.getDirectory()
            let playersDir = await dirHandle.getDirectoryHandle('players', {create: true})
            let handle = await playersDir.getFileHandle(`${playerIndex}`, {create: false})
            let playerFile = await handle.getFile()
            const url = URL.createObjectURL(playerFile)
            playerEl.style.backgroundImage = `url('${url}')`
        }
        catch (ex)
        {
            // fallback to default
            playerEl.style.backgroundImage = `url('${DefaultPlayerImages[((playerIndex - 1) % DefaultPlayerImages.length)]}')`
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
     * @param {TrackerDBRow|undefined} info Player information
     */
    addExtendedTask(info = undefined) {
        const template = document.getElementById('task-tracker-template')
        if (template instanceof HTMLTemplateElement === false)
            return

        const clone = document.importNode(template.content, true)

        if (typeof(info) !== 'undefined') {
            clone.querySelector('.name').textContent = info.name

            let attributeSelect = clone.querySelector('.attribute')
            if (attributeSelect instanceof HTMLSelectElement)
                attributeSelect.value = info.attribute

            let departmentSelect = clone.querySelector('.department')
            if (departmentSelect instanceof HTMLSelectElement)
                departmentSelect.value = info.department

            let resistanceInput = clone.querySelector('.resistance')
            if (resistanceInput instanceof HTMLInputElement)
                resistanceInput.value = `${info.resistance}`

            let complicationRangeInput = clone.querySelector('.complication-range')
            if (complicationRangeInput instanceof HTMLInputElement)
                complicationRangeInput.value = `${info.complicationRange}`

            let progressInput = clone.querySelector('.progress')
            if (progressInput instanceof HTMLInputElement)
                progressInput.value = `${info.progressTrack}`
        }

        template.parentElement.insertBefore(clone, template)
    }

    /**
     * Add trait element to the screen
     * @param {string|undefined} name the name of the trait
     */
    addTrait(name = undefined) {
        const template = document.querySelector('traits template')
        if (template instanceof HTMLTemplateElement === false)
            return

        const clone = document.importNode(template.content, true)
        if (typeof(name) === 'string')
            clone.querySelector('trait > .name').textContent = name
        template.parentElement.insertBefore(clone, template)
    }
    
    /**
     * Add a player to the players list
     * @param {PlayerDBRow|undefined} info Player information
     */
    addPlayer(info = undefined) {
        const template = document.querySelector('.players template')
        if (template instanceof HTMLTemplateElement === false)
            return

        const clone = document.importNode(template.content, true)
        /** @type HTMLLIElement */
        let clonePlayer = clone.querySelector('li')
        let playerIndex = document.querySelectorAll('.players li').length

        if (typeof(info) !== 'undefined') {
            clone.querySelector('.name').textContent = info.name
            playerIndex = info.id
            
            clone.querySelector('stress > input-progress').setAttribute('value', `${info.currentStress}`)
            clone.querySelector('stress > input-progress').setAttribute('max', `${info.maxStress}`)
            clone.querySelector('stress > input').setAttribute('value', `${info.maxStress}`)

            let rankSelect = clone.querySelector(`select.rank`)
            if (rankSelect instanceof HTMLSelectElement)
                rankSelect.value = info.pips

            /** @type HTMLSelectElement */
            const colorSelect = clone.querySelector(`select.color`)
            colorSelect.value = info.borderColor.trim()
        } 
        
        if (clonePlayer.style.backgroundImage.trim() === '') 
            clonePlayer.style.backgroundImage = `url('${DefaultPlayerImages[playerIndex % DefaultPlayerImages.length]}')`
        

        clonePlayer.setAttribute('player-index', `${playerIndex}`)
        const playerId = `player-${playerIndex}`
        clonePlayer.id = playerId
        
        template.parentElement.insertBefore(clone, template)
        const newEl = document.getElementById(playerId)
        
        // Wire events
        /** @type HTMLSelectElement */
        const colorSelect = newEl.querySelector(`select.color`)
        newEl.className = `border-${colorSelect.value}`
        colorSelect.addEventListener('change', () => newEl.className = `border-${colorSelect.value}`)

        // Get Image from cache (if not new)
        if (typeof(info) !== 'undefined')
            this.#loadPlayerImageFromCache(playerIndex, newEl)
        
        // Support Dropping images on the Player
        IndexController.setupDragOnlyTarget(newEl, event => {
            if (!event.dataTransfer.items?.[0].type.startsWith('image') ||
                !event.dataTransfer.files?.[0])
                return false

            this.onPlayerImageDropped(newEl, event.dataTransfer.files?.[0])
            return true
        })
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
