import { NamedInfo } from './named-info.js'

/**
 * Database Trait Information Object.
 */
export class TraitInfo extends NamedInfo {
    /**
     * The id of the scene it is for
     * @type {number}
     */
    scene

    /**
     * Create a Player info
     * @param {number} scene    The id of the scene it is for
     * @param {string} [name]   header for the scene
     */
    constructor (scene, name) {
        super(name)
        this.scene = scene
    }

    /**
     * Determine whether the object has complete, valid data.
     * @returns {boolean} whether the object is valid.
     */
    validate () {
        return typeof (this.scene) === 'number' &&
        typeof (this.name) === 'string'
    }
}
