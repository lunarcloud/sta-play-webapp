import { animateClose } from '../../js/dialog-utils.js'
import { loadElementFromFile } from '../../js/load-file-element.js'

const dialogEl = await loadElementFromFile('./components/input-dialog/input-dialog.html', 'dialog')

/**
 * Dialog to ask the user for text input (replaces prompt).
 */
export class InputDialogElement extends HTMLDialogElement {
  /**
   * @type {((value: string|null) => void)|null}
   */
  #resolvePromise = null

  /**
   * Object URL of the currently shown preview image, so it can be revoked.
   * @type {string|null}
   */
  #previewUrl = null

  /**
   * Constructor.
   */
  constructor () {
    super()
    this.innerHTML = dialogEl.innerHTML

    this.querySelector('button.close')?.addEventListener('click', () => this.#handleCancel())
    this.querySelector('button.cancel')?.addEventListener('click', () => this.#handleCancel())
    this.querySelector('button.confirm')?.addEventListener('click', () => this.#handleConfirm())

    // Resolve the pending promise only once the dialog has actually finished closing
    // (after the close animation), so a subsequent prompt() call doesn't try to
    // showModal() a dialog that's still technically open.
    this.addEventListener('close', () => {
      const resolve = this.#resolvePromise
      this.#resolvePromise = null
      resolve?.(this.returnValue === 'confirm' ? (this.querySelector('input')?.value ?? '') : null)
    })

    // Handle Enter key in input field
    this.querySelector('input')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        this.#handleConfirm()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        this.#handleCancel()
      }
    })
  }

  /**
   * Clear and hide the preview image, revoking its object URL if any.
   */
  #clearPreview () {
    const imgEl = /** @type {HTMLImageElement} */ (this.querySelector('.preview-image'))
    if (imgEl) {
      imgEl.hidden = true
      imgEl.removeAttribute('src')
    }
    if (this.#previewUrl) {
      URL.revokeObjectURL(this.#previewUrl)
      this.#previewUrl = null
    }
  }

  /**
   * Handle cancel action.
   */
  #handleCancel () {
    this.returnValue = ''
    animateClose(this)
  }

  /**
   * Handle confirm action.
   */
  #handleConfirm () {
    this.returnValue = 'confirm'
    animateClose(this)
  }

  /**
   * Show the dialog with an input prompt.
   * @param {string}            message      - The message to display
   * @param {string}            defaultValue - The default value for the input
   * @param {File|undefined}    [previewImage] - Optional image to preview above the input, e.g. to clarify which file is being named
   * @returns {Promise<string|null>} Promise that resolves to the input value, or null if cancelled
   */
  async prompt (message, defaultValue, previewImage = undefined) {
    const labelEl = this.querySelector('label')
    const inputEl = this.querySelector('input')
    const imgEl = /** @type {HTMLImageElement} */ (this.querySelector('.preview-image'))

    if (labelEl) {
      labelEl.textContent = message
    }
    if (inputEl) {
      inputEl.value = defaultValue || ''
    }

    this.#clearPreview()
    if (imgEl && previewImage instanceof File) {
      this.#previewUrl = URL.createObjectURL(previewImage)
      imgEl.src = this.#previewUrl
      imgEl.alt = previewImage.name
      imgEl.hidden = false
    }

    this.returnValue = ''
    this.showModal()

    // Focus and select the input
    if (inputEl) {
      setTimeout(() => {
        inputEl.focus()
        inputEl.select()
      }, 100)
    }

    return new Promise((resolve) => {
      this.#resolvePromise = resolve
    })
  }
}
customElements.define('input-dialog', InputDialogElement, { extends: 'dialog' })
