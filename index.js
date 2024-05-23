import BgAudioManager from './js/bg-audio-page.js'
import './components/input-progress/input-progress-element.js'
import {Database, GeneralInfo, PlayerInfo, TrackerInfo} from './js/database.js'
import 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js'

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

    safeToSaveDB = false
    
    db = new Database()

    fallbackText

    fallbackShipName

    /**
     * @type {object|undefined}
     */
    shipModel = undefined

    /**
     * @type {Map<number, object>}
     */
    playerImages = new Map()

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
        document.getElementById('save-btn').addEventListener('click', () => this.saveData())

        // Wire up the welcome dialog
        const welcomeDialog = document.getElementById('welcome-dialog')
        if (welcomeDialog instanceof HTMLDialogElement === false)
            throw new Error('HTML setup incorrect!')

        welcomeDialog.querySelector('button.close').addEventListener('click', () => welcomeDialog.close())

        // Wire up the settings dialog
        const settingsDialog = document.getElementById('settings-dialog')
        if (settingsDialog instanceof HTMLDialogElement === false)
            throw new Error('HTML setup incorrect!')

        this.#setupSettings(settingsDialog, welcomeDialog)

        // Setup Dropping 3D model on the Ship
        const modelViewers = document.getElementsByTagName('model-viewer')
        for (const viewer of modelViewers)
            IndexController.setupDragOnlyTarget(viewer, event => {
                if (!event.dataTransfer.items?.[0].type.startsWith('model/gltf') ||
                    !event.dataTransfer.files?.[0])
                   return false
                   
                this.setShipModel(event.dataTransfer.files?.[0])
                return true
            })
        
        // Load Info and Images from Database
        try {
            this.#loadData().then(hadData => {
                if (!hadData)
                    welcomeDialog.showModal() // Show Welcome Dialog the first time
            })
        } catch (e) {
            console.error(e)
        }

        // Keyboard Shortcuts
        window.addEventListener('keydown', e => {
            if(e.ctrlKey && e.key == 's'){
              e.preventDefault();
              this.saveData()
            }
            else if (e.key == 'F1' ) {
                e.preventDefault();
                welcomeDialog.showModal()
            }
            else if (e.ctrlKey && e.key == ',') {
                e.preventDefault();
                settingsDialog.showModal()
            }
        });
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
    #setupSettings(dialogEl, welcomeDialogEl) {
        document.getElementById('settings-btn').addEventListener('click', () => dialogEl.showModal())
        dialogEl.querySelector('button.close').addEventListener('click', () => dialogEl.close())
        dialogEl.querySelector('button.clear-info').addEventListener('click', async () => {
            await this.db.clear()
            this.#loadData()
        })

        let fileSelectShip = dialogEl.querySelector('input.select-ship')
        if (fileSelectShip instanceof HTMLInputElement === false)
            throw new Error('Page setup incorrect')
        dialogEl.querySelector('button.set-ship').addEventListener('click', () => {
            this.setShipModel(fileSelectShip.files[0])
        })

        let fileSelectPlayer = dialogEl.querySelector('.player-image-upload input.select')
        if (fileSelectPlayer instanceof HTMLInputElement === false)
            throw new Error('Page setup incorrect')
        let indexSelectPlayer = dialogEl.querySelector('.player-image-upload input.index')
        if (indexSelectPlayer instanceof HTMLInputElement === false)
            throw new Error('Page setup incorrect')

        dialogEl.querySelector('.player-image-upload button.set').addEventListener('click', () => {
            let index = parseInt(indexSelectPlayer.value) - 1 // convert 1-based to 0-based
            let playerEl = document.querySelector(`.players li[player-index='${index}']`)
            if (playerEl instanceof HTMLElement)
                this.setPlayerImage(playerEl, fileSelectPlayer.files[0])
        })

        dialogEl.querySelector('button.show-welcome').addEventListener('click', () => welcomeDialogEl.showModal())
    }

    /**
     * Load information from the database into the page
     * @returns {Promise<boolean>} if there was info to load
     */
    async #loadData() {
        let dbToken = await this.db.open()

        try {
            let generalInfo = await this.db.getInfo(dbToken)
            
            let momentumEl = document.getElementById('momentum-pool');
            if (momentumEl instanceof HTMLInputElement === false)
                throw new Error("page setup incorrectly!");

            document.getElementById('general-text').innerHTML = generalInfo?.text ?? this.fallbackText
            document.getElementById('shipname').textContent = (generalInfo?.shipName ?? this.fallbackShipName).trim()
            momentumEl.value = `${(generalInfo?.momentum ?? 0)}`
            document.getElementsByTagName('alert')[0].className = (generalInfo?.activeAlert ?? '').trim();
            this.setShipModel(generalInfo?.shipModel)

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

            this.safeToSaveDB = true
            return typeof(generalInfo) !== 'undefined'
        } finally {
            this.db.close(dbToken)
        }
    }

    /**
     * Save information from the page to the database
     */
    async saveData() {
        let dbToken = await this.db.open()

        let momentumEl = document.getElementById('momentum-pool');
        if (momentumEl instanceof HTMLInputElement === false)
            throw new Error("page setup incorrectly!");

        await this.db.saveInfo(new GeneralInfo(
            document.getElementById('general-text').innerHTML,
            document.getElementById('shipname').textContent.trim(),
            momentumEl.value,
            document.getElementsByTagName('alert')[0].className.trim(),
            this.shipModel
        ), dbToken)


        const traits = 
            [...document.querySelectorAll('traits > trait > .name')]
            .map(e => e.textContent.trim())
            .filter((v, i, a) => a.indexOf(v) === i) // unique
        await this.db.replaceTraits(traits, dbToken)

        const players = [...document.querySelectorAll('.players > li')]
                .map((/** @type HTMLLIElement */ e) => {
                    let el = e
                    let index = parseInt(el.getAttribute('player-index'))
                    /** @type HTMLSelectElement */
                    const colorSelect = el.querySelector('select.color')
                    /** @type HTMLSelectElement */
                    const pipsSelect = el.querySelector('select.rank')
                    const stressEl = el.querySelector('input-progress')
                    
                    let info = new PlayerInfo(
                        index,
                        el.querySelector('.name').textContent,
                        parseInt(stressEl.getAttribute('value')),
                        parseInt(stressEl.getAttribute('max')),
                        pipsSelect.value,
                        colorSelect.value.trim(),
                        this.playerImages?.[index]
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

        this.safeToSaveDB = true
        alert('Database Updated')
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
        
        clonePlayer.setAttribute('player-index', `${playerIndex}`)
        const playerId = `player-${playerIndex}`
        clonePlayer.id = playerId

        if (info?.image instanceof File) 
            this.setPlayerImage(clonePlayer, info.image)
        else
            clonePlayer.style.backgroundImage = `url('${DefaultPlayerImages[playerIndex % DefaultPlayerImages.length]}')`
        
        
        template.parentElement.insertBefore(clone, template)
        const newEl = document.getElementById(playerId)
        
        // Wire events
        /** @type HTMLSelectElement */
        const colorSelect = newEl.querySelector(`select.color`)
        newEl.className = `border-${colorSelect.value}`
        colorSelect.addEventListener('change', () => newEl.className = `border-${colorSelect.value}`)
        
        // Support Dropping images on the Player
        IndexController.setupDragOnlyTarget(newEl, event => {
            if (!event.dataTransfer.items?.[0].type.startsWith('image') ||
                !event.dataTransfer.files?.[0])
                return false

            this.setPlayerImage(newEl, event.dataTransfer.files?.[0])
            return true
        })

        // add player to the settings page selector
        let settingsPlayerEl = document.querySelector('#settings-dialog .player-image-upload input.index')
        if (settingsPlayerEl instanceof HTMLInputElement) {
            if (parseInt(settingsPlayerEl.max) < playerIndex+1)
                settingsPlayerEl.max = `${playerIndex+1}`
        }
    }

    /**
     * Handler for new ship model drop
     * @param {File} modelFile  GLTF/GLB model file
     */
    async setShipModel (modelFile) {
        this.shipModel = modelFile
        this.#updateShipSrc()
    }

    #updateShipSrc() {
        const url = this.shipModel instanceof File 
            ? URL.createObjectURL(this.shipModel)
            : DefaultShipUrl
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
    async setPlayerImage (playerEl, imageFile) {
        const index = playerEl.getAttribute('player-index')
        this.playerImages[index] = imageFile
        const url = URL.createObjectURL(imageFile)
        playerEl.style.backgroundImage = `url('${url}')`
    }
}

globalThis.App ??= { Page: undefined }
globalThis.App.Page = new IndexController()
