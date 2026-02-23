import { animateClose } from '../../js/dialog-utils.js'
import { loadElementFromFile } from '../../js/load-file-element.js'
import { dateToStardate, formatStardate, dateToTOSStardate, stardateToDate, tosStardateToDate, TNG_EPOCH_YEAR } from '../../js/stardate-utils.js'
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

  /** @type {HTMLInputElement|null} */ #yearInput = null
  /** @type {HTMLInputElement|null} */ #monthInput = null
  /** @type {HTMLInputElement|null} */ #dayInput = null
  /** @type {HTMLInputElement|null} */ #tosYearInput = null
  /** @type {HTMLInputElement|null} */ #tosMonthInput = null
  /** @type {HTMLInputElement|null} */ #tosDayInput = null

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

    this.#yearInput = /** @type {HTMLInputElement} */ (this.querySelector('input.calc-year'))
    this.#monthInput = /** @type {HTMLInputElement} */ (this.querySelector('input.calc-month'))
    this.#dayInput = /** @type {HTMLInputElement} */ (this.querySelector('input.calc-day'))
    const resultEl = /** @type {HTMLElement} */ (this.querySelector('.result-value'))
    const eraContextEl = /** @type {HTMLElement} */ (this.querySelector('.era-context'))
    const eraSeriesEl = /** @type {HTMLElement} */ (this.querySelector('.era-series'))
    const eraEventsEl = /** @type {HTMLElement} */ (this.querySelector('.era-events'))

    const recalculate = () => {
      const year = Math.max(2323, parseInt(this.#yearInput.value) || 2371)
      const month = Math.max(1, Math.min(12, parseInt(this.#monthInput.value) || 1))
      const day = Math.max(1, Math.min(31, parseInt(this.#dayInput.value) || 1))
      this.#yearInput.value = String(year)
      this.#monthInput.value = String(month)
      this.#dayInput.value = String(day)
      const stardate = dateToStardate(year, month, day)
      resultEl.textContent = formatStardate(stardate)

      const context = getEraContext(year)
      eraSeriesEl.textContent = context.series
      eraEventsEl.textContent = context.events
      eraContextEl.removeAttribute('hidden')
    }

    this.#yearInput.addEventListener('input', recalculate)
    this.#yearInput.addEventListener('change', recalculate)
    this.#monthInput.addEventListener('input', recalculate)
    this.#monthInput.addEventListener('change', recalculate)
    this.#dayInput.addEventListener('input', recalculate)
    this.#dayInput.addEventListener('change', recalculate)
    recalculate()

    this.querySelector('button.use-calculated')?.addEventListener('click', () => {
      const value = resultEl.textContent?.trim() ?? ''
      this.#resolve(value)
    })

    // TOS/Pre-TNG calculator
    this.#tosYearInput = /** @type {HTMLInputElement} */ (this.querySelector('input.tos-year'))
    this.#tosMonthInput = /** @type {HTMLInputElement} */ (this.querySelector('input.tos-month'))
    this.#tosDayInput = /** @type {HTMLInputElement} */ (this.querySelector('input.tos-day'))
    const tosResultEl = /** @type {HTMLElement} */ (this.querySelector('.tos-result-value'))
    const tosEraContextEl = /** @type {HTMLElement} */ (this.querySelector('.tos-era-context'))
    const tosEraSeriesEl = /** @type {HTMLElement} */ (this.querySelector('.tos-era-series'))
    const tosEraEventsEl = /** @type {HTMLElement} */ (this.querySelector('.tos-era-events'))

    const recalculateTOS = () => {
      const year = Math.min(2322, Math.max(2265, parseInt(this.#tosYearInput.value) || 2266))
      const month = Math.max(1, Math.min(12, parseInt(this.#tosMonthInput.value) || 1))
      const day = Math.max(1, Math.min(31, parseInt(this.#tosDayInput.value) || 1))
      this.#tosYearInput.value = String(year)
      this.#tosMonthInput.value = String(month)
      this.#tosDayInput.value = String(day)
      const stardate = dateToTOSStardate(year, month, day)
      tosResultEl.textContent = formatStardate(stardate)

      const context = getEraContext(year)
      tosEraSeriesEl.textContent = context.series
      tosEraEventsEl.textContent = context.events
      tosEraContextEl.removeAttribute('hidden')
    }

    this.#tosYearInput.addEventListener('input', recalculateTOS)
    this.#tosYearInput.addEventListener('change', recalculateTOS)
    this.#tosMonthInput.addEventListener('input', recalculateTOS)
    this.#tosMonthInput.addEventListener('change', recalculateTOS)
    this.#tosDayInput.addEventListener('input', recalculateTOS)
    this.#tosDayInput.addEventListener('change', recalculateTOS)
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
   * Switch the visible mode panel (tng, tos, or manual).
   * @param {string} mode - The mode identifier matching a data-mode attribute
   */
  #switchMode (mode) {
    this.querySelectorAll('.mode-btn').forEach(b => {
      b.classList.toggle('active', /** @type {HTMLElement} */ (b).dataset.mode === mode)
    })
    this.querySelectorAll('fieldset[data-mode]').forEach(fs => {
      fs.classList.toggle('active', /** @type {HTMLElement} */ (fs).dataset.mode === mode)
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
   * Pre-fills the appropriate calculator from the current value so
   * the displayed result always matches what is currently set.
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

    // Pre-fill the correct calculator from the current stardate value
    const num = parseFloat(currentStardate)
    if (!isNaN(num)) {
      // TNG conversion: if the resulting year is in TNG range, pre-fill TNG calc
      const tngDate = stardateToDate(num)
      if (tngDate.year >= TNG_EPOCH_YEAR) {
        this.#yearInput.value = String(tngDate.year)
        this.#monthInput.value = String(tngDate.month)
        this.#dayInput.value = String(tngDate.day)
        this.#yearInput.dispatchEvent(new Event('change'))
        this.#switchMode('tng')
      } else {
        // Treat as TOS stardate
        const tosDate = tosStardateToDate(num)
        this.#tosYearInput.value = String(Math.min(2322, Math.max(2265, tosDate.year)))
        this.#tosMonthInput.value = String(tosDate.month)
        this.#tosDayInput.value = String(tosDate.day)
        this.#tosYearInput.dispatchEvent(new Event('change'))
        this.#switchMode('tos')
      }
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
