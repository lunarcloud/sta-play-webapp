import { loadElementFromFile } from '../../js/load-file-element.js'

const setup = async () => {
    const dialogEl = await loadElementFromFile('./components/importing-dialog/importing-dialog.html', 'dialog')

    class ImportingDialogElement extends HTMLDialogElement {
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
