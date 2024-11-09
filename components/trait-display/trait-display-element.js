/**
 * Element that represents a scene trait.
 * @tagname trait-display
 * @cssprop [--trait-bg-color=gray] - controls the color of the trait's background color.
 * @attr {string} text - the trait's description text.
 * @event {CustomEvent} removed - when the element has been removed from the DOM.
 */
export class TraitDisplayElement extends HTMLElement {
    /**
     * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#responding_to_attribute_changes)
     * @returns {Array<string>} the list of attributes to observe.
     */
    static get observedAttributes () {
        return ['text']
    }

    #textEl
    #removeBtnEl
    #textElValueProperty

    /**
     * Constructor.
     */
    constructor () {
        super()

        const shadow = this.attachShadow({ mode: 'open' })

        // Apply external styles to the shadow DOM
        const linkElem = document.createElement('link')
        linkElem.setAttribute('rel', 'stylesheet')
        linkElem.setAttribute('href', 'components/trait-display/trait-display.css')

        // Attach the created element to the shadow DOM
        shadow.appendChild(linkElem)

        const internalEl = document.createElement('trait-display-internal')
        internalEl.setAttribute('part', 'internal')
        this.#textEl = document.createElement('span')

        /** Handle differences in ContentEditable support between firefox and chrome */
        let textElChangeEvent = 'input'
        this.#textElValueProperty = 'textContent'
        try {
            this.#textEl.contentEditable = 'plaintext-only'
        } catch {
            this.#textEl = document.createElement('input')
            textElChangeEvent = 'change'
            this.#textElValueProperty = 'value'
        }
        this.#textEl.textContent = ' '
        this.#textEl.classList.add('name')

        this.#removeBtnEl = document.createElement('button')
        this.#removeBtnEl.classList.add('close')
        this.#removeBtnEl.textContent = '⤫'
        this.#removeBtnEl.addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('removed'))
            this.remove()
        })

        internalEl.appendChild(this.#textEl)
        internalEl.appendChild(this.#removeBtnEl)
        shadow.appendChild(internalEl)

        this.#textEl.addEventListener(textElChangeEvent, _event => {
            this.setAttribute('text', this.#textEl[this.#textElValueProperty])
        }, { passive: true, capture: false })
    }

    /**
     * Called when an attribute changes.
     * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#responding_to_attribute_changes)
     * @param {string} name     attribute name
     * @param {any} _oldValue   the previous value
     * @param {any} newValue    the new value
     */
    attributeChangedCallback (name, _oldValue, newValue) {
        if (TraitDisplayElement.observedAttributes.includes(name))
            this[name] = newValue
    }

    /**
     * The trait description.
     * @returns {string}    the attribute value
     */
    get text () {
        return this.#textEl[this.#textElValueProperty].trim()
    }

    /**
     * The trait description.
     * @param {string} newValue     the new attribute value
     */
    set text (newValue) {
        this.#textEl[this.#textElValueProperty] = newValue
    }

    /**
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/focus)
     * @param {FocusOptions} [options]  An optional object for controlling aspects of the focusing process
     */
    focus (options) {
        this.#textEl.focus(options)
    }
}

// Register element
customElements.define('trait-display', TraitDisplayElement)
globalThis.TraitDisplayElement = TraitDisplayElement
