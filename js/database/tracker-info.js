import { NamedInfo } from './named-info.js'

/**
 * Database Tracker Information Object.
 */
export class TrackerInfo extends NamedInfo {
    /**
     * The id of the game it is for
     * @type {number}
     */
    game

    /**
     * @type {number}
     */
    resistance

    /**
     * @type {number}
     */
    complicationRange

    /**
     * @type {string}
     */
    attribute

    /**
     * @type {string}
     */
    department

    /**
     * @type {string}
     */
    shipSystem

    /**
     * @type {string}
     */
    shipDepartment

    /**
     * @type {number}
     */
    progressTrack

    /**
     * @type {number}
     */
    maxProgressTrack

    /**
     * @type {number}
     */
    breakthroughs

    /**
     * Create a Combat/Extended Tracker Info
     * @param {number} game                         the id of the game it is for
     * @param {string} name                         the tracker's name
     * @param {string} attribute                    the applicable attribute
     * @param {string} department                   the applicable discipline/department
     * @param {string} shipSystem                   the applicable ship system
     * @param {string} shipDepartment               the applicable sihp department
     * @param {number|string} progressTrack         the amount of progress earned
     * @param {number|string} maxProgressTrack      the amount of progress to reach
     * @param {number|string} [resistance]          the amount of resistance
     * @param {number|string} [complicationRange]   the complication range
     * @param {number|string} [breakthroughs]       the number of acheived breakthroughs
     */
    constructor (game, name, attribute, department, shipSystem, shipDepartment, progressTrack, maxProgressTrack, resistance = 0, complicationRange = 0, breakthroughs = 0) {
        super(name)
        this.game = game
        this.attribute = attribute
        this.department = department
        this.shipSystem = shipSystem
        this.shipDepartment = shipDepartment
        this.progressTrack = typeof (progressTrack) === 'number' ? progressTrack : parseInt(progressTrack)
        this.maxProgressTrack = typeof (maxProgressTrack) === 'number' ? maxProgressTrack : parseInt(maxProgressTrack)
        this.resistance = typeof (resistance) === 'number' ? resistance : parseInt(resistance)
        this.complicationRange = typeof (complicationRange) === 'number' ? complicationRange : parseInt(complicationRange)
        this.breakthroughs = typeof (breakthroughs) === 'number' ? breakthroughs : parseInt(breakthroughs)
    }

    /**
     * Assign the data from a generic object to that of a valid {@link TrackerInfo}
     * @param {object} obj object to copy from.
     * @returns {TrackerInfo}   valid {@link TrackerInfo}.
     */
    static assign (obj) {
        return new TrackerInfo(
            obj.game,
            obj.name,
            obj.attribute,
            obj.department,
            obj.shipSystem,
            obj.shipDepartment,
            obj.progressTrack,
            'maxProgressTrack' in obj ? obj.maxProgressTrack : obj.progressTrack,
            'resistance' in obj ? obj.resistance : 0,
            'complicationRange' in obj ? obj.complicationRange : 0,
            'breakthroughs' in obj ? obj.breakthroughs : 0
        )
    }

    /**
     * Determine whether the object has complete, valid data.
     * @returns {boolean} whether the object is valid.
     */
    validate () {
        return typeof (this.game) === 'number' &&
            typeof (this.name) === 'string' && this.name.length > 0 &&
            typeof (this.attribute) === 'string' && this.attribute.length > 0 &&
            typeof (this.department) === 'string' && this.department.length > 0 &&
            typeof (this.shipSystem) === 'string' && this.shipSystem.length > 0 &&
            typeof (this.shipDepartment) === 'string' && this.shipDepartment.length > 0 &&
            typeof (this.progressTrack) === 'number' &&
            typeof (this.maxProgressTrack) === 'number' &&
            typeof (this.resistance) === 'number' &&
            typeof (this.complicationRange) === 'number' &&
            typeof (this.breakthroughs) === 'number'
    }
}
