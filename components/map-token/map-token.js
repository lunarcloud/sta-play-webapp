import { snakeToCamel } from '../../js/string-utils.js'
import { getContainedImageRectRelativeTo } from '../../js/image-rect-utils.js'
import { clamp } from '../../js/math-utils.js'
import { animateRemove } from '../../js/dialog-utils.js'

// Fraction of the map image's smaller dimension used for a token's size,
// so tokens scale up/down together with the image instead of the viewport.
const TOKEN_SIZE_FRACTION = 0.08

// Minimum allowed value for a token's custom scale multiplier, so a token never shrinks small
// enough that it becomes hard to click again to change its scale back. There is no maximum,
// since a user may deliberately want a token much larger than its default size (e.g. a capital ship).
export const MIN_SCALE = 0.25

// How long a press/touch must be held to count as a long-press, in milliseconds.
const LONG_PRESS_DURATION_MS = 500

// Pointer movement (in pixels) beyond which a press is treated as a drag rather than a tap/long-press.
const DRAG_THRESHOLD_PX = 10

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
   * Client-space point where the current pointer press started, used to detect drag
   * movement past {@link DRAG_THRESHOLD_PX} before committing to a drag.
   * @type {number}
   */
  #dragStartX = 0

  /**
   * @type {number}
   */
  #dragStartY = 0

  /**
   * Whether the current pointer press has moved far enough to be treated as a drag.
   * @type {boolean}
   */
  #dragging = false

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
   * Setup dragging via Pointer Events, which unifies mouse and touch input in a single code
   * path (unlike the HTML5 drag-and-drop API, which touch devices never fire). A press that
   * moves past {@link DRAG_THRESHOLD_PX} before the long-press timer fires is a drag; one
   * released without moving far either opens the edit dialog (touch/pen) or does nothing,
   * since desktop mice use right-click (contextmenu) for that instead.
   */
  #setupDragAndDrop () {
    // Prevent the browser's native image drag (ghost/callout), now handled manually instead
    this.draggable = false

    this.addEventListener('pointerdown', event => {
      if (event.button !== 0) return // ignore right/middle mouse buttons

      this.setPointerCapture(event.pointerId)
      this.#dragging = false
      this.#dragStartX = event.clientX
      this.#dragStartY = event.clientY

      const rect = this.getBoundingClientRect()
      this.#dragOffsetX = event.clientX - (rect.left + (rect.width / 2))
      this.#dragOffsetY = event.clientY - (rect.top + (rect.height / 2))

      // Touch/pen get a long-press timer to open the edit dialog if released without moving
      if (event.pointerType !== 'mouse') {
        this.#longPressTimer = setTimeout(() => {
          this.#longPressTimer = undefined
          this.dispatchEvent(new CustomEvent('edit-requested', { bubbles: true }))
        }, LONG_PRESS_DURATION_MS)
      }
    })

    this.addEventListener('pointermove', event => {
      if (!this.hasPointerCapture(event.pointerId)) return

      if (!this.#dragging) {
        const movedX = event.clientX - this.#dragStartX
        const movedY = event.clientY - this.#dragStartY
        if (Math.hypot(movedX, movedY) < DRAG_THRESHOLD_PX) return

        this.#cancelLongPress()
        this.#dragging = true
        this.classList.add('dragging')
      }

      // Stop touchscreens from scrolling the page while a token is being dragged
      event.preventDefault()
      this.#setNormalizedFromClientPoint(event.clientX - this.#dragOffsetX, event.clientY - this.#dragOffsetY)
    })

    const endDrag = event => {
      if (this.hasPointerCapture(event.pointerId)) this.releasePointerCapture(event.pointerId)
      this.#cancelLongPress()
      this.#dragging = false
      this.classList.remove('dragging')
    }
    this.addEventListener('pointerup', endDrag)
    this.addEventListener('pointercancel', endDrag)
  }

  /**
   * Cancel any in-progress long-press detection timer.
   */
  #cancelLongPress () {
    clearTimeout(this.#longPressTimer)
    this.#longPressTimer = undefined
  }

  /**
   * Setup right-click (desktop) handler to open the edit (scale/remove) dialog, and
   * double-click as a quick shortcut to remove the token outright. The equivalent touch
   * gestures (long-press to edit, drag to move) are handled in {@link #setupDragAndDrop}.
   */
  #setupEditTrigger () {
    this.addEventListener('contextmenu', event => {
      event.preventDefault()
      this.dispatchEvent(new CustomEvent('edit-requested', { bubbles: true }))
    })

    this.addEventListener('dblclick', () => animateRemove(this))
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
