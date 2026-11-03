import { expect } from '@esm-bundle/chai'
import { TokensDialogElement } from '../../../components/tokens-dialog/tokens-dialog-element.js'
import { TokenInfo } from '../../../js/database/token-info.js'
import '../../../components/input-dialog/input-dialog-element.js'

describe('TokensDialogElement', () => {
  let dialog

  beforeEach(() => {
    dialog = document.createElement('dialog', { is: 'tokens-dialog' })
    document.body.appendChild(dialog)
  })

  afterEach(() => {
    if (dialog && dialog.parentNode) {
      if (dialog.open) {
        dialog.close()
      }
      document.body.removeChild(dialog)
    }
    document.querySelectorAll('dialog[is="input-dialog"]').forEach(el => el.remove())
  })

  describe('custom element registration', () => {
    it('should be defined as a custom element', () => {
      expect(customElements.get('tokens-dialog')).to.equal(TokensDialogElement)
    })

    it('should export a class constructor', () => {
      expect(TokensDialogElement).to.be.a('function')
      expect(TokensDialogElement.prototype).to.be.an.instanceof(HTMLDialogElement)
    })
  })

  describe('structure', () => {
    it('should have header with title and close button', () => {
      const header = dialog.querySelector('header')
      expect(header).to.not.be.null
      expect(header.textContent).to.include('Tokens')
      expect(header.querySelector('button.close')).to.not.be.null
    })

    it('should have a token list container', () => {
      expect(dialog.querySelector('.token-list')).to.not.be.null
    })

    it('should have an add-token button inside the list', () => {
      const addBtn = dialog.querySelector('.token-list .add-token-btn')
      expect(addBtn).to.not.be.null
    })

    it('should have a hidden file input for adding tokens', () => {
      const input = dialog.querySelector('.add-token-input')
      expect(input).to.not.be.null
      expect(input.type).to.equal('file')
      expect(input.hidden).to.be.true
    })

    it('should have a footer with a disabled place button and close button', () => {
      const placeBtn = dialog.querySelector('.place-tokens-btn')
      expect(placeBtn).to.not.be.null
      expect(placeBtn.disabled).to.be.true
      expect(dialog.querySelector('footer button.close')).to.not.be.null
    })
  })

  describe('close buttons', () => {
    it('should close the dialog when the close button is clicked', () => {
      dialog.showModal()
      dialog.querySelector('button.close').click()
      expect(dialog.open).to.be.false
    })
  })

  describe('loadTokens / getTokens', () => {
    it('should store and return the tokens', () => {
      const tokens = [new TokenInfo(1, 'NPC 1')]
      dialog.loadTokens(1, tokens)
      expect(dialog.getTokens()).to.equal(tokens)
    })

    it('should render a card per token, plus the add-token button', () => {
      const tokens = [new TokenInfo(1, 'NPC 1'), new TokenInfo(1, 'NPC 2')]
      dialog.loadTokens(1, tokens)

      const cards = dialog.querySelectorAll('.token-card')
      // 2 tokens + 1 add-token button (also classed token-card)
      expect(cards.length).to.equal(3)
    })

    it('should render a card per player', () => {
      const players = [
        { playerIndex: 0, name: 'Player A', image: undefined },
        { playerIndex: 1, name: 'Player B', image: undefined }
      ]
      dialog.loadTokens(1, [], players)

      const names = [...dialog.querySelectorAll('.token-name')].map(el => el.textContent)
      expect(names).to.deep.equal(['Player A', 'Player B'])
    })

    it('should reset any previous selection when reloaded', () => {
      const tokens = [new TokenInfo(1, 'NPC 1')]
      dialog.loadTokens(1, tokens)
      dialog.querySelector('.token-card:not(.add-token-btn)').click()
      expect(dialog.querySelector('.place-tokens-btn').disabled).to.be.false

      dialog.loadTokens(1, tokens)
      expect(dialog.querySelector('.place-tokens-btn').disabled).to.be.true
    })

    it('should default players to an empty array', () => {
      expect(() => dialog.loadTokens(1, [])).to.not.throw()
    })
  })

  describe('selecting cards', () => {
    it('should select a card and enable the place button on click', () => {
      dialog.loadTokens(1, [new TokenInfo(1, 'NPC 1')])
      const card = dialog.querySelector('.token-card:not(.add-token-btn)')

      card.click()

      expect(card.classList.contains('selected')).to.be.true
      expect(dialog.querySelector('.place-tokens-btn').disabled).to.be.false
      expect(dialog.querySelector('.place-tokens-btn').textContent).to.equal('Place (1)')
    })

    it('should increase the quantity badge on repeated clicks', () => {
      dialog.loadTokens(1, [new TokenInfo(1, 'NPC 1')])
      const card = dialog.querySelector('.token-card:not(.add-token-btn)')

      card.click()
      card.click()
      card.click()

      const badge = card.querySelector('.token-qty')
      expect(badge.textContent).to.equal('×3')
      expect(badge.hidden).to.be.false
      expect(dialog.querySelector('.place-tokens-btn').textContent).to.equal('Place (3)')
    })

    it('should hide the quantity badge when count is less than 2', () => {
      dialog.loadTokens(1, [new TokenInfo(1, 'NPC 1')])
      const card = dialog.querySelector('.token-card:not(.add-token-btn)')
      card.click()
      const badge = card.querySelector('.token-qty')
      expect(badge.hidden).to.be.true
    })

    it('should decrement the quantity when the decrement button is clicked', () => {
      dialog.loadTokens(1, [new TokenInfo(1, 'NPC 1')])
      const card = dialog.querySelector('.token-card:not(.add-token-btn)')
      card.click()
      card.click()

      card.querySelector('.token-qty-dec').click()

      expect(card.querySelector('.token-qty').textContent).to.equal('×1')
    })

    it('should deselect the card when decrementing to zero', () => {
      dialog.loadTokens(1, [new TokenInfo(1, 'NPC 1')])
      const card = dialog.querySelector('.token-card:not(.add-token-btn)')
      card.click()

      card.querySelector('.token-qty-dec').click()

      expect(card.classList.contains('selected')).to.be.false
      expect(dialog.querySelector('.place-tokens-btn').disabled).to.be.true
    })

    it('should do nothing when decrementing with nothing selected', () => {
      dialog.loadTokens(1, [new TokenInfo(1, 'NPC 1')])
      const card = dialog.querySelector('.token-card:not(.add-token-btn)')
      expect(() => card.querySelector('.token-qty-dec').click()).to.not.throw()
      expect(dialog.querySelector('.place-tokens-btn').disabled).to.be.true
    })

    it('should allow selecting both a player card and a token card together', () => {
      const players = [{ playerIndex: 0, name: 'Player A', image: undefined }]
      dialog.loadTokens(1, [new TokenInfo(1, 'NPC 1')], players)

      const cards = dialog.querySelectorAll('.token-card:not(.add-token-btn)')
      cards[0].click()
      cards[1].click()

      expect(dialog.querySelector('.place-tokens-btn').textContent).to.equal('Place (2)')
    })
  })

  describe('removing a token', () => {
    it('should remove the token card and dispatch tokens-changed', (done) => {
      const token = new TokenInfo(1, 'NPC 1', undefined, 5)
      dialog.loadTokens(1, [token])

      dialog.addEventListener('tokens-changed', (e) => {
        expect(e.detail.tokens.length).to.equal(0)
        done()
      })

      dialog.querySelector('.token-remove').click()

      expect(dialog.getTokens().length).to.equal(0)
    })

    it('should not render a remove button for player cards', () => {
      const players = [{ playerIndex: 0, name: 'Player A', image: undefined }]
      dialog.loadTokens(1, [], players)

      const card = dialog.querySelector('.token-card:not(.add-token-btn)')
      expect(card.querySelector('.token-remove')).to.be.null
    })

    it('should clear the selection for a removed token', () => {
      const token = new TokenInfo(1, 'NPC 1', undefined, 5)
      dialog.loadTokens(1, [token])

      dialog.querySelector('.token-card:not(.add-token-btn)').click()
      expect(dialog.querySelector('.place-tokens-btn').disabled).to.be.false

      dialog.querySelector('.token-remove').click()
      expect(dialog.querySelector('.place-tokens-btn').disabled).to.be.true
    })
  })

  describe('placing selected tokens', () => {
    it('should dispatch tokens-place with the selected entries and close the dialog', () => {
      const token = new TokenInfo(1, 'NPC 1')
      const players = [{ playerIndex: 0, name: 'Player A', image: undefined }]
      dialog.loadTokens(1, [token], players)
      dialog.showModal()

      const cards = dialog.querySelectorAll('.token-card:not(.add-token-btn)')
      cards[0].click() // player
      cards[1].click() // npc
      cards[1].click() // npc again, for count 2

      let detail = null
      dialog.addEventListener('tokens-place', (e) => { detail = e.detail })

      dialog.querySelector('.place-tokens-btn').click()

      expect(detail).to.not.be.null
      expect(detail.entries.length).to.equal(3)
      const kinds = detail.entries.map(entry => entry.kind).sort()
      expect(kinds).to.deep.equal(['npc', 'npc', 'player'])
      // animateClose runs after the event is dispatched; with reduced motion it closes immediately
      expect(dialog.open).to.be.false
    })

    it('should do nothing when nothing is selected', () => {
      dialog.loadTokens(1, [])
      dialog.showModal()

      let dispatched = false
      dialog.addEventListener('tokens-place', () => { dispatched = true })

      dialog.querySelector('.place-tokens-btn').click()

      expect(dispatched).to.be.false
      expect(dialog.open).to.be.true
    })

    it('should clear the selection after placing', () => {
      dialog.loadTokens(1, [new TokenInfo(1, 'NPC 1')])
      dialog.showModal()
      dialog.querySelector('.token-card:not(.add-token-btn)').click()

      dialog.querySelector('.place-tokens-btn').click()

      expect(dialog.querySelector('.place-tokens-btn').disabled).to.be.true
    })
  })

  describe('adding a token via file input', () => {
    it('should add tokens using the name confirmed via the input-dialog', async () => {
      const inputDialog = document.createElement('dialog', { is: 'input-dialog' })
      // createElement's `is` option doesn't reflect the attribute (only HTML parsing does),
      // but the production code looks the dialog up via `dialog[is="input-dialog"]`
      inputDialog.setAttribute('is', 'input-dialog')
      document.body.appendChild(inputDialog)

      dialog.loadTokens(1, [])

      const file = new File(['data'], 'my-token.png', { type: 'image/png' })
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(file)
      const fileInput = dialog.querySelector('.add-token-input')
      fileInput.files = dataTransfer.files

      let changed = null
      dialog.addEventListener('tokens-changed', (e) => { changed = e.detail })

      const changePromise = new Promise(resolve => {
        fileInput.addEventListener('change', () => setTimeout(resolve, 50))
      })
      fileInput.dispatchEvent(new Event('change'))

      // confirm the name prompt with the default value
      await new Promise(resolve => setTimeout(resolve, 20))
      const confirmBtn = inputDialog.querySelector('button.confirm')
      expect(inputDialog.open).to.be.true
      confirmBtn.click()

      await changePromise

      expect(changed).to.not.be.null
      expect(changed.tokens.length).to.equal(1)
      expect(changed.tokens[0].name).to.equal('my-token')
    })

    it('should ignore non-image files and add nothing', async () => {
      dialog.loadTokens(1, [])

      const file = new File(['data'], 'notes.txt', { type: 'text/plain' })
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(file)
      const fileInput = dialog.querySelector('.add-token-input')
      fileInput.files = dataTransfer.files

      let changed = false
      dialog.addEventListener('tokens-changed', () => { changed = true })

      fileInput.dispatchEvent(new Event('change'))
      await new Promise(resolve => setTimeout(resolve, 20))

      expect(changed).to.be.false
      expect(dialog.getTokens().length).to.equal(0)
    })

    it('should clear the file input value after handling the change', () => {
      dialog.loadTokens(1, [])
      const fileInput = dialog.querySelector('.add-token-input')
      fileInput.dispatchEvent(new Event('change'))
      expect(fileInput.value).to.equal('')
    })

    it('should open the file picker when the add-token button is clicked', () => {
      dialog.loadTokens(1, [])
      const fileInput = dialog.querySelector('.add-token-input')
      let clicked = false
      fileInput.addEventListener('click', () => { clicked = true })

      dialog.querySelector('.add-token-btn').click()

      expect(clicked).to.be.true
    })
  })
})
