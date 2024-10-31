
/**
 * Setup mouse scrolling to update number input
 * @param {HTMLInputElement} el element to setup
 */
export function setupNumberInputScroll(el) {
    if (el instanceof HTMLInputElement === false) {
        console.warn("Cannot setup input scrolling on element: " + el);
        return
    }
            
    el.addEventListener('wheel', evt => {
        if (evt instanceof WheelEvent === false)
            return
        evt.preventDefault()

        if (isNaN(el.valueAsNumber))
            el.valueAsNumber = 0

        el.valueAsNumber += evt.wheelDelta > 0 ? 1 : -1

        let minVal = parseInt(el.min)
        if (!isNaN(minVal))
            el.valueAsNumber = Math.max(el.valueAsNumber, minVal) // clamp min

        let maxVal = parseInt(el.max)
        if (!isNaN(maxVal))
            el.valueAsNumber = Math.min(el.valueAsNumber, maxVal) // clamp max
    })
}