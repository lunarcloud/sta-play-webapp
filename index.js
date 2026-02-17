import './components/input-progress/input-progress-element.js'
import './components/welcome-dialog/welcome-dialog-element.js'
import './components/settings-dialog/settings-dialog-element.js'
import './components/busy-dialog/busy-dialog-element.js'
import './components/message-dialog/message-dialog-element.js'
import './components/confirm-dialog/confirm-dialog-element.js'
import './components/dice-dialog/dice-dialog-element.js'
import './components/roll-tables-dialog/roll-tables-dialog-element.js'
import './components/scene-switcher/scene-switcher-element.js'
import { MissionTrackerElement } from './components/mission-tracker/mission-tracker-element.js'
import { TraitDisplayElement } from './components/trait-display/trait-display-element.js'
import { PlayerDisplayElement } from './components/player-display/player-display-element.js'
import { TaskTrackerElement } from './components/task-tracker/task-tracker-element.js'
import { Database } from './js/database/database.js'
import { TrackerInfo } from './js/database/tracker-info.js'
import { RollTableInfo } from './js/database/roll-table-info.js'
import { PlayerInfo } from './js/database/player-info.js'
import { DefaultGameName, GameInfo } from './js/database/game-info.js'
import { ShipAlertElement } from './components/ship-alert/ship-alert-element.js'
import { setupDropOnly } from './js/drop-nodrag-setup.js'
import { loadElementFromFile } from './js/load-file-element.js'
import { SceneInfo } from './js/database/scene-info.js'
import { saveBlobAs } from './js/save-file-utils.js'
import { BackupData } from './js/database/backup-data.js'
import './js/lib/model-viewer.min.js'
import { setupNumberInputScrollForParent } from './js/scrollable-inputs.js'
import { Interpolate, lerp } from './js/math-utils.js'
import { MirrorWindow } from './js/mirror-window.js'

