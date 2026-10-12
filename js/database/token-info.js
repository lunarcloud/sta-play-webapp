import { NamedInfo } from './named-info.js'

/**
 * Database Token Information Object.
 * Represents a reusable "other" (non-player, e.g. NPC) map token's definition,
 * usable across any scene of its game. Its on-map position is stored per-scene,
 * on the scene's `tokenPositions` field, keyed as `token-{id}`.
 */
export class TokenInfo extends NamedInfo {
  /**
   * The id of the game it is for
   * @type {number}
   */
  game

  /**
   * @type {File|undefined}
   */
  image

  /**
   * Create a Token info
   * @param {number}           game    the id of the game it is for
   * @param {string}           name    the token's name
   * @param {File|undefined}   [image] the token's artwork
   * @param {number|undefined} [id]    database entry id or undefined if new
   */
  constructor (game, name, image = undefined, id = undefined) {
    super(name, id)
    this.game = game
    this.image = image
  }

  /**
   * Assign the data from a generic object to that of a valid {@link TokenInfo}
   * @param {object} obj object to copy from.
   * @returns {TokenInfo}   valid {@link TokenInfo}.
   */
  static assign (obj) {
    return new TokenInfo(
      obj.game,
      obj.name,
      'image' in obj ? obj.image : undefined,
      obj.id
    )
  }

  /**
   * Determine whether the object has complete, valid data.
   * @returns {boolean} whether the object is valid.
   */
  validate () {
    return typeof (this.game) === 'number' &&
            typeof (this.name) === 'string' && this.name !== '' &&
            (this.image === undefined || this.image instanceof File)
  }
}
