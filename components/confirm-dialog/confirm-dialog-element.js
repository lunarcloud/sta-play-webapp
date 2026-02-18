import { animateClose } from '../../js/dialog-utils.js'
import { loadElementFromFile } from '../../js/load-file-element.js'

const setup = async () => {
  const dialogEl = await loadElementFromFile('./components/confirm-dialog/confirm-dialog.html', 'dialog')

  /**
   * Dialog to ask the user for confirmation (replaces confirm).
   */
  class ConfirmDialogElement extends HTMLDialogElement {
    /**
     * @type {((value: boolean) => void)|null}
     */
    #resolvePromise = null

    /**
     * Constructor.
     */
    constructor () {
      super()
      this.innerHTML = dialogEl.innerHTML

      this.querySelector('button.close')?.addEventListener('click', () => this.#handleCancel())
      this.querySelector('button.cancel')?.addEventListener('click', () => this.#handleCancel())
      this.querySelector('button.confirm')?.addEventListener('click', () => this.#handleConfirm())

      this.addEventListener('close', () => {
        if (this.returnValue !== 'confirm') {
          this.#handleCancel()
        }
      })
    }

    /**
     * Handle cancel action.
     */
    #handleCancel () {
      if (this.#resolvePromise) {
        this.#resolvePromise(false)
        this.#resolvePromise = null
      }
      animateClose(this)
    }

    /**
     * Handle confirm action.
     */
    #handleConfirm () {
      if (this.#resolvePromise) {
        this.#resolvePromise(true)
        this.#resolvePromise = null
      }
      this.returnValue = 'confirm'
      animateClose(this)
    }

    /**
     * Show the dialog with a confirmation question.
     * @param {string} message - The message to display
     * @returns {Promise<boolean>} Promise that resolves to true if confirmed, false otherwise
     */
    async confirm (message) {
      const mainEl = this.querySelector('main')
      if (mainEl) {
        mainEl.textContent = message
      }
      this.returnValue = ''
      this.showModal()

      return new Promise((resolve) => {
        this.#resolvePromise = resolve
      })
    }
  }
  customElements.define('confirm-dialog', ConfirmDialogElement, { extends: 'dialog' })
  globalThis.ConfirmDialogElement = ConfirmDialogElement

  return ConfirmDialogElement
}

export const ConfirmDialogElement = await setup()
