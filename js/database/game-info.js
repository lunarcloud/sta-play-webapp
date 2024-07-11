import { NamedInfo } from "./named-info.js";

export const DefaultGameName = 'Default Game'

export class GameInfo extends NamedInfo {

    /**
     * @type {string}
     */
    shipName;

    /**
     * @type {File|undefined}
     */
    shipModel;

    /**
     * @type {number}
     */
    momentum;

    /**
     * @type {number}
     */
    threat;

    /**
     * @type {string}
     */
    activeAlert;

    /**
     * @type {string}
     */
    theme;

    /**
     * @type {'1'|'2'|'captains-log'}
     */
    edition;

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
     */
    constructor(id, name, shipName, momentum = 0, threat = 0, activeAlert = "", theme = "lcars-24", edition = '2', shipModel = undefined) {
        super(name ?? DefaultGameName, id);
        this.shipName = shipName;
        this.momentum = typeof (momentum) === 'number' ? momentum : parseInt(momentum);
        this.threat = typeof (threat) === 'number' ? threat : parseInt(threat);
        this.activeAlert = activeAlert;
        this.theme = theme;
        this.setEdition(edition);
        this.shipModel = shipModel;
    }

    /**
     * Set Edition
     * @param {string} value
     */
    setEdition(value) {
        // Not done as a setter function because private members don't seem to save to db well
        switch (value) {
            case '1':
                this.edition = '1'
                break;
            case 'captains-log':
                this.edition = 'captains-log'
                break;
            default:
                this.edition = '2'
                break;
        }
    }

    validate() {
        return typeof(this.name) === "string"
            && this.momentum !== undefined
            && this.threat !== undefined
            && typeof(this.activeAlert) === "string"
            && typeof(this.theme) === "string"
            && ['1','2','captains-log'].includes(this.edition)
    }
}
