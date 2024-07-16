import { setupDropOnly } from '../../js/drop-nodrag-setup.js'
import { InputProgressElement } from '../input-progress/input-progress-element.js'
import { snakeToCamel } from '../../js/string-utils.js'

/**
 * Player Information Display
 */

const ColorSquares = [
    { name: 'brown', text: '🟫' },
    { name: 'red', text: '🟥' },
    { name: 'blue', text: '🟦' },
    { name: 'yellow', text: '🟨' },
    { name: 'black', text: '⬛' },
    { name: 'white', text: '⬜' }
]

/**
 * Get the text for player rank pips
 * @param {number} solid amount of solid pips
 * @param {number} hollow amount of hollow pips
 * @returns {string} text containing the solid, then hollow, pip symbols
 */
function PipText (solid, hollow) {
    return ''
        .padStart(solid, '⚫')
        .padEnd(solid + hollow, '⚪')
}

const Pips = [
    { title: 'Captain', pips: PipText(4, 0) },
    { title: 'Commander', pips: PipText(3, 0) },
    { title: 'Lieutenant Commander', pips: PipText(2, 1) },
    { title: 'Lieutenant', pips: PipText(2, 0) },
    { title: 'Lieutenant Junior Grade', pips: PipText(1, 1) },
    { title: 'Ensign', pips: PipText(1, 0) },
    { title: 'Other', pips: PipText(0, 0) }
]

const DefaultPlayerImages = [
    'img/player/ds9.webp',
    'img/player/voy.webp',
    'img/player/tng.webp',
    'img/player/ent.webp',
    'img/player/tos-movies.webp',
    'img/player/tng-cadet.webp'
]

export class PlayerDisplayElement extends HTMLLIElement {
    static get observedAttributes () {
        return [
            'player-index',
            'name',
            'color',
            'rank',
            'current-stress',
            'max-stress'
        ]
    }

    /**
     * @type {HTMLButtonElement}
     */
    #removeBtnEl

    /**
     * @type {HTMLElement}
     */
    #nameEl

    /**
     * @type {HTMLSelectElement}
     */
    #colorSelect

    /**
     * @type {HTMLSelectElement}
     */
    #rankSelect

    /**
     * @type {InputProgressElement}
     */
    #currentStressEl

    /**
     * @type {HTMLInputElement}
     */
    #maxStressEl

    /**
     * @type {HTMLImageElement}
     */
    #portraitEl

    /**
     * @type {File} Image file
     */
    #imageFile

