import { animateRemove } from '../../js/dialog-utils.js'
import { snakeToCamel } from '../../js/string-utils.js'


export class MapTokenElement extends HTMLDivElement {
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
   * @type {HTMLButtonElement}
   */
  #removeBtnEl


  /**
   * @type {File} Image file
   */
  #imageFile

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
      this.style.height = ''
      this.style.width = ''
      this.style.visibility = ''
      this.style.overflow = ''
    }
    linkElem.addEventListener('load', showElement, { once: true })
    linkElem.addEventListener('error', showElement, { once: true })

    // Attach the created element
    this.appendChild(linkElem)

    // remove button ⤫
    this.#removeBtnEl = document.createElement('button')
    this.#removeBtnEl.classList.add('remove')
    this.#removeBtnEl.textContent = '⤫'
    this.#removeBtnEl.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('removed'))
      animateRemove(this)
    })

    // Setup drag and drop for positioning
    this.#setupDragAndDrop()
  }

  /**
   * Setup drag and drop functionality for reordering players
   */
  #setupDragAndDrop () {
    // Make this element draggable
    this.setAttribute('draggable', 'true')

    this.addEventListener('dragstart', event => {
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('text/plain', '')
      this.classList.add('dragging')
    })

    this.addEventListener('dragend', _event => {
      this.classList.remove('dragging')
    })

    this.addEventListener('dragover', event => {
      event.preventDefault()
      event.dataTransfer.dropEffect = 'move'

      // Get the dragging element
      const draggingElement = document.querySelector('[is=map-token].dragging')
      if (!draggingElement) {
        return
      }

      // TODO
    })
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
    // URL.createObjectURL(this.#imageFile)
    // TODO
  }

}

// Register element
customElements.define('map-token', MapTokenElement, { extends: 'div' })
