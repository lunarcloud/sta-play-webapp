import { NamedInfo } from './named-info.js'

export const DefaultSceneName = 'Scene Notes'
export const DefaultSceneDescription = 'The story so far...'

export class SceneInfo extends NamedInfo {
    /**
     * @type {string}
     */
    description

    /**
     * The id of the game it is for
     * @type {number}
     */
    game

    /**
     * Create a Player info
     * @param {number|undefined}    id              database entry id or undefined if new
     * @param {number}              game            The id of the game it is for
     * @param {string}              [name]          header for the scene
     * @param {string}              [description]   description of the scene
     */
    constructor (id, game, name = DefaultSceneName, description = DefaultSceneDescription) {
        super(name, id)
        this.game = game
        this.name = name
        this.description = description
    }

    validate () {
        return typeof (this.game) === 'number' &&
            typeof (this.name) === 'string' &&
            typeof (this.description) === 'string'
    }
}
