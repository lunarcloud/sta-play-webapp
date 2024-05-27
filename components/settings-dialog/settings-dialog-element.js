
const setup = async () => {
    const parser = new DOMParser()
    const resp = await fetch('./components/settings-dialog/settings-dialog.html')
    const html = await resp.text()
    const template = parser.parseFromString(html, 'text/html').querySelector('dialog')

    class SettingsDialogElement extends HTMLDialogElement {
      constructor() {
        super()
        this.innerHTML = template.innerHTML
        this.querySelectorAll('button.close').forEach(el => el.addEventListener('click', () => this.close()))
      }

      // Rest of element implementation...
    }
    customElements.define('settings-dialog', SettingsDialogElement, { extends: 'dialog' })
    globalThis.SettingsDialogElement = SettingsDialogElement
  }

await setup()
export default globalThis.SettingsDialogElement