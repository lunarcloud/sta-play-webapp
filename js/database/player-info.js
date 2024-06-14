import { NamedInfo } from './named-info.js';


export class PlayerInfo extends NamedInfo {
    /**
     * @type {number|undefined}
     */
    id;

    /**
     * @type {number}
     */
    currentStress;

    /**
     * @type {number}
     */
    maxStress;

    /**
     * @type {string}
     */
    pips;

    /**
     * @type {string}
     */
    borderColor;

    /**
     * @type {File|undefined}
     */
    image;

    /**
     * Create a Player info
     * @param {number|string} id                    player id
     * @param {string} name                         player character's name
     * @param {number} currentStress                current stress value
     * @param {number} maxStress                    maximum stress value
     * @param {string} pips                         the pips text
     * @param {string} borderColor                  the color option text
     * @param {File|undefined} [image]    image of the player's character
     */
    constructor(id, name, currentStress, maxStress, pips, borderColor, image = undefined) {
        super(name);
        this.id = typeof (id) === 'number' ? id : parseInt(id);
        this.currentStress = typeof (currentStress) === 'number' ? currentStress : parseInt(currentStress);
        this.maxStress = typeof (maxStress) === 'number' ? maxStress : parseInt(maxStress);
        this.pips = pips;
        this.borderColor = borderColor;
        this.image = image;
    }
}
