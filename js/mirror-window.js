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
        const newFsBtn = fsBtn.cloneNode(true)
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
      document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
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
    }

    initialize()
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

      MirrorWindow.#scheduleSync()
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
        attributes: true
      })
    }

    // Also watch body attributes for edition and alert changes
    MirrorWindow.#observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class', 'alert', 'loaded-game-name']
    })

    // Watch for theme stylesheet changes
    const themeLink = document.getElementById('theme-link')
    if (themeLink) {
      MirrorWindow.#observer.observe(themeLink, {
        attributes: true,
        attributeFilter: ['href']
      })
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
      clearTimeout(MirrorWindow.#syncTimer)
    }

    // Schedule sync with a small delay to batch multiple changes
    MirrorWindow.#syncTimer = setTimeout(() => {
      MirrorWindow.#sync()
      MirrorWindow.#syncScheduled = false
      MirrorWindow.#syncTimer = null
    }, 50) // 50ms debounce - batches rapid changes while staying responsive
  }

  /**
   * Synchronizes current content to the mirror window.
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

      // Sync body classes and attributes (preserve mirror class)
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
      
      Array.from(document.body.attributes).forEach(attr => {
        if (attr.name !== 'data-mirror-window' && attr.name !== 'class') {
          mirrorDoc.body.setAttribute(attr.name, attr.value)
        }
      })

      // Sync main content
      const mainEl = document.querySelector('main')
      const mirrorMainEl = mirrorDoc.querySelector('main')
      if (mainEl && mirrorMainEl) {
        mirrorMainEl.innerHTML = mainEl.innerHTML
      }

      // Sync header (ship models)
      const headerEl = document.querySelector('header')
      const mirrorHeaderEl = mirrorDoc.querySelector('header')
      if (headerEl && mirrorHeaderEl) {
        // Copy model-viewer src attributes
        const modelViewers = headerEl.querySelectorAll('model-viewer')
        const mirrorModelViewers = mirrorHeaderEl.querySelectorAll('model-viewer')
        modelViewers.forEach((viewer, index) => {
          if (mirrorModelViewers[index] && viewer.src) {
            mirrorModelViewers[index].src = viewer.src
          }
        })
      }

      // Sync navigation
      const navEl = document.querySelector('nav')
      const mirrorNavEl = mirrorDoc.querySelector('nav')
      if (navEl && mirrorNavEl) {
        mirrorNavEl.innerHTML = navEl.innerHTML
      }

      // Sync theme
      const themeEl = document.querySelector('theme')
      const mirrorThemeEl = mirrorDoc.querySelector('theme')
      if (themeEl && mirrorThemeEl) {
        mirrorThemeEl.innerHTML = themeEl.innerHTML
        if (themeEl.hasAttribute('value')) {
          mirrorThemeEl.setAttribute('value', themeEl.getAttribute('value'))
        }
      }

      // Sync theme stylesheet
      const themeLink = document.getElementById('theme-link')
      const mirrorThemeLink = mirrorDoc.getElementById('theme-link')
      if (themeLink && mirrorThemeLink && themeLink.href) {
        mirrorThemeLink.href = themeLink.href
      }
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
