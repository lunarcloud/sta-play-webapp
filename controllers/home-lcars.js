import BgAudioManager from './bg-audio-page.js'
import '../input-progress/input-progress-element.js'

export default class HomeLCARSPageController {
    /**
     * Background Audio & Mute Manager
     * @type {BgAudioManager}
     */
    audioManager = new BgAudioManager()

    /**
     * Constructor.
     */
    constructor () {
        // Hook up hover buttons

        const okAudio = document.getElementById('beep-ok-audio') 
        const cancelAudio = document.getElementById('beep-cancel-audio')

        if (okAudio instanceof HTMLAudioElement === false || cancelAudio instanceof HTMLAudioElement === false)
            throw new Error("This page is wrong")

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

        const modelViewers = document.getElementsByTagName('model-viewer');
        for (let viewer of modelViewers)
        {
            viewer.addEventListener('dragenter', event => event.preventDefault())
            viewer.addEventListener('dragover', event => event.preventDefault());
            viewer.addEventListener('dragleave', event => event.preventDefault());
            viewer.addEventListener('drop', event => {
                if (event instanceof DragEvent === false ||
                     !event.dataTransfer.items?.[0].type.startsWith('model/gltf') ||
                     !event.dataTransfer.files?.[0])
                    return;

                this.onShipModelDropped(event.dataTransfer.files?.[0])
                event.preventDefault();
                event.stopPropagation();
            })
        }

        const players = document.querySelectorAll('ul.players li');
        for (let player of players)
        {
            player.addEventListener('dragenter', event => event.preventDefault())
            player.addEventListener('dragover', event => event.preventDefault());
            player.addEventListener('dragleave', event => event.preventDefault());
            player.addEventListener('drop', event => {
                if (event instanceof DragEvent === false ||
                    player instanceof HTMLElement === false ||
                    !event.dataTransfer.items?.[0].type.startsWith('image') ||
                    !event.dataTransfer.files?.[0])
                    return;

                this.onPlayerImageDropped(player, event.dataTransfer.files?.[0])
                event.preventDefault();
                event.stopPropagation();
            })
        }
    }

    toggleAlerts() {
        let alerts = document.querySelectorAll("alert");
        for (let alert of alerts) {
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

            const alertAudioEl = document.getElementById('beep-ok-audio')  // TODO actual alert sound! that loops
            if (alertAudioEl instanceof HTMLAudioElement === false) return;

            if (alert.classList.contains('condition-red')) {
                alertAudioEl.currentTime = 0
                alertAudioEl.play()
            } 
            else alertAudioEl.pause() /// TODO?
        }
    }

    addExtendedTask() {
        const template = document.getElementById('extended-task-template')
        if (template instanceof HTMLTemplateElement === false)
            return;

        const clone = document.importNode(template.content, true)
        template.parentElement.insertBefore(clone, template)
    }

    /**
     * Handler for new ship model drop
     * @param {File} modelFile 
     */
    onShipModelDropped(modelFile) {
        const url = URL.createObjectURL(modelFile)

        const modelViewers = document.getElementsByTagName('model-viewer');
        for (var viewer of modelViewers)
        {
            if ('src' in viewer)
                viewer.src = url;
        }
    }

    /**
     * Handler for new ship model drop
     * @param {HTMLElement} playerEl 
     * @param {File} imageFile 
     */
    onPlayerImageDropped(playerEl, imageFile) {

        const url = URL.createObjectURL(imageFile)
        playerEl.style.backgroundImage = `url('${url}')`
    }
}

globalThis.App ??= { Page: undefined }
globalThis.App.Page = new HomeLCARSPageController()
