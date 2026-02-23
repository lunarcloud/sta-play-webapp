/**
 * Element that displays the current in-universe stardate.
 * @tagname stardate-display
 * @attr {string} value - the stardate string to display.
 * @event {CustomEvent} edit - dispatched when the user clicks the edit button.
 */
export class StardateDisplayElement extends HTMLElement {
  /**
   * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#responding_to_attribute_changes)
   * @returns {Array<string>} the list of attributes to observe.
   */
  static get observedAttributes () {
    return ['value']
  }

  /**
   * @type {HTMLSpanElement}
   */
  #valueEl

  /**
   * @type {string}
   */
  #value = ''

  /**
   * Constructor.
   */
  constructor () {
    super()

    const shadow = this.attachShadow({ mode: 'open' })

    const linkElem = document.createElement('link')
    linkElem.setAttribute('rel', 'stylesheet')
    linkElem.setAttribute('href', 'components/stardate-display/stardate-display.css')
    shadow.appendChild(linkElem)

    const internalEl = document.createElement('stardate-display-internal')
    internalEl.setAttribute('part', 'internal')

    const labelEl = document.createElement('span')
    labelEl.className = 'label'
    labelEl.textContent = 'Stardate'

    this.#valueEl = document.createElement('span')
    this.#valueEl.className = 'value'
    this.#valueEl.textContent = '—'

    const editBtn = document.createElement('button')
    editBtn.className = 'edit-btn'
    editBtn.type = 'button'
    editBtn.title = 'Edit stardate'
    editBtn.textContent = '📅'
    editBtn.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('edit', { bubbles: true }))
    })

    internalEl.appendChild(labelEl)
    internalEl.appendChild(this.#valueEl)
    internalEl.appendChild(editBtn)
    shadow.appendChild(internalEl)
  }

  /**
   * Called when an attribute changes.
   * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#responding_to_attribute_changes)
   * @param {string} name     attribute name
   * @param {any} _oldValue   the previous value
   * @param {any} newValue    the new value
   */
  attributeChangedCallback (name, _oldValue, newValue) {
    if (StardateDisplayElement.observedAttributes.includes(name)) {
      this[name] = newValue
    }
  }

  /**
   * The stardate string.
   * @returns {string} the stardate value
   */
  get value () {
    return this.#value
  }

  /**
   * The stardate string.
   * @param {string} newValue  the new stardate value
   */
  set value (newValue) {
    this.#value = newValue?.trim() ?? ''
    this.#valueEl.textContent = this.#value || '—'
    if (this.getAttribute('value') !== this.#value) {
      this.setAttribute('value', this.#value)
    }
  }
}

customElements.define('stardate-display', StardateDisplayElement)
globalThis.StardateDisplayElement = StardateDisplayElement
