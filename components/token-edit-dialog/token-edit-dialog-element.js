import { animateClose, animateRemove } from '../../js/dialog-utils.js'
import { loadElementFromFile } from '../../js/load-file-element.js'
import { setupNumberInputScrollForParent } from '../../js/scrollable-inputs.js'
import { MIN_SCALE } from '../map-token/map-token.js'

const dialogEl = await loadElementFromFile('./components/token-edit-dialog/token-edit-dialog.html', 'dialog')

/**
 * Dialog for editing a placed map token: adjust its scale or stacking order, or remove it from the map.
 * Opened via a token's right-click/long-press `edit-requested` event.
 * @tagname token-edit-dialog
 */
export class TokenEditDialogElement extends HTMLDialogElement {
  /**
   * The on-map token element currently being edited, if any.
   * @type {import('../map-token/map-token.js').MapTokenElement|null}
   */
  #tokenEl = null

  /**
   * @type {HTMLImageElement}
   */
  #previewEl

  /**
   * @type {HTMLInputElement}
   */
  #scaleInputEl

  /**
   * @type {HTMLInputElement}
   */
  #scaleNumberEl

  /**
   * @type {HTMLButtonElement}
   */
  #sendBackwardEl

  /**
   * @type {HTMLButtonElement}
   */
  #bringForwardEl

  /**
   * Constructor.
   */
  constructor () {
    super()
    this.innerHTML = dialogEl.innerHTML

    this.#previewEl = this.querySelector('.token-preview')
    this.#scaleInputEl = this.querySelector('#token-scale-input')
    this.#scaleNumberEl = this.querySelector('#token-scale-number')
    this.#sendBackwardEl = this.querySelector('.send-backward')
    this.#bringForwardEl = this.querySelector('.bring-forward')

    this.querySelector('button.close')?.addEventListener('click', () => this.#handleClose())
    this.querySelector('button.confirm')?.addEventListener('click', () => this.#handleClose())
    this.querySelector('button.remove')?.addEventListener('click', () => this.#handleRemove())

    this.#scaleInputEl?.addEventListener('input', () => this.#applyScalePercent(Number(this.#scaleInputEl.value) * 100))
    this.#scaleNumberEl?.addEventListener('input', () => this.#applyScalePercent(Number(this.#scaleNumberEl.value)))
    this.#sendBackwardEl?.addEventListener('click', () => this.#tokenEl?.sendBackward())
    this.#bringForwardEl?.addEventListener('click', () => this.#tokenEl?.bringForward())

    setupNumberInputScrollForParent(this)

    this.addEventListener('close', () => { this.#tokenEl = null })
  }

  /**
   * Live-apply a scale percentage to the token being edited, flooring it to the minimum allowed
   * value (there is no maximum), and keep the slider and number input in sync with each other.
   * @param {number} percent    scale as a percentage (e.g. 100 for 1x)
   */
  #applyScalePercent (percent) {
    const scale = Math.max(percent / 100, MIN_SCALE)
    this.#scaleInputEl.value = `${scale}`
    this.#scaleNumberEl.value = `${Math.round(scale * 100)}`
    if (this.#tokenEl) this.#tokenEl.scale = scale
  }

  /**
   * Remove the token being edited from the map and close the dialog.
   */
  #handleRemove () {
    if (this.#tokenEl) animateRemove(this.#tokenEl)
    this.#tokenEl = null
    animateClose(this)
  }

  /**
   * Close the dialog, keeping whatever scale was applied live.
   */
  #handleClose () {
    animateClose(this)
  }

  /**
   * Open the dialog to edit a placed map token's scale, stacking order, or remove it.
   * @param {import('../map-token/map-token.js').MapTokenElement} tokenEl token being edited
   */
  edit (tokenEl) {
    this.#tokenEl = tokenEl
    this.#previewEl.src = tokenEl.src
    this.#applyScalePercent(tokenEl.scale * 100)
    this.showModal()
  }
}
customElements.define('token-edit-dialog', TokenEditDialogElement, { extends: 'dialog' })
