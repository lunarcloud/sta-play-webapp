import { setupDropOnly } from '../../js/drop-nodrag-setup.js'
import { InputProgressElement } from '../input-progress/input-progress-element.js'
import { snakeToCamel } from '../../js/string-utils.js'
import { setupNumberInputScrollForParent } from '../../js/scrollable-inputs.js'

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

const PipCharacters = {
  solid: '⬤',
  hollow: '◯',
  legacySolid: '⚫',
  legacyHollow: '⚪'
}

/**
 * Unicode symbols that resemble TNG/Voyager enlisted rank insignia
 */
const EnlistedCharacters = {
  chevron: '❯', // Heavy Right-Pointing Angle Quotation Mark (U+276F)
  bar: '▐' // Vertical bar (U+2590)
}

/**
 * Get the text for player rank pips
 * @param {number} solid amount of solid pips
 * @param {number} hollow amount of hollow pips
 * @returns {string} text containing the solid, then hollow, pip symbols
 */
function PipText (solid, hollow) {
  return ''
    .padStart(solid, PipCharacters.solid)
    .padEnd(solid + hollow, PipCharacters.hollow)
}

/**
 * Get the text for enlisted rank insignia
 * @param {number} chevrons number of upward chevrons
 * @param {number} bars number of horizontal bars
 * @returns {string} text containing the chevron and bar symbols
 */
function EnlistedText (chevrons, bars) {
  return ''
    .padStart(chevrons, EnlistedCharacters.chevron)
    .padEnd(chevrons + bars, EnlistedCharacters.bar)
}

const Pips = [
  // Starfleet Officer Ranks
  { title: 'Captain', pips: PipText(4, 0), group: 'Officer' },
  { title: 'Commander', pips: PipText(3, 0), group: 'Officer' },
  { title: 'Lieutenant Commander', pips: PipText(2, 1), group: 'Officer' },
  { title: 'Lieutenant', pips: PipText(2, 0), group: 'Officer' },
  { title: 'Lieutenant Junior Grade', pips: PipText(1, 1), group: 'Officer' },
  { title: 'Ensign', pips: PipText(1, 0), group: 'Officer' },

  // Starfleet Flag Ranks
  { title: 'Commodore', pips: PipText(1, 0), group: 'Flag' },
  { title: 'Rear admiral', pips: PipText(2, 0), group: 'Flag' },
  { title: 'Vice admiral', pips: PipText(3, 0), group: 'Flag' },
  { title: 'Admiral', pips: PipText(4, 0), group: 'Flag' },
  { title: 'Fleet admiral', pips: PipText(5, 0), group: 'Flag' },

  // Starfleet Enlisted Ranks (using chevrons/bars like TNG/Voyager)
  { title: 'Master Chief Petty Officer', pips: EnlistedText(3, 2), group: 'Enlisted' },
  { title: 'Senior Chief Petty Officer', pips: EnlistedText(3, 1), group: 'Enlisted' },
  { title: 'Chief Petty Officer', pips: EnlistedText(3, 0), group: 'Enlisted' },
  { title: 'Petty Officer First Class', pips: EnlistedText(2, 1), group: 'Enlisted' },
  { title: 'Petty Officer Second Class', pips: EnlistedText(2, 0), group: 'Enlisted' },
  { title: 'Petty Officer Third Class', pips: EnlistedText(1, 1), group: 'Enlisted' },
  { title: 'Crewman First Class', pips: EnlistedText(1, 0), group: 'Enlisted' },
  { title: 'Crewman Second Class', pips: EnlistedText(0, 1), group: 'Enlisted' },
  { title: 'Crewman Third Class', pips: '·', group: 'Enlisted' },

  // Non-Starfleet Roles
  { title: 'Civilian', pips: '', group: 'Non-Starfleet' },
  { title: 'Diplomat', pips: '◆', group: 'Non-Starfleet' },
  { title: 'Intelligence', pips: '◈', group: 'Non-Starfleet' },

  // Klingon Defense Force Ranks (using triangle/trefoil symbols)
  { title: 'General', pips: '▲▲▲▲', group: 'Klingon' },
  { title: 'Brigadier', pips: '▲▲▲', group: 'Klingon' },
  { title: 'Colonel', pips: '▲▲', group: 'Klingon' },
  { title: 'Captain (KDF)', pips: '▲', group: 'Klingon' },
  { title: 'Lieutenant (KDF)', pips: '△△', group: 'Klingon' },
  { title: 'Warrior', pips: '△', group: 'Klingon' },
  { title: 'Bekk', pips: '▪', group: 'Klingon' },

  // Romulan Star Empire Ranks (using crescent and star symbols)
  { title: 'Admiral (RSE)', pips: '★★★★', group: 'Romulan' },
  { title: 'Commander (RSE)', pips: '★★★', group: 'Romulan' },
  { title: 'Subcommander', pips: '★★', group: 'Romulan' },
  { title: 'Centurion', pips: '★', group: 'Romulan' },
  { title: 'Subcenturion', pips: '☆☆', group: 'Romulan' },
  { title: 'Uhlan', pips: '☆', group: 'Romulan' },
  { title: 'Soldier (RSE)', pips: '◐', group: 'Romulan' },

  // Ferengi Alliance Ranks (using commercial/trade symbols)
  { title: 'Liquidator', pips: '⊕⊕', group: 'Ferengi' },
  { title: 'DaiMon', pips: '⊕', group: 'Ferengi' },
  { title: 'Junior DaiMon', pips: '⊗⊗', group: 'Ferengi' },
  { title: 'Commerce Officer', pips: '⊗', group: 'Ferengi' },
  { title: 'Merchant', pips: '●', group: 'Ferengi' },

  // Cardassian Union Ranks (using geometric shapes)
  { title: 'Legate', pips: '◆◆◆◆', group: 'Cardassian' },
  { title: 'Gul', pips: '◆◆◆', group: 'Cardassian' },
  { title: 'Dal', pips: '◆◆', group: 'Cardassian' },
  { title: 'Glinn', pips: '◆', group: 'Cardassian' },
  { title: 'Gil', pips: '◇◇', group: 'Cardassian' },
  { title: 'Garresh', pips: '◇', group: 'Cardassian' },
  { title: 'Gorr', pips: '▫', group: 'Cardassian' },

  // Borg Collective
  { title: 'Drone', pips: '▣', group: 'Borg' },

  { title: 'Other', pips: PipText(0, 0) },
]

