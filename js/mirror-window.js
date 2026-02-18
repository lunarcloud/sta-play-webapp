import { ShipAlertElement } from '../components/ship-alert/ship-alert-element.js'

/**
 * Static class for managing a mirror window that displays a synchronized copy of the main application.
 */
export class MirrorWindow {
  /**
   * @type {Window|null}
   */
  static #window = null

  /**
   * @type {MutationObserver|null}
   */
  static #observer = null

  /**
   * @type {number|null}
   */
  static #syncTimer = null

  /**
   * @type {boolean}
   */
  static #syncScheduled = false

  /**
   * @type {object}
   * @property {boolean} body - Body attributes and classes
   * @property {boolean} menu - Menu items (momentum/threat pools)
   * @property {boolean} shipAlert - Ship alert element
   * @property {boolean} generalText - General text/story notes
   * @property {boolean} trackers - Task trackers
   * @property {boolean} traits - Character traits
   * @property {boolean} missionTracker - Mission tracker
   * @property {boolean} players - Player displays
   * @property {boolean} headerModels - Header ship models
   * @property {boolean} fullscreenShip - Fullscreen ship model
   * @property {boolean} navigation - Navigation element
   * @property {boolean} theme - Theme element
   * @property {boolean} themeStylesheet - Theme stylesheet link
   * @property {boolean} rootStyle - Root element style (font size)
   */
  static #syncsNeeded = {
    body: false,
    menu: false,
    shipAlert: false,
    generalText: false,
    trackers: false,
    traits: false,
    missionTracker: false,
    players: false,
    headerModels: false,
    fullscreenShip: false,
    navigation: false,
    theme: false,
    themeStylesheet: false,
    rootStyle: false
  }

  /**
   * Opens a mirror window that reflects the current application state.
   * @returns {Window|null} The opened window or null if it failed to open
   */
  static open () {
    // Close existing mirror window if open
    if (MirrorWindow.#window && !MirrorWindow.#window.closed) {
      MirrorWindow.#window.close()
    }

    // Open new window with minimal browser chrome
    const features = [
      'width=1024',
      'height=768',
      'location=no',
      'menubar=no',
      'toolbar=no',
      'status=no',
      'scrollbars=yes',
      'resizable=yes'
    ].join(',')
    MirrorWindow.#window = window.open('', 'STAPlayMirror', features)

    if (!MirrorWindow.#window) {
      console.error('Failed to open mirror window. Popup may have been blocked.')
      return null
    }

    // Set up the mirror window
    MirrorWindow.#setup(MirrorWindow.#window)

    // Set up synchronization
    MirrorWindow.#setupSynchronization()

    return MirrorWindow.#window
  }

  /**
   * Initializes the mirror window with the current document structure.
   * @param {Window} targetWindow The window to mirror content to
   */
  static #setup (targetWindow) {
    const doc = targetWindow.document

    // Copy the entire document structure
    doc.open()
    doc.write('<!DOCTYPE html>')
    doc.write('<html lang="en">')
    doc.write(document.documentElement.innerHTML)
    doc.write('</html>')
    doc.close()

    // Wait for the document to be ready before manipulating
    const initialize = () => {
      if (!doc.body) {
        setTimeout(initialize, 10)
        return
      }

      // Mark the window as a mirror
      doc.body.setAttribute('data-mirror-window', 'true')
      doc.body.classList.add('mirror')

      // Re-wire fullscreen button to control mirror window
      const fsBtn = doc.querySelector('#fullscreen-btn')
      if (fsBtn) {
        // Remove existing click handlers by cloning and replacing
        const newFsBtn = /** @type {Element} */ (fsBtn.cloneNode(true))
        fsBtn.parentNode.replaceChild(newFsBtn, fsBtn)

        // Add new handler for mirror window
        newFsBtn.addEventListener('click', () => {
          const exiting = !!doc.fullscreenElement || !doc.fullscreenEnabled
          if (exiting) {
            doc.exitFullscreen()
          } else {
            doc.documentElement.requestFullscreen({ navigationUI: 'auto' })
          }

          // Update the button symbol
          newFsBtn.querySelector('.symbol.enter')?.toggleAttribute('hidden', !exiting)
          newFsBtn.querySelector('.symbol.exit')?.toggleAttribute('hidden', exiting)
        })
      }

      // Copy all styles
      document.querySelectorAll('link[rel="stylesheet"]').forEach((/** @type {HTMLLinkElement} */ link) => {
        const newLink = doc.createElement('link')
        newLink.rel = 'stylesheet'
        newLink.href = link.href
        doc.head.appendChild(newLink)
      })

      // Copy inline styles
      document.querySelectorAll('style').forEach(style => {
        const newStyle = doc.createElement('style')
        newStyle.textContent = style.textContent
        doc.head.appendChild(newStyle)
      })

      // Make the mirror window read-only
      MirrorWindow.#disableInteractivity(doc)
    }

    initialize()
  }

  /**
   * Disables interactive elements in the mirror document to make it read-only.
   * Removes contenteditable attributes, disables inputs/selects/textareas,
   * and prevents keyboard focus on interactive elements.
   * @param {Document} doc - The mirror window document
   */
  static #disableInteractivity (doc) {
    // Remove contenteditable from light DOM elements
    doc.querySelectorAll('[contenteditable]').forEach(el => {
      el.removeAttribute('contenteditable')
    })

    // Disable all light DOM form controls
    doc.querySelectorAll('input, select, textarea').forEach(el => {
      el.setAttribute('disabled', '')
      el.setAttribute('tabindex', '-1')
    })
  }

  /**
   * Rebuilds the entire mirror window content by re-running the setup.
   * Used when theme changes, as it's more reliable than trying to sync all style changes.
   */
  static #rebuild () {
    if (!MirrorWindow.#window || MirrorWindow.#window.closed) {
      return
    }

    // Re-setup the mirror window with current content
    MirrorWindow.#setup(MirrorWindow.#window)
  }

  /**
   * Sets up mutation observer to synchronize changes from main window to mirror window.
   */
  static #setupSynchronization () {
    // Clean up existing observer if present
    if (MirrorWindow.#observer) {
      MirrorWindow.#observer.disconnect()
    }

    // Create a mutation observer to watch for DOM changes
    MirrorWindow.#observer = new MutationObserver((mutations) => {
      if (!MirrorWindow.#window || MirrorWindow.#window.closed) {
        MirrorWindow.#observer.disconnect()
        return
      }

      // Check if this is a theme change and what specific elements changed
      let isThemeChange = false

      for (const mutation of mutations) {
        // For characterData mutations, the target is a Text node, not an Element.
        // Resolve to the nearest parent element for classification.
        const target = mutation.target instanceof HTMLElement
          ? mutation.target
          : mutation.target.parentElement
        if (!target) continue

        // Theme link href change
        if (target.id === 'theme-link' && mutation.attributeName === 'href') {
          isThemeChange = true
          break
        }
        // Theme element value change
        if (target.tagName?.toLowerCase() === 'theme' && mutation.attributeName === 'value') {
          isThemeChange = true
          break
        }

        // Body attribute changes (alert, edition, etc.)
        if (target === document.body) {
          MirrorWindow.#syncsNeeded.body = true
          continue
        }

        // Root element style changes (font size via CSS custom property)
        if (target === document.documentElement && mutation.attributeName === 'style') {
          MirrorWindow.#syncsNeeded.rootStyle = true
          continue
        }

        // Header changes (ship models, cloaking)
        const isInHeader = target.closest && target.closest('header') !== null
        if (isInHeader) {
          // Check if it's the fullscreen ship specifically
          if (target.id === 'ship-fullscreen' || (target.closest && target.closest('#ship-fullscreen'))) {
            MirrorWindow.#syncsNeeded.fullscreenShip = true
          } else {
            // Header ship models
            MirrorWindow.#syncsNeeded.headerModels = true
          }
          continue
        }

        // Navigation changes
        const isInNav = target.closest && target.closest('nav') !== null
        if (isInNav) {
          MirrorWindow.#syncsNeeded.navigation = true
          continue
        }

        // Theme decoration changes (don't trigger main content sync)
        const isThemeDecoration = (target.classList.contains('theme-decoration')) ||
                                  (target.closest && target.closest('.theme-decoration') !== null)
        if (isThemeDecoration) {
          continue // Theme decorations don't require any sync
        }

        // Theme element changes
        if (target.tagName?.toLowerCase() === 'theme') {
          MirrorWindow.#syncsNeeded.theme = true
          continue
        }

        // Now check main content area elements
        const mainEl = document.querySelector('main')
        if (mainEl && (target === mainEl || mainEl.contains(target))) {
          // Menu items (momentum/threat pools)
          if (target.tagName?.toLowerCase() === 'menu-items' ||
              (target.closest && target.closest('menu-items'))) {
            MirrorWindow.#syncsNeeded.menu = true
            continue
          }

          // Ship alert
          if (target.tagName?.toLowerCase() === 'ship-alert' ||
              (target.closest && target.closest('ship-alert'))) {
            MirrorWindow.#syncsNeeded.shipAlert = true
            continue
          }

          // General text (story notes)
          if (target.id === 'general-text' ||
              (target.closest && target.closest('#general-text'))) {
            MirrorWindow.#syncsNeeded.generalText = true
            continue
          }

          // Task trackers
          if (target.tagName?.toLowerCase() === 'task-trackers' ||
              (target.closest && target.closest('task-trackers'))) {
            MirrorWindow.#syncsNeeded.trackers = true
            continue
          }

          // Traits
          if (target.tagName?.toLowerCase() === 'traits' ||
              (target.closest && target.closest('traits'))) {
            MirrorWindow.#syncsNeeded.traits = true
            continue
          }

          // Mission tracker
          if (target.tagName?.toLowerCase() === 'mission-tracker' ||
              (target.closest && target.closest('mission-tracker'))) {
            MirrorWindow.#syncsNeeded.missionTracker = true
            continue
          }

          // Players
          const isInPlayers = target.closest && target.closest('ul.players') !== null
          const isPlayerDisplay = target.tagName?.toLowerCase() === 'li' && target.getAttribute('is') === 'player-display'
          if (isInPlayers || isPlayerDisplay) {
            MirrorWindow.#syncsNeeded.players = true
            continue
          }
        }
      }

      // Rebuild entire mirror on theme change
      if (isThemeChange) {
        MirrorWindow.#rebuild()
      } else {
        // Schedule a targeted sync based on what changed
        MirrorWindow.#scheduleSync()
      }
    })

    // Observe changes to main content areas
    const mainEl = document.querySelector('main')
    const headerEl = document.querySelector('header')
    const navEl = document.querySelector('nav')
    const themeEl = document.querySelector('theme')

    if (mainEl) {
      MirrorWindow.#observer.observe(mainEl, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true
      })
    }

    if (headerEl) {
      MirrorWindow.#observer.observe(headerEl, {
        attributes: true,
        subtree: true
      })
    }

    if (navEl) {
      MirrorWindow.#observer.observe(navEl, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true
      })
    }

    if (themeEl) {
      MirrorWindow.#observer.observe(themeEl, {
        childList: true,
        attributes: true,
        attributeFilter: ['value']
      })
    }

    // Also watch body attributes for edition, alert, and other changes
    MirrorWindow.#observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class', 'alert', 'loaded-game-name', 'edition']
    })

    // Watch for theme stylesheet changes
    const themeLink = document.getElementById('theme-link')
    if (themeLink) {
      MirrorWindow.#observer.observe(themeLink, {
        attributes: true,
        attributeFilter: ['href']
      })
    }

    // Watch for root element style changes (font size via CSS custom property)
    MirrorWindow.#observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style']
    })

    // Set up input change listeners for immediate sync
    MirrorWindow.#setupInputListeners()
  }

  /**
   * Sets up listeners on input elements to trigger sync when values change.
   */
  static #setupInputListeners () {
    // Listen for input events on all input, select, and textarea elements
    const inputElements = document.querySelectorAll('input, select, textarea')

    /**
     * Determines which sync flag to set based on the element's location in the DOM.
     * @param {Element} element - The element that changed
     */
    const flagSyncForElement = (element) => {
      if (element.closest && element.closest('ul.players')) {
        MirrorWindow.#syncsNeeded.players = true
      } else if (element.closest && element.closest('menu-items')) {
        MirrorWindow.#syncsNeeded.menu = true
      } else if (element.closest && element.closest('task-trackers')) {
        MirrorWindow.#syncsNeeded.trackers = true
      } else if (element.id === 'general-text' || (element.closest && element.closest('#general-text'))) {
        MirrorWindow.#syncsNeeded.generalText = true
      } else if (element.closest && element.closest('nav')) {
        MirrorWindow.#syncsNeeded.navigation = true
      }
      MirrorWindow.#scheduleSync()
    }

    inputElements.forEach(element => {
      // Use 'input' event which fires on every value change
      element.addEventListener('input', () => flagSyncForElement(element))

      // Also listen for 'change' event for select dropdowns and
      // programmatic value changes (e.g., scroll-to-change on number inputs)
      element.addEventListener('change', () => flagSyncForElement(element))
    })

    // Listen for input events on contenteditable elements (general-text and shipname)
    const generalText = document.getElementById('general-text')
    if (generalText) {
      generalText.addEventListener('input', () => {
        MirrorWindow.#syncsNeeded.generalText = true
        MirrorWindow.#scheduleSync()
      })
    }

    const shipname = document.getElementById('shipname')
    if (shipname) {
      shipname.addEventListener('input', () => {
        MirrorWindow.#syncsNeeded.navigation = true
        MirrorWindow.#scheduleSync()
      })
    }
  }

  /**
   * Synchronizes form element values (input, select, textarea) from source to target.
   * This is needed because innerHTML doesn't capture current form values, only initial HTML.
   * @param {Element|DocumentFragment} sourceEl - The source element containing form inputs
   * @param {Element|DocumentFragment} targetEl - The target element to sync form inputs to
   */
  static #syncFormValues (sourceEl, targetEl) {
    if (!sourceEl || !targetEl) return

    // Sync all input elements (text, number, checkbox, radio)
    const sourceInputs = sourceEl.querySelectorAll('input')
    const targetInputs = targetEl.querySelectorAll('input')
    sourceInputs.forEach((input, index) => {
      if (targetInputs[index]) {
        if (input.type === 'checkbox' || input.type === 'radio') {
          targetInputs[index].checked = input.checked
        } else {
          targetInputs[index].value = input.value
        }
      }
    })

    // Sync all select elements
    const sourceSelects = sourceEl.querySelectorAll('select')
    const targetSelects = targetEl.querySelectorAll('select')
    sourceSelects.forEach((select, index) => {
      if (targetSelects[index]) {
        targetSelects[index].selectedIndex = select.selectedIndex
        targetSelects[index].value = select.value
      }
    })

    // Sync all textarea elements
    const sourceTextareas = sourceEl.querySelectorAll('textarea')
    const targetTextareas = targetEl.querySelectorAll('textarea')
    sourceTextareas.forEach((textarea, index) => {
      if (targetTextareas[index]) {
        targetTextareas[index].value = textarea.value
      }
    })
  }

  /**
   * Synchronizes custom element attributes (for elements with shadow DOM).
   * Instead of copying shadow DOM internals, we sync attributes which trigger
   * attributeChangedCallback in the custom element, allowing it to update properly.
   * @param {Element|DocumentFragment} sourceEl - The source element to copy from
   * @param {Element|DocumentFragment} targetEl - The target element to copy to
   */
  static #syncCustomElementAttributes (sourceEl, targetEl) {
    if (!sourceEl || !targetEl) return

    // List of custom elements that use shadow DOM and should have their attributes synced
    const customElementSelectors = ['input-progress']

    customElementSelectors.forEach(selector => {
      const sourceElements = sourceEl.querySelectorAll(selector)
      const targetElements = targetEl.querySelectorAll(selector)

      sourceElements.forEach((sourceElement, index) => {
        const targetElement = targetElements[index]
        if (targetElement) {
          // Sync all attributes to trigger attributeChangedCallback
          Array.from(sourceElement.attributes).forEach(attr => {
            targetElement.setAttribute(attr.name, attr.value)
          })
        }
      })
    })
  }

  /**
   * Synchronizes model-viewer properties and styles from source to target.
   * This is needed for cloaking effects which set opacity and exposure via JavaScript,
   * and for syncing camera orientation when users interact with the model.
   * @param {HTMLElement} sourceViewer - The source model-viewer element
   * @param {HTMLElement} targetViewer - The target model-viewer element
   */
  static #syncModelViewerProperties (sourceViewer, targetViewer) {
    if (!sourceViewer || !targetViewer) return

    // Sync src attribute
    if ('src' in sourceViewer) {
      targetViewer.setAttribute('src', /** @type {string} */ (sourceViewer['src']))
    }

    // Sync exposure property (used in cloaking effect)
    if ('exposure' in sourceViewer) {
      targetViewer['exposure'] = sourceViewer['exposure']
    }

    // Sync inline style.opacity (used in cloaking effect)
    if (sourceViewer.style.opacity !== undefined && sourceViewer.style.opacity !== '') {
      targetViewer.style.opacity = sourceViewer.style.opacity
    } else if (targetViewer.style.opacity !== '') {
      // Clear opacity if source doesn't have it set
      targetViewer.style.opacity = ''
    }

    // Sync camera orientation properties for interactive model viewing
    // These properties are updated when users interact with the model-viewer
    // Use setAttribute to set the camera-orbit, camera-target, and field-of-view attributes
    // which will update the view more reliably than setting properties directly
    if ('cameraOrbit' in sourceViewer && sourceViewer['cameraOrbit']) {
      targetViewer.setAttribute('camera-orbit', /** @type {string} */ (sourceViewer['cameraOrbit']))
      // Force immediate camera update
      if ('jumpCameraToGoal' in targetViewer && typeof targetViewer['jumpCameraToGoal'] === 'function') {
        targetViewer['jumpCameraToGoal']()
      }
    }

    if ('cameraTarget' in sourceViewer && sourceViewer['cameraTarget']) {
      targetViewer.setAttribute('camera-target', /** @type {string} */ (sourceViewer['cameraTarget']))
    }

    if ('fieldOfView' in sourceViewer && sourceViewer['fieldOfView']) {
      targetViewer.setAttribute('field-of-view', /** @type {string} */ (sourceViewer['fieldOfView']))
    }
  }

  /**
   * Schedules a sync operation with debouncing to prevent flickering.
   */
  static #scheduleSync () {
    // If a sync is already scheduled, don't schedule another
    if (MirrorWindow.#syncScheduled) {
      return
    }

    MirrorWindow.#syncScheduled = true

    // Clear any existing timer
    if (MirrorWindow.#syncTimer) {
      cancelAnimationFrame(MirrorWindow.#syncTimer)
    }

    // Schedule sync for next frame
    MirrorWindow.#syncTimer = requestAnimationFrame(() => {
      MirrorWindow.#sync()
      MirrorWindow.#syncScheduled = false
      MirrorWindow.#syncTimer = null
      // Reset all sync flags after sync completes
      MirrorWindow.#syncsNeeded = {
        body: false,
        menu: false,
        shipAlert: false,
        generalText: false,
        trackers: false,
        traits: false,
        missionTracker: false,
        players: false,
        headerModels: false,
        fullscreenShip: false,
        navigation: false,
        theme: false,
        themeStylesheet: false,
        rootStyle: false
      }
    })
  }

  /**
   * Synchronizes body classes and attributes to mirror window.
   * @param {Document} mirrorDoc - Mirror window document
   */
  static #syncBodyAttributes (mirrorDoc) {
    // Sync body classes (preserve mirror class)
    const bodyClasses = document.body.className.split(' ')
    bodyClasses.forEach(cls => {
      if (cls && !mirrorDoc.body.classList.contains(cls)) {
        mirrorDoc.body.classList.add(cls)
      }
    })
    // Remove classes that are no longer in main body (except mirror)
    Array.from(mirrorDoc.body.classList).forEach(cls => {
      if (cls !== 'mirror' && !document.body.classList.contains(cls)) {
        mirrorDoc.body.classList.remove(cls)
      }
    })

    // Sync body attributes
    Array.from(document.body.attributes).forEach(attr => {
      if (attr.name !== 'data-mirror-window' && attr.name !== 'class') {
        mirrorDoc.body.setAttribute(attr.name, attr.value)
      }
    })
  }

  /**
   * Synchronizes menu items (momentum pool, threat pool, etc.).
   * @param {Document} mirrorDoc - Mirror window document
   */
  static #syncMenuItems (mirrorDoc) {
    const menuItems = document.querySelector('menu-items')
    const mirrorMenuItems = mirrorDoc.querySelector('menu-items')
    if (menuItems && mirrorMenuItems) {
      MirrorWindow.#syncFormValues(menuItems, mirrorMenuItems)
    }
  }

  /**
   * Synchronizes ship alert element including color property.
   * @param {Element} mainEl - Main element from source window
   * @param {Element} mirrorMainEl - Main element from mirror window
   */
  static #syncShipAlert (mainEl, mirrorMainEl) {
    const shipAlert = mainEl.querySelector('ship-alert')
    const mirrorShipAlert = mirrorMainEl.querySelector('ship-alert')
    if (shipAlert && mirrorShipAlert) {
      // Copy attributes instead of cloning to preserve shadow DOM
      Array.from(shipAlert.attributes).forEach(attr => {
        mirrorShipAlert.setAttribute(attr.name, attr.value)
      })
      // Also sync the color property in case it was set via JavaScript
      // without updating the attribute (the setter only updates attribute if it exists)
      if (shipAlert instanceof ShipAlertElement && shipAlert.color) {
        mirrorShipAlert.setAttribute('color', shipAlert.color)
      }
    }
  }

  /**
   * Synchronizes general text contenteditable area.
   * @param {Element} mainEl - Main element from source window
   * @param {Element} mirrorMainEl - Main element from mirror window
   */
  static #syncGeneralText (mainEl, mirrorMainEl) {
    const generalText = mainEl.querySelector('#general-text')
    const mirrorGeneralText = mirrorMainEl.querySelector('#general-text')
    if (generalText && mirrorGeneralText) {
      mirrorGeneralText.innerHTML = generalText.innerHTML
    }
  }

  /**
   * Synchronizes task trackers with form values and attributes.
   * Syncs each tracker individually by attributes to avoid destroying/recreating custom elements.
   * @param {Element} mainEl - Main element from source window
   * @param {Element} mirrorMainEl - Main element from mirror window
   */
  static #syncTaskTrackers (mainEl, mirrorMainEl) {
    const taskTrackers = mainEl.querySelector('task-trackers')
    const mirrorTaskTrackers = mirrorMainEl.querySelector('task-trackers')
    if (!taskTrackers || !mirrorTaskTrackers) return

    const sourceTrackers = Array.from(taskTrackers.querySelectorAll('task-tracker'))
    const mirrorTrackers = Array.from(mirrorTaskTrackers.querySelectorAll('task-tracker'))

    // Remove extra mirror trackers if source has fewer
    while (mirrorTrackers.length > sourceTrackers.length) {
      const extra = mirrorTrackers.pop()
      if (extra) extra.remove()
    }

    // Sync or add trackers
    sourceTrackers.forEach((sourceTracker, index) => {
      if (index < mirrorTrackers.length) {
        // Sync existing tracker by copying attributes to trigger attributeChangedCallback
        const mirrorTracker = mirrorTrackers[index]
        Array.from(sourceTracker.attributes).forEach(attr => {
          mirrorTracker.setAttribute(attr.name, attr.value)
        })
        // Sync shadow DOM form values directly
        if (sourceTracker.shadowRoot && mirrorTracker.shadowRoot) {
          MirrorWindow.#syncFormValues(sourceTracker.shadowRoot, mirrorTracker.shadowRoot)
          MirrorWindow.#syncCustomElementAttributes(sourceTracker.shadowRoot, mirrorTracker.shadowRoot)
        }
      } else {
        // Add new tracker by cloning the source element
        const newTracker = /** @type {Element} */ (sourceTracker.cloneNode(true))
        mirrorTaskTrackers.appendChild(newTracker)
        // Sync attributes after append to trigger attributeChangedCallback
        Array.from(sourceTracker.attributes).forEach(attr => {
          newTracker.setAttribute(attr.name, attr.value)
        })
        // Sync shadow DOM form values on next frame after custom element initializes
        requestAnimationFrame(() => {
          if (MirrorWindow.isOpen() && sourceTracker.shadowRoot && newTracker.shadowRoot) {
            MirrorWindow.#syncFormValues(sourceTracker.shadowRoot, newTracker.shadowRoot)
            MirrorWindow.#syncCustomElementAttributes(sourceTracker.shadowRoot, newTracker.shadowRoot)
          }
        })
      }
    })
  }

  /**
   * Synchronizes trait elements and their attributes.
   * @param {Element} mainEl - Main element from source window
   * @param {Element} mirrorMainEl - Main element from mirror window
   */
  static #syncTraits (mainEl, mirrorMainEl) {
    const traits = mainEl.querySelector('traits')
    const mirrorTraits = mirrorMainEl.querySelector('traits')
    if (traits && mirrorTraits) {
      mirrorTraits.innerHTML = traits.innerHTML

      // Sync attributes on each trait-display element (for text in shadow DOM)
      const sourceTraitDisplays = traits.querySelectorAll('trait-display')
      const mirrorTraitDisplays = mirrorTraits.querySelectorAll('trait-display')
      sourceTraitDisplays.forEach((sourceTrait, index) => {
        const mirrorTrait = mirrorTraitDisplays[index]
        if (mirrorTrait) {
          // Copy all attributes to trigger attributeChangedCallback
          Array.from(sourceTrait.attributes).forEach(attr => {
            mirrorTrait.setAttribute(attr.name, attr.value)
          })
        }
      })
    }
  }

  /**
   * Synchronizes mission tracker attributes and shadow DOM form values.
   * @param {Element} mainEl - Main element from source window
   * @param {Element} mirrorMainEl - Main element from mirror window
   */
  static #syncMissionTracker (mainEl, mirrorMainEl) {
    const missionTracker = mainEl.querySelector('mission-tracker')
    const mirrorMissionTracker = mirrorMainEl.querySelector('mission-tracker')
    if (missionTracker && mirrorMissionTracker) {
      // Sync attributes (act1, act2, act3) to trigger attributeChangedCallback
      Array.from(missionTracker.attributes).forEach(attr => {
        mirrorMissionTracker.setAttribute(attr.name, attr.value)
      })

      // Also sync shadow DOM select elements directly
      // The mission-tracker has shadow DOM with select elements for each scene
      if (missionTracker.shadowRoot && mirrorMissionTracker.shadowRoot) {
        const sourceSelects = missionTracker.shadowRoot.querySelectorAll('select')
        const mirrorSelects = mirrorMissionTracker.shadowRoot.querySelectorAll('select')
        sourceSelects.forEach((sourceSelect, index) => {
          const mirrorSelect = mirrorSelects[index]
          if (mirrorSelect && sourceSelect instanceof HTMLSelectElement) {
            mirrorSelect.value = sourceSelect.value
            mirrorSelect.selectedIndex = sourceSelect.selectedIndex
          }
        })
      }
    }
  }

  /**
   * Synchronizes player display elements (conditionally based on #syncPlayersNeeded flag).
   * @param {Element} mainEl - Main element from source window
   * @param {Element} mirrorMainEl - Main element from mirror window
   */
  static #syncPlayers (mainEl, mirrorMainEl) {
    // Only sync players if changes affect players (to avoid flicker from header/theme updates)
    if (!MirrorWindow.#syncsNeeded.players) {
      return
    }

    const playersUl = mainEl.querySelector('ul.players')
    const mirrorPlayersUl = mirrorMainEl.querySelector('ul.players')
    if (!playersUl || !mirrorPlayersUl) {
      return
    }

    // Get all player-display elements from both windows
    const players = Array.from(playersUl.querySelectorAll('li[is="player-display"]'))
    const mirrorPlayers = Array.from(mirrorPlayersUl.querySelectorAll('li[is="player-display"]'))

    // Remove extra mirror players if main has fewer
    while (mirrorPlayers.length > players.length) {
      const extraPlayer = mirrorPlayers.pop()
      if (extraPlayer) {
        extraPlayer.remove()
      }
    }

    // Sync or add players
    players.forEach((player, index) => {
      if (index < mirrorPlayers.length) {
        // Sync existing player by copying attributes and innerHTML
        const mirrorPlayer = mirrorPlayers[index]
        Array.from(player.attributes).forEach(attr => {
          mirrorPlayer.setAttribute(attr.name, attr.value)
        })
        mirrorPlayer.innerHTML = player.innerHTML
        // Sync form values after innerHTML update
        MirrorWindow.#syncFormValues(player, mirrorPlayer)
        // Sync custom element attributes (e.g., input-progress) to trigger their attributeChangedCallback
        MirrorWindow.#syncCustomElementAttributes(player, mirrorPlayer)
      } else {
        // Add new player by cloning with full content
        const newPlayer = /** @type {Element} */ (player.cloneNode(true))
        mirrorPlayersUl.appendChild(newPlayer)
        // Sync form values and custom element attributes after adding
        MirrorWindow.#syncFormValues(player, newPlayer)
        MirrorWindow.#syncCustomElementAttributes(player, newPlayer)
        // Repeat sync on next frame to ensure DOM is fully settled
        // This prevents the image update issue when new players are added
        requestAnimationFrame(() => MirrorWindow.#sync())
      }
    })
  }

  /**
   * Synchronizes header ship models with cloaking effects.
   * @param {Document} mirrorDoc - Mirror window document
   */
  static #syncHeaderModels (mirrorDoc) {
    const headerEl = document.querySelector('header')
    const mirrorHeaderEl = mirrorDoc.querySelector('header')
    if (headerEl && mirrorHeaderEl) {
      // Sync model-viewer properties including cloaking effect
      const modelViewers = headerEl.querySelectorAll('model-viewer')
      const mirrorModelViewers = mirrorHeaderEl.querySelectorAll('model-viewer')
      modelViewers.forEach((viewer, index) => {
        if (mirrorModelViewers[index]) {
          MirrorWindow.#syncModelViewerProperties(/** @type {HTMLElement} */ (viewer), /** @type {HTMLElement} */ (mirrorModelViewers[index]))
        }
      })
    }
  }

  /**
   * Synchronizes fullscreen ship model viewer.
   * @param {Document} mirrorDoc - Mirror window document
   */
  static #syncFullscreenShip (mirrorDoc) {
    const fullscreenShip = document.getElementById('ship-fullscreen')
    const mirrorFullscreenShip = mirrorDoc.getElementById('ship-fullscreen')
    if (fullscreenShip && mirrorFullscreenShip) {
      MirrorWindow.#syncModelViewerProperties(fullscreenShip, mirrorFullscreenShip)
    }
  }

  /**
   * Synchronizes navigation element.
   * @param {Document} mirrorDoc - Mirror window document
   */
  static #syncNavigation (mirrorDoc) {
    const navEl = document.querySelector('nav')
    const mirrorNavEl = mirrorDoc.querySelector('nav')
    if (navEl && mirrorNavEl) {
      // Clone the nav element's children to preserve custom element state
      const clone = navEl.cloneNode(true)
      // Clear and replace content
      while (mirrorNavEl.firstChild) {
        mirrorNavEl.removeChild(mirrorNavEl.firstChild)
      }
      while (clone.firstChild) {
        mirrorNavEl.appendChild(clone.firstChild)
      }
    }
  }

  /**
   * Synchronizes theme element.
   * @param {Document} mirrorDoc - Mirror window document
   */
  static #syncTheme (mirrorDoc) {
    const themeEl = document.querySelector('theme')
    const mirrorThemeEl = mirrorDoc.querySelector('theme')
    if (themeEl && mirrorThemeEl) {
      // Clone the theme element's children to preserve custom element state
      const clone = themeEl.cloneNode(true)
      // Clear and replace content
      while (mirrorThemeEl.firstChild) {
        mirrorThemeEl.removeChild(mirrorThemeEl.firstChild)
      }
      while (clone.firstChild) {
        mirrorThemeEl.appendChild(clone.firstChild)
      }
      if (themeEl.hasAttribute('value')) {
        mirrorThemeEl.setAttribute('value', themeEl.getAttribute('value'))
      }
    }
  }

  /**
   * Synchronizes theme stylesheet link.
   * @param {Document} mirrorDoc - Mirror window document
   */
  static #syncThemeStylesheet (mirrorDoc) {
    const themeLink = document.getElementById('theme-link')
    const mirrorThemeLink = mirrorDoc.getElementById('theme-link')
    if (themeLink instanceof HTMLLinkElement &&
      mirrorThemeLink instanceof HTMLLinkElement &&
      themeLink.href) {
      mirrorThemeLink.href = themeLink.href
    }
  }

  /**
   * Synchronizes root element inline style (font size via CSS custom property).
   * @param {Document} mirrorDoc - Mirror window document
   */
  static #syncRootStyle (mirrorDoc) {
    const sourceStyle = document.documentElement.style.cssText
    mirrorDoc.documentElement.style.cssText = sourceStyle
  }

  /**
   * Synchronizes current content to the mirror window.
   * This is the main sync orchestrator that calls specific sync functions
   * based on which flags have been set by the mutation observer.
   * Only syncs what actually changed to prevent unnecessary flickering.
   */
  static #sync () {
    if (!MirrorWindow.#window || MirrorWindow.#window.closed) {
      return
    }

    try {
      const mirrorDoc = MirrorWindow.#window.document

      // Check if document body is ready
      if (!mirrorDoc.body) {
        return
      }

      // Only sync parts that have changed (based on flags)
      if (MirrorWindow.#syncsNeeded.body) {
        MirrorWindow.#syncBodyAttributes(mirrorDoc)
      }

      if (MirrorWindow.#syncsNeeded.menu) {
        MirrorWindow.#syncMenuItems(mirrorDoc)
      }

      // Sync main content area (only what changed)
      const mainEl = document.querySelector('main')
      const mirrorMainEl = mirrorDoc.querySelector('main')
      if (mainEl && mirrorMainEl) {
        if (MirrorWindow.#syncsNeeded.shipAlert) {
          MirrorWindow.#syncShipAlert(mainEl, mirrorMainEl)
        }

        if (MirrorWindow.#syncsNeeded.generalText) {
          MirrorWindow.#syncGeneralText(mainEl, mirrorMainEl)
        }

        if (MirrorWindow.#syncsNeeded.trackers) {
          MirrorWindow.#syncTaskTrackers(mainEl, mirrorMainEl)
        }

        if (MirrorWindow.#syncsNeeded.traits) {
          MirrorWindow.#syncTraits(mainEl, mirrorMainEl)
        }

        if (MirrorWindow.#syncsNeeded.missionTracker) {
          MirrorWindow.#syncMissionTracker(mainEl, mirrorMainEl)
        }

        if (MirrorWindow.#syncsNeeded.players) {
          MirrorWindow.#syncPlayers(mainEl, mirrorMainEl)
        }
      }

      // Sync ship models (only what changed)
      if (MirrorWindow.#syncsNeeded.headerModels) {
        MirrorWindow.#syncHeaderModels(mirrorDoc)
      }

      if (MirrorWindow.#syncsNeeded.fullscreenShip) {
        MirrorWindow.#syncFullscreenShip(mirrorDoc)
      }

      // Sync UI chrome (only what changed)
      if (MirrorWindow.#syncsNeeded.navigation) {
        MirrorWindow.#syncNavigation(mirrorDoc)
      }

      if (MirrorWindow.#syncsNeeded.theme) {
        MirrorWindow.#syncTheme(mirrorDoc)
      }

      if (MirrorWindow.#syncsNeeded.themeStylesheet) {
        MirrorWindow.#syncThemeStylesheet(mirrorDoc)
      }

      if (MirrorWindow.#syncsNeeded.rootStyle) {
        MirrorWindow.#syncRootStyle(mirrorDoc)
      }

      // Re-disable interactivity on any newly synced elements
      MirrorWindow.#disableInteractivity(mirrorDoc)
    } catch (error) {
      console.error('Error syncing to mirror window:', error)
    }
  }

  /**
   * Closes the mirror window if it's open.
   */
  static close () {
    if (MirrorWindow.#window && !MirrorWindow.#window.closed) {
      MirrorWindow.#window.close()
    }
    if (MirrorWindow.#observer) {
      MirrorWindow.#observer.disconnect()
    }
    if (MirrorWindow.#syncTimer) {
      clearTimeout(MirrorWindow.#syncTimer)
    }

    MirrorWindow.#window = null
    MirrorWindow.#observer = null
    MirrorWindow.#syncTimer = null
    MirrorWindow.#syncScheduled = false
  }

  /**
   * Checks if a mirror window is currently open.
   * @returns {boolean} True if mirror window is open
   */
  static isOpen () {
    return MirrorWindow.#window !== null && !MirrorWindow.#window.closed
  }
}
