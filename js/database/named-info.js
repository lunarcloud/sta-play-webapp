/**
 * Database Named Information Object.
 */
export class NamedInfo {
  /**
   * @type {number|undefined}
   */
  id

  /**
   * @type {string}
   */
  name

  /**
   * Create a named info object
   * @param {string}              name    the name (cannot be empty)
   * @param {number|undefined}    [id]    database entry id or undefined if new
   * @throws {Error} if name is an empty string
   */
  constructor (name, id = undefined) {
    if (name === '') {
      throw new Error('Name cannot be an empty string')
    }
    this.name = name
    this.id = id
  }
}
