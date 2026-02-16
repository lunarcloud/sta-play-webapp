import { NamedInfo } from './named-info.js'
/**
 * Database Player Information Object.
 */
export class PlayerInfo extends NamedInfo {
  /**
   * The id of the game it is for
   * @type {number}
   */
  game

  /**
   * @type {number|undefined}
   */
  playerNumber

  /**
   * @type {number}
   */
  currentStress

  /**
   * @type {number}
   */
  maxStress

  /**
   * @type {string}
   */
  pips

  /**
   * @type {string}
   */
  borderColor

  /**
   * @type {File|undefined}
   */
  image

  /**
   * @type {number}
   */
  order

  /**
   * Create a Player info
   * @param {number} game                     the id of the game it is for
   * @param {number|string} playerNumber      player id
   * @param {string} name                     player character's name
   * @param {number} currentStress            current stress value
   * @param {number} maxStress                maximum stress value
   * @param {string} pips                     the pips text
   * @param {string} borderColor              the color option text
   * @param {File|undefined} [image]          image of the player's character
   * @param {number} [order]                  display order (defaults to playerNumber)
   */
  constructor (game, playerNumber, name, currentStress, maxStress, pips, borderColor, image = undefined, order = undefined) {
    super(name)
    this.game = game
    this.playerNumber = typeof (playerNumber) === 'number' ? playerNumber : parseInt(playerNumber)
    this.currentStress = typeof (currentStress) === 'number' ? currentStress : parseInt(currentStress)
    this.maxStress = typeof (maxStress) === 'number' ? maxStress : parseInt(maxStress)
    this.pips = pips
    this.borderColor = borderColor
    this.image = image
    this.order = order !== undefined ? (typeof (order) === 'number' ? order : parseInt(order)) : this.playerNumber
  }

  /**
   * Assign the data from a generic object to that of a valid {@link PlayerInfo}
   * @param {object} obj object to copy from.
   * @returns {PlayerInfo}   valid {@link PlayerInfo}.
   */
  static assign (obj) {
    return new PlayerInfo(
      obj.game,
      obj.playerNumber,
      obj.name,
      obj.currentStress,
      obj.maxStress,
      obj.pips,
      obj.borderColor,
      'image' in obj ? obj.image : undefined,
      'order' in obj ? obj.order : undefined
    )
  }

  /**
   * Determine whether the object has complete, valid data.
   * @returns {boolean} whether the object is valid.
   */
  validate () {
    return typeof (this.game) === 'number' &&
            typeof (this.name) === 'string' &&
            typeof (this.playerNumber) === 'number' &&
            typeof (this.currentStress) === 'number' &&
            typeof (this.maxStress) === 'number' &&
            typeof (this.pips) === 'string' &&
            typeof (this.borderColor) === 'string' &&
            (this.image === undefined || this.image instanceof File)
  }
}
