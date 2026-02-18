import { animateClose } from '../../js/dialog-utils.js'
import { loadElementFromFile } from '../../js/load-file-element.js'

/**
 * Roll a single d20.
 * @returns {number} A random integer from 1 to 20
 */
function rollD20 () {
  return Math.floor(Math.random() * 20) + 1
}

const dialogEl = await loadElementFromFile('./components/dice-dialog/dice-dialog.html', 'dialog')

/**
 * Dialog for rolling d20 dice and displaying results.
 * @tagname dice-dialog
 */
export class DiceDialogElement extends HTMLDialogElement {
  /** @type {HTMLInputElement} */
  #diceCountInput

  /** @type {HTMLInputElement} */
  #targetNumberInput

  /** @type {HTMLInputElement} */
  #focusRangeInput

  /** @type {HTMLInputElement} */
  #complicationRangeInput

  /** @type {HTMLElement} */
  #resultsEl

  /** @type {HTMLElement} */
  #summaryEl

  /**
   * Constructor.
   */
  constructor () {
    super()
    this.innerHTML = dialogEl.innerHTML
    this.querySelectorAll('button.close').forEach(el => el.addEventListener('click', () => animateClose(this)))

    this.#diceCountInput = /** @type {HTMLInputElement} */ (this.querySelector('input.dice-count'))
    this.#targetNumberInput = /** @type {HTMLInputElement} */ (this.querySelector('input.target-number'))
    this.#focusRangeInput = /** @type {HTMLInputElement} */ (this.querySelector('input.focus-range'))
    this.#complicationRangeInput = /** @type {HTMLInputElement} */ (this.querySelector('input.complication-range'))
    this.#resultsEl = /** @type {HTMLElement} */ (this.querySelector('.dice-results'))
    this.#summaryEl = /** @type {HTMLElement} */ (this.querySelector('.dice-summary'))

    this.querySelector('button.roll-btn')?.addEventListener('click', () => this.roll())
  }

  /**
   * Roll the dice and display results.
   * @returns {{ rolls: number[], successes: number, complications: number }} The roll results
   */
  roll () {
    const diceCount = parseInt(this.#diceCountInput.value) || 2
    const targetNumber = parseInt(this.#targetNumberInput.value) || 10
    const parsedFocus = parseInt(this.#focusRangeInput.value)
    const focusRange = Number.isNaN(parsedFocus) ? 1 : parsedFocus
    const parsedComplication = parseInt(this.#complicationRangeInput.value)
    const complicationRange = Number.isNaN(parsedComplication) ? 1 : parsedComplication

    const rolls = []
    for (let i = 0; i < diceCount; i++) {
      rolls.push(rollD20())
    }

    let successes = 0
    let complications = 0

    this.#resultsEl.innerHTML = ''

    for (const value of rolls) {
      const dieEl = document.createElement('span')
      dieEl.className = 'die-result'
      dieEl.textContent = String(value)

      const isSuccess = value <= targetNumber
      const isCritical = value <= focusRange || value === 1
      const isComplication = value > (20 - complicationRange)

      if (isCritical) {
        dieEl.classList.add('critical')
        successes += 2
      } else if (isSuccess) {
        dieEl.classList.add('success')
        successes += 1
      }

      if (isComplication) {
        dieEl.classList.add('complication')
        complications += 1
      }

      this.#resultsEl.appendChild(dieEl)
    }

    const parts = []
    parts.push(`${successes} ${successes === 1 ? 'success' : 'successes'}`)
    if (complications > 0) {
      parts.push(`${complications} ${complications === 1 ? 'complication' : 'complications'}`)
    }
    this.#summaryEl.textContent = parts.join(', ')

    return { rolls, successes, complications }
  }
}
customElements.define('dice-dialog', DiceDialogElement, { extends: 'dialog' })