    /**
     * Constructor.
     */
    constructor () {
        super()

        this.setAttribute('is', 'player-display')

        // Apply external styles
        const linkElem = document.createElement('link')
        linkElem.setAttribute('rel', 'stylesheet')
        linkElem.setAttribute('href', 'components/player-display/player-display.css')

        // Attach the created element
        this.appendChild(linkElem)

        // remove button ⤫
        this.#removeBtnEl = document.createElement('button')
        this.#removeBtnEl.classList.add('remove')
        this.#removeBtnEl.textContent = '⤫'
        this.#removeBtnEl.addEventListener('click', () => {
            this.dispatchEvent(new Event('removed'))
            this.remove()
        })

        // select 'color'
        const currentColor = this.getAttribute('color') ?? 'brown'
        this.setAttribute('color', currentColor)

        this.#colorSelect = document.createElement('select')
        this.#colorSelect.className = 'color'
        for (let i = 0; i < ColorSquares.length; i++) {
            const optionEl = document.createElement('option')
            optionEl.value = ColorSquares[i].name
            optionEl.textContent = ColorSquares[i].text
            if (currentColor === ColorSquares[i].name)
                optionEl.selected = true
            this.#colorSelect.appendChild(optionEl)
        }
        this.#colorSelect.addEventListener('change', _event => this.setAttribute('color', this.#colorSelect.value))

        // select 'rank'
        const currentRank = this.getAttribute('rank') ?? Pips[0].pips
        this.setAttribute('rank', currentRank)

        this.#rankSelect = document.createElement('select')
        this.#rankSelect.className = 'rank'
        for (let i = 0; i < Pips.length; i++) {
            const optionEl = document.createElement('option')
            optionEl.title = Pips[i].title
            optionEl.textContent = Pips[i].pips
            if ([Pips[i].pips, Pips[i].title].includes(currentRank))
                optionEl.selected = true
            this.#rankSelect.appendChild(optionEl)
        }
        this.#rankSelect.addEventListener('change', _event => this.setAttribute('rank', this.#rankSelect.value))

        // stress input-progress of input max
        let currentStress = parseInt(this.getAttribute('current-stress'))
        if (isNaN(currentStress))
            currentStress = 9
        this.setAttribute('current-stress', `${currentStress}`)

        let maxStress = parseInt(this.getAttribute('max-stress'))
        if (isNaN(maxStress))
            maxStress = 9
        this.setAttribute('max-stress', `${maxStress}`)

        const stressEl = document.createElement('stress')
        stressEl.classList.add('edition-1', 'edition-2')

        const currentStressEl = document.createElement('input-progress')
        if (currentStressEl instanceof InputProgressElement === false)
            throw new Error('Something went very wrong!')
        this.#currentStressEl = currentStressEl
        this.#currentStressEl.setAttribute('value', `${currentStress}`)
        this.#currentStressEl.setAttribute('max', `${maxStress}`)
        this.#currentStressEl.addEventListener('change', _event =>
            this.setAttribute('current-stress', this.#currentStressEl.getAttribute('value'))
        )

        this.#maxStressEl = document.createElement('input')
        this.#maxStressEl.type = 'number'
        this.#maxStressEl.setAttribute('value', `${currentStress}`)
        // wire to change max of the current stress value
        this.#maxStressEl.addEventListener('change', _event =>
            this.setAttribute('max-stress', this.#maxStressEl.value)
        )

        stressEl.appendChild(this.#currentStressEl)
        stressEl.append(' of ')
        stressEl.appendChild(this.#maxStressEl)

        // h2 name contenteditable
        const currentName = this.getAttribute('name') ?? 'Jo Doe'
        this.setAttribute('name', currentName)

        this.#nameEl = document.createElement('h2')
        this.#nameEl.className = 'name'
        this.#nameEl.setAttribute('autocomplete', 'false')
        this.#nameEl.setAttribute('autocorrect', 'false')
        this.#nameEl.setAttribute('spellcheck', 'false')
        this.#nameEl.textContent = currentName
        try {
            this.#nameEl.contentEditable = 'plaintext-only'
        } catch {
            this.#nameEl.contentEditable = 'true'
        }

        this.#portraitEl = document.createElement('img')
        this.#portraitEl.className = 'portrait'

        const topAreaEl = document.createElement('div')
        topAreaEl.className = 'top-area'
        topAreaEl.appendChild(this.#portraitEl)
        topAreaEl.appendChild(this.#nameEl)

        // Put them together
        this.appendChild(this.#removeBtnEl)
        this.appendChild(this.#colorSelect)
        this.appendChild(this.#rankSelect)
        this.appendChild(stressEl)
        this.appendChild(topAreaEl)

        this.#nameEl.addEventListener('input', _event => {
            this.setAttribute('text', this.#nameEl.textContent)
        }, { passive: true, capture: false })

        setupDropOnly(this, event => {
            if (!event.dataTransfer.items?.[0].type.startsWith('image') ||
                !event.dataTransfer.files?.[0])
                return false

            this.imageFile = event.dataTransfer.files?.[0]
            return true
        })
    }

    attributeChangedCallback (name, _oldValue, newValue) {
        if (PlayerDisplayElement.observedAttributes.includes(name))
            this[snakeToCamel(name)] = newValue
    }

    get playerIndex () {
        const i = parseInt(this.getAttribute('player-index'))
        return isNaN(i) ? 0 : i
    }

    set playerIndex (value) {
        if (this.getAttribute('player-index') !== `${value}`)
            this.setAttribute('player-index', `${value}`)
    }

    get name () {
        return this.#nameEl.textContent
    }

    set name (value) {
        this.#nameEl.textContent = value
    }

    get color () {
        return this.#colorSelect.value
    }

    set color (value) {
        this.#colorSelect.value = value
    }

    get rank () {
        return this.#rankSelect.value
    }

    set rank (value) {
        if (typeof (value) !== 'string')
            return
        const titleMatches = Pips.filter(e => e.title === value)
        const pipMatches = Pips.filter(e => e.pips === value)
        if (titleMatches.length > 0)
            this.setAttribute('rank', titleMatches[0].pips)
        else if (pipMatches.length > 0)
            this.#rankSelect.value = pipMatches[0].pips
    }

    get currentStress () {
        return this.#currentStressEl.value
    }

    set currentStress (value) {
        if (isNaN(value))
            return

        if (this.#currentStressEl.max !== value)
            this.#currentStressEl.value = value
    }

    get maxStress () {
        return this.#currentStressEl.max
    }

    set maxStress (value) {
        if (isNaN(value))
            return

        if (this.#currentStressEl.max !== value)
            this.#currentStressEl.max = value

        if (this.#maxStressEl.value !== `${value}`)
            this.#maxStressEl.value = `${value}`
    }

    get imageFile () {
        return this.#imageFile
    }

    /**
     * Handler for new ship model drop
     * @param {File} file          image to change player element background to
     */
    set imageFile (file) {
        this.#imageFile = file
        this.#portraitEl.src = URL.createObjectURL(this.#imageFile)
    }

    setDefaultImage () {
        this.#portraitEl.src = DefaultPlayerImages[this.playerIndex % DefaultPlayerImages.length]
    }
}

// Register element
customElements.define('player-display', PlayerDisplayElement, { extends: 'li' })
globalThis.PlayerDisplayElement = PlayerDisplayElement
