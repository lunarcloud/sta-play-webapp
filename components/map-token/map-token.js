import { snakeToCamel } from '../../js/string-utils.js'
import { getContainedImageRectRelativeTo } from '../../js/image-rect-utils.js'
import { clamp } from '../../js/math-utils.js'

// Fraction of the map image's smaller dimension used for a token's size,
// so tokens scale up/down together with the image instead of the viewport.
const TOKEN_SIZE_FRACTION = 0.08

// Minimum allowed value for a token's custom scale multiplier, so a token never shrinks small
// enough that it becomes hard to click again to change its scale back. There is no maximum,
// since a user may deliberately want a token much larger than its default size (e.g. a capital ship).
export const MIN_SCALE = 0.25

// How long a press/touch must be held to count as a long-press, in milliseconds.
const LONG_PRESS_DURATION_MS = 500

export class MapTokenElement extends HTMLImageElement {
  /**
   * All currently connected tokens, kept in sync with the rendered map image size/position.
   * @type {Set<MapTokenElement>}
   */
  static #tokens = new Set()

  /**
   * @type {ResizeObserver}
   */
  static #resizeObserver

  /**
   * Make sure the shared observer watching the map & its image exists,
   * repositioning all tokens whenever either one changes size or the image itself (re)loads.
   */
  static #ensureObserver () {
    if (MapTokenElement.#resizeObserver) return

    const map = document.getElementById('play-field')
    if (!map) return

    MapTokenElement.#resizeObserver = new ResizeObserver(() => MapTokenElement.#repositionAll())
    MapTokenElement.#resizeObserver.observe(map)

    const bgImageEl = map.querySelector('img.bg')
    if (bgImageEl) {
      MapTokenElement.#resizeObserver.observe(bgImageEl)
      bgImageEl.addEventListener('load', () => MapTokenElement.#repositionAll())
    }
  }

  /**
   * Reposition/resize every connected token to match the map image's current rendered rectangle.
   */
  static #repositionAll () {
    for (const token of MapTokenElement.#tokens) {
      token.#reposition()
    }
  }

  /**
   * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#responding_to_attribute_changes)
   * @returns {Array<string>} the list of attributes to observe.
   */
  static get observedAttributes () {
    return [
      'image'
    ]
  }

  /**
   * @type {File} Image file
   */
  #imageFile

  /**
   * Normalized horizontal position (0-1) within the map image's rendered bounds.
   * @type {number}
   */
  #normalizedX = 0.5

  /**
   * Normalized vertical position (0-1) within the map image's rendered bounds.
   * @type {number}
   */
  #normalizedY = 0.5

  /**
   * Custom size multiplier applied on top of the map-relative base size.
   * @type {number}
   */
  #scale = 1

  /**
   * Offset between the cursor and this token's center, in pixels, captured at drag start
   * so the point grabbed stays under the cursor for the whole drag.
   * @type {number}
   */
  #dragOffsetX = 0

  /**
   * @type {number}
   */
  #dragOffsetY = 0

  /**
   * Timer id for the in-progress long-press detection, if any.
   * @type {ReturnType<typeof setTimeout>|undefined}
   */
  #longPressTimer

  /**
   * Constructor.
   */
  constructor () {
    super()

    this.setAttribute('is', 'map-token')

    // Apply external styles
    const linkElem = document.createElement('link')
    linkElem.setAttribute('rel', 'stylesheet')
    linkElem.setAttribute('href', 'components/map-token/map-token.css')

    // Hide until CSS loads to prevent flash before animation applies
    this.style.opacity = '0'
    this.style.margin = '0'
    this.style.height = '1px'
    this.style.width = '1px'
    this.style.visibility = 'hidden'
    this.style.overflow = 'hidden'
    const showElement = () => {
      this.style.opacity = ''
      this.style.margin = ''
      this.style.visibility = ''
      this.style.overflow = ''
      this.#reposition()
    }
    linkElem.addEventListener('load', showElement, { once: true })
    linkElem.addEventListener('error', showElement, { once: true })

    // Attach the created element
    this.appendChild(linkElem)

    // Setup drag and drop for positioning
    this.#setupDragAndDrop()

    // Setup right-click/long-press to open the edit (scale/remove) dialog
    this.#setupEditTrigger()
  }

