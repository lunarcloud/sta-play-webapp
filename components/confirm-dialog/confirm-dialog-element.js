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
     * Animate the dialog closing.
     * @returns {Promise<void>} Promise that resolves when animation completes
     */
    async #animateClose () {
      // Check if animations are enabled
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      if (prefersReducedMotion) {
        // If reduced motion is preferred, close immediately
        this.close()
        return
      }

      // Add closing class to trigger animation
      this.classList.add('closing')

      // Wait for animation to complete before actually closing
      const animationDuration = 300 // matches CSS animation duration
      await new Promise(resolve => setTimeout(resolve, animationDuration))

      this.classList.remove('closing')
      this.close()
    }

    /**
     * Handle cancel action.
     */
    #handleCancel () {
      if (this.#resolvePromise) {
        this.#resolvePromise(false)
        this.#resolvePromise = null
      }
      this.#animateClose()
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
      this.#animateClose()
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
}

await setup()
