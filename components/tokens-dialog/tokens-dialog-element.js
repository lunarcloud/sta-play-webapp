import { animateClose } from '../../js/dialog-utils.js'
import { loadElementFromFile } from '../../js/load-file-element.js'
import { TokenInfo } from '../../js/database/token-info.js'
import { InputDialogElement } from '../input-dialog/input-dialog-element.js'

const dialogEl = await loadElementFromFile('./components/tokens-dialog/tokens-dialog.html', 'dialog')

/**
 * @typedef {object} PlayerTokenEntry
 * @property {number} playerIndex - The player's index
 * @property {string} name - The player character's name
 * @property {File|undefined} image - The player's token image
 */

/**
 * @typedef {object} SelectedEntry
 * @property {'player'|'npc'} kind - which kind of entry this is
 * @property {PlayerTokenEntry} [player] - the player, if kind is 'player'
 * @property {TokenInfo} [token] - the token, if kind is 'npc'
 * @property {number} count - how many copies are selected
 */

/**
 * Dialog listing all of the game's map tokens - the players, plus manually added tokens.
 * Users select the ones they want, then place them all on the play-field at once with the
 * "Place" button. Players are added/removed via the existing player controls, not here.
 * Any card can be selected multiple times to place several copies at once (e.g. a generic
 * "shuttlepod" token used for more than one shuttle in a scene, or a cloned player character).
 * @tagname tokens-dialog
 */
export class TokensDialogElement extends HTMLDialogElement {
  /** @type {HTMLElement} */
  #listEl

  /** @type {HTMLInputElement} */
  #addInputEl

  /** @type {HTMLButtonElement} */
  #placeBtn

  /** @type {HTMLButtonElement} */
  #addTokenBtn

  /** @type {Array<TokenInfo>} */
  #tokens = []

  /** @type {Array<PlayerTokenEntry>} */
  #players = []

  /** @type {Map<string, SelectedEntry>} */
  #selected = new Map()

  /** @type {number} */
  #gameId

  /**
   * Constructor.
   */
  constructor () {
    super()
    this.innerHTML = dialogEl.innerHTML
    this.querySelectorAll('button.close').forEach(el => el.addEventListener('click', () => animateClose(this)))

    this.#listEl = /** @type {HTMLElement} */ (this.querySelector('.token-list'))
    this.#addInputEl = /** @type {HTMLInputElement} */ (this.querySelector('.add-token-input'))
    this.#placeBtn = /** @type {HTMLButtonElement} */ (this.querySelector('.place-tokens-btn'))
    this.#addTokenBtn = /** @type {HTMLButtonElement} */ (this.querySelector('.add-token-btn'))

    this.#addTokenBtn?.addEventListener('click', () => this.#addInputEl.click())
    this.#addInputEl?.addEventListener('change', () => this.#addToken())
    this.#placeBtn?.addEventListener('click', () => this.#placeSelected())
  }

  /**
   * Load the tokens and players for a game
   * @param {number} gameId - The game ID
   * @param {Array<TokenInfo>} tokens - Array of the game's manually added tokens
   * @param {Array<PlayerTokenEntry>} [players] - The game's current players
   */
  loadTokens (gameId, tokens, players = []) {
    this.#gameId = gameId
    this.#tokens = tokens
    this.#players = players
    this.#selected.clear()
    this.#render()
  }

  /**
   * Get the current tokens
   * @returns {Array<TokenInfo>} Current tokens
   */
  getTokens () {
    return this.#tokens
  }

  /**
   * Render the flexbox grid of player and token cards
   */
  #render () {
    this.#listEl.innerHTML = ''