const DefaultPlayerImages = [
  'img/player/ds9.webp',
  'img/player/voy.webp',
  'img/player/tng.webp',
  'img/player/ent.webp',
  'img/player/tos-movies.webp',
  'img/player/tng-cadet.webp'
]

const AnonymousNames = [
  'Jo Doe',
  'Jane Doe',
  'John Doe',
  'Josh Doe',
  'J\'lin Doe',
  'J\'larr Doe',
  'J\'Tag Doe',
  'Jane Sh\'Doe',
  'Jon Th\'Doe'
]

/**
 * Get a random "X Doe" style anonymous name.
 * @returns {string} name text
 */
function getAnonymousName () {
  return AnonymousNames[Math.floor(Math.random() * AnonymousNames.length)]
}

/**
 * @summary Element that represents a player character.
 * @tagname player-display
 * @cssprop [--pip-color=hsl(0, 0%, 73%)] - controls the color of the rank pips.
 * @cssprop [--progress-bar-color=#229bd8] - controls the color of the stress level progress-bar.
 * @cssprop [--progress-text-shadow-color=gray] - controls the text stress level progress-bar shadow color.
 * @cssprop [--slider-thumb-color=hsl(0deg 0% 0% / 75%)] - controls the color of the stress level progress-bar slider.
 * @cssprop [--trek-color-1=black] - controls the color of the border.
 * @cssprop [--player-color-brown=hsl(40deg 36% 21%)] - controls the color of the brown border selection color.
 * @cssprop [--player-color-red=red] - controls the color of the red border selection color.
 * @cssprop [--player-color-blue=blue] - controls the color of the blue border selection color.
 * @cssprop [--player-color-yellow=yellow] - controls the color of the yellow border selection color.
 * @cssprop [--player-color-black=black] - controls the color of the black border selection color.
 * @cssprop [--player-color-white=white] - controls the color of the white border selection color.
 * @attr {number} player-index - the player id number.
 * @attr {string} name - the player's name text.
 * @attr {string} color - the player's department color.
 * @attr {string} rank - the player's rank pip text.
 * @attr {number} current-stress - the player's current stress value.
 * @attr {number} max-stress - the player's maximum stress value.
 * @event {CustomEvent} removed - when the element has been removed from the DOM.
 */
