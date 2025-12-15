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
      this.querySelectorAll('button.close').forEach(el => el.addEventListener('click', () => this.close()))
    }

    /**
     * Show the dialog with a message.
     *
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
