
export class ShipAlertElement extends HTMLElement {

    static get observedAttributes() {
        return ['color']
    }

    static Colors = [
        {
            name: 'Yellow',
            description: 'caution'
        },
        {
            name: 'Red',
            description: 'battle stations'
        },
        {
            name: 'Blue',
            description: 'ship landing'
        },
        {
            name: 'Black',
            description: 'top-secret action'
        }
    ]

    #firstColorClass

    #internalEl

    #colorEl

    /**
     * Constructor.
     */
    constructor () {
        super()

        const shadow = this.attachShadow({ mode: 'open' })

        // Apply external styles to the shadow DOM
        const linkElem = document.createElement('link')
        linkElem.setAttribute('rel', 'stylesheet')
        linkElem.setAttribute('href', 'components/ship-alert/ship-alert.css')

        // Attach the created element to the shadow DOM
        shadow.appendChild(linkElem)

        let currentColor = this.getAttribute('color')
        this.#firstColorClass = ShipAlertElement.Colors[0].name.toLowerCase()

        this.#internalEl = document.createElement('ship-alert-internal')

        const titleEl = document.createElement('h1')
        titleEl.textContent = 'ALERT'

        const conditionEl = document.createElement('p')
        conditionEl.textContent = 'CONDITION: '

        this.#colorEl = document.createElement('span')
        
        this.#internalEl.appendChild(titleEl)
        conditionEl.appendChild(this.#colorEl)
        this.#internalEl.appendChild(conditionEl)
        shadow.appendChild(this.#internalEl)

        this.setColor(currentColor)
    }
    
    attributeChangedCallback (name, _oldValue, newValue) {
        if (name === 'color')
            this.setColor(newValue)
    }

    setColor(color) {
        // Must be valid (null or in the list)
        if (!!color && !ShipAlertElement.Colors.map(a=>a.name.toLowerCase()).includes(color.toLowerCase()))
            return

        this.#colorEl.textContent = color?.toUpperCase() ?? 'HIDDEN'
        this.#internalEl.className = color?.toLowerCase() ?? 'hidden'
    }

    /**
     * Cycle between the alert types and none.
     */
    cycle () {
        const lastType = ShipAlertElement.Colors[ShipAlertElement.Colors.length - 1].name.toLowerCase()

        if (this.#internalEl.classList.contains(lastType)) {
            this.removeAttribute('color')

        } else if (['', 'hidden'].includes(this.#internalEl.className)) {
            this.setAttribute('color', this.#firstColorClass)

        } else for (let i = 0; i < ShipAlertElement.Colors.length - 1; i++) {
            if (this.#internalEl.classList.contains(ShipAlertElement.Colors[i].name.toLowerCase())) {
                this.setAttribute('color', ShipAlertElement.Colors[i + 1].name)
                break
            }
        }
    }

}

// Register element
customElements.define('ship-alert', ShipAlertElement)
globalThis.ShipAlertElement = ShipAlertElement
export default ShipAlertElement
