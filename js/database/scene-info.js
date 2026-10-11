import { NamedInfo } from './named-info.js'

export const DefaultSceneName = 'Scene Notes'
export const DefaultSceneDescription = 'The story so far...'

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
   * Create a Player info
   * @param {number|undefined}    id              database entry id or undefined if new
   * @param {number}              game            The id of the game it is for
   * @param {string}              [name]          header for the scene
   * @param {string}              [description]   description of the scene
   * @param {Array<string>}       [missionTrack]  mission tracker
   * @param {string}              [activeAlert]   active alert/condition for this scene
   * @param {File|undefined}      [image]         image to use for map mode
   */
  constructor (id, game, name = DefaultSceneName, description = DefaultSceneDescription, missionTrack = [], activeAlert = '', image = undefined) {
    super(name, id)
    this.game = game
    this.description = description
    this.missionTrack = missionTrack
    this.activeAlert = activeAlert
    this.image = image
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
      'image' in obj ? obj.image : undefined
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
            (this.image === undefined || this.image instanceof File)
  }
}
