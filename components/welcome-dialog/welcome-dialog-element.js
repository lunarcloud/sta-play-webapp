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
            this.querySelectorAll('button.close').forEach(el => el.addEventListener('click', () => this.close()))
        }
    }
    customElements.define('welcome-dialog', WelcomeDialogElement, { extends: 'dialog' })
    globalThis.WelcomeDialogElement = WelcomeDialogElement
}

await setup()
