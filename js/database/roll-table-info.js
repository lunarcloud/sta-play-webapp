/**
 * @typedef {object} RollTableEntry
 * @property {number} min - Minimum dice value (inclusive)
 * @property {number} max - Maximum dice value (inclusive)
 * @property {string} result - The result text for this roll range
 */

/**
 * Database Roll Table Information Object.
 */
export class RollTableInfo {
  /**
   * @type {number|undefined}
   */
  id

  /**
   * @type {string}
   */
  name

  /**
   * @type {string}
   */
  diceType

  /**
   * @type {RollTableEntry[]}
   */
  entries

  /**
   * @type {number}
   */
  game

  /**
   * Create a Roll Table info object
   * @param {number} game                     The id of the game it is for
   * @param {string} [name]                Name of the roll table
   * @param {string} [diceType]         Type of dice (e.g., 'd20', 'd6', 'd100')
   * @param {RollTableEntry[]} [entries]   Array of table entries
   * @param {number|undefined} [id]           Database entry id or undefined if new
   */
  constructor (game, name = '', diceType = 'd20', entries = [], id = undefined) {
    this.id = id
    this.game = game
    this.name = name
    this.diceType = diceType
    this.entries = entries
  }

  /**
   * Assign the data from a generic object to that of a valid {@link RollTableInfo}
   * @param {object} obj object to copy from.
   * @returns {RollTableInfo}   valid {@link RollTableInfo}.
   */
  static assign (obj) {
    return new RollTableInfo(
      obj.game,
      obj.name,
      obj.diceType,
      obj.entries,
      obj.id
    )
  }

  /**
   * Determine whether the object has complete, valid data.
   * @returns {boolean} whether the object is valid.
   */
  validate () {
    if (typeof this.game !== 'number') {
      return false
    }
    if (typeof this.name !== 'string' || this.name === '') {
      return false
    }
    if (typeof this.diceType !== 'string' || this.diceType === '') {
      return false
    }
    if (!Array.isArray(this.entries)) {
      return false
    }
    // Validate each entry
    for (const entry of this.entries) {
      if (typeof entry.min !== 'number' || typeof entry.max !== 'number') {
        return false
      }
      if (typeof entry.result !== 'string' || entry.result === '') {
        return false
      }
      if (entry.min > entry.max) {
        return false
      }
    }
    return true
  }

  /**
   * Roll on this table and return a result
   * @returns {string} The result text
   */
  roll () {
    // Parse dice type to get max value (e.g., "d20" -> 20)
    const maxValue = parseInt(this.diceType.substring(1)) || 20
    const roll = Math.floor(Math.random() * maxValue) + 1

    // Find matching entry
    for (const entry of this.entries) {
      if (roll >= entry.min && roll <= entry.max) {
        return `Rolled ${roll}: ${entry.result}`
      }
    }

    return `Rolled ${roll}: No result found`
  }
}
