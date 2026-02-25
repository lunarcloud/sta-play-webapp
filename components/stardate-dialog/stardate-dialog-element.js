import { animateClose } from '../../js/dialog-utils.js'
import { loadElementFromFile } from '../../js/load-file-element.js'
import { dateToStardate, formatStardate, dateToTOSStardate, stardateToDate, tosStardateToDate, TNG_EPOCH_YEAR, TOS_EPOCH_YEAR } from '../../js/stardate-utils.js'
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

  /** @type {string} */ #activeMode = 'tng'

  /** @type {HTMLInputElement|null} */ #yearInput = null
  /** @type {HTMLInputElement|null} */ #monthInput = null
  /** @type {HTMLInputElement|null} */ #dayInput = null
  /** @type {HTMLInputElement|null} */ #tngStardateInput = null

  /** @type {HTMLInputElement|null} */ #tosYearInput = null
  /** @type {HTMLInputElement|null} */ #tosMonthInput = null
  /** @type {HTMLInputElement|null} */ #tosDayInput = null
  /** @type {HTMLInputElement|null} */ #tosStardateInput = null

  /**
   * Constructor.
   */
  constructor () {
    super()
    this.innerHTML = dialogEl.innerHTML
    this.querySelectorAll('button.close').forEach(el => el.addEventListener('click', () => this.#handleCancel()))

    // Mode switcher: show only the active fieldset at a time
    this.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', () => this.#switchMode(/** @type {HTMLElement} */ (btn).dataset.mode))
    })

    // --- TNG calculator (bidirectional) ---
    this.#yearInput = /** @type {HTMLInputElement} */ (this.querySelector('input.calc-year'))
    this.#monthInput = /** @type {HTMLInputElement} */ (this.querySelector('input.calc-month'))
    this.#dayInput = /** @type {HTMLInputElement} */ (this.querySelector('input.calc-day'))
    this.#tngStardateInput = /** @type {HTMLInputElement} */ (this.querySelector('input.tng-stardate'))
    const eraContextEl = /** @type {HTMLElement} */ (this.querySelector('.era-context'))
    const eraSeriesEl = /** @type {HTMLElement} */ (this.querySelector('.era-series'))
    const eraEventsEl = /** @type {HTMLElement} */ (this.querySelector('.era-events'))

    let tngSync = false

    /**
     * @param {number} year     year to update as TNG
     */
    const tngUpdateEra = (year) => {
      const ctx = getEraContext(year)
      eraSeriesEl.textContent = ctx.series
      eraEventsEl.textContent = ctx.events
      eraContextEl.removeAttribute('hidden')
    }

    /**
     * On every keystroke: update the stardate output if year looks valid, but do NOT
     * write the clamped value back to the year input (that would interrupt typing).
     */
    const tngDateInput = () => {
      if (tngSync) return
      const year = parseInt(this.#yearInput.value)
      const month = parseInt(this.#monthInput.value)
      const day = parseInt(this.#dayInput.value)
      if (isNaN(year) || year < TNG_EPOCH_YEAR) return
      const m = Math.max(1, Math.min(12, isNaN(month) ? 1 : month))
      const d = Math.max(1, Math.min(31, isNaN(day) ? 1 : day))
      tngSync = true
      this.#tngStardateInput.value = formatStardate(dateToStardate(year, m, d))
      tngUpdateEra(year)
      tngSync = false
    }

    /**
     * On blur/change: clamp values, write back to inputs, then recalculate.
     */
    const tngDateChange = () => {
      if (tngSync) return
      tngSync = true
      const year = Math.max(TNG_EPOCH_YEAR, parseInt(this.#yearInput.value) || 2371)
      const month = Math.max(1, Math.min(12, parseInt(this.#monthInput.value) || 1))
      const day = Math.max(1, Math.min(31, parseInt(this.#dayInput.value) || 1))
      this.#yearInput.value = String(year)
      this.#monthInput.value = String(month)
      this.#dayInput.value = String(day)
      this.#tngStardateInput.value = formatStardate(dateToStardate(year, month, day))
      tngUpdateEra(year)
      tngSync = false
    }

    ;[this.#yearInput, this.#monthInput, this.#dayInput].forEach(el => {
      el.addEventListener('input', tngDateInput)
      el.addEventListener('change', tngDateChange)
    })

    const tngStardateChanged = () => {
      if (tngSync) return
      tngSync = true
      const num = parseFloat(this.#tngStardateInput.value)
      if (!isNaN(num)) {
        const d = stardateToDate(num)
        const year = Math.max(TNG_EPOCH_YEAR, d.year)
        this.#yearInput.value = String(year)
        this.#monthInput.value = String(d.month)
        this.#dayInput.value = String(d.day)
        tngUpdateEra(year)
      }
      tngSync = false
    }
    this.#tngStardateInput.addEventListener('input', tngStardateChanged)
    this.#tngStardateInput.addEventListener('change', tngStardateChanged)
    tngDateChange()

    this.querySelector('button.use-calculated')?.addEventListener('click', () => {
      this.#resolve(this.#tngStardateInput?.value?.trim() ?? '')
    })

    // --- TOS calculator (bidirectional) ---
    this.#tosYearInput = /** @type {HTMLInputElement} */ (this.querySelector('input.tos-year'))
    this.#tosMonthInput = /** @type {HTMLInputElement} */ (this.querySelector('input.tos-month'))
    this.#tosDayInput = /** @type {HTMLInputElement} */ (this.querySelector('input.tos-day'))
    this.#tosStardateInput = /** @type {HTMLInputElement} */ (this.querySelector('input.tos-stardate'))
    const tosEraContextEl = /** @type {HTMLElement} */ (this.querySelector('.tos-era-context'))
    const tosEraSeriesEl = /** @type {HTMLElement} */ (this.querySelector('.tos-era-series'))
    const tosEraEventsEl = /** @type {HTMLElement} */ (this.querySelector('.tos-era-events'))

    let tosSync = false

    /**
     * @param {number} year     year to update as TOS
     */
    const tosUpdateEra = (year) => {
      const ctx = getEraContext(year)
      tosEraSeriesEl.textContent = ctx.series
      tosEraEventsEl.textContent = ctx.events
      tosEraContextEl.removeAttribute('hidden')
    }

    const tosDateInput = () => {
      if (tosSync) return
      const year = parseInt(this.#tosYearInput.value)
      const month = parseInt(this.#tosMonthInput.value)
      const day = parseInt(this.#tosDayInput.value)
      if (isNaN(year) || year < TOS_EPOCH_YEAR) return
      const m = Math.max(1, Math.min(12, isNaN(month) ? 1 : month))
      const d = Math.max(1, Math.min(31, isNaN(day) ? 1 : day))
      tosSync = true
      this.#tosStardateInput.value = formatStardate(dateToTOSStardate(year, m, d))
      tosUpdateEra(year)
      tosSync = false
    }

    const tosDateChange = () => {
      if (tosSync) return
      tosSync = true
      const year = Math.min(2322, Math.max(TOS_EPOCH_YEAR, parseInt(this.#tosYearInput.value) || 2266))
      const month = Math.max(1, Math.min(12, parseInt(this.#tosMonthInput.value) || 1))
      const day = Math.max(1, Math.min(31, parseInt(this.#tosDayInput.value) || 1))
      this.#tosYearInput.value = String(year)
      this.#tosMonthInput.value = String(month)
      this.#tosDayInput.value = String(day)
      this.#tosStardateInput.value = formatStardate(dateToTOSStardate(year, month, day))
      tosUpdateEra(year)
      tosSync = false
    }

    const tosStardateChanged = () => {
      if (tosSync) return
      tosSync = true
      const num = parseFloat(this.#tosStardateInput.value)
      if (!isNaN(num)) {
        const d = tosStardateToDate(num)
        const year = Math.min(2322, Math.max(TOS_EPOCH_YEAR, d.year))
        this.#tosYearInput.value = String(year)
        this.#tosMonthInput.value = String(d.month)
        this.#tosDayInput.value = String(d.day)
        tosUpdateEra(year)
      }
      tosSync = false
    }

    ;[this.#tosYearInput, this.#tosMonthInput, this.#tosDayInput].forEach(el => {
      el.addEventListener('input', tosDateInput)
      el.addEventListener('change', tosDateChange)
    })
    this.#tosStardateInput.addEventListener('input', tosStardateChanged)
    this.#tosStardateInput.addEventListener('change', tosStardateChanged)
    tosDateChange()

    this.querySelector('button.use-tos')?.addEventListener('click', () => {
      this.#resolve(this.#tosStardateInput?.value?.trim() ?? '')
    })

    this.addEventListener('close', () => {
      if (this.returnValue !== 'confirm') {
        this.#handleCancel()
      }
    })
  }

  /**
   * The currently active mode ('tng' or 'tos').
   * @returns {string}      either 'tng' or 'tos'
   */
  get activeMode () {
    return this.#activeMode
  }

  /**
   * Whether the active mode uses the TOS stardate system.
   * @returns {boolean}     whether 'tos' or not
   */
  get isTOS () {
    return this.#activeMode === 'tos'
  }

  /**
   * Switch the visible mode panel ('tng' or 'tos').
   * @param {string} mode - The mode identifier matching a data-mode attribute
   */
  #switchMode (mode) {
    this.#activeMode = mode
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
   * Pre-fills the appropriate calculator from the current value and resets
   * the other calculator to its defaults to prevent stale state.
   * @param {string} [currentStardate] - The currently set stardate to pre-fill
   * @param {boolean} [isTOS] - Whether the current stardate uses the TOS system
   * @returns {Promise<string|null>} The new stardate, or null if cancelled
   */
  async editStardate (currentStardate = '', isTOS = false) {
    const currentEl = /** @type {HTMLElement} */ (this.querySelector('.current-value'))
    if (currentEl) {
      currentEl.textContent = currentStardate?.trim() || '—'
    }

    const num = parseFloat(currentStardate)

    if (isTOS) {
      // Reset TNG calculator to defaults
      this.#yearInput.value = '2371'
      this.#monthInput.value = '1'
      this.#dayInput.value = '1'
      this.#yearInput.dispatchEvent(new Event('change'))

      // Pre-fill TOS stardate input (exact stored value), then sync to date fields
      this.#tosStardateInput.value = !isNaN(num) ? (currentStardate?.trim() ?? '') : ''
      if (!isNaN(num)) {
        this.#tosStardateInput.dispatchEvent(new Event('change'))
      } else {
        // No stored value — reset to defaults
        this.#tosYearInput.value = '2266'
        this.#tosMonthInput.value = '1'
        this.#tosDayInput.value = '1'
        this.#tosYearInput.dispatchEvent(new Event('change'))
      }
      this.#switchMode('tos')
    } else {
      // Reset TOS calculator to defaults
      this.#tosYearInput.value = '2266'
      this.#tosMonthInput.value = '1'
      this.#tosDayInput.value = '1'
      this.#tosYearInput.dispatchEvent(new Event('change'))

      // Pre-fill TNG stardate input (exact stored value), then sync to date fields
      this.#tngStardateInput.value = !isNaN(num) ? (currentStardate?.trim() ?? '') : ''
      if (!isNaN(num)) {
        const d = stardateToDate(num)
        if (d.year >= TNG_EPOCH_YEAR) {
          this.#tngStardateInput.dispatchEvent(new Event('change'))
        } else {
          // Value out of TNG range — reset to defaults
          this.#yearInput.value = '2371'
          this.#monthInput.value = '1'
          this.#dayInput.value = '1'
          this.#yearInput.dispatchEvent(new Event('change'))
        }
      } else {
        // No stored value — reset to defaults
        this.#yearInput.value = '2371'
        this.#monthInput.value = '1'
        this.#dayInput.value = '1'
        this.#yearInput.dispatchEvent(new Event('change'))
      }
      this.#switchMode('tng')
    }

    this.returnValue = ''
    this.showModal()

    return new Promise((resolve) => {
      this.#resolvePromise = resolve
    })
  }
}

customElements.define('stardate-dialog', StardateDialogElement, { extends: 'dialog' })
