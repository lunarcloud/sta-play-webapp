import { loadElementFromFile } from '../../js/load-file-element.js'

const setup = async () => {
    const dialogEl = await loadElementFromFile('./components/importing-dialog/importing-dialog.html', 'dialog')

    /**
     * Dialog to tell the user to wait for an import to complete.
     */
    class ImportingDialogElement extends HTMLDialogElement {
        /**
         * Constructor.
         */
        constructor () {
            super()
            this.innerHTML = dialogEl.innerHTML
            this.querySelectorAll('button.close').forEach(el => el.addEventListener('click', () => this.close()))
        }
    }
    customElements.define('importing-dialog', ImportingDialogElement, { extends: 'dialog' })
    globalThis.importingDialogElement = ImportingDialogElement
}

await setup()