    for (const player of this.#players) {
      this.#renderCard(`player-${player.playerIndex}`, player.name, player.image,
        () => ({ kind: 'player', player }))
    }
    for (const token of this.#tokens) {
      this.#renderCard(`npc-${token.id}`, token.name, token.image,
        () => ({ kind: 'npc', token }), () => this.#removeToken(token))
    }

    if (this.#addTokenBtn) this.#listEl.appendChild(this.#addTokenBtn)

    this.#updatePlaceButton()
  }

  /**
   * Render a single card for either a player or a manually added token. Any card can be
   * selected more than once, to place several independent copies at once.
   * @param {string}             key         stable selection key for this entry (e.g. `player-0`, `npc-3`)
   * @param {string}             name        display name
   * @param {File|undefined}     image       thumbnail image
   * @param {() => SelectedEntry} makeEntry  builds the selection entry this card represents
   * @param {() => void}         [onRemove]  if provided, renders a remove button that calls this
   */
  #renderCard (key, name, image, makeEntry, onRemove = undefined) {
    const card = document.createElement('div')
    card.className = 'token-card'

    const qtyBadge = document.createElement('span')
    qtyBadge.className = 'token-qty'
    card.appendChild(qtyBadge)

    const decrementBtn = document.createElement('button')
    decrementBtn.className = 'token-qty-dec'
    decrementBtn.textContent = '−'
    decrementBtn.title = `Remove one ${name} from selection`
    decrementBtn.addEventListener('click', event => {
      event.stopPropagation()
      const existing = this.#selected.get(key)
      if (!existing) return
      if (existing.count <= 1) {
        this.#selected.delete(key)
      } else {
        this.#selected.set(key, { ...existing, count: existing.count - 1 })
      }
      updateSelectedState()
      this.#updatePlaceButton()
    })

    const updateSelectedState = () => {
      const count = this.#selected.get(key)?.count ?? 0
      card.classList.toggle('selected', count > 0)
      qtyBadge.textContent = `×${count}`
      qtyBadge.hidden = count < 2
      decrementBtn.hidden = count < 1
    }

    card.addEventListener('click', () => {
      const existing = this.#selected.get(key)
      this.#selected.set(key, { ...makeEntry(), count: (existing?.count ?? 0) + 1 })
      updateSelectedState()
      this.#updatePlaceButton()
    })

    updateSelectedState()

    const thumb = document.createElement('img')
    thumb.className = 'token-thumb'
    thumb.alt = name
    if (image instanceof File) {
      thumb.src = URL.createObjectURL(image)
    }
    card.appendChild(thumb)

    const nameEl = document.createElement('span')
    nameEl.className = 'token-name'
    nameEl.textContent = name
    card.appendChild(nameEl)

    card.appendChild(decrementBtn)

    if (onRemove) {
      const removeBtn = document.createElement('button')
      removeBtn.className = 'token-remove'
      removeBtn.textContent = '✕'
      removeBtn.title = `Remove ${name}`
      removeBtn.addEventListener('click', event => {
        event.stopPropagation()
        onRemove()
      })
      card.appendChild(removeBtn)
    }

    this.#listEl.appendChild(card)
  }

  /**
   * Remove a manually added token
   * @param {TokenInfo} token - token to remove
   */
  #removeToken (token) {
    const index = this.#tokens.indexOf(token)
    if (index < 0) return

    this.#tokens.splice(index, 1)
    this.#selected.delete(`npc-${token.id}`)
    this.#render()
    this.dispatchEvent(new CustomEvent('tokens-changed', { detail: { tokens: this.#tokens }, bubbles: true }))
  }

  /**
   * Enable/disable the "Place" button and update its label based on the current selection
   */
  #updatePlaceButton () {
    if (!this.#placeBtn) return
    const count = [...this.#selected.values()].reduce((total, entry) => total + entry.count, 0)
    this.#placeBtn.disabled = count === 0
    this.#placeBtn.textContent = count > 0 ? `Place (${count})` : 'Place'
  }

  /**
   * Dispatch the selected entries for placement on the map, then close the dialog
   */
  #placeSelected () {
    if (this.#selected.size === 0) return

    /** @type {Array<{kind: 'player'|'npc', player?: PlayerTokenEntry, token?: TokenInfo}>} */
    const entries = []
    for (const entry of this.#selected.values()) {
      for (let i = 0; i < entry.count; i++) {
        entries.push(entry.kind === 'player'
          ? { kind: 'player', player: entry.player }
          : { kind: 'npc', token: entry.token })
      }
    }

    this.#selected.clear()
    this.#render()

    this.dispatchEvent(new CustomEvent('tokens-place', { detail: { entries }, bubbles: true }))
    animateClose(this)
  }

  /**
   * Handle the "Add Token" file input, prompting for a name per selected image and adding
   * each as a new token. Multiple files may be selected at once.
   */
  async #addToken () {
    const files = Array.from(this.#addInputEl.files ?? []).filter(file => file.type.startsWith('image/'))
    this.#addInputEl.value = null
    if (files.length === 0) return

    const inputDialog = document.querySelector('dialog[is="input-dialog"]')
    let added = false

    for (const file of files) {
      const defaultName = file.name.replace(/\.[^.]+$/, '')
      const name = inputDialog instanceof InputDialogElement
        ? await inputDialog.prompt('Name this token:', defaultName, file)
        : defaultName
      if (name === null) continue // cancelled this one, keep going with the rest

      this.#tokens.push(new TokenInfo(this.#gameId, name || defaultName, file))
      added = true
    }

    if (!added) return

    this.#render()
    this.dispatchEvent(new CustomEvent('tokens-changed', { detail: { tokens: this.#tokens }, bubbles: true }))
  }
}
customElements.define('tokens-dialog', TokensDialogElement, { extends: 'dialog' })
