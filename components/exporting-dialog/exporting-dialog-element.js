import { animateClose } from '../../js/dialog-utils.js'
import { loadElementFromFile } from '../../js/load-file-element.js'

const setup = async () => {
  const dialogEl = await loadElementFromFile('./components/exporting-dialog/exporting-dialog.html', 'dialog')

  /**
   * Dialog to tell the user to wait for an export to complete.
   */
  class ExportingDialogElement extends HTMLDialogElement {
    /**
     * Constructor.
     */
    constructor () {
      super()
      this.innerHTML = dialogEl.innerHTML
      this.querySelectorAll('button.close').forEach(el => el.addEventListener('click', () => animateClose(this)))
    }
  }
  customElements.define('exporting-dialog', ExportingDialogElement, { extends: 'dialog' })
  globalThis.ExportingDialogElement = ExportingDialogElement
}

await setup()
