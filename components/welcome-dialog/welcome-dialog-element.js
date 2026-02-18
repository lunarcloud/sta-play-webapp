import { animateClose } from '../../js/dialog-utils.js'
import { loadElementFromFile } from '../../js/load-file-element.js'

const dialogEl = await loadElementFromFile('./components/welcome-dialog/welcome-dialog.html', 'dialog')

/**
 * Dialog to tell the user about the application.
 */
export class WelcomeDialogElement extends HTMLDialogElement {
  /**
   * Constructor.
   */
  constructor () {
    super()
    this.innerHTML = dialogEl.innerHTML
    this.querySelectorAll('button.close').forEach(el => el.addEventListener('click', () => animateClose(this)))
  }
}
customElements.define('welcome-dialog', WelcomeDialogElement, { extends: 'dialog' })
