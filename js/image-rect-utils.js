/**
 * @typedef {object} Rect
 * @property {number} x       offset from the left of the element's box, in pixels
 * @property {number} y       offset from the top of the element's box, in pixels
 * @property {number} width   rendered width, in pixels
 * @property {number} height  rendered height, in pixels
 */

/**
 * Determine the rectangle (within an `<img>` element's own box) that the image is
 * actually drawn into when using `object-fit: contain`. When the image has no
 * intrinsic size yet (e.g. no source loaded), the full element box is returned.
 * @param {HTMLImageElement} imgEl   the image element
 * @returns {Rect}                  the rendered image rectangle, relative to the element's box
 */
export function getContainedImageRect (imgEl) {
  const boxWidth = imgEl.clientWidth
  const boxHeight = imgEl.clientHeight
  const rect = { x: 0, y: 0, width: boxWidth, height: boxHeight }

  const naturalWidth = imgEl.naturalWidth
  const naturalHeight = imgEl.naturalHeight
  if (!naturalWidth || !naturalHeight || !boxWidth || !boxHeight) {
    return rect
  }

  const elementRatio = boxWidth / boxHeight
  const imageRatio = naturalWidth / naturalHeight

  if (imageRatio > elementRatio) {
    // image is relatively wider than its box, so it's letterboxed top & bottom
    rect.height = boxWidth / imageRatio
    rect.y = (boxHeight - rect.height) / 2
  } else {
    // image is relatively taller than its box, so it's letterboxed left & right
    rect.width = boxHeight * imageRatio
    rect.x = (boxWidth - rect.width) / 2
  }

  return rect
}

/**
 * Determine the rectangle that an image (rendered with `object-fit: contain`) occupies
 * relative to an ancestor element's box, e.g. a positioning container the image sits within.
 * @param {HTMLImageElement} imgEl        the image element
 * @param {Element} containerEl           ancestor element to measure relative to
 * @returns {Rect}                        the rendered image rectangle, relative to the container's box
 */
export function getContainedImageRectRelativeTo (imgEl, containerEl) {
  const contained = getContainedImageRect(imgEl)

  const containerRect = containerEl.getBoundingClientRect()
  const imgRect = imgEl.getBoundingClientRect()

  return {
    x: (imgRect.left - containerRect.left) + contained.x,
    y: (imgRect.top - containerRect.top) + contained.y,
    width: contained.width,
    height: contained.height
  }
}
