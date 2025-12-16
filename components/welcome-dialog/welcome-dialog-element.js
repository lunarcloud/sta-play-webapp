import { loadElementFromFile } from '../../js/load-file-element.js'

const setup = async () => {
  const dialogEl = await loadElementFromFile('./components/welcome-dialog/welcome-dialog.html', 'dialog')

  /**
   * Dialog to tell the user about the application.
   */
  class WelcomeDialogElement extends HTMLDialogElement {
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
  }
  customElements.define('welcome-dialog', WelcomeDialogElement, { extends: 'dialog' })
  globalThis.WelcomeDialogElement = WelcomeDialogElement
}

await setup()
