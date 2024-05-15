
export default class BgAudioManager {
    /**
     * Whether the page audio is enabled.
     * @type {boolean}
     */
    muted = true

    /**
     * Background Audio
     * @type {HTMLAudioElement}
     */
    bgAudio

    /**
     * Constructor.
     */
    constructor () {
        // Find the background audio element
        const bgAudioEl = document.getElementById('bg-audio')
        if (bgAudioEl instanceof HTMLAudioElement)
            this.bgAudio = bgAudioEl
        else
            throw new Error("BG Audio isn't an audio element!")

        this.bgAudio.pause() // prevents weirdness with navigation

        if (localStorage.getItem('muted') === 'true') {
            this.muteToggle(true)
        } else {
            // Detect whether we are muted
            this.bgAudio.currentTime = 0
            this.bgAudio.play()
                .then(() => this.muteToggle(false))
                .catch(() => this.muteToggle(true))
        }

        document.addEventListener('visibilitychange', () => this.pageVisibilityChanged())

        document.getElementById('mute-btn')
            .addEventListener('click', () => this.muteToggle(), { once: false, passive: true })

        document.getElementById('mute-btn')
            .addEventListener('touchend', () => this.muteToggle(), { once: false, passive: true })
    }

    /**
     * Update the muted value.
     * @param {boolean} value what to set mute to (defaults to toggle)
     */
    muteToggle (value = !this.muted) {
        this.muted = value
        localStorage.setItem('muted', value ? 'true' : 'false')

        if (this.muted) {
            this.bgAudio.pause()
            speechSynthesis?.cancel()
            document.getElementById('mute-btn').classList.add('on')
        } else {
            this.bgAudio.play()
            document.getElementById('mute-btn').classList.remove('on')
        }
    }

    /**
     * Handle page visibility change.
     */
    pageVisibilityChanged () {
        if (this.muted)
            return

        if (document.visibilityState === 'visible')
            this.bgAudio.play()
        else
            this.bgAudio.pause()
    }

    /**
     * Setup elements which may need to play sounds.
     * @param {Array<Element>|NodeListOf<Element>|string} elements elements to handle events for.
     * @param {Function} onHover Element hovering handler.
     * @param {Function} onLeave Element un-hovering handler.
     * @param {Function} onClick Element clicking handler.
     */
    setupElements (elements, onHover, onLeave, onClick) {
        if (typeof elements === 'string')
            elements = document.querySelectorAll(elements)

        if (!(elements?.[0] instanceof Element))
            throw new Error('Error during setup, can\'t use these elements')

        for (const el of elements) {
            if (onHover) {
                el.addEventListener('mouseover', () => onHover('mouseover', el, this.muted), {
                    passive: true
                })
                el.addEventListener('touchstart', () => onHover('touchstart', el, this.muted), {
                    passive: true
                })
            }
            if (onLeave) {
                el.addEventListener('mouseout', () => onLeave('mouseout', el, this.muted), {
                    passive: true
                })
                el.addEventListener('touchend', () => onLeave('touchend', el, this.muted), {
                    passive: true
                })
            }
            if (onClick)
                el.addEventListener('click', () => onClick('click', el, this.muted), {
                    passive: true
                })
        }
    }

    /**
     * Play a non-looping sound (if not muted)
     * @param {Element | string} element    element to handle events for.
     */
    playOnce (element) {
        if (typeof element === 'string')
            element = document.querySelector(element)

        // make noise
        if (!this.muted && element instanceof HTMLAudioElement) {
            element.currentTime = 0
            element.play()
        }
    }
}
