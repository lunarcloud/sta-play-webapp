import { setupNumberInputScrollForParent, handleScrollOnNumberInput } from '../../js/scrollable-inputs.js'
import { snakeToCamel } from '../../js/string-utils.js'

/**
 * Extended Task / Combat Tracking Widget
 */

/**
 * List of Character Attributes
 */
const AttributeNames = [
  'Control',
  'Fitness',
  'Presence',
  'Daring',
  'Insight',
  'Reason'
]

/**
 * List of Ship Systems
 */
const SystemNames = [
  'Communications',
  'Engines',
  'Structure',
  'Computers',
  'Sensors',
  'Weapons'
]

/**
 * List of Character Departments (2e) / Disciplines (1e)
 */
const DepartmentNames = [
  'Command',
  'Security',
  'Science',
  'Conn',
  'Engineering',
  'Medicine'
]

/**
 * Element that represents an extended-task or combat tracker.
 * @tagname task-tracker
 * @cssprop [--tracker-background-color=#666] - controls the background color.
 * @cssprop [--tracker-border-width=6px] - controls the border width.
 * @cssprop [--tracker-border-style=outset] - controls the border style.
 * @cssprop [--tracker-border-color=black white white black] - controls the border color.
 * @cssprop [--tracker-title-separator-color=#333] - controls the color of the title separator.
 * @cssprop [--tracker-select-background-color=#333] - controls the color of the background color of select elements.
 * @cssprop [--tracker-select-color=#ccc] -  controls the color of the text color of select elements.
 * @cssprop [--tracker-dt-text-color=inherit] - controls the color of the text color of description term elements.
 * @cssprop [--tracker-dt-background-color=unset] - controls the color of the background color of description term elements.
 * @cssprop [--tracker-dt-border-color=transparent] - controls the color of the border color of description term elements.
 * @cssprop [--tracker-dd-text-color=inherit] - controls the color of the text color of description details elements.
 * @cssprop [--tracker-dd-background-color=unset] - controls the color of the background color of description details elements.
 * @cssprop [--tracker-dd-border-color=transparent] - controls the color of the border color of description details elements.
 * @attr {string} name - the name of the extended task or combat being tracked.
 * @attr {number} resistance - the amount of resistance applied to the task.
 * @attr {number} complication-range - the complication range of the task.
 * @attr {string} attribute - the task's attribute for a player
 * @attr {string} department - the task's department (discipline) for a player
 * @attr {string} ship-system - the task's attribute for the ship
 * @attr {string} ship-department - the task's department (discipline) for the ship
 * @attr {number} progress - the progress made/yet to be made for the task.
 * @event {CustomEvent} removed - when the element has been removed from the DOM.
 */
export class TaskTrackerElement extends HTMLElement {
  /**
   * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#responding_to_attribute_changes)
   * @returns {Array<string>} the list of attributes to observe.
   */
  static get observedAttributes () {
    return [
      'name',
      'resistance',
      'complication-range',
      'attribute',
      'department',
      'ship-system',
      'ship-department',
      'progress',
      'max-progress',
      'breakthroughs',
      'legacy-controls',
      'manual-breakthroughs'
    ]
  }

  /**
   * @type {HTMLElement}
   */
  #internalEls

  /**
   * @type {HTMLButtonElement}
   */
  #removeBtnEl

  /**
   * @type {HTMLElement}
   */
  #nameEl

  /**
   * @type {HTMLInputElement}
   */
  #resistanceEl

  /**
   * @type {HTMLInputElement}
   */
  #complicationRangeEl

  /**
   * @type {HTMLSelectElement}
   */
  #attributeEl

  /**
   * @type {HTMLSelectElement}
   */
  #departmentEl

  /**
   * @type {HTMLSelectElement}
   */
  #shipSystemEl

  /**
   * @type {HTMLSelectElement}
   */
  #shipDepartmentEl

  /**
   * @type {HTMLInputElement}
   */
  #progressEl

  /**
   * @type {HTMLInputElement}
   */
  #maxProgressEl

  /**
   * @type {HTMLInputElement}
   */
  #breakthroughsEl

  /**
   * @type {HTMLDivElement}
   */
  #progressVisualizeEl

