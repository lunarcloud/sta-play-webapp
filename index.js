import './components/input-progress/input-progress-element.js'
import './components/welcome-dialog/welcome-dialog-element.js'
import './components/settings-dialog/settings-dialog-element.js'
import './components/busy-dialog/busy-dialog-element.js'
import './components/message-dialog/message-dialog-element.js'
import './components/confirm-dialog/confirm-dialog-element.js'
import { MissionTrackerElement } from './components/mission-tracker/mission-tracker-element.js'
import { TraitDisplayElement } from './components/trait-display/trait-display-element.js'
import { PlayerDisplayElement } from './components/player-display/player-display-element.js'
import { TaskTrackerElement } from './components/task-tracker/task-tracker-element.js'
import { Database } from './js/database/database.js'
import { TrackerInfo } from './js/database/tracker-info.js'
import { PlayerInfo } from './js/database/player-info.js'
import { DefaultGameName, GameInfo } from './js/database/game-info.js'
import { ShipAlertElement } from './components/ship-alert/ship-alert-element.js'
import { setupDropOnly } from './js/drop-nodrag-setup.js'
import { loadElementFromFile } from './js/load-file-element.js'
import { SceneInfo } from './js/database/scene-info.js'
import { saveBlobAs } from './js/save-file-utils.js'
import { BackupData } from './js/database/backup-data.js'
import './lib/model-viewer.min.js'
import { setupNumberInputScrollForParent } from './js/scrollable-inputs.js'
import { Interpolate, lerp } from './js/math-utils.js'

const DefaultShipUrl = 'gltf/default-ship-1.glb'

/**
 * Controller for the Main, Index, Page.
 */
export class IndexController {
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
   * Ship Alert Transition ID, used to cancel old transitions when demanding a new one
   * @type {number}
   */
  #shipAlertTransitionID = 0

  /**
   * @type {HTMLDialogElement|undefined}
   */
  messageDialog

  /**
   * @type {HTMLDialogElement|undefined}
   */
  confirmDialog

  /**
   * @type {HTMLDialogElement|undefined}
   */
  busyDialog

