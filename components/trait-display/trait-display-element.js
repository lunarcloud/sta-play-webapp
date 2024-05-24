export class TraitDisplayElement extends HTMLElement {
    static observedAttributes = ['text']

    #textEl
    #closeBtnEl

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
        this.#textEl = document.createElement('span')
        this.#textEl.textContent = 'TODO'
        this.#textEl.classList.add("name")
        this.#textEl.contentEditable = "plaintext-only";

        this.#closeBtnEl = document.createElement('button')
        this.#closeBtnEl.classList.add("close")
        this.#closeBtnEl.textContent = '⤫'
        this.#closeBtnEl.addEventListener("click", () => this.remove());
        

        internalEl.appendChild(this.#textEl)
        internalEl.appendChild(this.#closeBtnEl)
        shadow.appendChild(internalEl)

        this.#textEl.addEventListener('input', (event) => {
            this.setAttribute('text', this.#textEl.textContent)
        })
    }
    
    attributeChangedCallback (name, _oldValue, newValue) {
        if (name !== 'text')
            return;

        this.#textEl.textContent = newValue
    }
}

// Register element
customElements.define('trait-display', TraitDisplayElement)
globalThis.TraitDisplayElement = TraitDisplayElement
export default TraitDisplayElement
