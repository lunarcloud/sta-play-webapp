import BgAudioManager from './bg-audio-page.js'
import '../input-progress/input-progress-element.js'

export default class IndexController {
    /**
     * Background Audio & Mute Manager
     * @type {BgAudioManager}
     */
    audioManager = new BgAudioManager()

    static DefaultShipUrl = 'gltf/starfleet-generic.glb'

    static DefaultPlayerImages = [
        'img/player/voy.webp',
        'img/player/ds9.webp',
        'img/player/tng.webp',
        'img/player/ent.webp',
        'img/player/tos-movies.webp',
        'img/player/tng-cadet.webp'
    ]

    /**
     * Constructor.
     */
    constructor () {
        // Hook up hover buttons

        const okAudio = document.getElementById('beep-ok-audio')
        const cancelAudio = document.getElementById('beep-cancel-audio')

        if (okAudio instanceof HTMLAudioElement === false || cancelAudio instanceof HTMLAudioElement === false)
            throw new Error('This page is wrong')

        const buttonEffects = (evtName, el, muted) => {
            // Audio
            if (muted)
                return
            const audioEl = evtName === 'click' ? okAudio : cancelAudio
            audioEl.currentTime = 0
            audioEl.play()
        }
        this.audioManager.setupElements('a[hover]', buttonEffects, undefined, buttonEffects)

        document.getElementById('alert-toggle').addEventListener('click', () => this.toggleAlerts())
        document.getElementById('extended-task-add').addEventListener('click', () => this.addExtendedTask())
        document.getElementById('player-add').addEventListener('click', () => this.addPlayer())
        document.getElementById('trait-add').addEventListener('click', () => this.addTrait())
        document.getElementById('settings-btn').addEventListener('click', () => this.openSettings())

        this.#loadDBInfo()
        this.#loadCacheData()

        const modelViewers = document.getElementsByTagName('model-viewer')
        for (const viewer of modelViewers) {
            viewer.addEventListener('dragenter', event => event.preventDefault())
            viewer.addEventListener('dragover', event => event.preventDefault())
            viewer.addEventListener('dragleave', event => event.preventDefault())
            viewer.addEventListener('drop', event => {
                if (event instanceof DragEvent === false ||
                     !event.dataTransfer.items?.[0].type.startsWith('model/gltf') ||
                     !event.dataTransfer.files?.[0])
                    return

                this.onShipModelDropped(event.dataTransfer.files?.[0])
                event.preventDefault()
                event.stopPropagation()
            })
        }

        const players = document.querySelectorAll('ul.players li')
        for (const player of players) {
            player.addEventListener('dragenter', event => event.preventDefault())
            player.addEventListener('dragover', event => event.preventDefault())
            player.addEventListener('dragleave', event => event.preventDefault())
            player.addEventListener('drop', event => {
                if (event instanceof DragEvent === false ||
                    player instanceof HTMLElement === false ||
                    !event.dataTransfer.items?.[0].type.startsWith('image') ||
                    !event.dataTransfer.files?.[0])
                    return

                this.onPlayerImageDropped(player, event.dataTransfer.files?.[0])
                event.preventDefault()
                event.stopPropagation()
            })
        }
    }

