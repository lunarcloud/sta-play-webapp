import { animateClose } from '../../js/dialog-utils.js'
import { loadElementFromFile } from '../../js/load-file-element.js'
import { dateToStardate, formatStardate, dateToTOSStardate } from '../../js/stardate-utils.js'
import { getEraContext } from '../../js/stardate-eras.js'

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

    // Mode switcher: show only the active fieldset at a time
    this.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = /** @type {HTMLElement} */ (btn).dataset.mode
        this.querySelectorAll('.mode-btn').forEach(b => b.classList.toggle('active', b === btn))
        this.querySelectorAll('fieldset[data-mode]').forEach(fs => {
          fs.classList.toggle('active', /** @type {HTMLElement} */ (fs).dataset.mode === mode)
        })
      })
    })

    const yearInput = /** @type {HTMLInputElement} */ (this.querySelector('input.calc-year'))
    const monthInput = /** @type {HTMLInputElement} */ (this.querySelector('input.calc-month'))
    const dayInput = /** @type {HTMLInputElement} */ (this.querySelector('input.calc-day'))
    const resultEl = /** @type {HTMLElement} */ (this.querySelector('.result-value'))
    const eraContextEl = /** @type {HTMLElement} */ (this.querySelector('.era-context'))
    const eraSeriesEl = /** @type {HTMLElement} */ (this.querySelector('.era-series'))
    const eraEventsEl = /** @type {HTMLElement} */ (this.querySelector('.era-events'))

    const recalculate = () => {
      const year = parseInt(yearInput.value) || 2371
      const month = Math.max(1, Math.min(12, parseInt(monthInput.value) || 1))
      const day = Math.max(1, Math.min(31, parseInt(dayInput.value) || 1))
      const stardate = dateToStardate(year, month, day)
      resultEl.textContent = formatStardate(stardate)

      const context = getEraContext(year)
      eraSeriesEl.textContent = context.series
      eraEventsEl.textContent = context.events
      eraContextEl.removeAttribute('hidden')
    }

    yearInput.addEventListener('input', recalculate)
    yearInput.addEventListener('change', recalculate)
    monthInput.addEventListener('input', recalculate)
    monthInput.addEventListener('change', recalculate)
    dayInput.addEventListener('input', recalculate)
    dayInput.addEventListener('change', recalculate)
    recalculate()

    this.querySelector('button.use-calculated')?.addEventListener('click', () => {
      const value = resultEl.textContent?.trim() ?? ''
      this.#resolve(value)
    })

    // TOS/Pre-TNG calculator
    const tosYearInput = /** @type {HTMLInputElement} */ (this.querySelector('input.tos-year'))
    const tosMonthInput = /** @type {HTMLInputElement} */ (this.querySelector('input.tos-month'))
    const tosDayInput = /** @type {HTMLInputElement} */ (this.querySelector('input.tos-day'))
    const tosResultEl = /** @type {HTMLElement} */ (this.querySelector('.tos-result-value'))
    const tosEraContextEl = /** @type {HTMLElement} */ (this.querySelector('.tos-era-context'))
    const tosEraSeriesEl = /** @type {HTMLElement} */ (this.querySelector('.tos-era-series'))
    const tosEraEventsEl = /** @type {HTMLElement} */ (this.querySelector('.tos-era-events'))

    const recalculateTOS = () => {
      const year = Math.min(2322, Math.max(2265, parseInt(tosYearInput.value) || 2266))
      const month = Math.max(1, Math.min(12, parseInt(tosMonthInput.value) || 1))
      const day = Math.max(1, Math.min(31, parseInt(tosDayInput.value) || 1))
      const stardate = dateToTOSStardate(year, month, day)
      tosResultEl.textContent = formatStardate(stardate)

      const context = getEraContext(year)
      tosEraSeriesEl.textContent = context.series
      tosEraEventsEl.textContent = context.events
      tosEraContextEl.removeAttribute('hidden')
    }

    tosYearInput.addEventListener('input', recalculateTOS)
    tosYearInput.addEventListener('change', recalculateTOS)
    tosMonthInput.addEventListener('input', recalculateTOS)
    tosMonthInput.addEventListener('change', recalculateTOS)
    tosDayInput.addEventListener('input', recalculateTOS)
    tosDayInput.addEventListener('change', recalculateTOS)
    recalculateTOS()

    this.querySelector('button.use-tos')?.addEventListener('click', () => {
      const value = tosResultEl.textContent?.trim() ?? ''
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
