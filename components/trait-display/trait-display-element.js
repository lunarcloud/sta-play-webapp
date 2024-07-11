export class TraitDisplayElement extends HTMLElement {
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
        this.#textEl.textContent = 'TODO'
        this.#textEl.classList.add('name')

        this.#removeBtnEl = document.createElement('button')
        this.#removeBtnEl.classList.add('close')
        this.#removeBtnEl.textContent = '⤫'
        this.#removeBtnEl.addEventListener('click', () => {
            this.dispatchEvent(new Event('removed'))
            this.remove()
        })

        internalEl.appendChild(this.#textEl)
        internalEl.appendChild(this.#removeBtnEl)
        shadow.appendChild(internalEl)

        this.#textEl.addEventListener(textElChangeEvent, _event => {
            this.setAttribute('text', this.#textEl[this.#textElValueProperty])
        }, { passive: true, capture: false })
    }

    attributeChangedCallback (name, _oldValue, newValue) {
        if (TraitDisplayElement.observedAttributes.includes(name))
            this[name] = newValue
    }

    get text () {
        return this.#textEl[this.#textElValueProperty].trim()
    }

    set text (newValue) {
        this.#textEl[this.#textElValueProperty] = newValue
    }
}

// Register element
customElements.define('trait-display', TraitDisplayElement)
globalThis.TraitDisplayElement = TraitDisplayElement
