/**
 * Element that represents the alert level of the ship or scene.
 * @tagname ship-alert
 * @attr {string} color - the alert's color.
 */
export class ShipAlertElement extends HTMLElement {
    /**
     * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#responding_to_attribute_changes)
     * @returns {Array<string>} the list of attributes to observe.
     */
    static get observedAttributes () {
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

        const currentColor = this.getAttribute('color')
        this.#firstColorClass = ShipAlertElement.Colors[0].name.toLowerCase()

        this.#internalEl = document.createElement('ship-alert-internal')
        this.#internalEl.setAttribute('part', 'internal')

        const titleEl = document.createElement('h1')
        titleEl.textContent = 'ALERT'

        const conditionEl = document.createElement('p')
        conditionEl.textContent = 'CONDITION: '

        this.#colorEl = document.createElement('span')

        this.#internalEl.appendChild(titleEl)
        conditionEl.appendChild(this.#colorEl)
        this.#internalEl.appendChild(conditionEl)
        shadow.appendChild(this.#internalEl)

        this.color = currentColor
    }

    /**
     * Called when an attribute changes.
     * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#responding_to_attribute_changes)
     * @param {string} name     attribute name
     * @param {any} _oldValue   the previous value
     * @param {any} newValue    the new value
     */
    attributeChangedCallback (name, _oldValue, newValue) {
        if (ShipAlertElement.observedAttributes.includes(name))
            this[name] = newValue
    }

    /**
     * The alert's color.
     * @returns {string}    the attribute value
     * @see {@link ShipAlertElement.Colors}
     */
    get color () {
        return this.#internalEl.className
    }

    /**
     * The alert's color.
     * @param {string}  value    the attribute value
     * @see {@link ShipAlertElement.Colors}
     */
    set color (value) {
        // Must be valid (null or in the list)
        if (!!value && !ShipAlertElement.Colors.map(a => a.name.toLowerCase()).includes(value.toLowerCase()))
            return

        this.#colorEl.textContent = value?.toUpperCase() ?? 'HIDDEN'
        this.#internalEl.className = value?.toLowerCase() ?? 'hidden'
    }
}

// Register element
customElements.define('ship-alert', ShipAlertElement)
globalThis.ShipAlertElement = ShipAlertElement
