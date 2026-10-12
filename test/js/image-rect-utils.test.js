import { expect } from '@esm-bundle/chai'
import { getContainedImageRect, getContainedImageRectRelativeTo } from '../../js/image-rect-utils.js'

/**
 * Build a stub image element with the given box size and natural (intrinsic) size.
 * @param {object} options                box/natural size options
 * @param {number} options.clientWidth    rendered box width
 * @param {number} options.clientHeight   rendered box height
 * @param {number} options.naturalWidth   intrinsic image width
 * @param {number} options.naturalHeight  intrinsic image height
 * @param {object} [boundingRect]         optional override for getBoundingClientRect()
 * @returns {HTMLImageElement}            stub image element
 */
function makeImageStub ({ clientWidth, clientHeight, naturalWidth, naturalHeight }, boundingRect) {
  return {
    clientWidth,
    clientHeight,
    naturalWidth,
    naturalHeight,
    getBoundingClientRect: () => boundingRect ?? { left: 0, top: 0, width: clientWidth, height: clientHeight }
  }
}

describe('Image Rect Utils', () => {
  describe('getContainedImageRect', () => {
    it('should fill the box when no intrinsic size is available', () => {
      const img = makeImageStub({ clientWidth: 200, clientHeight: 100, naturalWidth: 0, naturalHeight: 0 })
      expect(getContainedImageRect(img)).to.deep.equal({ x: 0, y: 0, width: 200, height: 100 })
    })

    it('should letterbox top & bottom when the image is relatively wider than its box', () => {
      // box is square (200x200), image is 2:1 (wide)
      const img = makeImageStub({ clientWidth: 200, clientHeight: 200, naturalWidth: 400, naturalHeight: 200 })
      const rect = getContainedImageRect(img)
      expect(rect.width).to.equal(200)
      expect(rect.height).to.equal(100)
      expect(rect.x).to.equal(0)
      expect(rect.y).to.equal(50)
    })

    it('should letterbox left & right when the image is relatively taller than its box', () => {
      // box is square (200x200), image is 1:2 (tall)
      const img = makeImageStub({ clientWidth: 200, clientHeight: 200, naturalWidth: 200, naturalHeight: 400 })
      const rect = getContainedImageRect(img)
      expect(rect.width).to.equal(100)
      expect(rect.height).to.equal(200)
      expect(rect.x).to.equal(50)
      expect(rect.y).to.equal(0)
    })

    it('should exactly fill the box when the aspect ratios match', () => {
      const img = makeImageStub({ clientWidth: 300, clientHeight: 150, naturalWidth: 600, naturalHeight: 300 })
      expect(getContainedImageRect(img)).to.deep.equal({ x: 0, y: 0, width: 300, height: 150 })
    })
  })

  describe('getContainedImageRectRelativeTo', () => {
    it('should offset the rendered rect by the image element\'s position within the container', () => {
      const img = makeImageStub(
        { clientWidth: 200, clientHeight: 200, naturalWidth: 400, naturalHeight: 200 },
        { left: 60, top: 40, width: 200, height: 200 }
      )
      const container = { getBoundingClientRect: () => ({ left: 10, top: 10, width: 300, height: 300 }) }

      const rect = getContainedImageRectRelativeTo(img, container)

      // image element itself is offset (60-10, 40-10) = (50, 30) from the container,
      // plus the internal letterbox offset (0, 50) from getContainedImageRect
      expect(rect).to.deep.equal({ x: 50, y: 80, width: 200, height: 100 })
    })
  })
})
