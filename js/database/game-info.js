import { NamedInfo } from "./named-info.js";

export class GameInfo extends NamedInfo {
    /**
     * @type {number|undefined}
     */
    id;

    /**
     * @type {string}
     */
    text;

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
     * @type {string}
     */
    activeAlert;

    /**
     * @type {string}
     */
    theme;

    /**
     * @type {number}
     */
    edition;

    /**
     * Create a new General Info object
     * @param {string}          name            name of the game
     * @param {string}          text            general screen text
     * @param {string}          shipName        name of the ship
     * @param {number|string}   [momentum]      amount of momentum in the player's pool
     * @param {string}          [activeAlert]   which alert is active
     * @param {string}          [theme]         which theme is active
     * @param {1|2}             [edition]       which edition is active
     * @param {File}            [shipModel]     ship's 3D model
     */
    constructor(name, text, shipName, momentum = 0, activeAlert = "", theme = "lcars-24", edition = 2, shipModel = undefined) {
        super(name);
        this.id = 0;
        this.text = text;
        this.shipName = shipName;
        this.momentum = typeof (momentum) === 'number' ? momentum : parseInt(momentum);
        this.activeAlert = activeAlert;
        this.theme = theme;
        this.edition = edition;
        this.shipModel = shipModel;
    }

    validate() {
        return typeof(this.id) === "number"
            && typeof(this.name) === "string"
            && typeof(this.text) === "string"
            && this.momentum !== undefined
            && typeof(this.activeAlert) === "string"
            && typeof(this.theme) === "string"
            && typeof(this.edition) === "number";
    }
}