  /**
   * Constructor.
   */
  constructor () {
    // Get default to fallback to
    this.fallbackText = document.getElementById('general-text').innerHTML
    this.fallbackShipName = document.getElementById('shipname').innerHTML

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

    const fsBtn = document.getElementById('fullscreen-btn')
    fsBtn.addEventListener('click', () => {
      // Debounce
      fsBtn.setAttribute('disabled', '')
      setTimeout(() => fsBtn.removeAttribute('disabled'), this.#debounceAmount)

      // Do
      const exiting = !!document.fullscreenElement || !document.fullscreenEnabled
      if (exiting) { document.exitFullscreen() } else { document.documentElement.requestFullscreen({ navigationUI: 'auto' }) }

      // Update the button symbol
      fsBtn.querySelector('.symbol.enter').toggleAttribute('hidden', !exiting)
      fsBtn.querySelector('.symbol.exit').toggleAttribute('hidden', exiting)
    })

    // load this device's last known font size
    this.#loadFontSize()

    // Wire up font size change buttons
    document.getElementById('font-up-btn').addEventListener('click', () => this.#editFontSize(0.25))
    document.getElementById('font-down-btn').addEventListener('click', () => this.#editFontSize(-0.25))

    // Wire up Alternate Font checkbox
    const altFontCheckbox = document.getElementById('alt-font-toggle')
    if (altFontCheckbox instanceof HTMLInputElement) {
      altFontCheckbox.addEventListener('change', () => this.#setAltFont(altFontCheckbox.checked))
    }

    // Wire up Legacy Task Tracker Controls checkbox
    const legacyTrackersCheckbox = document.getElementById('legacy-task-tracker-toggle')
    if (legacyTrackersCheckbox instanceof HTMLInputElement) {
      legacyTrackersCheckbox.addEventListener('change', () => this.#setLegacyTaskTrackers(legacyTrackersCheckbox.checked))
    }

    // Wire up the Alerts Selector
    const alertDropdownEl = document.getElementById('alert-dropdown')
    if (alertDropdownEl instanceof HTMLSelectElement === false) {
      throw new Error('Ship Alerts not setup correctly!')
    }
    alertDropdownEl.addEventListener('change', () => this.#setShipAlert(alertDropdownEl.value))

    // Check the busy dialog
    const busyDialog = document.querySelector('dialog[is="busy-dialog"]')
    if (busyDialog instanceof HTMLDialogElement === false) {
      throw new Error('Busy dialog not setup!')
    }
    this.busyDialog = busyDialog

    // Wire up the welcome dialog
    const welcomeDialog = document.querySelector('dialog[is="welcome-dialog"]')
    if (welcomeDialog instanceof HTMLDialogElement === false) {
      throw new Error('Welcome dialog not setup!')
    }

    setTimeout(() => {
      if (!localStorage.getItem('welcomed-once')) {
        welcomeDialog.showModal() // Show Welcome Dialog the first time
        localStorage.setItem('welcomed-once', 'true')
      }
    }, 1)

    // Wire up the settings dialog
    const settingsDialog = document.querySelector('dialog[is="settings-dialog"]')
    if (settingsDialog instanceof HTMLDialogElement === false) {
      throw new Error('HTML setup incorrect!')
    }

    // Get message and confirm dialogs
    this.messageDialog = document.querySelector('dialog[is="message-dialog"]')
    if (this.messageDialog instanceof HTMLDialogElement === false) {
      throw new Error('Message dialog not setup!')
    }

    this.confirmDialog = document.querySelector('dialog[is="confirm-dialog"]')
    if (this.confirmDialog instanceof HTMLDialogElement === false) {
      throw new Error('Confirm dialog not setup!')
    }

    this.#setupSettings(settingsDialog, welcomeDialog, busyDialog)

    // Setup Model-Viewer fullscreen view buttons
    const enterShipFullscreenBtn = document.getElementById('ship-enter-fullscreen')
    enterShipFullscreenBtn.addEventListener('click', () => document.body.classList.add('ship-fullscreen'))
    const leaveShipFullscreenBtn = document.getElementById('ship-leave-fullscreen')
    leaveShipFullscreenBtn.addEventListener('click', () => document.body.classList.remove('ship-fullscreen'))

    // Setup fullscreen Model-Viewer rotate button
    const rotateShipFullscreenBtn = document.getElementById('ship-autorotate-fullscreen')
    const shipFullscreenViewer = document.getElementById('ship-fullscreen')
    rotateShipFullscreenBtn.addEventListener('click', () => {
      shipFullscreenViewer.toggleAttribute('auto-rotate')
      const interactionPrompt = shipFullscreenViewer.getAttribute('interaction-prompt') === 'auto'
      shipFullscreenViewer.setAttribute('interaction-prompt', interactionPrompt ? 'none' : 'auto')
    })

    // Setup Dropping ship's 3D model anywhere on the page
    setupDropOnly(document.body, event => {
      if (!event.dataTransfer.items?.[0].type.startsWith('model/gltf') ||
                !event.dataTransfer.files?.[0]) {
        return false
      }

      this.setShipModel(event.dataTransfer.files?.[0])
      return true
    })

    // Setup Theme & Selection
    const themeSelectEl = document.getElementById('select-theme')
    if (themeSelectEl instanceof HTMLSelectElement === false) {
      throw new Error('Theme selector element is wrong/missing!')
    }

    const themeStyleEl = document.getElementById('theme-link')
    if (themeStyleEl instanceof HTMLLinkElement === false) {
      throw new Error('Theme CSS link element is wrong/missing!')
    }

    themeSelectEl.addEventListener('change', () => this.#useTheme(themeSelectEl.value))

    // Load Info and Images from Database
    this.#loadData()
    // .catch(e => console.error(e))

    // Mouse scrolling to update number inputs
    setupNumberInputScrollForParent(document)

    // Keyboard Shortcuts
    let handlingInput = false
    window.addEventListener('keydown', async (e) => {
      if (handlingInput) {
        return
      }
      handlingInput = true
      try {
        if (e.key === 'Escape') {
          document.body.classList.remove('ship-fullscreen')
          handlingInput = false // let it be handled by more things like modals too
        } else if (e.ctrlKey && e.shiftKey && e.key === 'F11') {
          e.preventDefault()
          document.body.classList.add('ship-fullscreen')
        } else if (e.ctrlKey && e.key === 'e') {
          e.preventDefault()
          await this.saveAndExport()
        } else if (e.ctrlKey && e.key === 'i') {
          e.preventDefault()
          const importEl = document.querySelector('input.import-game-file')
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
      } finally {
        handlingInput = false
      }
    })
  }

  /**
   * Load the local device's last-saved font size.
   */
  #loadFontSize () {
    const savedSize = localStorage.getItem('fontSize')

    if (savedSize === null) {
      return
    }

    const value = parseFloat(savedSize)
    document.documentElement.style.setProperty('--main-font-unitless', `${value}`)
  }

  /**
   * Add to the existing font size
   * @param {number} amount amount to add
   */
  #editFontSize (amount) {
    const valueText = getComputedStyle(document.documentElement).getPropertyValue('--main-font-unitless')
    let value = parseFloat(valueText)
    value += amount
    document.documentElement.style.setProperty('--main-font-unitless', `${value}`)
    localStorage.setItem('fontSize', `${value}`)
  }

  /**
   * Set the page to a particular theme
   * @param {string} theme        name of the theme
   * @param {boolean} [altFont]   whether to use the alternate font (defaults to false)
   */
  #useTheme (theme, altFont = false) {
    // Get elements
    const themeSelectEl = document.getElementById('select-theme')
    if (themeSelectEl instanceof HTMLSelectElement === false) {
      throw new Error('Theme selector element is wrong/missing!')
    }

    const themeStyleEl = document.getElementById('theme-link')
    if (themeStyleEl instanceof HTMLLinkElement === false) {
      throw new Error('Theme CSS link element is wrong/missing!')
    }

    const themeEl = document.getElementsByTagName('theme')[0]
    if (themeEl instanceof HTMLElement === false) {
      throw new Error('Theme element is wrong/missing!')
    }

    // Set elements
    themeEl.setAttribute('value', theme)
    themeSelectEl.value = theme

    // Update Style and theme element contents
    themeStyleEl.href = `./themes/${theme}/theme.css`
    loadElementFromFile(`./themes/${theme}/theme.html`, 'theme').then(el => {
      if (el instanceof HTMLElement === false) {
        throw new Error(`Cannot find theme: "${theme}"`)
      }
      themeEl.innerHTML = el.innerHTML
    })

    this.#setAltFont(altFont)
  }

  /**
   * Update the alternative font setting.
   * @param {boolean} use whether to use the alternative font
   */
  #setAltFont (use) {
    document.documentElement.classList.toggle('alt-font', use === true)

    const altFontCheckbox = document.getElementById('alt-font-toggle')
    if (altFontCheckbox instanceof HTMLInputElement) {
      altFontCheckbox.checked = use === true
    }
  }

  /**
   * Set the page's text to a particular gaem edition
   * @param {string} edition   the number of the rules edition to use
   */
  #useEdition (edition) {
    const editionSelectEl = document.getElementById('select-edition')
    if (editionSelectEl instanceof HTMLSelectElement === false) {
      throw new Error('Theme selector element is wrong/missing!')
    }

    if (['1', '2', 'captains-log'].includes(edition) === false) {
      edition = '2'
    }

    editionSelectEl.value = `${edition}`
    document.body.classList.remove('edition-1', 'edition-2', 'edition-captains-log')
    document.body.classList.add(`edition-${edition}`)

    const trackerEls = document.getElementsByTagName('task-tracker')
    for (const el of trackerEls) {
      el.toggleAttribute('manual-breakthroughs', edition === '1')
    }
  }

  /**
   * Update the legacy task tracker style setting.
   * @param {boolean} use whether to use the legacy task trackers
   */
  #setLegacyTaskTrackers (use) {
    document.body.classList.toggle('legacy-task-trackers', use === true)

    const legacyTrackersCheckbox = document.getElementById('legacy-task-tracker-toggle')
    if (legacyTrackersCheckbox instanceof HTMLInputElement) {
      legacyTrackersCheckbox.checked = use === true
    }

    const trackerEls = document.getElementsByTagName('task-tracker')
    for (const el of trackerEls) {
      el.toggleAttribute('legacy-controls', use === true)
    }
  }

  /**
   * Update the ship alert
   * @param {string} newColor color to use
   */
  #setShipAlert (newColor) {
    const alertEl = document.getElementsByTagName('ship-alert')[0]
    const alertDropdownEl = document.getElementById('alert-dropdown')
    if (alertEl instanceof ShipAlertElement === false ||
        alertDropdownEl instanceof HTMLSelectElement === false) {
      throw new Error('Ship alert elements are wrong/missing!')
    }

    // Update if different
    if (alertEl.color !== newColor) { alertEl.color = newColor }
    if (alertDropdownEl.value !== newColor) { alertDropdownEl.value = newColor }

    // inform the body element, for potential styling
    if (alertEl.color) {
      document.body.setAttribute('alert', alertEl.color)
    } else {
      document.body.removeAttribute('alert')
    }

    const targetExposure = alertEl.color === 'grey' ? 0.25 : alertEl.color === 'cloak' ? 0.01 : 0.90
    const targetOpacity = alertEl.color === 'cloak' ? 0.1 : 1
    const thisTransitionID = ++this.#shipAlertTransitionID
    const transitionTime = 6000 // ms
    const startTime = Date.now()
    const modelViewers = document.querySelectorAll('model-viewer')
    const updateExposure = (el) => {
      if (thisTransitionID !== this.#shipAlertTransitionID) {
        return
      }

      const t = (Date.now() - startTime) / transitionTime
      el.exposure = lerp(el.exposure, targetExposure, t, Interpolate.cubic)
      el.style.opacity = lerp(el.style.opacity || 1, targetOpacity, t, Interpolate.cubic)

      if (t < 1) {
        requestAnimationFrame(() => updateExposure(el))
      }
    }
    for (const el of modelViewers) {
      requestAnimationFrame(() => updateExposure(el))
    }
  }

  /**
   * Wire up all the settings.
   * @param {HTMLDialogElement} dialogEl          settings dialog element
   * @param {HTMLDialogElement} welcomeDialogEl   the welcome dialog element
   * @param {HTMLDialogElement} busyDialog        the busy dialog element
   */
  #setupSettings (dialogEl, welcomeDialogEl, busyDialog) {
    document.getElementById('settings-btn').addEventListener('click', () => dialogEl.showModal())
    dialogEl.querySelector('button.clear-info').addEventListener('click', async () => {
      await this.db.clear()
      this.#loadData()
    })
    const importEl = dialogEl.querySelector('input.import-game-file')
    if (importEl instanceof HTMLInputElement === false) {
      throw new Error('Page setup incorrect')
    }

    importEl.addEventListener('change', async () => {
      if (importEl.files.length === 0) {
        return
      }
      busyDialog.show('The application is loading data...')
      const file = importEl.files[0]
      try {
        if (!file.name.endsWith('.staplay')) {
          throw new Error('Not an \'staplay\' game backup file')
        }
        await this.import(file)
      } catch (ex) {
        if (ex instanceof Error) {
          this.messageDialog?.show(`Could not import ${file.name} \n${ex.message}`)
        }
      } finally {
        importEl.value = null
        busyDialog.close()
      }
    })

    dialogEl.querySelector('button.export-game').addEventListener('click', async () => await this.saveAndExport())

    const fileSelectShip = dialogEl.querySelector('input.select-ship')
    if (fileSelectShip instanceof HTMLInputElement === false) {
      throw new Error('Page setup incorrect')
    }
    dialogEl.querySelector('button.set-ship').addEventListener('click', () => {
      this.setShipModel(fileSelectShip.files[0])
    })
    dialogEl.querySelector('button.clear-ship').addEventListener('click', () => {
      this.setShipModel(undefined)
    })

    const fileSelectPlayer = dialogEl.querySelector('.player-image-upload input.select')
    if (fileSelectPlayer instanceof HTMLInputElement === false) {
      throw new Error('Page setup incorrect')
    }
    const indexSelectPlayer = dialogEl.querySelector('.player-image-upload input.index')
    if (indexSelectPlayer instanceof HTMLInputElement === false) {
      throw new Error('Page setup incorrect')
    }

    dialogEl.querySelector('.player-image-upload button.set').addEventListener('click', () => {
      const index = parseInt(indexSelectPlayer.value)
      const playerEl = document.querySelector(`.players li:nth-child(${index})`)
      if (playerEl instanceof PlayerDisplayElement) {
        playerEl.imageFile = fileSelectPlayer.files[0]
      }
    })

    dialogEl.querySelector('button.show-welcome').addEventListener('click', () => welcomeDialogEl?.showModal())

    // Setup Edition & Selection
    const editionSelectEl = document.getElementById('select-edition')
    if (editionSelectEl instanceof HTMLSelectElement === false) {
      throw new Error('Theme selector element is wrong/missing!')
    }

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
    const gameInfo = await this.db.getGameInfo(gameName)

    const momentumEl = document.getElementById('momentum-pool')
    if (momentumEl instanceof HTMLInputElement === false) {
      throw new Error('page setup incorrectly!')
    }

    const momentumToggleEl = document.getElementById('momentum-toggle')
    if (momentumToggleEl instanceof HTMLInputElement === false) {
      throw new Error('page setup incorrectly!')
    }

    const threatEl = document.getElementById('threat-pool')
    if (threatEl instanceof HTMLInputElement === false) {
      throw new Error('page setup incorrectly!')
    }

    const threatToggleEl = document.getElementById('threat-toggle')
    if (threatToggleEl instanceof HTMLInputElement === false) {
      throw new Error('page setup incorrectly!')
    }

    const editionSelectEl = document.getElementById('select-edition')
    if (editionSelectEl instanceof HTMLSelectElement === false) {
      throw new Error('Theme selector element is wrong/missing!')
    }

    const missionTrackerEl = document.getElementsByTagName('mission-tracker')[0]
    if (missionTrackerEl instanceof MissionTrackerElement === false) {
      throw new Error('Mission Tracker element is wrong/missing!')
    }

    // Clear screen
    document.querySelectorAll('trait-display').forEach(el => el.parentNode.removeChild(el))
    document.querySelectorAll('.players li').forEach(el => el.parentNode.removeChild(el))
    document.querySelectorAll('task-tracker').forEach(el => el.parentNode.removeChild(el))

    this.currentGameId = gameInfo?.id
    document.body.setAttribute('loaded-game-name', gameInfo?.name ?? DefaultGameName)
    document.getElementById('shipname').textContent = (gameInfo?.shipName ?? this.fallbackShipName).trim()
    momentumEl.value = `${(gameInfo?.momentum ?? 0)}`
    momentumToggleEl.checked = gameInfo?.momentum > 0
    threatEl.value = `${(gameInfo?.threat ?? 0)}`
    threatToggleEl.checked = gameInfo?.threat > 0
    this.#setShipAlert((gameInfo?.activeAlert ?? '').trim())
    this.#useTheme(gameInfo?.theme ?? 'lcars-24', gameInfo?.altFont ?? false)
    this.#useEdition(gameInfo?.edition)
    this.#setLegacyTaskTrackers(gameInfo?.legacyTrackers ?? false)

    /** @type {SceneInfo} */
    let firstSceneInfo

    if (gameInfo !== undefined) {
      const sceneInfos = await this.db.getScenes(this.currentGameId)
      firstSceneInfo = sceneInfos?.[0]
      this.currentSceneId = firstSceneInfo?.id
      document.getElementById('general-text').innerHTML = firstSceneInfo?.description ?? this.fallbackText

      // Get all players
      const players = await this.db.getPlayers(gameInfo?.id)
      for (const player of players) {
        this.addPlayer(player)
      }

      // Get all trackers
      const trackers = await this.db.getTrackers(gameInfo?.id)
      for (const tracker of trackers) {
        this.addTaskTracker(tracker)
      }
    }

    if (firstSceneInfo !== undefined) {
      // Get all traits
      const traits = await this.db.getTraits(firstSceneInfo.id)
      for (const trait of traits) {
        this.addTrait(trait)
      }

      if (firstSceneInfo.missionTrack.length >= 3) {
        missionTrackerEl.act1 = firstSceneInfo.missionTrack[0]
        missionTrackerEl.act2 = firstSceneInfo.missionTrack[1]
        missionTrackerEl.act3 = firstSceneInfo.missionTrack[2]
      }
    } else {
      document.getElementById('general-text').innerHTML = this.fallbackText
    }

    this.setShipModel(gameInfo?.shipModel)

    this.safeToSaveDB = true
    return typeof (gameInfo) !== 'undefined'
  }

