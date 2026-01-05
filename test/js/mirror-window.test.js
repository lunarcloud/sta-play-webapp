import { expect } from '@esm-bundle/chai'
import { isMirrorWindowOpen, closeMirrorWindow } from '../../../js/mirror-window.js'

describe('mirror-window', () => {
  afterEach(() => {
    // Clean up any open mirror windows
    closeMirrorWindow()
  })

  describe('module exports', () => {
    it('should export openMirrorWindow function', async () => {
      const module = await import('../../../js/mirror-window.js')
      expect(module.openMirrorWindow).to.be.a('function')
    })

    it('should export closeMirrorWindow function', async () => {
      const module = await import('../../../js/mirror-window.js')
      expect(module.closeMirrorWindow).to.be.a('function')
    })

    it('should export isMirrorWindowOpen function', async () => {
      const module = await import('../../../js/mirror-window.js')
      expect(module.isMirrorWindowOpen).to.be.a('function')
    })
  })

  describe('isMirrorWindowOpen', () => {
    it('should return false when no window is open initially', () => {
      expect(isMirrorWindowOpen()).to.be.false
    })
  })

  describe('closeMirrorWindow', () => {
    it('should handle being called when no window is open', () => {
      expect(() => closeMirrorWindow()).to.not.throw()
    })

    it('should set isMirrorWindowOpen to false', () => {
      closeMirrorWindow()
      expect(isMirrorWindowOpen()).to.be.false
    })
  })
})
