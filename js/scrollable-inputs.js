import { InputProgressElement } from '../components/input-progress/input-progress-element.js'

export const NumberInputTypes = [
    HTMLInputElement,
    InputProgressElement
]

/**
 * Setup all scrollable-number inputs under a parent element.
 * @param {DocumentFragment|Element} parentEl parent element whose children will be setup
 */
export function setupNumberInputScrollForParent (parentEl) {
    const els = parentEl.querySelectorAll('input[type=number], input[type=range], input-progress')
    for (const el of els)
        if (NumberInputTypes.some(e => el instanceof e))
            // @ts-ignore
            setupNumberInputScroll(el)
}

/**
 * Setup mouse scrolling to update number input
 * @param {HTMLInputElement|InputProgressElement} el element to setup
 */
export function setupNumberInputScroll (el) {
    if (!NumberInputTypes.some(e => el instanceof e)) {
        console.warn('Cannot setup input scrolling on element: ' + el)
        return
    }

    if ('inputScrollSetup' in el && el.inputScrollSetup === true) {
        console.warn('Ignoring already setup input scrolling on element: ' + el)
        return
    }
    // @ts-ignore
    el.inputScrollSetup = true

    // @ts-ignore
    el.addEventListener('wheel', handleScrollOnNumberInput, { passive: false })
}

/**
 * Remove mouse scrolling from update number input
 * @param {EventTarget} el element to de-setup
 */
export function removeNumberInputScroll (el) {
    // @ts-ignore
    el.inputScrollSetup = false
    el.removeEventListener('wheel', handleScrollOnNumberInput)
}

/**
 * Handle scroll wheel event for number inputs
 * @param {WheelEvent} evt scroll wheel event
 */
export function handleScrollOnNumberInput (evt) {
    const el = evt.target
    if (evt instanceof WheelEvent === false || 'wheelDelta' in evt === false ||
        !NumberInputTypes.some(e => el instanceof e) ||
        'valueAsNumber' in el === false || typeof (el.valueAsNumber) !== 'number')
        return

    evt.preventDefault()

    if (isNaN(el.valueAsNumber))
        el.valueAsNumber = 0

    // @ts-ignore
    el.valueAsNumber += evt.wheelDelta > 0 ? 1 : -1

    // @ts-ignore
    const minVal = parseInt(el.min)
    if (!isNaN(minVal))
        // @ts-ignore
        el.valueAsNumber = Math.max(el.valueAsNumber, minVal) // clamp min

    // @ts-ignore
    const maxVal = parseInt(el.max)
    if (!isNaN(maxVal))
        // @ts-ignore
        el.valueAsNumber = Math.min(el.valueAsNumber, maxVal) // clamp max

    el.dispatchEvent(new Event('change'))
}
