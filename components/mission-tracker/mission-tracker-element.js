import { toCSV } from '../../js/string-utils.js'

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
const SCENE_OUTCOMES = [' ', '✓', '✗']

/**
 * Element that represents a Captain's Log mission tracker.
 * @tagname mission-tracker
 * @cssprop [--nav-color-text=unset] - controls the text color of the clear missions button.
 * @cssprop [--trait-color-opacity=1] - controls the background color of the clear missions button.
 * @cssprop [--player-color-red=red] - controls the act1 background color.
 * @cssprop [--player-color-blue=blue] - controls the act2 background color.
 * @cssprop [--player-color-yellow=gold] - controls the act3 background color.
 * @attr {string} act1 - the act1 progress text (series of comma-separated ' ', '✓, and '✗' characters)
 * @attr {string} act2 - the act2 progress text (series of comma-separated ' ', '✓, and '✗' characters)
 * @attr {string} act3 - the act3 progress text (series of comma-separated ' ', '✓, and '✗' characters)
 */
export class MissionTrackerElement extends HTMLElement {
  /**
   * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#responding_to_attribute_changes)
   * @returns {Array<string>} the list of attributes to observe.
   */
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

    const internalEl = document.createElement('mission-tracker-internal')
    internalEl.setAttribute('part', 'internal')

    const clearBtnEl = document.createElement('button')
    clearBtnEl.className = 'clear-mission-tracker'
    clearBtnEl.type = 'button'
    clearBtnEl.addEventListener('click', _ => {
      const answer = confirm('Are you sure you want to clear the mission tracker?')
      if (answer === true) {
        this.clear()
      }
    })
    const clearBtnTextEl = document.createElement('div')
    clearBtnTextEl.textContent = '⌦'
    clearBtnEl.appendChild(clearBtnTextEl)
    internalEl.appendChild(clearBtnEl)

    for (let act = 1; act <= NUM_ACTS_PER_MISSION; act++) {
      const actEl = document.createElement('act')

      for (let scene = 1; scene <= NUM_SCENES_PER_ACT; scene++) {
        const sceneEl = document.createElement('div')
        sceneEl.className = 'scene'
        sceneEl.setAttribute('part', 'scene')

        const successSelectEl = document.createElement('select')
        for (const outcome of SCENE_OUTCOMES) {
          const outcomeEl = document.createElement('option')
          outcomeEl.text = outcome
          outcomeEl.value = outcome
          successSelectEl.appendChild(outcomeEl)
        }
        sceneEl.appendChild(successSelectEl)

        actEl.appendChild(sceneEl)
      }

      internalEl.appendChild(actEl)
      this.#actEls[act] = actEl
    }

    shadow.appendChild(internalEl)
  }

  /**
   * Called when an attribute changes.
   * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#responding_to_attribute_changes)
   * @param {string} name     attribute name
   * @param {any} _oldValue   the previous value
   * @param {any} newValue    the new value
   */
  attributeChangedCallback (name, _oldValue, newValue) {
    if (MissionTrackerElement.observedAttributes.includes(name)) {
      this[name] = newValue
    }
  }

  /**
   * the act1 progress text
   * @returns {string} series of comma-separated {@link SCENE_OUTCOMES}
   */
  get act1 () {
    return this.#getActValue(this.#actEls[1])
  }

  /**
   * the act1 progress text
   * @param {string} newValue     series of comma-separated {@link SCENE_OUTCOMES}
   */
  set act1 (newValue) {
    this.#setActValue(this.#actEls[1], newValue.split(','))
  }

  /**
   * the act2 progress text
   * @returns {string} series of comma-separated {@link SCENE_OUTCOMES}
   */
  get act2 () {
    return this.#getActValue(this.#actEls[2])
  }

  /**
   * the act2 progress text
   * @param {string} newValue     series of comma-separated {@link SCENE_OUTCOMES}
   */
  set act2 (newValue) {
    this.#setActValue(this.#actEls[2], newValue.split(','))
  }

  /**
   * the act3 progress text
   * @returns {string} series of comma-separated {@link SCENE_OUTCOMES}
   */
  get act3 () {
    return this.#getActValue(this.#actEls[3])
  }

  /**
   * the act3 progress text
   * @param {string} newValue     series of comma-separated {@link SCENE_OUTCOMES}
   */
  set act3 (newValue) {
    this.#setActValue(this.#actEls[3], newValue.split(','))
  }

  /**
   * Clears the progress of all acts.
   */
  clear () {
    this.act1 = ',,,,'
    this.act2 = ',,,,'
    this.act3 = ',,,,'
  }

  /**
   * Get the value of an act
   * @param {HTMLElement} act     which act
   * @returns {string} values     the act's values
   */
  #getActValue (act) {
    const values = []
    for (const sceneEl of act.children) {
      if ('value' in sceneEl) {
        values.push(sceneEl.value)
      }
    }
    return toCSV(values)
  }

  /**
   * Set the value of an act
   * @param {HTMLElement} act         which act
   * @param {Array<string>} values    the act's values
   */
  #setActValue (act, values) {
    const sceneEls = act.querySelectorAll('select')

    for (let i = 1; i <= values.length; i++) {
      let value = SCENE_OUTCOMES[0]
      if (SCENE_OUTCOMES.includes(values[i])) {
        value = values[i]
      }

      const sceneEl = sceneEls[i - 1]
      if (sceneEl instanceof HTMLSelectElement) {
        sceneEl.value = value
      }
    }
  }
}

// Register element
customElements.define('mission-tracker', MissionTrackerElement)
globalThis.MissionTrackerElement = MissionTrackerElement
