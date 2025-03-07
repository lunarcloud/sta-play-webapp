import { NamedInfo } from './named-info.js'

export const DefaultGameName = 'Default Game'

/**
 * Database Game Information Object.
 */
export class GameInfo extends NamedInfo {
    /**
     * @type {string}
     */
    shipName

    /**
     * @type {File|undefined}
     */
    shipModel

    /**
     * @type {number}
     */
    momentum

    /**
     * @type {number}
     */
    threat

    /**
     * @type {string}
     */
    activeAlert

    /**
     * @type {string}
     */
    theme

    /**
     * @type {boolean}
     */
    altFont

    /**
     * @type {boolean}
     */
    legacyTrackers

    /**
     * @type {'1'|'2'|'captains-log'}
     */
    edition

    /**
     * Create a new General Info object
     * @param {number|undefined}    id              database entry id or undefined if new
     * @param {string|undefined}    name            name of the game
     * @param {string}              shipName        name of the ship
     * @param {number|string}       [momentum]      amount of momentum in the player's pool
     * @param {number|string}       [threat]        amount of threat in the GM's pool
     * @param {string}              [activeAlert]   which alert is active
     * @param {string}              [theme]         which theme is active
     * @param {string}              [edition]       which edition is active
     * @param {File}                [shipModel]     ship's 3D model
     * @param {boolean}             [altFont]       whether to use a theme's alternate font
     * @param {boolean}             [legacyTrackers]       whether to use the legacy trackers controls
     */
    constructor (id, name, shipName, momentum = 0, threat = 0, activeAlert = '', theme = 'lcars-24', edition = '2', shipModel = undefined, altFont = false, legacyTrackers = false) {
        super(name ?? DefaultGameName, id)
        this.shipName = shipName
        this.momentum = typeof (momentum) === 'number' ? momentum : parseInt(momentum)
        this.threat = typeof (threat) === 'number' ? threat : parseInt(threat)
        this.activeAlert = activeAlert
        this.theme = theme
        this.altFont = altFont
        this.legacyTrackers = legacyTrackers
        this.setEdition(edition)
        this.shipModel = shipModel
    }

    /**
     * Assign the data from a generic object to that of a valid {@link GameInfo}
     * @param {object} obj object to copy from.
     * @returns {GameInfo}   valid {@link GameInfo}.
     */
    static assign (obj) {
        return new GameInfo(
            obj.id,
            obj.name,
            obj.shipName,
            'momentum' in obj ? obj.momentum : 0,
            'threat' in obj ? obj.threat : 0,
            'activeAlert' in obj ? obj.activeAlert : '',
            'theme' in obj ? obj.theme : 'lcars-24',
            'edition' in obj ? obj.edition : '2',
            'shipModel' in obj ? obj.shipModel : undefined,
            'altFont' in obj ? obj.altFont : false,
            'legacyTrackers' in obj ? obj.legacyTrackers : false
        )
    }

    /**
     * Set Edition
     * @param {string} value  edition specified
     */
    setEdition (value) {
        // Not done as a setter function because private members don't seem to save to db well
        switch (value) {
        case '1':
            this.edition = '1'
            break
        case 'captains-log':
            this.edition = 'captains-log'
            break
        default:
            this.edition = '2'
            break
        }
    }

    /**
     * Determine whether the object has complete, valid data.
     * @returns {boolean} whether the object is valid.
     */
    validate () {
        return typeof (this.name) === 'string' &&
            this.momentum !== undefined &&
            this.threat !== undefined &&
            typeof (this.activeAlert) === 'string' &&
            typeof (this.theme) === 'string' &&
            ['1', '2', 'captains-log'].includes(this.edition)
    }
}