  /**
   * Save information from the page to the database
   * @param {boolean} [alertAtEnd]    whether to display the "saved!" notification at the end of saving
   */
  async saveData (alertAtEnd = true) {
    const momentumEl = document.getElementById('momentum-pool')
    if (momentumEl instanceof HTMLInputElement === false) {
      throw new Error('page setup incorrectly!')
    }

    const momentumToggleEl = document.getElementById('momentum-toggle')
    if (momentumToggleEl instanceof HTMLInputElement === false) {
      throw new Error('page setup incorrectly!')
    }

    const threatEl = document.getElementById('threat-pool')
    if (threatEl instanceof HTMLInputElement === false) {
      throw new Error('page setup incorrectly!')
    }

    const threatToggleEl = document.getElementById('threat-toggle')
    if (threatToggleEl instanceof HTMLInputElement === false) {
      throw new Error('page setup incorrectly!')
    }

    const editionSelectEl = document.getElementById('select-edition')
    if (editionSelectEl instanceof HTMLSelectElement === false) {
      throw new Error('Edition selector element is wrong/missing!')
    }

    const themeSelectEl = document.getElementById('select-theme')
    if (themeSelectEl instanceof HTMLSelectElement === false) {
      throw new Error('Theme selector element is wrong/missing!')
    }

    const altFontCheckbox = document.getElementById('alt-font-toggle')
    if (altFontCheckbox instanceof HTMLInputElement === false) {
      throw new Error('Theme alt font choice is wrong/missing!')
    }

    const legacyTrackersCheckbox = document.getElementById('legacy-task-tracker-toggle')
    if (legacyTrackersCheckbox instanceof HTMLInputElement === false) {
      throw new Error('The legacy task tracker style choice is wrong/missing!')
    }

    const shipAlertEl = document.getElementsByTagName('ship-alert')[0]
    if (shipAlertEl instanceof ShipAlertElement === false) {
      throw new Error('Ship alert element is wrong/missing!')
    }

    const missionTrackerEl = document.getElementsByTagName('mission-tracker')[0]
    if (missionTrackerEl instanceof MissionTrackerElement === false) {
      throw new Error('Mission Tracker element is wrong/missing!')
    }

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
      this.shipModel,
      altFontCheckbox.checked,
      legacyTrackersCheckbox.checked
    )
    const savedGameId = await this.db.saveGameInfo(gameInfo)
    if (savedGameId !== undefined) {
      this.currentGameId = savedGameId
    }

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
    const savedSceneId = await this.db.saveSceneInfo(sceneInfo)
    if (savedSceneId !== undefined) {
      this.currentSceneId = savedSceneId
    }

