

/**
 * Animate a dialog closing.
 * @param {HTMLDialogElement} dialogEl      dialog element whose close is animated
 */
export function animateClose (dialogEl) {
    // Check if animations are enabled
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion) {
        // If reduced motion is preferred, close immediately
        dialogEl.close()
        return
    }

    // Add closing class to trigger animation
    dialogEl.classList.add('closing')

    // Wait for animation to complete before actually closing
    const animationDuration = 300 // matches CSS animation duration
    setTimeout(() => {
        dialogEl.classList.remove('closing')
        dialogEl.close()
    }, animationDuration)
}