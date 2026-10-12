import { NamedInfo } from './named-info.js'

export const DefaultSceneName = 'Scene Notes'
export const DefaultSceneDescription = 'The story so far...'

/**
 * @typedef {object} TokenPosition
 * @property {number} x   normalized horizontal position (0-1) within the map image's rendered bounds
 * @property {number} y   normalized vertical position (0-1) within the map image's rendered bounds
 */

/**
 * Scene Named Information Object.
 */
export class SceneInfo extends NamedInfo {
  /**
   * The id of the game it is for
   * @type {number}
   */
  game

  /**
   * @type {string}
   */
  description

  /**
   * Captain's Log mission tracker progress
   * @type {Array<string>}
   */
  missionTrack

  /**
   * Ship condition/alert status for this scene
   * @type {string}
   */
  activeAlert

  /**
   * @type {File|undefined}
   */
  image

  /**
   * Map token positions for this scene, keyed by token key (e.g. `player-0-0`, `token-5-0`).
   * Any number of independent copies ("instances") of a player or NPC/other token may be placed
   * at once (e.g. a cloned player character, or several "shuttlepod" tokens), each key carrying
   * its own instance number suffix. A token with no entry here is not placed on this scene's map.
   * @type {Record<string, TokenPosition>}
   */
  tokenPositions

  /**
   * Create a Player info
   * @param {number|undefined}    id              database entry id or undefined if new
   * @param {number}              game            The id of the game it is for
   * @param {string}              [name]          header for the scene
   * @param {string}              [description]   description of the scene
   * @param {Array<string>}       [missionTrack]  mission tracker
   * @param {string}              [activeAlert]   active alert/condition for this scene
   * @param {File|undefined}      [image]         image to use for map mode
   * @param {Record<string, TokenPosition>} [tokenPositions]   map token positions, keyed by token key
   */
  constructor (id, game, name = DefaultSceneName, description = DefaultSceneDescription, missionTrack = [], activeAlert = '', image = undefined, tokenPositions = {}) {
    super(name, id)
    this.game = game
    this.description = description
    this.missionTrack = missionTrack
    this.activeAlert = activeAlert
    this.image = image
    this.tokenPositions = tokenPositions
  }

  /**
   * Assign the data from a generic object to that of a valid {@link SceneInfo}
   * @param {object} obj object to copy from.
   * @returns {SceneInfo}   valid {@link SceneInfo}.
   */
  static assign (obj) {
    return new SceneInfo(
      obj.id,
      obj.game,
      'name' in obj ? obj.name : DefaultSceneName,
      'description' in obj ? obj.description : DefaultSceneDescription,
      'missionTrack' in obj ? obj.missionTrack : [],
      'activeAlert' in obj ? obj.activeAlert : '',
      'image' in obj ? obj.image : undefined,
      'tokenPositions' in obj ? obj.tokenPositions : {}
    )
  }

  /**
   * Determine whether the object has complete, valid data.
   * @returns {boolean} whether the object is valid.
   */
  validate () {
    return typeof (this.game) === 'number' &&
            typeof (this.name) === 'string' &&
            typeof (this.description) === 'string' &&
            (this.image === undefined || this.image instanceof File) &&
            typeof (this.tokenPositions) === 'object' && this.tokenPositions !== null
  }
}
