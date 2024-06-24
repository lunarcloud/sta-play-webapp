import BgAudioManager from './js/bg-audio-page.js'
import './components/input-progress/input-progress-element.js'
import './components/trait-display/trait-display-element.js'
import './components/welcome-dialog/welcome-dialog-element.js'
import './components/settings-dialog/settings-dialog-element.js'
import './components/player-display/player-display-element.js'
import './components/task-tracker/task-tracker-element.js'
import { Database } from './js/database/database.js'
import { TrackerInfo } from './js/database/tracker-info.js'
import { PlayerInfo } from './js/database/player-info.js'
import { GameInfo } from './js/database/game-info.js'
import 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js'
import ShipAlertElement from './components/ship-alert/ship-alert-element.js'
import { setupDropOnly } from './js/drop-nodrag-setup.js'
import { loadElementFromFile } from './js/load-file-element.js'

const DefaultShipUrl = 'gltf/starfleet-generic.glb'

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
     * Milliseconds to wait until another toggle is allowed
     * @type {number}
     */
    #debounceAmount = 300

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
        document.getElementById('task-tracker-add').addEventListener('click', () => this.addTaskTracker())
        document.getElementById('player-add').addEventListener('click', () => this.addPlayer())
        document.getElementById('trait-add').addEventListener('click', () => this.addTrait())
        let saveBtn = document.getElementById('save-btn')
        saveBtn.addEventListener('click', () => {
            // Debounce
            saveBtn.setAttribute('disabled', '')
            setTimeout(() => saveBtn.removeAttribute('disabled'), this.#debounceAmount);
            // Do
            this.saveData()
        })

        const alertEl = document.getElementsByTagName('ship-alert')[0]
        if (alertEl instanceof ShipAlertElement)
            document.getElementById('alert-toggle').addEventListener('click', () => {
            alertEl.cycle()
        })


        // Wire up the welcome dialog
        const welcomeDialog = document.querySelector('dialog[is="welcome-dialog"]')
        if (welcomeDialog instanceof HTMLDialogElement === false)
            throw new Error('Welcome dialog not setup!')

        // Wire up the settings dialog
        const settingsDialog = document.querySelector('dialog[is="settings-dialog"]')
        if (settingsDialog instanceof HTMLDialogElement === false)
            throw new Error('HTML setup incorrect!')

        this.#setupSettings(settingsDialog, welcomeDialog)

        // Setup Dropping 3D model on the Ship
        const modelViewers = document.getElementsByTagName('model-viewer')
        for (const viewer of modelViewers)
            setupDropOnly(viewer, event => {
                if (!event.dataTransfer.items?.[0].type.startsWith('model/gltf') ||
                    !event.dataTransfer.files?.[0])
                    return false

                this.setShipModel(event.dataTransfer.files?.[0])
                return true
            })

        // Setup Theme & Selection
        const themeSelectEl = document.getElementById('select-theme')
        if (themeSelectEl instanceof HTMLSelectElement === false)
            throw new Error('Theme selector element is wrong/missing!')

        const themeStyleEl = document.getElementById('theme-link')
        if (themeStyleEl instanceof HTMLLinkElement === false)
            throw new Error('Theme CSS link element is wrong/missing!')

        themeSelectEl.addEventListener('change', () => this.#useTheme(themeSelectEl.value));

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
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault()
                this.saveData()
            } else if (e.key === 'F1') {
                e.preventDefault()
                welcomeDialog.showModal()
            } else if (e.ctrlKey && e.key === ',') {
                e.preventDefault()
                settingsDialog.showModal()
            }
        })

    }

    /**
     * Set an element up as a drop zone (not draggable).
     * @param {HTMLElement|any} el Element to set up drop but not drag for
     * @param {function(DragEvent):boolean} onDrop  Action to perform within the drop event handler
     */
    static setupDropOnly (el, onDrop) {
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
     * Set the page to a particular theme
     * @param {string} theme name of the theme
     */
    #useTheme(theme) {
        // Get elements
        const themeSelectEl = document.getElementById('select-theme')
        if (themeSelectEl instanceof HTMLSelectElement === false)
            throw new Error('Theme selector element is wrong/missing!')

        const themeStyleEl = document.getElementById('theme-link')
        if (themeStyleEl instanceof HTMLLinkElement === false)
            throw new Error('Theme CSS link element is wrong/missing!')

        const themeEl = document.getElementsByTagName('theme')[0]
        if (themeEl instanceof HTMLElement === false)
            throw new Error('Theme element is wrong/missing!')

        // Set elements
        themeEl.setAttribute('value', theme)
        themeSelectEl.value = theme

        // Update Style and theme element contents
        themeStyleEl.href = `./themes/${theme}/theme.css`
        loadElementFromFile(`./themes/${theme}/theme.html`, 'theme').then(el => {
            if (el instanceof HTMLElement === false)
                throw new Error(`Cannot find theme: "${theme}"`)
            themeEl.innerHTML = el.innerHTML
        })
    }

    /**
     * Set the page's text to a particular gaem edition
     * @param {1|2} edition   the number of the rules edition to use
     */
    #useEdition(edition) {
        const editionSelectEl = document.getElementById('select-edition')
        if (editionSelectEl instanceof HTMLSelectElement === false)
            throw new Error('Theme selector element is wrong/missing!')
        editionSelectEl.value = `${edition}`

        document.body.classList.remove('edition-1', 'edition-2')
        document.body.classList.add(`edition-${edition}`)
    }

    /**
     * Wire up all the settings.
     * @param {HTMLDialogElement} dialogEl                      settings dialog element
     * @param {HTMLDialogElement|undefined} welcomeDialogEl     the welcome dialog element
     */
    #setupSettings (dialogEl, welcomeDialogEl) {
        document.getElementById('settings-btn').addEventListener('click', () => dialogEl.showModal())
        dialogEl.querySelectorAll('button.close').forEach(el => el.addEventListener('click', () => dialogEl.close()))
        dialogEl.querySelector('button.clear-info').addEventListener('click', async () => {
            await this.db.clear()
            this.#loadData()
        })

        const fileSelectShip = dialogEl.querySelector('input.select-ship')
        if (fileSelectShip instanceof HTMLInputElement === false)
            throw new Error('Page setup incorrect')
        dialogEl.querySelector('button.set-ship').addEventListener('click', () => {
            this.setShipModel(fileSelectShip.files[0])
        })

        const fileSelectPlayer = dialogEl.querySelector('.player-image-upload input.select')
        if (fileSelectPlayer instanceof HTMLInputElement === false)
            throw new Error('Page setup incorrect')
        const indexSelectPlayer = dialogEl.querySelector('.player-image-upload input.index')
        if (indexSelectPlayer instanceof HTMLInputElement === false)
            throw new Error('Page setup incorrect')

        dialogEl.querySelector('.player-image-upload button.set').addEventListener('click', () => {
            const index = parseInt(indexSelectPlayer.value) - 1 // convert 1-based to 0-based
            const playerEl = document.querySelector(`.players li[player-index='${index}']`)
            if (playerEl instanceof PlayerDisplayElement)
                playerEl.imageFile = fileSelectPlayer.files[0]
        })

        dialogEl.querySelector('button.show-welcome').addEventListener('click', () => welcomeDialogEl?.showModal())

        // Setup Edition & Selection
        const editionSelectEl = document.getElementById('select-edition')
        if (editionSelectEl instanceof HTMLSelectElement === false)
            throw new Error('Theme selector element is wrong/missing!')

        editionSelectEl.addEventListener('change', () => {
             this.#useEdition(editionSelectEl.value == '1' ? 1 : 2)
        });
    }

    /**
     * Load information from the database into the page
     * @param {string}  [gameName]      the name of the game to load
     * @returns {Promise<boolean>}      if there was info to load
     */
    async #loadData (gameName = 'Default Game') {
        const dbToken = await this.db.open()

        try {
            const generalInfo = await this.db.getGameInfo(gameName, dbToken)

            const momentumEl = document.getElementById('momentum-pool')
            if (momentumEl instanceof HTMLInputElement === false)
                throw new Error('page setup incorrectly!')

            const editionSelectEl = document.getElementById('select-edition')
            if (editionSelectEl instanceof HTMLSelectElement === false)
                throw new Error('Theme selector element is wrong/missing!')

            document.body.setAttribute('loaded-game-name', generalInfo.name)
            document.getElementById('general-text').innerHTML = generalInfo?.text ?? this.fallbackText
            document.getElementById('shipname').textContent = (generalInfo?.shipName ?? this.fallbackShipName).trim()
            momentumEl.value = `${(generalInfo?.momentum ?? 0)}`
            document.getElementsByTagName('ship-alert')[0].setAttribute('color', (generalInfo?.activeAlert ?? '').trim())
            this.#useTheme(generalInfo?.theme ?? 'lcars-24')
            this.#useEdition(generalInfo?.edition == 1 ? 1 : 2)

            this.setShipModel(generalInfo?.shipModel)

            // remove existing traits
            document.querySelectorAll('trait-display').forEach(el => el.parentNode.removeChild(el))
            // Get all traits
            const traits = await this.db.getTraits(generalInfo.name, dbToken)
            for (const trait of traits)
                this.addTrait(trait)

            // remove existing players
            document.querySelectorAll('.players li').forEach(el => el.parentNode.removeChild(el))
            // Get all players
            const players = await this.db.getPlayers(generalInfo.name, dbToken)
            for (const player of players)
                this.addPlayer(player)

            // remove existing trackers
            document.querySelectorAll('task-tracker').forEach(el => el.parentNode.removeChild(el))
            // Get all trackers
            const trackers = await this.db.getTrackers(generalInfo.name, dbToken)
            for (const tracker of trackers)
                this.addTaskTracker(tracker)

            this.safeToSaveDB = true
            return typeof (generalInfo) !== 'undefined'
        } finally {
            dbToken.close()
        }
    }

    /**
     * Save information from the page to the database
     */
    async saveData () {
        const dbToken = await this.db.open()

        const momentumEl = document.getElementById('momentum-pool')
        if (momentumEl instanceof HTMLInputElement === false)
            throw new Error('page setup incorrectly!')

        const editionSelectEl = document.getElementById('select-edition')
        if (editionSelectEl instanceof HTMLSelectElement === false)
            throw new Error('Edition selector element is wrong/missing!')

        const themeSelectEl = document.getElementById('select-theme')
        if (themeSelectEl instanceof HTMLSelectElement === false)
            throw new Error('Theme selector element is wrong/missing!')

        const shipAlertEl = document.getElementsByTagName('ship-alert')[0]
        if (shipAlertEl instanceof ShipAlertElement === false)
            throw new Error('Ship alert element is wrong/missing!')

        const gameName = document.body.getAttribute('loaded-game-name') || 'Default Game'

        await this.db.saveGameInfo(new GameInfo(
            gameName,
            document.getElementById('general-text').innerHTML,
            document.getElementById('shipname').textContent.trim(),
            momentumEl.value,
            shipAlertEl.color,
            themeSelectEl.value,
            editionSelectEl.value === '1' ? 1 : 2,
            this.shipModel
        ), dbToken)

        const traits =
            [...document.querySelectorAll('traits trait-display')]
                .map(el => (el instanceof TraitDisplayElement ? el.text : ''))
                .filter(el => !!el)
                .filter((v, i, a) => a.indexOf(v) === i) // unique
        await this.db.replaceTraits(traits, dbToken)

        const players = [...document.querySelectorAll('.players > li')]
            .map((el) => {
                if (el instanceof PlayerDisplayElement === false)
                    return
                const info = new PlayerInfo(
                    el.playerIndex,
                    el.name,
                    el.currentStress,
                    el.maxStress,
                    el.rank,
                    el.color,
                    el.imageFile
                )
                return info
            })
        await this.db.replacePlayers(players, dbToken)

        const trackers = [...document.querySelectorAll('task-tracker')]
            .map(el => {
                if (el instanceof TaskTrackerElement === false)
                    return

                const info = new TrackerInfo(
                    el.name,
                    el.attribute,
                    el.department,
                    el.shipSystem,
                    el.shipDepartment,
                    el.progress,
                    el.resistance,
                    el.complicationRange
                )
                return info
            })
        await this.db.replaceTrackers(trackers, dbToken)
        dbToken.close()

        this.safeToSaveDB = true
        alert('Database Updated')
    }

    /**
     * Add a new Combat / Extended task tracker to the page.
     * @param {TrackerInfo|undefined} info Player information
     */
    addTaskTracker (info = undefined) {
        const newTrackerEl = document.createElement('task-tracker' )
        if (newTrackerEl instanceof TaskTrackerElement === false)
            throw new Error('App incorrectly configured!')

        if (typeof (info) !== 'undefined') {
            newTrackerEl.name = info.name
            newTrackerEl.attribute = info.attribute
            newTrackerEl.department = info.department
            newTrackerEl.shipSystem = info.shipSystem
            newTrackerEl.shipDepartment = info.shipDepartment
            newTrackerEl.resistance = `${info.resistance}`
            newTrackerEl.complicationRange = `${info.complicationRange}`
            newTrackerEl.progress = `${info.progressTrack}`
        }

        document.querySelector('task-trackers').appendChild(newTrackerEl)
    }

    /**
     * Add trait element to the screen
     * @param {string|undefined} name the name of the trait
     */
    addTrait (name = undefined) {
        let traitEl = document.createElement('trait-display')
        if (typeof (name) === 'string')
            traitEl.setAttribute('text', name)

        const traitsEl = document.getElementsByTagName('traits')[0]
        traitsEl.appendChild(traitEl)
    }

    /**
     * Add a player to the players list
     * @param {PlayerInfo|undefined} info Player information
     */
    addPlayer (info = undefined) {
        const playersEl = document.querySelector('.players')
        const newPlayerEl = document.createElement('li', { is: 'player-display' })
        if (newPlayerEl instanceof PlayerDisplayElement === false)
            throw new Error('App incorrectly configured!')

        let playerIndex = document.querySelectorAll('.players li').length

        if (typeof (info) !== 'undefined') {
            playerIndex = info.id
            newPlayerEl.setAttribute('name', info.name)
            newPlayerEl.setAttribute('current-stress', `${info.currentStress}`)
            newPlayerEl.setAttribute('max-stress', `${info.maxStress}`)
            newPlayerEl.setAttribute('rank', info.pips)
            newPlayerEl.setAttribute('color', info.borderColor.trim())
        }

        newPlayerEl.setAttribute('player-index', `${playerIndex}`)
        const playerId = `player-${playerIndex}`
        newPlayerEl.id = playerId

        if (info?.image instanceof File)
            newPlayerEl.imageFile = info.image
        else
            newPlayerEl.setDefaultImage()

        playersEl.appendChild(newPlayerEl)

        // add player to the settings page selector
        const settingsPlayerEl = document.querySelector('dialog[is="settings-dialog"] .player-image-upload input.index')
        if (settingsPlayerEl instanceof HTMLInputElement) {
            if (parseInt(settingsPlayerEl.max) < playerIndex + 1)
                settingsPlayerEl.max = `${playerIndex + 1}`

            newPlayerEl.addEventListener('removed', () => {
                let playerCount = document.querySelectorAll('.players li').length
                settingsPlayerEl.max = `${playerCount - 1}`
                settingsPlayerEl.value = `1` // reset so it's not above max
            })
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

    #updateShipSrc () {
        const url = this.shipModel instanceof File
            ? URL.createObjectURL(this.shipModel)
            : DefaultShipUrl
        const modelViewers = document.getElementsByTagName('model-viewer')
        for (const viewer of modelViewers) {
            if ('src' in viewer)
                viewer.src = url
        }
    }

}

globalThis.App ??= { Page: undefined }
globalThis.App.Page = new IndexController()
