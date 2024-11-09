/**
 * Element that represents a combination of range and progress elements.
 * @tagname input-progress
 * @cssprop [--progress-bar-color=#229bd8] - controls the color of the progress-bar.
 * @cssprop [--progress-text-shadow-color=gray] - controls the text shadow color.
 * @cssprop [--slider-thumb-color=hsl(0deg 0% 0% / 75%)] - controls the color of the slider.
 * @attr {number} value - the current numeric value.
 * @attr {number} max - the maximum numeric value.
 * @event {CustomEvent} change - when the value changes.
 */
export class InputProgressElement extends HTMLElement {
    /**
     * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#responding_to_attribute_changes)
     * @returns {Array<string>} the list of attributes to observe.
     */
    static get observedAttributes () {
        return ['value', 'max']
    }

    /**
     * @type {HTMLInputElement}
     */
    #rangeEl

    /**
     * @type {HTMLProgressElement}
     */
    #progressEl

    /**
     * @type {HTMLDataElement}
     */
    #dataEl

    /**
     * Constructor.
     */
    constructor () {
        super()

        // Get initial values
        let initialValue = parseInt(this.getAttribute('value'))
        if (isNaN(initialValue))
            initialValue = 10
        let initialMax = parseInt(this.getAttribute('value'))
        if (isNaN(initialMax))
            initialMax = 10

        const shadow = this.attachShadow({ mode: 'open' })

        // Apply external styles to the shadow DOM
        const linkElem = document.createElement('link')
        linkElem.setAttribute('rel', 'stylesheet')
        linkElem.setAttribute('href', 'components/input-progress/input-progress.css')

        // Attach the created element to the shadow DOM
        shadow.appendChild(linkElem)

        const internalEl = document.createElement('input-progress-internal')
        this.#progressEl = document.createElement('progress')
        this.#dataEl = document.createElement('data')
        this.#dataEl.textContent = `${initialValue}`
        this.#rangeEl = document.createElement('input')
        this.#rangeEl.type = 'range'

        internalEl.appendChild(this.#progressEl)
        internalEl.appendChild(this.#dataEl)
        internalEl.appendChild(this.#rangeEl)
        shadow.appendChild(internalEl)

        this.#rangeEl.min = '0'
        this.#rangeEl.value = `${initialValue}`
        this.#rangeEl.max = `${initialMax}`
        this.#progressEl.value = initialMax
        this.#progressEl.max = initialMax

        // Wire Events
        this.#rangeEl.addEventListener('change', () => {
            this.setAttribute('value', `${this.#rangeEl.value}`)
            this.dispatchEvent(new Event('change'))
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
        if (InputProgressElement.observedAttributes.includes(name))
            this[name] = newValue
    }

    /**
     * Current value
     * @returns {number} attribute value
     */
    get value () {
        return this.#progressEl.value
    }

    /**
     * Current value
     * @param {number} newValue attribute value
     */
    set value (newValue) {
        const intVal = parseInt(`${newValue}`)
        newValue = Math.min(this.max, Math.max(0, intVal)) // clamp

        this.#rangeEl.value = `${intVal}`
        this.#progressEl.value = intVal
        this.#dataEl.textContent = `${intVal}`
    }

    /**
     * Current value, as a number.
     * @returns {number} attribute value as a number
     */
    get valueAsNumber () {
        return this.value
    }

    /**
     * Current value, as a number.
     * @param {number} newValue   attribute value as a number
     */
    set valueAsNumber (newValue) {
        this.value = newValue
    }

    /**
     * Maximum value
     * @returns {number} attribute value
     */
    get max () {
        return this.#progressEl.max
    }

    /**
     * Maximum value
     * @param {number} newValue attribute value
     */
    set max (newValue) {
        let intVal = parseInt(`${newValue}`)
        intVal = Math.max(1, intVal) // clamp

        const oldVal = parseInt(this.#progressEl.getAttribute('value'))
        const oldMax = parseInt(this.#progressEl.getAttribute('max'))

        this.#rangeEl.max = `${intVal}`
        this.#progressEl.max = intVal

        if (oldVal > intVal || oldVal === oldMax)
            this.value = intVal
    }
}

// Register element
customElements.define('input-progress', InputProgressElement)
globalThis.InputProgressElement = InputProgressElement