  /**
   * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#responding_to_connection)
   */
  connectedCallback () {
    MapTokenElement.#tokens.add(this)
    MapTokenElement.#ensureObserver()
    this.#reposition()
  }

  /**
   * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#responding_to_disconnection)
   */
  disconnectedCallback () {
    MapTokenElement.#tokens.delete(this)
  }

  /**
   * Setup drag and drop functionality for reordering players
   */
  #setupDragAndDrop () {
    // Make this element draggable
    this.setAttribute('draggable', 'true')

    this.addEventListener('dragstart', event => {
      event.dataTransfer.effectAllowed = 'move'
      // Required for Firefox compatibility
      event.dataTransfer.setData('text/plain', '')

      // Preserve the offset between the cursor and the token's center, so the
      // point grabbed stays under the cursor for the whole drag, matching the preview.
      const rect = this.getBoundingClientRect()
      this.#dragOffsetX = event.clientX - (rect.left + (rect.width / 2))
      this.#dragOffsetY = event.clientY - (rect.top + (rect.height / 2))

      // Use a standalone, off-screen copy of the artwork as the drag preview, anchored
      // at the grabbed point. A separate copy is needed because hiding the real token
      // (below) would otherwise make the browser's drag-image snapshot invisible too.
      const previewEl = document.createElement('img')
      previewEl.src = this.src
      previewEl.style.position = 'fixed'
      previewEl.style.left = '-9999px'
      previewEl.style.top = '-9999px'
      previewEl.style.width = `${rect.width}px`
      previewEl.style.height = `${rect.height}px`
      previewEl.style.objectFit = 'contain'
      document.body.appendChild(previewEl)
      event.dataTransfer.setDragImage(previewEl, event.clientX - rect.left, event.clientY - rect.top)
      // The browser captures the snapshot synchronously, so the copy can be removed right after
      setTimeout(() => previewEl.remove(), 0)

      this.classList.add('dragging')
    })

    this.addEventListener('dragend', event => {
      this.classList.remove('dragging')
    })

    const map = document.getElementById('play-field')
    if (!map) return