  /**
   * Constructor.
   */
  constructor () {
    super()

    const shadow = this.attachShadow({ mode: 'open' })

    // Apply external styles
    const linkElem = document.createElement('link')
    linkElem.setAttribute('rel', 'stylesheet')
    linkElem.setAttribute('href', 'components/task-tracker/task-tracker.css')

    // Attach the created element
    shadow.appendChild(linkElem)

    // remove button ⤫
    this.#removeBtnEl = document.createElement('button')
    this.#removeBtnEl.classList.add('remove')
    this.#removeBtnEl.textContent = '⤫'
    this.#removeBtnEl.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('removed'))
      this.remove()
    })

    // name element
    try {
      this.#nameEl = document.createElement('h1')
      this.#nameEl.contentEditable = 'plaintext-only'
    } catch {
      this.#nameEl = document.createElement('input')
      if (this.#nameEl instanceof HTMLInputElement) {
        this.#nameEl.type = 'text'
      }
    }
    this.#nameEl.className = 'name'
    this.#nameEl.setAttribute('spellcheck', 'false')

    this.#useAttrOrDefault(this.#nameEl, 'name', '')

    this.#nameEl.addEventListener(
      this.#nameEl instanceof HTMLInputElement ? 'change' : 'input',
      _event => this.setAttribute('name', this.#nameEl instanceof HTMLInputElement ? this.#nameEl.value : this.#nameEl.textContent))

    // Data-List & Elements
    const listEl = document.createElement('dl')

    // resistance element
    this.#resistanceEl = document.createElement('input')
    this.#resistanceEl.type = 'number'
    this.#resistanceEl.className = 'resistance'
    this.#useAttrOrDefault(this.#resistanceEl, 'resistance', '0')
    this.#resistanceEl.addEventListener('change', _event => this.setAttribute('resistance', this.#resistanceEl.value))

    this.#addDataListItem(listEl, 'resistance', 'Resistance', this.#resistanceEl)

    // complication-range element
    this.#complicationRangeEl = document.createElement('input')
    this.#complicationRangeEl.type = 'number'
    this.#complicationRangeEl.max = '5'
    this.#complicationRangeEl.min = '0'
    this.#complicationRangeEl.className = 'complication-range'
    this.#useAttrOrDefault(this.#complicationRangeEl, 'complication-range', '0')
    this.#complicationRangeEl.addEventListener('change', _event => this.setAttribute('complication-range', this.#complicationRangeEl.value))

    this.#addDataListItem(listEl, 'complication-range', 'Complication Range', this.#complicationRangeEl)

    // Stats elements
    const [attributeEl, departmentEl] = this.#createStatEls(true)
    this.#attributeEl = attributeEl
    this.#departmentEl = departmentEl

    const [shipSystemEl, shipDepartmentEl] = this.#createStatEls(false)
    this.#shipSystemEl = shipSystemEl
    this.#shipDepartmentEl = shipDepartmentEl

    // add both attribute and department under the same heading
    const [listDtEl, listDdEl] = this.#addDataListItem(listEl, 'stats', 'Stats',
      this.#attributeEl, this.#departmentEl,
      this.#shipSystemEl, this.#shipDepartmentEl)

    // Ensure all this is only shown when legacy trackers is enabled
    for (const el of [attributeEl, departmentEl, shipSystemEl, shipDepartmentEl, listDtEl, listDdEl]) {
      el.classList.add('legacy-controls')
    }

    // Allow Toggling between Character and Ship Stats
    const statsToggleParentEl = document.createElement('label')
    statsToggleParentEl.classList.add('stats-toggle')

    const statsToggleSwitchEl = document.createElement('input')
    statsToggleSwitchEl.type = 'checkbox'
    listDdEl.classList.add('character') // start with character
    statsToggleSwitchEl.addEventListener('change', () => {
      listDdEl.classList.toggle('character')
      listDdEl.classList.toggle('ship')
    })

    const statsCharacterIconEl = document.createElement('img')
    statsCharacterIconEl.classList.add('character')
    statsCharacterIconEl.src = 'img/vulcan-salute.svg'

    const statsShipIconEl = document.createElement('img')
    statsShipIconEl.classList.add('ship')
    statsShipIconEl.src = 'img/starship-profile.svg'

    statsToggleParentEl.appendChild(statsToggleSwitchEl)
    statsToggleParentEl.appendChild(statsCharacterIconEl)
    statsToggleParentEl.appendChild(statsShipIconEl)
    listDtEl.appendChild(statsToggleParentEl)

    // Line break if not legacy style
    const brFor1eEl = document.createElement('br')
    brFor1eEl.classList.add('non-legacy-controls')
    listEl.appendChild(brFor1eEl)

    // progress elements
    this.#progressEl = document.createElement('input')
    this.#progressEl.type = 'number'
    this.#progressEl.max = ''
    this.#progressEl.min = '0'
    this.#progressEl.className = 'current progress'
    this.#useAttrOrDefault(this.#progressEl, 'progress', '0')
    this.#progressEl.addEventListener('change', _event => this.setAttribute('progress', this.#progressEl.value))

    const progressDividerEl = document.createElement('span')
    progressDividerEl.className = 'text progress'
    progressDividerEl.textContent = 'of '

    this.#maxProgressEl = document.createElement('input')
    this.#maxProgressEl.type = 'number'
    this.#maxProgressEl.max = ''
    this.#maxProgressEl.min = '2'
    this.#maxProgressEl.className = 'max progress'
    this.#useAttrOrDefault(this.#maxProgressEl, 'max-progress', '9')
    this.#maxProgressEl.addEventListener('change', _event => this.setAttribute('max-progress', this.#maxProgressEl.value))

    // add both current and max progress under the same heading
    this.#addDataListItem(listEl, 'progress', 'Progress',
      this.#progressEl, progressDividerEl, this.#maxProgressEl)

    // manual breakthroughs element
    this.#breakthroughsEl = document.createElement('input')
    this.#breakthroughsEl.type = 'number'
    this.#breakthroughsEl.max = '20'
    this.#breakthroughsEl.min = '1'
    this.#breakthroughsEl.className = 'breakthroughs'
    this.#useAttrOrDefault(this.#breakthroughsEl, 'breakthroughs', '1')
    const [breakthroughsDtEl, breakthroughsDdEl] = this.#addDataListItem(listEl, 'breakthroughs', 'Breakthroughs', this.#breakthroughsEl)
    breakthroughsDtEl.classList.add('manual-breakthroughs', 'non-legacy-controls')
    breakthroughsDdEl.classList.add('manual-breakthroughs', 'non-legacy-controls')

    // Line break before progress visualization
    const brForVisualizeEl = document.createElement('br')
    brForVisualizeEl.classList.add('non-legacy-controls')
    listEl.appendChild(brForVisualizeEl)

    // progress visualization element
    this.#progressVisualizeEl = document.createElement('div')
    this.#progressVisualizeEl.className = 'progress-visual non-legacy-controls'
    this.#updateProgressVisualization()
    listEl.appendChild(this.#progressVisualizeEl)

    // Create internal element
    const internalEls = document.createElement('task-tracker-internal')
    internalEls.setAttribute('part', 'internal')

    // Put it together
    internalEls.appendChild(this.#removeBtnEl)
    internalEls.appendChild(this.#nameEl)
    internalEls.appendChild(listEl)
    shadow.appendChild(internalEls)

    // Setup input field scrolling to update
    setupNumberInputScrollForParent(shadow)

    // Scrolling on the visualization should update the progress value
    this.#progressVisualizeEl.addEventListener('wheel', evt => {
      handleScrollOnNumberInput(evt, this.#progressEl)
    }, { passive: false })

    this.#internalEls = internalEls

    // Make sure the setters for these are called to help enforce rules
    this.progress = this.#progressEl.valueAsNumber
    this.maxProgress = this.#maxProgressEl.valueAsNumber
  }

  /**
   * Update the textual representation of progress
   */
  #updateProgressVisualization () {
    // clear previous
    this.#progressVisualizeEl.textContent = ''

    const max = this.#maxProgressEl.valueAsNumber
    const current = this.#progressEl.valueAsNumber

    // loop for all max progress blocks
    for (let i = 1; i <= max; i++) {
      // if we're on an earned block
      if (i <= current) {
        // black squares for earned
        this.#progressVisualizeEl.textContent += '⬛'
      } else if (!this.manualBreakthroughs &&
                (i === Math.ceil(max * 0.50) || i === Math.ceil(max * 0.75))) {
        // yellow squares for unearned 50% or 75% auto breakthrough (2e)
        this.#progressVisualizeEl.textContent += '🟨'
      } else {
        // white squares for the other unearned blocks
        this.#progressVisualizeEl.textContent += '⬜'
      }
    }
  }

  /**
   * Create stats elements
   * @param {boolean} isCharacter    whether this is for a character (or ship)
   * @returns {[HTMLSelectElement, HTMLSelectElement]} the two stats elements
   */
  #createStatEls (isCharacter) {
    const displayClass = isCharacter ? 'character' : 'ship'

    // Big Number, Attribute or System, element
    const bigStatAttr = isCharacter ? 'attribute' : 'ship-system'
    const bigStatEl = document.createElement('select')
    bigStatEl.classList.add(bigStatAttr, displayClass)

    const names = isCharacter ? AttributeNames : SystemNames

    for (const bigStatName of names) {
      const optionEl = document.createElement('option')
      optionEl.textContent = bigStatName
      optionEl.value = bigStatName
      bigStatEl.appendChild(optionEl)
    }
    this.#useAttrOrDefault(bigStatEl, bigStatAttr, names[0])
    bigStatEl.addEventListener('change', _event => this.setAttribute(bigStatAttr, bigStatEl.value))

    // Small Number, Department, element
    const smallStatAttr = isCharacter ? 'department' : 'ship-department'
    const smallStatEl = document.createElement('select')
    smallStatEl.classList.add(smallStatAttr, displayClass)
    for (const smallStatName of DepartmentNames) {
      const optionEl = document.createElement('option')
      optionEl.textContent = smallStatName
      optionEl.value = smallStatName
      smallStatEl.appendChild(optionEl)
    }
    this.#useAttrOrDefault(smallStatEl, smallStatAttr, DepartmentNames[0])
    smallStatEl.addEventListener('change', _event => this.setAttribute(smallStatAttr, smallStatEl.value))

    return [bigStatEl, smallStatEl]
  }

  /**
   * Add a new element to a list
   * @param {Element} listEl      list element to add to
   * @param {string} name         class name
   * @param {string} text         title text
   * @param {...Element} elements data elements
   * @returns {HTMLElement[]}      the dt and dd elements
   */
  #addDataListItem (listEl, name, text, ...elements) {
    const listTextEl = document.createElement('dt')
    listTextEl.textContent = text
    listTextEl.classList.add(name)

    const listDataEl = document.createElement('dd')
    listDataEl.classList.add(name)

    for (const element of elements) {
      listDataEl.appendChild(element)
    }
    listEl.appendChild(listTextEl)
    listEl.appendChild(listDataEl)

    return [listTextEl, listDataEl]
  }

  /**
   * Update the inner editable element with this element's attribute or a default
   * @param {Element} innerEl Element inside that is the editable source of the value
   * @param {string} attribute name of the attribute on this element
   * @param {string} defaultValue value if this element doesn't have a value set
   */
  #useAttrOrDefault (innerEl, attribute, defaultValue) {
    const value = this.getAttribute(attribute) ?? defaultValue

    if (innerEl instanceof HTMLInputElement || innerEl instanceof HTMLSelectElement) {
      innerEl.value = value
    } else {
      innerEl.textContent = value
    }
  }

  /**
   * Called when an attribute changes.
   * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#responding_to_attribute_changes)
   * @param {string} name     attribute name
   * @param {any} _oldValue   the previous value
   * @param {any} newValue    the new value
   */
  attributeChangedCallback (name, _oldValue, newValue) {
    if (TaskTrackerElement.observedAttributes.includes(name)) {
      this[snakeToCamel(name)] = newValue
    }
  }

  /**
   * the name of the extended task or combat being tracked.
   * @returns {string} attribute value
   */
  get name () {
    return this.#nameEl.textContent
  }

  /**
   * the name of the extended task or combat being tracked.
   * @param {string} value attribute value
   */
  set name (value) {
    // "if" so we don't do it if round-tripping or we'll reset the cursor position while typing
    if (this.#nameEl.textContent !== value) {
      this.#nameEl.textContent = value
    }
  }

  /**
   * the amount of resistance applied to the task.
   * @returns {number} attribute value
   */
  get resistance () {
    const value = parseInt(this.#resistanceEl.value)
    return isNaN(value) ? 0 : value
  }

  /**
   * the amount of resistance applied to the task.
   * @param {number|string} value the new attribute value
   */
  set resistance (value) {
    if (!isNaN(parseInt(`${value}`))) {
      this.#resistanceEl.value = `${value}`
    }
  }

  /**
   * the complication range applied to the task.
   * @returns {number} attribute value
   */
  get complicationRange () {
    const value = parseInt(this.#complicationRangeEl.value)
    return isNaN(value) ? 0 : value
  }

  /**
   * the complication range applied to the task.
   * @param {number|string} value the new attribute value
   */
  set complicationRange (value) {
    if (!isNaN(parseInt(`${value}`))) {
      this.#complicationRangeEl.value = `${value}`
    }
  }

  /**
   * the progress made/yet to be made for the task
   * @returns {number} attribute value
   */
  get progress () {
    const value = parseInt(this.#progressEl.value)
    return isNaN(value) ? 0 : value
  }

  /**
   * the progress made/yet to be made for the task
   * @param {number|string} value the new attribute value
   */
  set progress (value) {
    if (isNaN(parseInt(`${value}`))) {
      return
    }
    this.#progressEl.value = `${value}`
    this.#updateProgressVisualization()
  }

  /**
   * the total progress for the task
   * @returns {number} attribute value
   */
  get maxProgress () {
    const value = parseInt(this.#maxProgressEl.value)
    return isNaN(value) ? 0 : value
  }

  /**
   * the total progress for the task
   * @param {number|string} value the new attribute value
   */
  set maxProgress (value) {
    if (isNaN(parseInt(`${value}`))) {
      return
    }
    this.#maxProgressEl.value = `${value}`

    // ensure the max is never smaller than current
    if (this.#maxProgressEl.valueAsNumber < this.#progressEl.valueAsNumber) { this.#maxProgressEl.value = `${this.#progressEl.valueAsNumber}` }

    // ensure the current is never larger than max
    this.#progressEl.max = this.manualBreakthroughs ? '' : `${value}`

    this.#updateProgressVisualization()
  }

  /**
   * the breakthroughs made/yet to be made for the task
   * @returns {number} attribute value
   */
  get breakthroughs () {
    const value = parseInt(this.#breakthroughsEl.value)
    return isNaN(value) ? 0 : value
  }

  /**
   * the breakthroughs made/yet to be made for the task
   * @param {number|string} value the new attribute value
   */
  set breakthroughs (value) {
    if (!isNaN(parseInt(`${value}`))) {
      this.#breakthroughsEl.value = `${value}`
    }
  }

  /**
   * the task's attribute for a player
   * @returns {string} attribute value
   * @see {@link AttributeNames}
   */
  get attribute () {
    return this.#attributeEl.value
  }

  /**
   * the task's attribute for a player
   * @param {string} value    attribute value
   * @see {@link AttributeNames}
   */
  set attribute (value) {
    if (this.#attributeEl.querySelector(`option[value="${value}"]`)) {
      this.#attributeEl.value = value
    }
  }

  /**
   * the task's department (discipline) for a player
   * @returns {string} attribute value
   * @see {@link DepartmentNames}
   */
  get department () {
    return this.#departmentEl.value
  }

  /**
   * the task's department (discipline) for a player
   * @param {string} value    attribute value
   * @see {@link DepartmentNames}
   */
  set department (value) {
    if (this.#departmentEl.querySelector(`option[value="${value}"]`)) {
      this.#departmentEl.value = value
    }
  }

  /**
   * the task's attribute for the ship
   * @returns {string} attribute value
   * @see {@link SystemNames}
   */
  get shipSystem () {
    return this.#shipSystemEl.value
  }

  /**
   * the task's attribute for the ship
   * @param {string} value    attribute value
   * @see {@link SystemNames}
   */
  set shipSystem (value) {
    if (this.#shipSystemEl.querySelector(`option[value="${value}"]`)) {
      this.#shipSystemEl.value = value
    }
  }

  /**
   *  the task's department (discipline) for the ship
   * @returns {string} attribute value
   * @see {@link DepartmentNames}
   */
  get shipDepartment () {
    return this.#shipDepartmentEl.value
  }

  /**
   *  the task's department (discipline) for the ship
   * @param {string} value    attribute value
   * @see {@link DepartmentNames}
   */
  set shipDepartment (value) {
    if (this.#shipDepartmentEl.querySelector(`option[value="${value}"]`)) {
      this.#shipDepartmentEl.value = value
    }
  }

  /**
   *  Whether to use legacy controls for the tracker
   * @returns {boolean} legacy controls active or not
   */
  get legacyControls () {
    return this.#internalEls.classList.contains('legacy-controls')
  }

  /**
   *  Whether to use legacy controls for the tracker
   * @param {string|boolean|null} value    legacy controls should be active or not
   */
  set legacyControls (value) {
    this.#internalEls.classList.toggle('legacy-controls', value !== null && `${value}` !== 'false')
  }

  /**
   *  Whether breakthroughs are a manual thing (1e) or automatic (2e)
   * @returns {boolean}   if breakthroughs are manual
   */
  get manualBreakthroughs () {
    if (!this.#internalEls) {
      return false
    }

    return this.#internalEls.classList.contains('manual-breakthroughs')
  }

  /**
   *  Whether breakthroughs are a manual thing (1e) or automatic (2e)
   * @param {string|boolean|null} value    breakthroughs should be manual
   */
  set manualBreakthroughs (value) {
    if (!this.#internalEls) {
      return
    }

    this.#internalEls.classList.toggle('manual-breakthroughs', value !== null && `${value}` !== 'false')
    this.#updateProgressVisualization()
  }

  /**
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/focus)
   * @param {FocusOptions} [options]  An optional object for controlling aspects of the focusing process
   */
  focus (options) {
    this.#nameEl.focus(options)
  }
}

// Register element
customElements.define('task-tracker', TaskTrackerElement)
