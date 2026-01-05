/**
 * Utility for managing a mirror window that displays a synchronized copy of the main application.
 */

/**
 * @type {Window|null}
 */
let mirrorWindow = null

/**
 * @type {MutationObserver|null}
 */
let observer = null

/**
 * Opens a mirror window that reflects the current application state.
 * @returns {Window|null} The opened window or null if it failed to open
 */
export function openMirrorWindow () {
  // Close existing mirror window if open
  if (mirrorWindow && !mirrorWindow.closed) {
    mirrorWindow.close()
  }

  // Open new window
  mirrorWindow = window.open('', 'STAPlayMirror', 'width=1024,height=768')

  if (!mirrorWindow) {
    console.error('Failed to open mirror window. Popup may have been blocked.')
    return null
  }

  // Set up the mirror window
  setupMirrorWindow(mirrorWindow)

  // Set up synchronization
  setupSynchronization()

  return mirrorWindow
}

/**
 * Initializes the mirror window with the current document structure.
 * @param {Window} targetWindow The window to mirror content to
 */
function setupMirrorWindow (targetWindow) {
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

    // Hide dialogs in mirror window
    const dialogs = doc.querySelectorAll('dialog')
    dialogs.forEach(dialog => {
      dialog.style.display = 'none'
    })

    // Hide menu items in mirror window
    const menuItems = doc.querySelector('menu-items')
    if (menuItems) {
      menuItems.style.display = 'none'
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
function setupSynchronization () {
  // Clean up existing observer if present
  if (observer) {
    observer.disconnect()
  }

  // Create a mutation observer to watch for DOM changes
  observer = new MutationObserver((mutations) => {
    if (!mirrorWindow || mirrorWindow.closed) {
      observer.disconnect()
      return
    }

    syncContentToMirror()
  })

  // Observe changes to main content areas
  const mainEl = document.querySelector('main')
  const headerEl = document.querySelector('header')
  const navEl = document.querySelector('nav')
  const themeEl = document.querySelector('theme')

  if (mainEl) {
    observer.observe(mainEl, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true
    })
  }

  if (headerEl) {
    observer.observe(headerEl, {
      attributes: true,
      subtree: true
    })
  }

  if (navEl) {
    observer.observe(navEl, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true
    })
  }

  if (themeEl) {
    observer.observe(themeEl, {
      childList: true,
      attributes: true
    })
  }

  // Also watch body attributes for edition and alert changes
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['class', 'alert', 'loaded-game-name']
  })

  // Set up periodic sync as fallback
  setInterval(() => {
    if (mirrorWindow && !mirrorWindow.closed) {
      syncContentToMirror()
    } else if (observer) {
      observer.disconnect()
    }
  }, 1000)
}

/**
 * Synchronizes current content to the mirror window.
 */
function syncContentToMirror () {
  if (!mirrorWindow || mirrorWindow.closed) {
    return
  }

  try {
    const mirrorDoc = mirrorWindow.document

    // Check if document body is ready
    if (!mirrorDoc.body) {
      return
    }

    // Sync body classes and attributes
    mirrorDoc.body.className = document.body.className
    Array.from(document.body.attributes).forEach(attr => {
      if (attr.name !== 'data-mirror-window') {
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
export function closeMirrorWindow () {
  if (mirrorWindow && !mirrorWindow.closed) {
    mirrorWindow.close()
  }
  if (observer) {
    observer.disconnect()
  }
  mirrorWindow = null
  observer = null
}

/**
 * Checks if a mirror window is currently open.
 * @returns {boolean} True if mirror window is open
 */
export function isMirrorWindowOpen () {
  return mirrorWindow !== null && !mirrorWindow.closed
}
