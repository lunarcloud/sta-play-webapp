import { NamedInfo } from './named-info.js';


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
    constructor(scene, name) {
        super(name);
        this.scene = scene
    }

    validate() {
        return typeof(this.scene) === "number"
        && typeof(this.name) === "string"
    }
}