import { loadElementFromFile } from '../../js/load-file-element.js'

const setup = async () => {
  const dialogEl = await loadElementFromFile('./components/message-dialog/message-dialog.html', 'dialog')

  /**
   * Dialog to display a message to the user (replaces alert).
   */
  class MessageDialogElement extends HTMLDialogElement {
    /**
     * Constructor.
     */
    constructor () {
      super()
      this.innerHTML = dialogEl.innerHTML
      this.querySelectorAll('button.close').forEach(el => el.addEventListener('click', () => this.#animateClose()))
    }

    /**
     * Animate the dialog closing.
     */
    #animateClose () {
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
      setTimeout(() => {
        this.classList.remove('closing')
        this.close()
      }, animationDuration)
    }

    /**
     * Show the dialog with a message.
     * @param {string} message - The message to display
     */
    show (message) {
      const mainEl = this.querySelector('main')
      if (mainEl) {
        mainEl.textContent = message
      }
      this.showModal()
    }
  }
  customElements.define('message-dialog', MessageDialogElement, { extends: 'dialog' })
  globalThis.MessageDialogElement = MessageDialogElement
}

await setup()
