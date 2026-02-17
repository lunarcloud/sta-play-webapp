import { GameInfo } from './game-info.js'
import { PlayerInfo } from './player-info.js'
import { TrackerInfo } from './tracker-info.js'
import { RollTableInfo } from './roll-table-info.js'
import { SceneInfo } from './scene-info.js'
import { zipSync, unzipSync, strToU8, strFromU8 } from '../lib/fflate.js'

/**
 * @typedef AppEncodedFileObject
 * @property {number}  lastModified         file last modified time
 * @property {string}  name                 name of the file
 * @property {number}  size                 size in bytes
 * @property {string}  type                 mime type
 * @property {string}  webkitRelativePath   relative path
 * @property {boolean} isReferencedFile     flag to say this is referenced
 * @property {string}  reference            lookup GUID
 */

const INFO_FILE_NAME = 'info.json'

/**
 * Game Backup Data
 */
export class BackupData {
  /**
   * @type {GameInfo}
   */
  GameInfo

  /**
   * @type {Array<PlayerInfo>}
   */
  Players

  /**
   * @type {Array<SceneInfo>}
   */
  Scenes

  /**
   * @type {Array<TrackerInfo>}
   */
  Trackers

  /**
   * @type {Array<RollTableInfo>}
   */
  RollTables

  /**
   * @type {Map<number, Array<string>>}
   */
  Traits

  /**
   *  Backup Game Data
   * @param {GameInfo} gameInfo                       game general info
   * @param {Array<PlayerInfo>} players               list of players info
   * @param {Array<SceneInfo>} scenes                 list of scenes info
   * @param {Array<TrackerInfo>} trackers             list of trackers
   * @param {Map<number, Array<string>>} traits       list of traits for scenes
   * @param {Array<RollTableInfo>} rollTables         list of roll tables
   */
  constructor (gameInfo, players, scenes, trackers, traits, rollTables = []) {
    this.GameInfo = gameInfo
    this.Players = players
    this.Scenes = scenes
    this.Trackers = trackers
    this.Traits = traits
    this.RollTables = rollTables
  }

  /**
   * Create via file
   * @param {File} file   backup file to read.
   * @returns {Promise<BackupData>} data
   */
  static async import (file) {
    // Read the file as an ArrayBuffer and convert to Uint8Array
    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    // Unzip the file
    const unzipped = unzipSync(uint8Array)

    // Get the info.json content and parse it
    const jsonText = strFromU8(unzipped[INFO_FILE_NAME])

    /**
     * convert the file
     * @param {AppEncodedFileObject} fileInfo   recorded file information
     * @returns {Promise<File>}  file reconstituted
     */
    async function convertFile (fileInfo) {
      if (fileInfo === undefined) { return }

      const uint8Data = unzipped[fileInfo.reference]
      const blob = new Blob([uint8Data])
      return new File(
        [blob],
        fileInfo.name,
        {
          lastModified: fileInfo.lastModified,
          type: fileInfo.type
        }
      )
    }

    // re-hydrate the info
    const data = JSON.parse(jsonText)

    // re-hydrate the files
    if (data.GameInfo.shipModel) { data.GameInfo.shipModel = await convertFile(data.GameInfo.shipModel) }

    const players = []
    for (const player of data.Players) {
      if (player.image) { player.image = await convertFile(player.image) }
      players.push(PlayerInfo.assign(player))
    }

    const scenes = []
    for (const scene of data.Scenes) {
      scenes.push(SceneInfo.assign(scene))
    }

    const trackers = []
    for (const tracker of data.Trackers) {
      trackers.push(TrackerInfo.assign(tracker))
    }

    const rollTables = []
    if (data.RollTables) {
      for (const table of data.RollTables) {
        rollTables.push(RollTableInfo.assign(table))
      }
    }

    const backupData = new BackupData(
      GameInfo.assign(data.GameInfo),
      players,
      scenes,
      trackers,
      data.Traits,
      rollTables
    )

    // Put it all into the object
    return backupData
  }

  /**
   * Build the zip file.
   * @returns {Promise<Blob>} zip file blob
   */
  async getZip () {
    const files = new Map()
    const zipData = {}

    if (this.GameInfo.shipModel instanceof File) {
      // @ts-ignore
      this.GameInfo.shipModel.toJSON = function () {
        /** @type {AppEncodedFileObject} */
        const value = {
          lastModified: this.lastModified,
          name: this.name,
          size: this.size,
          type: this.type,
          webkitRelativePath: this.webkitRelativePath,
          isReferencedFile: true,
          reference: crypto.randomUUID()
        }
        files[value.reference] = this
        return value
      }
    }

    for (let i = 0; i < this.Players.length; i++) {
      if (this.Players[i].image instanceof File === false) { continue }

      // @ts-ignore
      this.Players[i].image.toJSON = function () {
        /** @type {AppEncodedFileObject} */
        const value = {
          lastModified: this.lastModified,
          name: this.name,
          size: this.size,
          type: this.type,
          webkitRelativePath: this.webkitRelativePath,
          isReferencedFile: true,
          reference: crypto.randomUUID()
        }
        files[value.reference] = this
        return value
      }
    }

    const text = JSON.stringify(this)

    // Add info.json to zip data
    zipData[INFO_FILE_NAME] = strToU8(text)

    // Add all referenced files to zip data
    for (const guid in files) {
      const file = files[guid]
      const arrayBuffer = await file.arrayBuffer()
      zipData[guid] = new Uint8Array(arrayBuffer)
    }

    // Create the zip with compression level 9
    const zipped = zipSync(zipData, { level: 9 })

    return new Blob([zipped], { type: 'application/staplay' })
  }
}