    // You must listen for dragover on the parent container (the map)
    map.addEventListener('dragover', event => {
      // Required to allow a drop event to trigger
      event.preventDefault()
      event.dataTransfer.dropEffect = 'move'

      const token = document.querySelector('[is=map-token].dragging')
      if (token instanceof MapTokenElement === false) return

      token.#setNormalizedFromClientPoint(event.clientX - token.#dragOffsetX, event.clientY - token.#dragOffsetY)
    })
  }

  /**
   * Setup right-click (desktop) and long-press (touch) handlers that both request this
   * token's edit dialog (scale/remove), since neither gesture is otherwise used by the token.
   */
  #setupEditTrigger () {
    this.addEventListener('contextmenu', event => {
      event.preventDefault()
      this.dispatchEvent(new CustomEvent('edit-requested', { bubbles: true }))
    })

    const cancelLongPress = () => {
      clearTimeout(this.#longPressTimer)
      this.#longPressTimer = undefined
    }

    this.addEventListener('touchstart', () => {
      cancelLongPress()
      this.#longPressTimer = setTimeout(() => {
        this.#longPressTimer = undefined
        this.dispatchEvent(new CustomEvent('edit-requested', { bubbles: true }))
      }, LONG_PRESS_DURATION_MS)
    }, { passive: true })
    this.addEventListener('touchend', cancelLongPress)
    this.addEventListener('touchmove', cancelLongPress)
    this.addEventListener('touchcancel', cancelLongPress)
  }

  /**
   * Set the token's position from a client-space point (e.g. a pointer/drag event),
   * translating it into a position normalized to the map image's rendered bounds.
   * @param {number} clientX    the x coordinate, in client (viewport) space
   * @param {number} clientY    the y coordinate, in client (viewport) space
   */
  #setNormalizedFromClientPoint (clientX, clientY) {
    const map = document.getElementById('play-field')
    const bgImageEl = map?.querySelector('img.bg')
    if (!map || !bgImageEl) return

    const imageRect = getContainedImageRectRelativeTo(bgImageEl, map)
    const mapRect = map.getBoundingClientRect()

    const localX = (clientX - mapRect.left) - imageRect.x
    const localY = (clientY - mapRect.top) - imageRect.y

    this.#normalizedX = clamp(imageRect.width ? localX / imageRect.width : 0.5)
    this.#normalizedY = clamp(imageRect.height ? localY / imageRect.height : 0.5)

    this.#reposition()
  }

  /**
   * Reposition and resize this token to match its normalized position within
   * the map image's current rendered bounds, so it stays aligned with the
   * artwork regardless of window size, fullscreen, or image aspect ratio.
   */
  #reposition () {
    const map = document.getElementById('play-field')
    const bgImageEl = map?.querySelector('img.bg')
    if (!map || !bgImageEl || !this.isConnected) return

    const imageRect = getContainedImageRectRelativeTo(bgImageEl, map)

    const size = Math.min(imageRect.width, imageRect.height) * TOKEN_SIZE_FRACTION * this.#scale

    this.style.left = `${imageRect.x + (this.#normalizedX * imageRect.width)}px`
    this.style.top = `${imageRect.y + (this.#normalizedY * imageRect.height)}px`
    this.style.width = `${size}px`
    this.style.height = `${size}px`
  }

  /**
   * Normalized horizontal position (0-1) within the map image's rendered bounds.
   * @returns {number}    the normalized position
   */
  get x () {
    return this.#normalizedX
  }

  /**
   * Set the normalized horizontal position (0-1) within the map image's rendered bounds.
   * @param {number} value    the normalized position
   */
  set x (value) {
    this.#normalizedX = clamp(Number(value))
    this.#reposition()
  }

  /**
   * Normalized vertical position (0-1) within the map image's rendered bounds.
   * @returns {number}    the normalized position
   */
  get y () {
    return this.#normalizedY
  }

  /**
   * Set the normalized vertical position (0-1) within the map image's rendered bounds.
   * @param {number} value    the normalized position
   */
  set y (value) {
    this.#normalizedY = clamp(Number(value))
    this.#reposition()
  }

  /**
   * Custom size multiplier applied on top of the map-relative base size.
   * @returns {number}    the scale multiplier
   */
  get scale () {
    return this.#scale
  }

  /**
   * Set the custom size multiplier applied on top of the map-relative base size.
   * @param {number} value    the scale multiplier, floored to the minimum allowed value
   */
  set scale (value) {
    this.#scale = Math.max(Number(value) || 1, MIN_SCALE)
    this.#reposition()
  }

  /**
   * Called when an attribute changes.
   * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#responding_to_attribute_changes)
   * @param {string} name     attribute name
   * @param {any} _oldValue   the previous value
   * @param {any} newValue    the new value
   */
  attributeChangedCallback (name, _oldValue, newValue) {
    if (MapTokenElement.observedAttributes.includes(name)) {
      this[snakeToCamel(name)] = newValue
    }
  }

  /**
   * The token's image.
   * @returns {File}    the attribute value
   */
  get image () {
    return this.#imageFile
  }

  /**
   * Handler for new token image
   * @param {File} file          image to change player element background to
   */
  set image (file) {
    this.#imageFile = file
    this.src = file instanceof File ? URL.createObjectURL(file) : ''
  }
}

// Register element
customElements.define('map-token', MapTokenElement, { extends: 'img' })
