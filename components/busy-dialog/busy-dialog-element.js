import { animateClose } from '../../js/dialog-utils.js'
import { loadElementFromFile } from '../../js/load-file-element.js'

const setup = async () => {
  const dialogEl = await loadElementFromFile('./components/busy-dialog/busy-dialog.html', 'dialog')

  /**
   * Dialog to tell the user to wait for a long-running operation to complete.
   */
  class BusyDialogElement extends HTMLDialogElement {
    /**
     * @type {HTMLElement|null}
     */
    #messageElement

    /**
     * Constructor.
     */
    constructor () {
      super()
      this.innerHTML = dialogEl.innerHTML
      this.querySelectorAll('button.close').forEach(el => el.addEventListener('click', () => animateClose(this)))
      // Cache the message element for better performance
      this.#messageElement = this.querySelector('main p')
    }

    /**
     * Show the dialog with a custom message.
     * @param {string} message - The activity message to display
     * @override
     */
    // @ts-ignore - TypeScript doesn't recognize the HTMLDialogElement.show() method signature override
    show (message) {
      if (this.#messageElement) {
        this.#messageElement.textContent = message
      }
      this.showModal()
    }
  }
  customElements.define('busy-dialog', BusyDialogElement, { extends: 'dialog' })
  globalThis.BusyDialogElement = BusyDialogElement
}

await setup()
