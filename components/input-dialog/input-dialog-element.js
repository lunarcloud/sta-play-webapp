import { animateClose } from '../../js/dialog-utils.js'
import { loadElementFromFile } from '../../js/load-file-element.js'

const setup = async () => {
  const dialogEl = await loadElementFromFile('./components/input-dialog/input-dialog.html', 'dialog')

  /**
   * Dialog to ask the user for text input (replaces prompt).
   */
  class InputDialogElement extends HTMLDialogElement {
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

      this.querySelector('button.close')?.addEventListener('click', () => this.#handleCancel())
      this.querySelector('button.cancel')?.addEventListener('click', () => this.#handleCancel())
      this.querySelector('button.confirm')?.addEventListener('click', () => this.#handleConfirm())

      this.addEventListener('close', () => {
        if (this.returnValue !== 'confirm') {
          this.#handleCancel()
        }
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
     * Handle confirm action.
     */
    #handleConfirm () {
      if (this.#resolvePromise) {
        const input = this.querySelector('input')
        const value = input ? input.value : ''
        this.#resolvePromise(value)
        this.#resolvePromise = null
      }
      this.returnValue = 'confirm'
      animateClose(this)
    }

    /**
     * Show the dialog with an input prompt.
     * @param {string} message - The message to display
     * @param {string} defaultValue - The default value for the input
     * @returns {Promise<string|null>} Promise that resolves to the input value, or null if cancelled
     */
    async prompt (message, defaultValue) {
      const labelEl = this.querySelector('label')
      const inputEl = this.querySelector('input')

      if (labelEl) {
        labelEl.textContent = message
      }
      if (inputEl) {
        inputEl.value = defaultValue || ''
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
  globalThis.InputDialogElement = InputDialogElement

  return InputDialogElement
}

export const InputDialogElement = await setup()
