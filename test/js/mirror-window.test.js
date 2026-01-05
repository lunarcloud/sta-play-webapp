import { expect } from '@esm-bundle/chai'
import { MirrorWindow } from '../../../js/mirror-window.js'

describe('mirror-window', () => {
  afterEach(() => {
    // Clean up any open mirror windows
    MirrorWindow.close()
  })

  describe('MirrorWindow class', () => {
    it('should export MirrorWindow class', async () => {
      const module = await import('../../../js/mirror-window.js')
      expect(module.MirrorWindow).to.be.a('function')
    })

    it('should have open static method', () => {
      expect(MirrorWindow.open).to.be.a('function')
    })

    it('should have close static method', () => {
      expect(MirrorWindow.close).to.be.a('function')
    })

    it('should have isOpen static method', () => {
      expect(MirrorWindow.isOpen).to.be.a('function')
    })
  })

  describe('isOpen', () => {
    it('should return false when no window is open initially', () => {
      expect(MirrorWindow.isOpen()).to.be.false
    })
  })

  describe('close', () => {
    it('should handle being called when no window is open', () => {
      expect(() => MirrorWindow.close()).to.not.throw()
    })

    it('should set isOpen to false', () => {
      MirrorWindow.close()
      expect(MirrorWindow.isOpen()).to.be.false
    })
  })
})
