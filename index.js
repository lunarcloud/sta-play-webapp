import { BgAudioManager } from './js/bg-audio-page.js'
import './components/input-progress/input-progress-element.js'
import { MissionTrackerElement } from './components/mission-tracker/mission-tracker-element.js'
import { TraitDisplayElement } from './components/trait-display/trait-display-element.js'
import './components/welcome-dialog/welcome-dialog-element.js'
import './components/settings-dialog/settings-dialog-element.js'
import './components/importing-dialog/importing-dialog-element.js'
import { PlayerDisplayElement } from './components/player-display/player-display-element.js'
import { TaskTrackerElement } from './components/task-tracker/task-tracker-element.js'
import { Database } from './js/database/database.js'
import { TrackerInfo } from './js/database/tracker-info.js'
import { PlayerInfo } from './js/database/player-info.js'
import { DefaultGameName, GameInfo } from './js/database/game-info.js'
import 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js'
import { ShipAlertElement } from './components/ship-alert/ship-alert-element.js'
import { setupDropOnly } from './js/drop-nodrag-setup.js'
import { loadElementFromFile } from './js/load-file-element.js'
import { SceneInfo } from './js/database/scene-info.js'
import { saveBlobAs } from './js/save-file-utils.js'
import { BackupData } from './js/database/backup-data.js'

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
     * @type {number|undefined}
     */
    currentGameId

    /**
     * @type {number|undefined}
     */
    currentSceneId

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
        const saveBtn = document.getElementById('save-btn')
        saveBtn.addEventListener('click', () => {
            // Debounce
            saveBtn.setAttribute('disabled', '')
            setTimeout(() => saveBtn.removeAttribute('disabled'), this.#debounceAmount)
            // Do
            this.saveData()
        })

        // load this device's last known font size
        this.#loadFontSize()
        // Wire up font size change buttons
        document.getElementById('font-up-btn').addEventListener('click', () => this.#editFontSize(0.25))
        document.getElementById('font-down-btn').addEventListener('click', () => this.#editFontSize(-0.25))

        const alertEl = document.getElementsByTagName('ship-alert')[0]
        if (alertEl instanceof ShipAlertElement)
            document.getElementById('alert-toggle').addEventListener('click', () => {
                alertEl.cycle()
            })

        // Check the importing dialog
        const importingDialog = document.querySelector('dialog[is="importing-dialog"]')
        if (importingDialog instanceof HTMLDialogElement === false)
            throw new Error('Importing dialog not setup!')

        // Wire up the welcome dialog
        const welcomeDialog = document.querySelector('dialog[is="welcome-dialog"]')
        if (welcomeDialog instanceof HTMLDialogElement === false)
            throw new Error('Welcome dialog not setup!')

        // Wire up the settings dialog
        const settingsDialog = document.querySelector('dialog[is="settings-dialog"]')
        if (settingsDialog instanceof HTMLDialogElement === false)
            throw new Error('HTML setup incorrect!')

        this.#setupSettings(settingsDialog, welcomeDialog, importingDialog)


        // Setup Model-Viewer fullscreen view buttons
        const enterShipFullscreenBtn = document.getElementById('ship-enter-fullscreen')
        enterShipFullscreenBtn.addEventListener('click', () => document.body.classList.add('ship-fullscreen'))
        const leaveShipFullscreenBtn = document.getElementById('ship-leave-fullscreen')
        leaveShipFullscreenBtn.addEventListener('click', () => document.body.classList.remove('ship-fullscreen'))

        // Setup fullscreen Model-Viewer rotate button
        const rotateShipFullscreenBtn = document.getElementById('ship-autorotate-fullscreen')
        const shipFullscreenViewer = document.getElementById('ship-fullscreen')
        rotateShipFullscreenBtn.addEventListener('click', () => shipFullscreenViewer.toggleAttribute('auto-rotate'))

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

        themeSelectEl.addEventListener('change', () => this.#useTheme(themeSelectEl.value))

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
        let handlingInput = false
        window.addEventListener('keydown', async (e) => {

            if (handlingInput)
                return
            handlingInput = true
            try {
                if (e.ctrlKey && e.key === 'e') {
                    e.preventDefault()
                    await this.export()
                } else if (e.ctrlKey && e.key === 'i') {
                    e.preventDefault()
                    let importEl = document.querySelector('input.import-game-file')
                    if (importEl instanceof HTMLInputElement) {
                        importEl.click()
                    }
                } else if (e.ctrlKey && e.key === 's') {
                    e.preventDefault()
                    await this.saveData()
                } else if (e.key === 'F1') {
                    e.preventDefault()
                    welcomeDialog.showModal()
                } else if (e.ctrlKey && e.key === ',') {
                    e.preventDefault()
                    settingsDialog.showModal()
                }
            }
            finally {
                handlingInput = false
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

    #loadFontSize() {
        const savedSize = localStorage.getItem('fontSize')

        if (savedSize === null)
            return

        let value = parseFloat(savedSize)
        document.documentElement.style.setProperty('--main-font-size', `${value}pt`)
    }

    /**
     * Add to the existing font size
     * @param {number} amount amount to add
     */
    #editFontSize (amount) {
        const valueText = getComputedStyle(document.documentElement).getPropertyValue('--main-font-size')
        let value = parseFloat(valueText)
        value += amount
        document.documentElement.style.setProperty('--main-font-size', `${value}pt`)
        localStorage.setItem('fontSize', `${value}`)
    }

    /**
     * Set the page to a particular theme
     * @param {string} theme name of the theme
     */
    #useTheme (theme) {
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
     * @param {string} edition   the number of the rules edition to use
     */
    #useEdition (edition) {
        const editionSelectEl = document.getElementById('select-edition')
        if (editionSelectEl instanceof HTMLSelectElement === false)
            throw new Error('Theme selector element is wrong/missing!')

        if (['1', '2', 'captains-log'].includes(edition) === false)
            edition = '2'

        editionSelectEl.value = `${edition}`
        document.body.classList.remove('edition-1', 'edition-2', 'edition-captains-log')
        document.body.classList.add(`edition-${edition}`)
    }

    /**
     * Wire up all the settings.
     * @param {HTMLDialogElement} dialogEl          settings dialog element
     * @param {HTMLDialogElement} welcomeDialogEl   the welcome dialog element
     * @param {HTMLDialogElement} importingDialog   the importing dialog element
     */
    #setupSettings (dialogEl, welcomeDialogEl, importingDialog) {
        document.getElementById('settings-btn').addEventListener('click', () => dialogEl.showModal())
        dialogEl.querySelectorAll('button.close').forEach(el => el.addEventListener('click', () => dialogEl.close()))
        dialogEl.querySelector('button.clear-info').addEventListener('click', async () => {
            await this.db.clear()
            this.#loadData()
        })
        const importEl = dialogEl.querySelector('input.import-game-file')
        if (importEl instanceof HTMLInputElement === false)
            throw new Error('Page setup incorrect')

        importEl.addEventListener('change', async () => {
            if (importEl.files.length === 0)
                return
            importingDialog.showModal()
            await this.import(importEl.files[0])
            importEl.value = null
            importingDialog.close()
        })

        dialogEl.querySelector('button.export-game').addEventListener('click', async () => {
            await this.export()
        })

        const fileSelectShip = dialogEl.querySelector('input.select-ship')
        if (fileSelectShip instanceof HTMLInputElement === false)
            throw new Error('Page setup incorrect')
        dialogEl.querySelector('button.set-ship').addEventListener('click', () => {
            this.setShipModel(fileSelectShip.files[0])
        })
        dialogEl.querySelector('button.clear-ship').addEventListener('click', () => {
            this.setShipModel(undefined)
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
            this.#useEdition(editionSelectEl.value)
        })
    }

    /**
     * Load information from the database into the page
     * @param {string}  [gameName]      the name of the game to load
     * @returns {Promise<boolean>}      if there was info to load
     */
    async #loadData (gameName = DefaultGameName) {
        const dbToken = await this.db.open()

        try {
            const gameInfo = await this.db.getGameInfo(gameName, dbToken)

            const momentumEl = document.getElementById('momentum-pool')
            if (momentumEl instanceof HTMLInputElement === false)
                throw new Error('page setup incorrectly!')

            const momentumToggleEl = document.getElementById('momentum-toggle')
            if (momentumToggleEl instanceof HTMLInputElement === false)
                throw new Error('page setup incorrectly!')

            const threatEl = document.getElementById('threat-pool')
            if (threatEl instanceof HTMLInputElement === false)
                throw new Error('page setup incorrectly!')

            const threatToggleEl = document.getElementById('threat-toggle')
            if (threatToggleEl instanceof HTMLInputElement === false)
                throw new Error('page setup incorrectly!')

            const editionSelectEl = document.getElementById('select-edition')
            if (editionSelectEl instanceof HTMLSelectElement === false)
                throw new Error('Theme selector element is wrong/missing!')

            const missionTrackerEl = document.getElementsByTagName('mission-tracker')[0]
            if (missionTrackerEl instanceof MissionTrackerElement === false)
                throw new Error('Mission Tracker element is wrong/missing!')

            this.currentGameId = gameInfo?.id
            document.body.setAttribute('loaded-game-name', gameInfo?.name ?? DefaultGameName)
            document.getElementById('shipname').textContent = (gameInfo?.shipName ?? this.fallbackShipName).trim()
            momentumEl.value = `${(gameInfo?.momentum ?? 0)}`
            momentumToggleEl.checked = gameInfo?.momentum > 0
            threatEl.value = `${(gameInfo?.threat ?? 0)}`
            threatToggleEl.checked = gameInfo?.threat > 0
            document.getElementsByTagName('ship-alert')[0].setAttribute('color', (gameInfo?.activeAlert ?? '').trim())
            this.#useTheme(gameInfo?.theme ?? 'lcars-24')
            this.#useEdition(gameInfo?.edition)

            this.setShipModel(gameInfo?.shipModel)

            /** @type {SceneInfo} */
            let firstSceneInfo

            if (gameInfo !== undefined) {
                const sceneInfos = await this.db.getScenes(this.currentGameId, dbToken)
                firstSceneInfo = sceneInfos?.[0]
                this.currentSceneId = firstSceneInfo?.id
                document.getElementById('general-text').innerHTML = firstSceneInfo?.description ?? this.fallbackText

                // remove existing players
                document.querySelectorAll('.players li').forEach(el => el.parentNode.removeChild(el))
                // Get all players
                const players = await this.db.getPlayers(gameInfo?.id, dbToken)
                for (const player of players)
                    this.addPlayer(player)

                // remove existing trackers
                document.querySelectorAll('task-tracker').forEach(el => el.parentNode.removeChild(el))
                // Get all trackers
                const trackers = await this.db.getTrackers(gameInfo?.id, dbToken)
                for (const tracker of trackers)
                    this.addTaskTracker(tracker)
            }

            if (firstSceneInfo !== undefined) {
                // remove existing traits
                document.querySelectorAll('trait-display').forEach(el => el.parentNode.removeChild(el))
                // Get all traits
                const traits = await this.db.getTraits(firstSceneInfo.id, dbToken)
                for (const trait of traits)
                    this.addTrait(trait)

                if (firstSceneInfo.missionTrack.length >= 3) {
                    missionTrackerEl.act1 = firstSceneInfo.missionTrack[0]
                    missionTrackerEl.act2 = firstSceneInfo.missionTrack[1]
                    missionTrackerEl.act3 = firstSceneInfo.missionTrack[2]
                }
            } else {
                document.getElementById('general-text').innerHTML = this.fallbackText
            }

            this.safeToSaveDB = true
            return typeof (gameInfo) !== 'undefined'
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

        const momentumToggleEl = document.getElementById('momentum-toggle')
        if (momentumToggleEl instanceof HTMLInputElement === false)
            throw new Error('page setup incorrectly!')

        const threatEl = document.getElementById('threat-pool')
        if (threatEl instanceof HTMLInputElement === false)
            throw new Error('page setup incorrectly!')

        const threatToggleEl = document.getElementById('threat-toggle')
        if (threatToggleEl instanceof HTMLInputElement === false)
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

        const missionTrackerEl = document.getElementsByTagName('mission-tracker')[0]
        if (missionTrackerEl instanceof MissionTrackerElement === false)
            throw new Error('Mission Tracker element is wrong/missing!')

        const gameName = document.body.getAttribute('loaded-game-name') || DefaultGameName

        const momentumValue = editionSelectEl.value === 'captains-log'
            ? momentumToggleEl.checked ? 1 : 0
            : momentumEl.value

        const threatValue = editionSelectEl.value === 'captains-log'
            ? threatToggleEl.checked ? 1 : 0
            : threatEl.value

        const gameInfo = new GameInfo(
            this.currentGameId,
            gameName,
            document.getElementById('shipname').textContent.trim(),
            momentumValue,
            threatValue,
            shipAlertEl.color,
            themeSelectEl.value,
            editionSelectEl.value,
            this.shipModel
        )
        this.currentGameId = await this.db.saveGameInfo(gameInfo, dbToken)

        const sceneInfo = new SceneInfo(
            this.currentSceneId,
            this.currentGameId,
            undefined, // TODO title/name
            document.getElementById('general-text').innerHTML,
            [
                missionTrackerEl.act1,
                missionTrackerEl.act2,
                missionTrackerEl.act3
            ]
        )
        this.currentSceneId = await this.db.saveSceneInfo(sceneInfo, dbToken)

        const traits =
            [...document.querySelectorAll('traits trait-display')]
                .map(el => (el instanceof TraitDisplayElement ? el.text : ''))
                .filter(el => !!el)
                .filter((v, i, a) => a.indexOf(v) === i) // unique
        await this.db.replaceTraits(this.currentSceneId, traits, dbToken)

        const players = [...document.querySelectorAll('.players > li')]
            .map((el) => {
                if (el instanceof PlayerDisplayElement === false)
                    return null

                const info = new PlayerInfo(
                    this.currentGameId,
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
                    return null

                const info = new TrackerInfo(
                    this.currentGameId,
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
        const newTrackerEl = document.createElement('task-tracker')
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

        newTrackerEl.focus()
    }

    /**
     * Add trait element to the screen
     * @param {string|undefined} name the name of the trait
     */
    addTrait (name = undefined) {
        const traitEl = document.createElement('trait-display')
        if (typeof (name) === 'string')
            traitEl.setAttribute('text', name)

        const traitsEl = document.getElementsByTagName('traits')[0]
        traitsEl.appendChild(traitEl)
        traitEl.focus()
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
            playerIndex = info.playerNumber
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
                const playerCount = document.querySelectorAll('.players li').length
                settingsPlayerEl.max = `${playerCount - 1}`
                settingsPlayerEl.value = '1' // reset so it's not above max
            })
        }

        // Add 2 threat for the new player (if not just loading)
        let threatEl = document.getElementById('threat-pool')
        if (typeof (info) === 'undefined' && threatEl instanceof HTMLInputElement === true) {
            let threatValue = parseInt(threatEl.value)
            threatEl.value = `${threatValue + 2}`
        }

        newPlayerEl.focus()
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

    /**
     * Export information from the database to a file
     * @param {string}  [gameName]      the name of the game to export
     */
    async export (gameName = undefined) {
        gameName ??= document.body.getAttribute('loaded-game-name') || 'Game'
        let fileName = gameName === DefaultGameName ? `game.${Date.now()}` : gameName
        const file = await this.db.export(gameName)
        const mimeOpts = {
            description: 'STA Play Backup',
            mimes: [{ 'application/staplay': '.staplay' }]
        }

        await saveBlobAs( `${fileName}.staplay`, file, mimeOpts, 'downloads', true)
    }

    async import (backupFile) {
        const backupData = await BackupData.import(backupFile)
        await this.db.import(backupData)
        await this.#loadData(backupData.GameInfo.name)
    }
}

globalThis.App = new IndexController()