export class PlayerDisplayElement extends HTMLLIElement {
  /**
   * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#responding_to_attribute_changes)
   * @returns {Array<string>} the list of attributes to observe.
   */
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
   * @type {HTMLElement}
   */
  #rankDisplay

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
      this.dispatchEvent(new CustomEvent('removed'))
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
      if (currentColor === ColorSquares[i].name) {
        optionEl.selected = true
      }
      this.#colorSelect.appendChild(optionEl)
    }
    this.#colorSelect.addEventListener('change', _event => this.setAttribute('color', this.#colorSelect.value))

    // select 'rank'
    const currentRank = this.getAttribute('rank') ?? Pips[0].pips
    this.setAttribute('rank', currentRank)

    this.#rankDisplay = document.createElement('div')
    this.#rankDisplay.className = 'rank'

    const rankLabelEl = document.createElement('label')
    this.#rankDisplay.appendChild(rankLabelEl)

    this.#rankSelect = document.createElement('select')
    this.#rankDisplay.appendChild(this.#rankSelect)

    // For all pip ranks
    const rankGroups = []
    for (let i = 0; i < Pips.length; i++) {
      // Create the option element
      const optionEl = document.createElement('option')
      optionEl.title = Pips[i].title
      optionEl.textContent = Pips[i].title
      optionEl.value = Pips[i].pips + ':' + Pips[i].group

      // If this belongs to a group...
      if (Pips[i].group !== undefined) {
        // Find or create the group
        let optGroup = rankGroups.find(e => e.label === Pips[i].group)
        if (!optGroup) {
          optGroup = document.createElement('optgroup')
          optGroup.label = Pips[i].group

          // Put this new group into the list
          rankGroups.push(optGroup)
        }

        // Add to the list
        optGroup.appendChild(optionEl)
      } else {
        // Not part of a group, add directly to list
        rankGroups.push(optionEl)
      }
    }
    // Add it all to the select element
    rankGroups.forEach(e => this.#rankSelect.appendChild(e))

    // Wire up change events
    this.#rankSelect.addEventListener('change', _event => this.setAttribute('rank', this.#rankSelect.value))

    // Select the current rank
    this.setAttribute('rank', currentRank)

    // stress input-progress of input max
    let currentStress = parseInt(this.getAttribute('current-stress'))
    if (isNaN(currentStress)) {
      currentStress = 9
    }
    this.setAttribute('current-stress', `${currentStress}`)

    let maxStress = parseInt(this.getAttribute('max-stress'))
    if (isNaN(maxStress)) {
      maxStress = 9
    }
    this.setAttribute('max-stress', `${maxStress}`)

    const stressEl = document.createElement('stress')
    stressEl.classList.add('edition-1', 'edition-2')

    const currentStressEl = document.createElement('input-progress')
    if (currentStressEl instanceof InputProgressElement === false) {
      throw new Error('Something went very wrong!')
    }
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
    const currentName = this.getAttribute('name') ?? getAnonymousName()
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
    this.appendChild(this.#rankDisplay)
    this.appendChild(stressEl)
    this.appendChild(topAreaEl)

    this.#nameEl.addEventListener('input', _event => {
      this.setAttribute('text', this.#nameEl.textContent)
    }, { passive: true, capture: false })

    // Mouse scrolling to update number inputs
    setupNumberInputScrollForParent(this)

    // Setup drag and drop for reordering
    this.#setupDragAndDrop()

    // Setup drop for images
    setupDropOnly(this, event => {
      if (!event.dataTransfer.items?.[0].type.startsWith('image') ||
                !event.dataTransfer.files?.[0]) {
        return false
      }

      this.imageFile = event.dataTransfer.files?.[0]
      return true
    })
  }

  /**
   * Setup drag and drop functionality for reordering players
   */
  #setupDragAndDrop () {
    // Make this element draggable
    this.setAttribute('draggable', 'true')

    this.addEventListener('dragstart', event => {
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('text/plain', this.playerIndex.toString())
      this.classList.add('dragging')
    })

    this.addEventListener('dragend', _event => {
      this.classList.remove('dragging')
    })

    this.addEventListener('dragover', event => {
      event.preventDefault()
      event.dataTransfer.dropEffect = 'move'

      // Get the dragging element
      const draggingElement = document.querySelector('.players .dragging')
      if (!draggingElement) {
        return
      }

      // Determine if we should insert before or after this element
      const rect = this.getBoundingClientRect()
      const midpoint = rect.top + rect.height / 2
      const insertBefore = event.clientY < midpoint

      // Dispatch a reorder event
      this.dispatchEvent(new CustomEvent('player-reorder', {
        bubbles: true,
        detail: {
          draggedElement: draggingElement,
          targetElement: this,
          insertBefore
        }
      }))
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
    if (PlayerDisplayElement.observedAttributes.includes(name)) {
      this[snakeToCamel(name)] = newValue
    }
  }

  /**
   * The Player's Database Id number.
   * @returns {number}    the attribute value
   */
  get playerIndex () {
    const i = parseInt(this.getAttribute('player-index'))
    return isNaN(i) ? 0 : i
  }

  /**
   * The Player's Database Id number.
   * @param {number} value    the attribute value
   */
  set playerIndex (value) {
    if (this.getAttribute('player-index') !== `${value}`) {
      this.setAttribute('player-index', `${value}`)
    }
  }

  /**
   * The Player's name text.
   * @returns {string}    the attribute value
   */
  get name () {
    return this.#nameEl.textContent
  }

  /**
   * The Player's name text.
   * @param {string} value    the attribute value
   */
  set name (value) {
    this.#nameEl.textContent = value
  }

  /**
   * The Player's department color.
   * @returns {string}    the attribute value
   * @see {@link ColorSquares}
   */
  get color () {
    return this.#colorSelect.value
  }

  /**
   * The Player's department color.
   * @param {string} value    the attribute value
   * @see {@link ColorSquares}
   */
  set color (value) {
    this.#colorSelect.value = value
  }

  /**
   * The Player's rank pips text.
   * @returns {string}    the attribute value
   * @see {@link Pips}
   */
  get rank () {
    return this.#rankSelect.value
  }

  /**
   * The Player's rank pips text.
   * @param {string} value    the attribute value
   * @see {@link Pips}
   */
  set rank (value) {
    if (typeof (value) !== 'string') {
      return
    }

    // Convert legacy symbols to current ones
    value = value
      .replaceAll(PipCharacters.legacySolid, PipCharacters.solid)
      .replaceAll(PipCharacters.legacyHollow, PipCharacters.hollow)

    // Try to find the rank value amongst the valid options
    const titleMatches = Pips.filter(e => e.title === value)
    const pipMatches = Pips.filter(e => e.pips + ':' + e.group === value)
      .concat(Pips.filter(e => e.pips + ':' + e.group === value + ':Officer'))

    // Get data from the searches
    const match = titleMatches.length > 0
      ? titleMatches[0]
      : pipMatches.length > 0
        ? pipMatches[0]
        : Pips[Pips.length - 1] // "Other"
    const group = match.group || ''

    // update the select element's value itself
    if (titleMatches.length > 0) {
      this.setAttribute('rank', match.pips + ':' + group)
    } else if (pipMatches.length > 0) {
      this.#rankSelect.value = match.pips + ':' + group
    }

    // Update the rank display
    this.#rankDisplay.querySelector('label').textContent = match.pips
    this.#rankDisplay.title = match.title
    this.#rankDisplay.classList.toggle('flag', group.toLowerCase().trim() === 'flag')
  }

  /**
   * The Player's current stress level.
   * @returns {number}    the attribute value
   */
  get currentStress () {
    return this.#currentStressEl.value
  }

  /**
   * The Player's current stress level.
   * @param {number} value    the attribute value
   */
  set currentStress (value) {
    if (isNaN(value)) {
      return
    }

    if (this.#currentStressEl.max !== value) {
      this.#currentStressEl.value = value
    }
  }

  /**
   * The Player's maximum stress level.
   * @returns {number}    the attribute value
   */
  get maxStress () {
    return this.#currentStressEl.max
  }

  /**
   * The Player's maximum stress level.
   * @param {number} value    the attribute value
   */
  set maxStress (value) {
    if (isNaN(value)) {
      return
    }

    if (this.#currentStressEl.max !== value) {
      this.#currentStressEl.max = value
    }

    if (this.#maxStressEl.value !== `${value}`) {
      this.#maxStressEl.value = `${value}`
    }
  }

  /**
   * The Player's portrait image.
   * @returns {File}    the attribute value
   */
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

  /**
   * Set the player's portrait image to a random default image.
   * @see {@link DefaultPlayerImages}
   */
  setDefaultImage () {
    this.#portraitEl.src = DefaultPlayerImages[this.playerIndex % DefaultPlayerImages.length]
  }

  /**
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/focus)
   * @param {FocusOptions} [options]  An optional object for controlling aspects of the focusing process
   */
  focus (options) {
    this.#nameEl.focus(options)
  }

  /**
   * Focus on this element and highlight the editable name text.
   */
  focusNameEdit () {
    this.focus()
    document.getSelection().setBaseAndExtent(this.#nameEl, 0, this.#nameEl, 1)
  }
}

// Register element
customElements.define('player-display', PlayerDisplayElement, { extends: 'li' })
