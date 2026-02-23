import { animateClose } from '../../js/dialog-utils.js'
import { loadElementFromFile } from '../../js/load-file-element.js'
import { dateToStardate, formatStardate } from '../../js/stardate-utils.js'

const dialogEl = await loadElementFromFile('./components/stardate-dialog/stardate-dialog.html', 'dialog')

/**
 * Dialog to edit the current in-universe stardate.
 * @tagname stardate-dialog
 */
export class StardateDialogElement extends HTMLDialogElement {
  /**
   * @type {((value: string|null) => void)|null}
   */
  #resolvePromise = null

  /**
   * Constructor.
   */
  constructor () {
    super()
    this.innerHTML = dialogEl.innerHTML
    this.querySelectorAll('button.close').forEach(el => el.addEventListener('click', () => this.#handleCancel()))

    const yearInput = /** @type {HTMLInputElement} */ (this.querySelector('input.calc-year'))
    const monthInput = /** @type {HTMLInputElement} */ (this.querySelector('input.calc-month'))
    const dayInput = /** @type {HTMLInputElement} */ (this.querySelector('input.calc-day'))
    const resultEl = /** @type {HTMLElement} */ (this.querySelector('.result-value'))

    const recalculate = () => {
      const year = parseInt(yearInput.value) || 2371
      const month = Math.max(1, Math.min(12, parseInt(monthInput.value) || 1))
      const day = Math.max(1, Math.min(31, parseInt(dayInput.value) || 1))
      const stardate = dateToStardate(year, month, day)
      resultEl.textContent = formatStardate(stardate)
    }

    yearInput.addEventListener('input', recalculate)
    monthInput.addEventListener('input', recalculate)
    dayInput.addEventListener('input', recalculate)
    recalculate()

    this.querySelector('button.use-calculated')?.addEventListener('click', () => {
      const value = resultEl.textContent?.trim() ?? ''
      this.#resolve(value)
    })

    this.querySelector('button.use-manual')?.addEventListener('click', () => {
      const input = /** @type {HTMLInputElement} */ (this.querySelector('input.manual-stardate'))
      const value = input?.value?.trim() ?? ''
      this.#resolve(value)
    })

    this.addEventListener('close', () => {
      if (this.returnValue !== 'confirm') {
        this.#handleCancel()
      }
    })
  }

  /**
   * Resolve with a new stardate value and close.
   * @param {string} value - The stardate to set
   */
  #resolve (value) {
    if (this.#resolvePromise) {
      this.#resolvePromise(value)
      this.#resolvePromise = null
    }
    this.returnValue = 'confirm'
    animateClose(this)
  }

  /**
   * Handle cancel action.
   */
  #handleCancel () {
    if (this.#resolvePromise) {
      this.#resolvePromise(null)
      this.#resolvePromise = null
    }
    animateClose(this)
  }

  /**
   * Show the dialog and return the chosen stardate.
   * @param {string} [currentStardate] - The currently set stardate to pre-fill
   * @returns {Promise<string|null>} The new stardate, or null if cancelled
   */
  async editStardate (currentStardate = '') {
    const currentEl = /** @type {HTMLElement} */ (this.querySelector('.current-value'))
    if (currentEl) {
      currentEl.textContent = currentStardate?.trim() || '—'
    }

    const manualInput = /** @type {HTMLInputElement} */ (this.querySelector('input.manual-stardate'))
    if (manualInput) {
      manualInput.value = currentStardate?.trim() ?? ''
    }

    this.returnValue = ''
    this.showModal()

    return new Promise((resolve) => {
      this.#resolvePromise = resolve
    })
  }
}

customElements.define('stardate-dialog', StardateDialogElement, { extends: 'dialog' })
globalThis.StardateDialogElement = StardateDialogElement
