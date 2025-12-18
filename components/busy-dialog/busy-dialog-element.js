import { animateClose } from '../../js/dialog-utils.js'
import { loadElementFromFile } from '../../js/load-file-element.js'

const setup = async () => {
  const dialogEl = await loadElementFromFile('./components/busy-dialog/busy-dialog.html', 'dialog')

  /**
   * Dialog to tell the user to wait for a long-running operation to complete.
   */
  class BusyDialogElement extends HTMLDialogElement {
    /**
     * Constructor.
     */
    constructor () {
      super()
      this.innerHTML = dialogEl.innerHTML
      this.querySelectorAll('button.close').forEach(el => el.addEventListener('click', () => animateClose(this)))
    }

    /**
     * Show the dialog with a custom message.
     * @param {string} message - The activity message to display
     * @override
     */
    // @ts-ignore
    show (message) {
      const mainEl = this.querySelector('main p')
      if (mainEl) {
        mainEl.textContent = message
      }
      this.showModal()
    }
  }
  customElements.define('busy-dialog', BusyDialogElement, { extends: 'dialog' })
  globalThis.BusyDialogElement = BusyDialogElement
}

await setup()
