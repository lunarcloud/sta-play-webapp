import { GameInfo } from './game-info.js'
import { PlayerInfo } from './player-info.js'
import { TrackerInfo } from './tracker-info.js'
import { TraitInfo } from './trait-info.js'
import { SceneInfo } from './scene-info.js'

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
     * @type {Map<number, Array<string>>}
     */
    Traits

    /**
     *  Backup Game Data
     * @param {GameInfo} gameInfo                       game general info
     * @param {Array<PlayerInfo>} players               list of players info
     * @param {Array<SceneInfo>} scenes                 list of scenes info
     * @param {Array<TrackerInfo>} trackers             list of trackers
     * @param {Map<number, Array<string>>} traits    list of traits for scenes
     */
    constructor (gameInfo, players, scenes, trackers, traits) {
        this.GameInfo = gameInfo
        this.Players = players
        this.Scenes = scenes
        this.Trackers = trackers
        this.Traits = traits
    }

    /**
     * Create via file
     * @param {File} file   backup file to read.
     * @returns {Promise<BackupData>} data
     */
    static async import (file) {
        const zip = await (new JSZip()).loadAsync(file)
        const jsonText = await zip.file(INFO_FILE_NAME).async('string')

        /**
         * convert the file
         * @param {AppEncodedFileObject} fileInfo
         * @returns {Promise<File>}  file reconstituted
         */
        async function convertFile(fileInfo) {

                let blob = await zip.file(fileInfo.reference).async('blob')
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
        data.GameInfo.shipModel = await convertFile(data.GameInfo.shipModel)


        let players = []
        for (let player of data.Players) {

            if (player.image)
                player.image = await convertFile(player.image)
            players.push(PlayerInfo.assign(player))
        }

        let scenes = []
        let traits = new Map()
        for (let scene of data.Scenes) {
            scenes.push(SceneInfo.assign(scene))
        }

        let trackers = []
        for (let tracker of data.Trackers) {
            trackers.push(TrackerInfo.assign(tracker))
        }

        let backupData = new BackupData(
            GameInfo.assign(data.GameInfo),
            players,
            scenes,
            trackers,
            data.Traits
        )

        // Put it all into the object
        return backupData
    }

    async getZip () {
        const files = new Map()

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

        for (let i = 0; i < this.Players.length; i++) {
            if (this.Players[i].image instanceof File === false)
                continue

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

        const text = JSON.stringify(this, undefined, 4)

        const zip = new globalThis.JSZip()
        zip.file(INFO_FILE_NAME, text)

        for (const guid in files)
            zip.file(`${guid}`, files[guid])

        return await zip.generateAsync({
            type: 'blob',
            mimeType: 'application/staplay'
        })
    }
}
