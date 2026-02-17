/**
 * @typedef {object} RollTableEntry
 * @property {string} result - The result text for this entry
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
   * @param {RollTableEntry[]} [entries]   Array of table entries
   * @param {number|undefined} [id]           Database entry id or undefined if new
   */
  constructor (game, name = '', entries = [], id = undefined) {
    this.id = id
    this.game = game
    this.name = name
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
    if (!Array.isArray(this.entries)) {
      return false
    }
    // Require at least one entry
    if (this.entries.length === 0) {
      return false
    }
    // Validate each entry
    for (const entry of this.entries) {
      if (typeof entry.result !== 'string' || entry.result === '') {
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
    if (this.entries.length === 0) {
      return 'No entries in table'
    }

    // Randomly select an entry
    const randomIndex = Math.floor(Math.random() * this.entries.length)
    return this.entries[randomIndex].result
  }
}
