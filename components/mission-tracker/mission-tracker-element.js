import { toCSV } from "../../js/string-utils.js"

/**
 * @type {number}
 */
const NUM_ACTS_PER_MISSION = 3

/**
 * @type {number}
 */
const NUM_SCENES_PER_ACT = 5

/**
 * @type {Array<object>}
 */
const SCENE_OUTCOMES = ['⮝', '✓', '✗']

export class MissionTrackerElement extends HTMLElement {
    
    static get observedAttributes () {
        return ['act1', 'act2', 'act3']
    }

    /**
     * @type {Array<HTMLElement>}
     */
    #actEls = []

    /**
     * Constructor.
     */
     constructor () {
        super()

        const shadow = this.attachShadow({ mode: 'open' })

        // Apply external styles to the shadow DOM
        const linkElem = document.createElement('link')
        linkElem.setAttribute('rel', 'stylesheet')
        linkElem.setAttribute('href', 'components/mission-tracker/mission-tracker.css')

        // Attach the created element to the shadow DOM
        shadow.appendChild(linkElem)

        let internalEl = document.createElement('mission-tracker-internal')

        let clearBtnEl = document.createElement('button')
        clearBtnEl.className = 'clear-mission-tracker'
        clearBtnEl.type = "button"
        clearBtnEl.textContent = '⌦'
        clearBtnEl.addEventListener('click', _ => {
            if (confirm('Are you sure you want to clear the mission tracker?') === true) 
                this.clear()
        })
        internalEl.appendChild(clearBtnEl)

        for (let act = 1; act <= NUM_ACTS_PER_MISSION; act++) {

            let actEl = document.createElement('act')

            for (let scene = 1; scene <= NUM_SCENES_PER_ACT; scene++) {

                let sceneEl = document.createElement('select')

                for (let outcome of SCENE_OUTCOMES) {
                  let outcomeEl = document.createElement('option')
                  outcomeEl.text = outcome
                  outcomeEl.value = outcome
                  sceneEl.appendChild(outcomeEl)
                }

                actEl.appendChild(sceneEl)
            }

            internalEl.appendChild(actEl)
            this.#actEls[act] = actEl
        }

        shadow.appendChild(internalEl)
    }
    
    attributeChangedCallback (name, _oldValue, newValue) {
        if (InputProgressElement.observedAttributes.includes(name))
            this[name] = newValue
    }

    get act1 () {
        return this.#getActValue(this.#actEls[1])
    }

    set act1 (newValue) {
        this.#setActValue(this.#actEls[1], newValue.split(','))
    }

    get act2 () {
        return this.#getActValue(this.#actEls[2])
    }

    set act2 (newValue) {
        this.#setActValue(this.#actEls[2], newValue.split(','))
    }

    get act3 () {
        return this.#getActValue(this.#actEls[3])
    }

    set act3 (newValue) {
        this.#setActValue(this.#actEls[3], newValue.split(','))
    }

    clear() {
        this.act1 = ',,,,'
        this.act2 = ',,,,'
        this.act3 = ',,,,'
    }

    /**
     * 
     * @param {HTMLElement} act 
     * @returns {string} values 
     */
    #getActValue(act) {
        let values = []
        for (let sceneEl of act.children) {
            if ('value' in sceneEl)
                values.push(sceneEl.value)
        }
        return toCSV(values)
    }

    /**
     * 
     * @param {HTMLElement} act 
     * @param {Array<string>} values 
     */
    #setActValue(act, values) {
        for (let i = 1; i <= values.length; i++) {

            let value = SCENE_OUTCOMES[0]
            if ( SCENE_OUTCOMES.includes(values[i]))
                value = values[i]

            let sceneEl = act.children[i]

            if (sceneEl instanceof HTMLSelectElement)
                sceneEl.value = value
        }
    }
}

// Register element
customElements.define('mission-tracker', MissionTrackerElement)
globalThis.MissionTrackerElement = MissionTrackerElement