    const traits =
            [...document.querySelectorAll('traits trait-display')]
              .map(el => (el instanceof TraitDisplayElement ? el.text : ''))
              .filter(el => !!el)
              .filter((v, i, a) => a.indexOf(v) === i) // unique
    await this.db.replaceTraits(this.currentSceneId, traits)

    const players = [...document.querySelectorAll('.players > li')]
      .map((el) => {
        if (el instanceof PlayerDisplayElement === false) {
          return null
        }

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
    await this.db.replacePlayers(players)

    const trackers = [...document.querySelectorAll('task-tracker')]
      .map(el => {
        if (el instanceof TaskTrackerElement === false) {
          return null
        }

        const info = new TrackerInfo(
          this.currentGameId,
          el.name,
          el.attribute,
          el.department,
          el.shipSystem,
          el.shipDepartment,
          el.progress,
          el.maxProgress,
          el.resistance,
          el.complicationRange,
          el.breakthroughs
        )
        return info
      })
    await this.db.replaceTrackers(trackers)

    this.safeToSaveDB = true
    if (alertAtEnd) {
      this.messageDialog?.show('Database Updated')
    }
  }

  /**
   * Add a new Combat / Extended task tracker to the page.
   * @param {TrackerInfo|undefined} info Player information
   */
  addTaskTracker (info = undefined) {
    const newTrackerEl = document.createElement('task-tracker')
    if (newTrackerEl instanceof TaskTrackerElement === false) {
      throw new Error('App incorrectly configured!')
    }

    if (typeof (info) !== 'undefined') {
      newTrackerEl.name = info.name
      newTrackerEl.attribute = info.attribute
      newTrackerEl.department = info.department
      newTrackerEl.shipSystem = info.shipSystem
      newTrackerEl.shipDepartment = info.shipDepartment
      newTrackerEl.resistance = `${info.resistance}`
      newTrackerEl.complicationRange = `${info.complicationRange}`
      newTrackerEl.progress = `${info.progressTrack}`
      newTrackerEl.maxProgress = `${info.maxProgressTrack}`
      newTrackerEl.breakthroughs = `${info.breakthroughs}`
    }

    newTrackerEl.toggleAttribute('manual-breakthroughs', document.body.classList.contains('edition-1'))
    newTrackerEl.toggleAttribute('legacy-controls', document.body.classList.contains('legacy-task-trackers'))
    document.querySelector('task-trackers').appendChild(newTrackerEl)

    // if completely new tracker, focus on renaming
    if (typeof (info) === 'undefined') {
      newTrackerEl.focus()
    }
  }

  /**
   * Add trait element to the screen
   * @param {string|undefined} name the name of the trait
   */
  addTrait (name = undefined) {
    const traitEl = document.createElement('trait-display')
    if (typeof (name) === 'string') {
      traitEl.setAttribute('text', name)
    }

    const traitsEl = document.getElementsByTagName('traits')[0]
    traitsEl.appendChild(traitEl)

    // if completely new trait, focus on renaming
    if (typeof (name) === 'undefined') {
      traitEl.focus()
    }
  }

  /**
   * Add a player to the players list
   * @param {PlayerInfo|undefined} info Player information
   */
  addPlayer (info = undefined) {
    const playersEl = document.querySelector('.players')
    const newPlayerEl = document.createElement('li', { is: 'player-display' })
    if (newPlayerEl instanceof PlayerDisplayElement === false) {
      throw new Error('App incorrectly configured!')
    }

    let playerIndex = 0

    if (typeof (info) !== 'undefined') {
      // Set the index and other attributes from the database info
      playerIndex = info.playerNumber
      newPlayerEl.setAttribute('name', info.name)
      newPlayerEl.setAttribute('current-stress', `${info.currentStress}`)
      newPlayerEl.setAttribute('max-stress', `${info.maxStress}`)
      newPlayerEl.setAttribute('rank', info.pips)
      newPlayerEl.setAttribute('color', info.borderColor.trim())
    } else {
      // Find the highest current player Index
      playerIndex = Array.from(document.querySelectorAll('.players li'))
        .filter(el => el instanceof PlayerDisplayElement)
        .map(el => el.playerIndex)
        .sort()
        .reverse()?.[0] ?? -1
      playerIndex++ // this is one newer than that
    }

    newPlayerEl.setAttribute('player-index', `${playerIndex}`)
    const playerId = `player-${playerIndex}`
    newPlayerEl.id = playerId

    if (info?.image instanceof File) {
      newPlayerEl.imageFile = info.image
    } else {
      newPlayerEl.setDefaultImage()
    }

    playersEl.appendChild(newPlayerEl)

    // add player to the settings page selector
    const settingsPlayerEl = document.querySelector('dialog[is="settings-dialog"] .player-image-upload input.index')
    const playerCount = document.querySelectorAll('.players li').length
    if (settingsPlayerEl instanceof HTMLInputElement) {
      if (parseInt(settingsPlayerEl.max) < playerCount) {
        settingsPlayerEl.max = `${playerCount}`
      }

      newPlayerEl.addEventListener('removed', () => {
        const playerCount = document.querySelectorAll('.players li').length
        settingsPlayerEl.max = `${playerCount - 1}`
        settingsPlayerEl.value = '1' // reset so it's not above max
      })
    }

    // Add 2 threat for the new player (if not just loading)
    const threatEl = document.getElementById('threat-pool')
    if (typeof (info) === 'undefined' && threatEl instanceof HTMLInputElement === true) {
      const threatValue = parseInt(threatEl.value)
      threatEl.value = `${threatValue + 2}`
    }

    // if completely new player, focus on renaming
    if (typeof (info) === 'undefined') {
      newPlayerEl.focusNameEdit()
    }
  }

  /**
   * Handler for new ship model drop
   * @param {File} modelFile  GLTF/GLB model file
   */
  setShipModel (modelFile) {
    this.shipModel = modelFile
    this.#updateShipSrc()
  }

  /**
   * Update the model-viewers so they are using the current ship model.
   */
  #updateShipSrc () {
    const url = this.shipModel instanceof File
      ? URL.createObjectURL(this.shipModel)
      : DefaultShipUrl
    const modelViewers = document.getElementsByTagName('model-viewer')
    for (const viewer of modelViewers) {
      if ('src' in viewer) {
        viewer.src = url
      }
    }
  }

