import { NamedInfo } from './named-info.js'

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
     * Create a Player info
     * @param {number} game                     the id of the game it is for
     * @param {number|string} playerNumber      player id
     * @param {string} name                     player character's name
     * @param {number} currentStress            current stress value
     * @param {number} maxStress                maximum stress value
     * @param {string} pips                     the pips text
     * @param {string} borderColor              the color option text
     * @param {File|undefined} [image]          image of the player's character
     */
    constructor (game, playerNumber, name, currentStress, maxStress, pips, borderColor, image = undefined) {
        super(name)
        this.game = game
        this.playerNumber = typeof (playerNumber) === 'number' ? playerNumber : parseInt(playerNumber)
        this.currentStress = typeof (currentStress) === 'number' ? currentStress : parseInt(currentStress)
        this.maxStress = typeof (maxStress) === 'number' ? maxStress : parseInt(maxStress)
        this.pips = pips
        this.borderColor = borderColor
        this.image = image
    }

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
