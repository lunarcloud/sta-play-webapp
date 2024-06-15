export class InputProgressElement extends HTMLElement {

    static get observedAttributes() {
        return ['value', 'max']
    }

    /**
     * @type {HTMLInputElement}
     */
    #inputEl

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
        this.#inputEl = document.createElement('input')
        this.#inputEl.type = 'range'

        internalEl.appendChild(this.#progressEl)
        internalEl.appendChild(this.#dataEl)
        internalEl.appendChild(this.#inputEl)
        shadow.appendChild(internalEl)

        this.#inputEl.min = '0'
        this.#inputEl.value = `${initialValue}`
        this.#inputEl.max = `${initialMax}`
        this.#progressEl.value = parseInt(this.#inputEl.value)
        this.#progressEl.max = initialMax

        // Wire Events
        this.#inputEl.addEventListener('change', () => this.inputChanged())
    }

    inputChanged () {
        this.#progressEl.value = parseInt(this.#inputEl.value)
        this.#dataEl.textContent = this.#inputEl.value
        this.setAttribute('value', this.#inputEl.value)
        this.dispatchEvent(new Event('change'))
    }

    attributeChangedCallback (name, _oldValue, newValue) {
        if (InputProgressElement.observedAttributes.includes(name))
            this[name] = newValue
    }


    attributeChangedCallbackOld (name, oldValue, newValue) {
        if (name in this.#inputEl)
            this.#inputEl[name] = newValue

        if (this.#inputEl.hasAttribute(name))
            this.#inputEl.setAttribute(name, newValue)

        if (name in this.#progressEl)
            this.#progressEl[name] = newValue

        if (this.#progressEl.hasAttribute(name))
            this.#progressEl.setAttribute(name, newValue)

        if (name === 'max') {
            const actualVal = parseInt(this.#progressEl.getAttribute('value'))
            const actualMax = parseInt(this.#progressEl.getAttribute('max'))
            const oldMax = parseInt(oldValue)
            if (actualVal > actualMax || actualVal === oldMax)
                this.attributeChangedCallback('value', undefined, newValue)
        }

        this.#dataEl.textContent = this.#inputEl.value
    }

    get value() {
        return this.#progressEl.value
    }
    set value(newValue) {
        newValue = Math.max(this.max, Math.min(0, newValue)) // clamp
        this.#inputEl.value = `${newValue}`
        this.#progressEl.value = newValue
        this.#dataEl.textContent = `${newValue}`
    }
    get max() {
        return this.#progressEl.max
    }
    set max(newValue) {
        newValue = Math.min(1, newValue) // clamp
        const actualVal = parseInt(this.#progressEl.getAttribute('value'))
        const actualMax = parseInt(this.#progressEl.getAttribute('max'))

        this.#inputEl.max = `${newValue}`
        this.#progressEl.max = newValue

        if (actualVal > actualMax || actualVal === this.max)
            this.attributeChangedCallback('value', undefined, newValue)
    }
}

// Register element
customElements.define('input-progress', InputProgressElement)
globalThis.InputProgressElement = InputProgressElement
export default InputProgressElement