  /**
   * Save to database and then export information from the database to a file
   * @param {string}  [gameName]      the name of the game to export
   */
  async saveAndExport (gameName = undefined) {
    try {
      await this.saveData(false)
    } catch (ex) {
      this.messageDialog?.show('Issue saving data.\n' + ex.message)
    }
    try {
      this.busyDialog?.show('The application is creating your file...')
      await this.export(gameName)
    } catch (ex) {
      this.messageDialog?.show('Issue exporting data.\n' + ex.message)
    } finally {
      this.busyDialog?.close()
    }
  }

  /**
   * Export information from the database to a file
   * @param {string}  [gameName]      the name of the game to export
   */
  async export (gameName = undefined) {
    gameName ??= document.body.getAttribute('loaded-game-name') || 'Game'
    const shipName = document.getElementById('shipname').textContent ?? 'game'
    const fileName = gameName === DefaultGameName ? `${shipName}.${Date.now()}` : gameName
    const file = await this.db.export(gameName)
    const mimeOpts = {
      description: 'STA Play Backup',
      mimes: [{ 'application/staplay': '.staplay' }]
    }

    await saveBlobAs(`${fileName}.staplay`, file, mimeOpts, 'downloads', true)
  }

  /**
   * Import information from a file to the database.
   * @param {File} backupFile save data to import from.
   */
  async import (backupFile) {
    const backupData = await BackupData.import(backupFile)
    await this.db.import(backupData)
    await this.#loadData(backupData.GameInfo.name)
  }
}

globalThis.App = new IndexController()
