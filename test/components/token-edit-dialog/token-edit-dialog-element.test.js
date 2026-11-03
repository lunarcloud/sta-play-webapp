import { expect } from '@esm-bundle/chai'
import { TokenEditDialogElement } from '../../../components/token-edit-dialog/token-edit-dialog-element.js'
import { MIN_SCALE } from '../../../components/map-token/map-token.js'

/**
 * Build a minimal stand-in for a map-token element, with just enough
 * surface area for the dialog under test (scale property, sendBackward/bringForward).
 * @returns {object} fake token
 */
function createFakeToken () {
  return {
    src: 'blob:fake-token-src',
    scale: 1,
    sendBackward () { this.sentBackward = (this.sentBackward ?? 0) + 1 },
    bringForward () { this.broughtForward = (this.broughtForward ?? 0) + 1 },
    remove () { this.removed = true }
  }
}

describe('TokenEditDialogElement', () => {
  let dialog

  beforeEach(() => {
    dialog = document.createElement('dialog', { is: 'token-edit-dialog' })
    document.body.appendChild(dialog)
  })

  afterEach(() => {
    if (dialog && dialog.parentNode) {
      if (dialog.open) {
        dialog.close()
      }
      document.body.removeChild(dialog)
    }
  })

  describe('custom element registration', () => {
    it('should be defined as a custom element', () => {
      expect(customElements.get('token-edit-dialog')).to.equal(TokenEditDialogElement)
    })

    it('should export a class constructor', () => {
      expect(TokenEditDialogElement).to.be.a('function')
      expect(TokenEditDialogElement.prototype).to.be.an.instanceof(HTMLDialogElement)
    })
  })

  describe('structure', () => {
    it('should have header with title and close button', () => {
      const header = dialog.querySelector('header')
      expect(header).to.not.be.null
      expect(header.textContent).to.include('Edit Token')
      expect(header.querySelector('button.close')).to.not.be.null
    })

    it('should have a token preview image', () => {
      expect(dialog.querySelector('.token-preview')).to.not.be.null
    })

    it('should have a scale range input', () => {
      const input = dialog.querySelector('#token-scale-input')
      expect(input).to.not.be.null
      expect(input.type).to.equal('range')
    })

    it('should have a scale number input', () => {
      const input = dialog.querySelector('#token-scale-number')
      expect(input).to.not.be.null
      expect(input.type).to.equal('number')
    })

    it('should have send-backward and bring-forward buttons', () => {
      expect(dialog.querySelector('.send-backward')).to.not.be.null
      expect(dialog.querySelector('.bring-forward')).to.not.be.null
    })

    it('should have footer with remove and confirm buttons', () => {
      const footer = dialog.querySelector('footer')
      expect(footer).to.not.be.null
      expect(footer.querySelector('button.remove')).to.not.be.null
      expect(footer.querySelector('button.confirm')).to.not.be.null
    })
  })

  describe('edit method', () => {
    it('should show the dialog as modal', () => {
      const token = createFakeToken()
      dialog.edit(token)
      expect(dialog.open).to.be.true
    })

    it('should set the preview image src from the token', () => {
      const token = createFakeToken()
      dialog.edit(token)
      expect(dialog.querySelector('.token-preview').src).to.equal(token.src)
    })

    it('should initialize the scale inputs from the token scale', () => {
      const token = createFakeToken()
      token.scale = 1.5
      dialog.edit(token)

      expect(dialog.querySelector('#token-scale-input').value).to.equal('1.5')
      expect(dialog.querySelector('#token-scale-number').value).to.equal('150')
    })
  })

  describe('scale inputs', () => {
    it('should update the token scale when the range input changes', () => {
      const token = createFakeToken()
      dialog.edit(token)

      const rangeInput = dialog.querySelector('#token-scale-input')
      rangeInput.value = '2'
      rangeInput.dispatchEvent(new Event('input'))

      expect(token.scale).to.equal(2)
      expect(dialog.querySelector('#token-scale-number').value).to.equal('200')
    })

    it('should update the token scale when the number input changes', () => {
      const token = createFakeToken()
      dialog.edit(token)

      const numberInput = dialog.querySelector('#token-scale-number')
      numberInput.value = '50'
      numberInput.dispatchEvent(new Event('input'))

      expect(token.scale).to.equal(0.5)
      expect(dialog.querySelector('#token-scale-input').value).to.equal('0.5')
    })

    it('should floor the scale to the minimum allowed value', () => {
      const token = createFakeToken()
      dialog.edit(token)

      const numberInput = dialog.querySelector('#token-scale-number')
      numberInput.value = '0'
      numberInput.dispatchEvent(new Event('input'))

      expect(token.scale).to.equal(MIN_SCALE)
    })

    it('should not throw when no token is currently being edited', () => {
      const rangeInput = dialog.querySelector('#token-scale-input')
      rangeInput.value = '1.2'
      expect(() => rangeInput.dispatchEvent(new Event('input'))).to.not.throw()
    })
  })

  describe('layer order buttons', () => {
    it('should call sendBackward on the edited token', () => {
      const token = createFakeToken()
      dialog.edit(token)

      dialog.querySelector('.send-backward').click()

      expect(token.sentBackward).to.equal(1)
    })

    it('should call bringForward on the edited token', () => {
      const token = createFakeToken()
      dialog.edit(token)

      dialog.querySelector('.bring-forward').click()

      expect(token.broughtForward).to.equal(1)
    })

    it('should not throw when no token is currently being edited', () => {
      expect(() => dialog.querySelector('.send-backward').click()).to.not.throw()
      expect(() => dialog.querySelector('.bring-forward').click()).to.not.throw()
    })
  })

  describe('closing', () => {
    it('should close the dialog when the close button is clicked', () => {
      const token = createFakeToken()
      dialog.edit(token)

      dialog.querySelector('button.close').click()

      expect(dialog.open).to.be.false
    })

    it('should close the dialog when the confirm (Done) button is clicked', () => {
      const token = createFakeToken()
      dialog.edit(token)

      dialog.querySelector('button.confirm').click()

      expect(dialog.open).to.be.false
    })

    it('should clear the edited token reference after the dialog closes', () => {
      const token = createFakeToken()
      dialog.edit(token)

      dialog.querySelector('button.confirm').click()
      dialog.dispatchEvent(new Event('close'))

      // after clearing, layer order buttons should be no-ops
      dialog.querySelector('.send-backward').click()
      expect(token.sentBackward).to.be.undefined
    })
  })

  describe('remove', () => {
    it('should close the dialog when the remove button is clicked', () => {
      const token = createFakeToken()
      dialog.edit(token)

      dialog.querySelector('button.remove').click()

      expect(dialog.open).to.be.false
    })

    it('should not throw when no token is currently being edited', () => {
      expect(() => dialog.querySelector('button.remove').click()).to.not.throw()
    })
  })
})
