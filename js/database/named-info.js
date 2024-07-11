
export class NamedInfo {
    /**
     * @type {number|undefined}
     */
    id

    /**
     * @type {string}
     */
    name;

    /**
     * Create a named info object
     * @param {string}              name    the name
     * @param {number|undefined}    [id]    database entry id or undefined if new
     */
    constructor(name, id = undefined) {
        this.name = name;
        this.id = id
    }
}
