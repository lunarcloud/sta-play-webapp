
const setup = async () => {
    const parser = new DOMParser()
    const resp = await fetch('./components/welcome-dialog/welcome-dialog.html')
    const html = await resp.text()
    const template = parser.parseFromString(html, 'text/html').querySelector('dialog')

    class WelcomeDialogElement extends HTMLDialogElement {
      constructor() {
        super()
        this.innerHTML = template.innerHTML
        this.querySelectorAll('button.close').forEach(el => el.addEventListener('click', () => this.close()))
      }

      // Rest of element implementation...
    }
    customElements.define('welcome-dialog', WelcomeDialogElement, { extends: 'dialog' })
    globalThis.WelcomeDialogElement = WelcomeDialogElement
  }

await setup()
export default globalThis.WelcomeDialogElement