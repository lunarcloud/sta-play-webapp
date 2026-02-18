import { animateClose } from '../../js/dialog-utils.js'
import { loadElementFromFile } from '../../js/load-file-element.js'

const dialogEl = await loadElementFromFile('./components/settings-dialog/settings-dialog.html', 'dialog')

/**
 * Dialog to allow the user to configure the application.
 */
export class SettingsDialogElement extends HTMLDialogElement {
  /**
   * Constructor.
   */
  constructor () {
    super()
    this.innerHTML = dialogEl.innerHTML
    this.querySelectorAll('button.close').forEach(el => el.addEventListener('click', () => animateClose(this)))
  }
}
customElements.define('settings-dialog', SettingsDialogElement, { extends: 'dialog' })
globalThis.SettingsDialogElement = SettingsDialogElement