// Make RollTableInfo available globally for the dialog component
globalThis.RollTableInfo = RollTableInfo

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
   * @type {object|undefined}
   */
  shipModel2 = undefined

  /**
   * Current model displayed in fullscreen (1 or 2)
   * @type {number}
   */
  #currentFullscreenModel = 1

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

    // Wire up the dice dialog
    const diceDialog = document.querySelector('dialog[is="dice-dialog"]')
    if (diceDialog instanceof HTMLDialogElement === false) {
      throw new Error('Dice dialog not setup!')
    }
    document.getElementById('dice-btn').addEventListener('click', () => diceDialog.showModal())

    // Wire up the roll tables dialog
    const rollTablesDialog = document.querySelector('dialog[is="roll-tables-dialog"]')
    if (rollTablesDialog instanceof HTMLDialogElement === false) {
      throw new Error('Roll tables dialog not setup!')
    }
    document.getElementById('tables-btn').addEventListener('click', () => {
      this.#loadRollTablesDialog(rollTablesDialog)
      rollTablesDialog.showModal()
    })
    rollTablesDialog.addEventListener('tables-changed', () => {
      this.#saveRollTablesFromDialog(rollTablesDialog)
    })

    // Wire up the scene switcher dialog
    const sceneSwitcherDialog = document.querySelector('dialog[is="scene-switcher"]')
    if (sceneSwitcherDialog instanceof HTMLDialogElement === false) {
      throw new Error('Scene switcher dialog not setup!')
    }
    document.getElementById('scenes-btn').addEventListener('click', async () => {
      await this.#loadSceneSwitcherDialog(sceneSwitcherDialog)
      sceneSwitcherDialog.showModal()
    })

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

    // Setup fullscreen Model-Viewer switcher button
    const switchShipFullscreenBtn = document.getElementById('ship-switch-fullscreen')
    switchShipFullscreenBtn.addEventListener('click', () => {
      // Toggle between model 1 and model 2
      this.#currentFullscreenModel = this.#currentFullscreenModel === 1 ? 2 : 1

      // Update the viewer src based on current model
      const url = this.#currentFullscreenModel === 1
        ? (this.shipModel instanceof File ? URL.createObjectURL(this.shipModel) : DefaultShipUrl)
        : (this.shipModel2 instanceof File ? URL.createObjectURL(this.shipModel2) : DefaultShipUrl)

      shipFullscreenViewer.src = url

      // Update the icon to show appropriate chevron
      // When viewing model 1, show right chevron (to switch to model 2)
      // When viewing model 2, show left chevron (to switch back to model 1)
      const showRightChevron = this.#currentFullscreenModel === 1
      switchShipFullscreenBtn.querySelector('.chevron-right').toggleAttribute('hidden', !showRightChevron)
      switchShipFullscreenBtn.querySelector('.chevron-left').toggleAttribute('hidden', showRightChevron)
    })

    // Setup Dropping ship's 3D model on the header model viewers
    const shipSidewaysViewer = document.getElementById('ship-sideways')
    const shipTopViewer = document.getElementById('ship-top')

    // Left side (ship-sideways) - Model 1
    setupDropOnly(shipSidewaysViewer, event => {
      if (!event.dataTransfer.items?.[0].type.startsWith('model/gltf') ||
                !event.dataTransfer.files?.[0]) {
        return false
      }

      // Call async method without blocking the event handler
      this.setShipModel(event.dataTransfer.files?.[0], 1).catch(err => {
        console.error('Error setting ship model 1:', err)
      })
      return true
    })

    // Right side (ship-top) - Model 2
    setupDropOnly(shipTopViewer, event => {
      if (!event.dataTransfer.items?.[0].type.startsWith('model/gltf') ||
                !event.dataTransfer.files?.[0]) {
        return false
      }

      // Call async method without blocking the event handler
      this.setShipModel(event.dataTransfer.files?.[0], 2).catch(err => {
        console.error('Error setting ship model 2:', err)
      })
      return true
    })

    // Setup player reorder handler
    document.querySelector('.players').addEventListener('player-reorder', (event) => {
      this.#handlePlayerReorder(event.detail)
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
        } else if (e.ctrlKey && e.altKey && e.key === 'm') {
          e.preventDefault()
          MirrorWindow.open()
        } else if (e.ctrlKey && e.altKey && e.key === 'd') {
          e.preventDefault()
          diceDialog.showModal()
        } else if (e.ctrlKey && e.altKey && e.key === 't') {
          e.preventDefault()
          this.#loadRollTablesDialog(rollTablesDialog)
          rollTablesDialog.showModal()
        } else if (e.ctrlKey && e.altKey && e.key === 'ArrowUp') {
          e.preventDefault()
          const themeSelectEl = document.getElementById('select-theme')
          if (themeSelectEl instanceof HTMLSelectElement && themeSelectEl.selectedOptions[0] !== themeSelectEl.lastElementChild) {
            themeSelectEl.selectedIndex++
            this.#useTheme(themeSelectEl.value)
          }
        } else if (e.ctrlKey && e.altKey && e.key === 'ArrowDown') {
          e.preventDefault()
          const themeSelectEl = document.getElementById('select-theme')
          if (themeSelectEl instanceof HTMLSelectElement && themeSelectEl.selectedOptions[0] !== themeSelectEl.firstElementChild) {
            themeSelectEl.selectedIndex--
            this.#useTheme(themeSelectEl.value)
          }
        }
      } finally {
        handlingInput = false
      }
    })

    // Close mirror window when main page is reloaded or closed
    window.addEventListener('beforeunload', () => {
      if (MirrorWindow.isOpen()) {
        MirrorWindow.close()
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
    document.documentElement.classList.toggle('alt-font', use)

    const altFontCheckbox = document.getElementById('alt-font-toggle')
    if (altFontCheckbox instanceof HTMLInputElement) {
      altFontCheckbox.checked = use
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

    if (!['1', '2', 'captains-log'].includes(edition)) {
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
    document.body.classList.toggle('legacy-task-trackers', use)

    const legacyTrackersCheckbox = document.getElementById('legacy-task-tracker-toggle')
    if (legacyTrackersCheckbox instanceof HTMLInputElement) {
      legacyTrackersCheckbox.checked = use
    }

    const trackerEls = document.getElementsByTagName('task-tracker')
    for (const el of trackerEls) {
      el.toggleAttribute('legacy-controls', use)
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
    dialogEl.querySelector('button.set-ship').addEventListener('click', async () => {
      await this.setShipModel(fileSelectShip.files[0], 1)
    })
    dialogEl.querySelector('button.clear-ship').addEventListener('click', async () => {
      await this.setShipModel(undefined, 1)
    })

    const fileSelectShip2 = dialogEl.querySelector('input.select-ship-2')
    if (fileSelectShip2 instanceof HTMLInputElement === false) {
      throw new Error('Page setup incorrect')
    }
    dialogEl.querySelector('button.set-ship-2').addEventListener('click', async () => {
      await this.setShipModel(fileSelectShip2.files[0], 2)
    })
    dialogEl.querySelector('button.clear-ship-2').addEventListener('click', async () => {
      await this.setShipModel(undefined, 2)
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

    dialogEl.querySelector('button.open-mirror').addEventListener('click', () => {
      const mirrorWin = MirrorWindow.open()
      if (!mirrorWin) {
        this.messageDialog?.show('Failed to open mirror window.\nPlease check if popups are blocked.')
      }
    })

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

    await this.setShipModel(gameInfo?.shipModel, 1)
    await this.setShipModel(gameInfo?.shipModel2, 2)

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

    const isCaptainsLog = editionSelectEl.value === 'captains-log'
    const momentumValue = isCaptainsLog
      ? momentumToggleEl.checked ? 1 : 0
      : momentumEl.value

    const threatValue = isCaptainsLog
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
      legacyTrackersCheckbox.checked,
      this.shipModel2
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
      .map((el, index) => {
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
          el.imageFile,
          index
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
    newPlayerEl.id = `player-${playerIndex}`

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
    if (typeof (info) === 'undefined' && threatEl instanceof HTMLInputElement) {
      const threatValue = parseInt(threatEl.value)
      threatEl.value = `${threatValue + 2}`
    }

    // if completely new player, focus on renaming
    if (typeof (info) === 'undefined') {
      newPlayerEl.focusNameEdit()
    }
  }

  /**
   * Handle player reorder event
   * @param {object} detail - Event detail with draggedElement, targetElement, and insertBefore
   */
  #handlePlayerReorder (detail) {
    const { draggedElement, targetElement, insertBefore } = detail
    if (!draggedElement || !targetElement) {
      return
    }

    const playersEl = document.querySelector('.players')

    // Calculate where the dragged element should be inserted
    let targetPosition
    if (insertBefore) {
      targetPosition = targetElement
    } else {
      targetPosition = targetElement.nextSibling
    }

    // Check if the element is already in the correct position to avoid unnecessary DOM manipulations
    // Case 1: Trying to insert element before itself
    if (draggedElement === targetPosition) {
      return
    }
    // Case 2: Element is already right before the target position
    if (draggedElement.nextSibling === targetPosition) {
      return
    }

    // Perform the reorder
    playersEl.insertBefore(draggedElement, targetPosition)
  }

  /**
   * Handler for new ship model drop/set
   * @param {File} modelFile  GLTF/GLB model file
   * @param {number} [modelIndex]  Which model to set (1 or 2)
   */
  async setShipModel (modelFile, modelIndex = 1) {
    // Check if file size exceeds 56 MB (56 * 1024 * 1024 bytes)
    const maxSizeBytes = 56 * 1024 * 1024
    if (modelFile && modelFile.size > maxSizeBytes) {
      const sizeMB = (modelFile.size / (1024 * 1024)).toFixed(2)
      const confirmed = await this.confirmDialog.confirm(
        `This 3D model is ${sizeMB} MB in size. Large models may increase load time, use more storage space, and make import/export slower.\n\n` +
        'Consider using a GLB compressor / 3D model optimizer to reduce the file size.\n\n' +
        'Do you still want to use this model?'
      )
      if (!confirmed) {
        return
      }
    }
    if (modelIndex === 2) {
      this.shipModel2 = modelFile
    } else {
      this.shipModel = modelFile
    }
    this.#updateShipSrc()
  }

  /**
   * Update the model-viewers so they are using the current ship model(s).
   */
  #updateShipSrc () {
    const hasTwoModels = this.shipModel instanceof File && this.shipModel2 instanceof File

    // Reset fullscreen model selection to model 1 when models change
    this.#currentFullscreenModel = 1

    // Determine URLs for each model
    const url1 = this.shipModel instanceof File
      ? URL.createObjectURL(this.shipModel)
      : DefaultShipUrl
    const url2 = this.shipModel2 instanceof File
      ? URL.createObjectURL(this.shipModel2)
      : url1 // Use same URL as model1 if model2 not set

    // Update header viewers with different models or same model
    const shipSidewaysViewer = document.getElementById('ship-sideways')
    const shipTopViewer = document.getElementById('ship-top')
    if (shipSidewaysViewer) shipSidewaysViewer.src = url1
    if (shipTopViewer) shipTopViewer.src = url2

    // Update fullscreen viewer (defaults to model1)
    const shipFullscreenViewer = document.getElementById('ship-fullscreen')
    if (shipFullscreenViewer) shipFullscreenViewer.src = url1

    // Show/hide the model switcher button based on whether we have two models
    const switcherBtn = document.getElementById('ship-switch-fullscreen')
    if (switcherBtn) {
      switcherBtn.style.display = hasTwoModels ? 'block' : 'none'
      // Reset icon to show right chevron (since we're on model 1)
      const rightChevron = switcherBtn.querySelector('.chevron-right')
      const leftChevron = switcherBtn.querySelector('.chevron-left')
      if (rightChevron) rightChevron.removeAttribute('hidden')
      if (leftChevron) leftChevron.setAttribute('hidden', '')
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

    await saveBlobAs(`${fileName}.staplay`, file, {
      description: 'STA Play Backup',
      mimes: [{ 'application/staplay': '.staplay' }]
    }, 'downloads', true)
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

  /**
   * Load roll tables into the dialog
   * @param {HTMLDialogElement} dialog - The roll tables dialog
   */
  async #loadRollTablesDialog (dialog) {
    // Use currentGameId if available, otherwise use a temporary ID (0)
    // The correct game ID will be set when the user saves
    const gameId = this.currentGameId || 0

    const tables = await this.db.getRollTables(gameId)

    // Add example table if no tables exist
    if (tables.length === 0) {
      const exampleTable = new RollTableInfo(
        gameId,
        'Example: Mission Complications',
        [
          { result: 'Equipment malfunction at a critical moment' },
          { result: 'Unexpected enemy reinforcements arrive' },
          { result: 'A trusted ally reveals hidden motives' },
          { result: 'Environmental hazard escalates the danger' },
          { result: 'Communication systems fail' },
          { result: 'Time constraint becomes more severe' }
        ]
      )
      tables.push(exampleTable)
    }

    dialog.loadTables(gameId, tables)
  }

  /**
   * Save roll tables from the dialog to the database
   * @param {HTMLDialogElement} dialog - The roll tables dialog
   */
  async #saveRollTablesFromDialog (dialog) {
    const tables = dialog.getTables()

    // Update all tables with the current game ID before saving
    // This handles the case where tables were created before the game was saved
    if (this.currentGameId) {
      tables.forEach(table => {
        table.game = this.currentGameId
      })
    }

    await this.db.replaceRollTables(tables)
  }

  /**
   * Load the scene switcher dialog with current scenes
   * @param {HTMLDialogElement} dialog - The scene switcher dialog
   */
  async #loadSceneSwitcherDialog (dialog) {
    const gameId = this.currentGameId
    if (!gameId) {
      console.warn('No game loaded, cannot show scene switcher')
      return
    }

    const scenes = await this.db.getScenes(gameId)

    // Set up the dialog with current scenes and callbacks
    dialog.setScenes(scenes, this.currentSceneId)

    dialog.onSceneSwitch(async (sceneId) => {
      await this.#switchToScene(sceneId)
    })

    dialog.onSceneAdd(async (sceneName) => {
      const newSceneId = await this.#addScene(sceneName)
      await this.#loadSceneSwitcherDialog(dialog)
      return newSceneId
    })

    dialog.onSceneRename(async (sceneId, newName) => {
      await this.#renameScene(sceneId, newName)
      await this.#loadSceneSwitcherDialog(dialog)
    })

    dialog.onSceneDelete(async (sceneId) => {
      await this.#deleteScene(sceneId)
      await this.#loadSceneSwitcherDialog(dialog)
    })
  }

  /**
   * Switch to a different scene
   * @param {number} sceneId - The scene ID to switch to
   */
  async #switchToScene (sceneId) {
    // Save current scene before switching
    await this.#saveCurrentScene()

    // Load the new scene
    this.currentSceneId = sceneId
    const sceneInfo = await this.db.getScenes(this.currentGameId)
    const scene = sceneInfo.find(s => s.id === sceneId)

    if (scene) {
      // Update scene description
      document.getElementById('general-text').innerHTML = scene.description || this.fallbackText

      // Update mission tracker
      const missionTrackerEl = document.getElementsByTagName('mission-tracker')[0]
      if (missionTrackerEl instanceof MissionTrackerElement) {
        if (scene.missionTrack.length >= 3) {
          missionTrackerEl.act1 = scene.missionTrack[0]
          missionTrackerEl.act2 = scene.missionTrack[1]
          missionTrackerEl.act3 = scene.missionTrack[2]
        }
      }

      // Clear existing traits
      const traitsEl = document.querySelector('traits')
      if (traitsEl) {
        traitsEl.querySelectorAll('trait-display').forEach(el => el.remove())
      }

      // Load traits for this scene
      const traits = await this.db.getTraits(sceneId)
      for (const trait of traits) {
        this.addTrait(trait)
      }
    }
  }

  /**
   * Save the current scene data
   */
  async #saveCurrentScene () {
    if (!this.currentSceneId || !this.currentGameId) {
      return
    }

    const missionTrackerEl = document.getElementsByTagName('mission-tracker')[0]
    if (!(missionTrackerEl instanceof MissionTrackerElement)) {
      return
    }

    const sceneInfo = new SceneInfo(
      this.currentSceneId,
      this.currentGameId,
      undefined,
      document.getElementById('general-text').innerHTML,
      [
        missionTrackerEl.act1,
        missionTrackerEl.act2,
        missionTrackerEl.act3
      ]
    )
    await this.db.saveSceneInfo(sceneInfo)

    const traits =
      [...document.querySelectorAll('traits trait-display')]
        .map(el => (el instanceof TraitDisplayElement ? el.text : ''))
        .filter(el => !!el)
        .filter((v, i, a) => a.indexOf(v) === i)
    await this.db.replaceTraits(this.currentSceneId, traits)
  }

  /**
   * Add a new scene
   * @param {string} sceneName - The name of the new scene
   * @returns {Promise<number|undefined>} The new scene ID
   */
  async #addScene (sceneName) {
    if (!this.currentGameId) {
      console.warn('No game loaded, cannot add scene')
      return undefined
    }

    const sceneInfo = new SceneInfo(
      undefined,
      this.currentGameId,
      sceneName,
      '<h1>Scene Notes</h1><p>The story continues...</p>',
      ['', '', '']
    )

    const newSceneId = await this.db.saveSceneInfo(sceneInfo)
    return newSceneId
  }

  /**
   * Rename a scene
   * @param {number} sceneId - The scene ID to rename
   * @param {string} newName - The new scene name
   */
  async #renameScene (sceneId, newName) {
    const scenes = await this.db.getScenes(this.currentGameId)
    const scene = scenes.find(s => s.id === sceneId)

    if (scene) {
      scene.name = newName
      await this.db.saveSceneInfo(scene)
    }
  }

  /**
   * Delete a scene
   * @param {number} sceneId - The scene ID to delete
   */
  async #deleteScene (sceneId) {
    if (!this.currentGameId) {
      return
    }

    // Don't allow deleting the last scene
    const scenes = await this.db.getScenes(this.currentGameId)
    if (scenes.length <= 1) {
      if (this.messageDialog && typeof this.messageDialog.message === 'function') {
        await this.messageDialog.message('Cannot delete the last scene.')
      }
      return
    }

    // Delete the scene from database
    const db = await this.db.open()
    await db.delete('scenes', sceneId)

    // Delete all traits associated with this scene
    const traits = await db.getAllFromIndex('traits', 'scene', sceneId)
    for (const trait of traits) {
      await db.delete('traits', trait.id)
    }

    db.close()

    // If we just deleted the current scene, switch to another one
    if (sceneId === this.currentSceneId) {
      const remainingScenes = await this.db.getScenes(this.currentGameId)
      if (remainingScenes.length > 0) {
        await this.#switchToScene(remainingScenes[0].id)
      }
    }
  }
}

globalThis.App = new IndexController()
