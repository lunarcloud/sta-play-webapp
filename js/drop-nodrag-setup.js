
/**
 * Set an element up as a drop zone (not draggable).
 * @param {HTMLElement|any} el Element to set up drop but not drag for
 * @param {function(DragEvent):boolean} onDrop  Action to perform within the drop event handler
 */
export function setupDropOnly (el, onDrop) {
    if (el instanceof HTMLElement === false)
        throw new Error("Cannot use 'el' as HTMLElement argument!")

    el.addEventListener('dragenter', event => event.preventDefault())
    el.addEventListener('dragover', event => event.preventDefault())
    el.addEventListener('dragleave', event => event.preventDefault())
    el.addEventListener('drop', event => {
        if (event instanceof DragEvent === false || !onDrop(event))
            return

        event.preventDefault()
        event.stopPropagation()
    })
}