    async #loadDBInfo() {
        throw new Error('Method not implemented.')
    }

    async #loadCacheData() {
        let dirHandle = await navigator.storage.getDirectory()
        let defaultDir = await dirHandle.getDirectoryHandle('default', {create: true})
        let playersDir = await dirHandle.getDirectoryHandle('players', {create: true})

        // Load cached ship, if available
        try {
            let handle = await defaultDir.getFileHandle('ship.glb', {create: false})
            let shipFile = await handle.getFile()
            this.#setShipModel(URL.createObjectURL(shipFile))
        }
        catch (ex)
        {
            // fallback to default
            this.#setShipModel(IndexController.DefaultShipUrl)
        }

        const playerEls = document.querySelectorAll('ul.players li')
        for (const playerEl of playerEls)
        {
            if (playerEl instanceof HTMLElement === false)
                return;
            let i = playerEl.getAttribute('player-index');

            // Load cached player image, if available
            try {
                let handle = await playersDir.getFileHandle(`${i}`, {create: false})
                let playerFile = await handle.getFile()
                const url = URL.createObjectURL(playerFile)
                playerEl.style.backgroundImage = `url('${url}')`
            }
            catch (ex)
            {
                // fallback to default
                playerEl.style.backgroundImage = `url('${IndexController.DefaultPlayerImages[i]}')`
            }
        }
    }

    openSettings() {
        throw new Error('Method not implemented.')
    }

    /**
     * Cycle between the alert types and none.
     */
    toggleAlerts () {
        const alerts = document.querySelectorAll('alert')
        for (const alert of alerts) {
            if (alert.classList.contains('condition-yellow'))
                alert.classList.replace('condition-yellow', 'condition-red')
            else if (alert.classList.contains('condition-red'))
                alert.classList.replace('condition-red', 'condition-blue')
            else if (alert.classList.contains('condition-blue'))
                alert.classList.replace('condition-blue', 'condition-black')
            else if (alert.classList.contains('condition-black'))
                alert.classList.remove('condition-black')
            else
                alert.classList.add('condition-yellow')

            const alertAudioEl = document.getElementById('beep-ok-audio') // TODO actual alert sound! that loops
            if (alertAudioEl instanceof HTMLAudioElement === false) return

            if (alert.classList.contains('condition-red')) {
                alertAudioEl.currentTime = 0
                alertAudioEl.play()
            } else alertAudioEl.pause() /// TODO?
        }
    }

    /**
     * Add a new Combat / Extended task tracker to the page.
     */
    addExtendedTask () {
        const template = document.getElementById('extended-task-template')
        if (template instanceof HTMLTemplateElement === false)
            return

        const clone = document.importNode(template.content, true)
        template.parentElement.insertBefore(clone, template)
    }

    addTrait() {
        throw new Error('Method not implemented.')
    }
    
    addPlayer() {
        throw new Error('Method not implemented.')
    }

    /**
     * Handler for new ship model drop
     * @param {File} modelFile  GLTF/GLB model file
     */
    async onShipModelDropped (modelFile) {
        let cacheFile = await this.cacheFile(modelFile, 'ship.glb')
        const url = URL.createObjectURL(cacheFile)

        this.#setShipModel(url)
    }

    #setShipModel(url) {
        const modelViewers = document.getElementsByTagName('model-viewer')
        for (const viewer of modelViewers) {
            if ('src' in viewer)
                viewer.src = url
        }
    }

    /**
     * Handler for new ship model drop
     * @param {HTMLElement} playerEl    player element to change the background of
     * @param {File} imageFile          image to change player element background to
     */
    async onPlayerImageDropped (playerEl, imageFile) {
        let cacheFile = await this.cacheFile(imageFile, `${playerEl.getAttribute('player-index')}`, 'players')
        const url = URL.createObjectURL(cacheFile)
        playerEl.style.backgroundImage = `url('${url}')`
    }

    /**
     * Create and return a cached copy of a file
     * @param {File} inputFile file to cache
     * @param {string} newName filename for the cached copy
     * @param {string} folderName Name of the sub-folder to store it in
     * @returns cached file
     */
    async cacheFile(inputFile, newName = inputFile.name, folderName = 'default') {
        let dirHandle = await navigator.storage.getDirectory()
        let dir = await dirHandle.getDirectoryHandle(folderName, {create: true})
        let handle = await dir.getFileHandle(newName, {create: true})
        let writeable = await handle.createWritable()
        await writeable.write(inputFile)
        await writeable.close()

        return await handle.getFile()
    }
    
    async clearCache(folderName = undefined) {
        let dirHandle = await navigator.storage.getDirectory()

        if (folderName === undefined)
        {
            this.clearCache('default')
            this.clearCache('players')
        }
        else
            dirHandle.removeEntry(folderName, {recursive: true})
    }
}

globalThis.App ??= { Page: undefined }
globalThis.App.Page = new IndexController()
