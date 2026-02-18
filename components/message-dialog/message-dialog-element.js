import { animateClose } from '../../js/dialog-utils.js'
import { loadElementFromFile } from '../../js/load-file-element.js'

const dialogEl = await loadElementFromFile('./components/message-dialog/message-dialog.html', 'dialog')

/**
 * Dialog to display a message to the user (replaces alert).
 */
export class MessageDialogElement extends HTMLDialogElement {
  /**
   * Constructor.
   */
  constructor () {
    super()
    this.innerHTML = dialogEl.innerHTML
    // @ts-ignore
    this.querySelectorAll('button.close').forEach(el => el.addEventListener('click', () => animateClose(this)))
  }

  /**
   * Show the dialog with a message.
   * @param {string} message - The message to display
   * @override
   */
  // @ts-ignore
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
