import { expect } from '@esm-bundle/chai'
import { animateClose } from '../../js/dialog-utils.js'

describe('Dialog Utils', () => {
  describe('animateClose', () => {
    let dialog

    beforeEach(() => {
      dialog = document.createElement('dialog')
      document.body.appendChild(dialog)
      dialog.showModal()
    })

    afterEach(() => {
      if (dialog && dialog.parentNode) {
        if (dialog.open) {
          dialog.close()
        }
        document.body.removeChild(dialog)
      }
    })

    it('should close dialog immediately with reduced motion preference', (done) => {
      // Create a mock matchMedia that returns true for reduced motion
      const originalMatchMedia = window.matchMedia
      window.matchMedia = (query) => ({
        matches: query.includes('prefers-reduced-motion'),
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => true
      })

      animateClose(dialog)

      // Dialog should close immediately
      setTimeout(() => {
        expect(dialog.open).to.be.false
        window.matchMedia = originalMatchMedia
        done()
      }, 50)
    })

    it('should add closing class when animations are enabled', () => {
      // Create a mock matchMedia that returns false for reduced motion
      const originalMatchMedia = window.matchMedia
      window.matchMedia = (query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => true
      })

      animateClose(dialog)

      // Closing class should be added immediately
      expect(dialog.classList.contains('closing')).to.be.true

      window.matchMedia = originalMatchMedia
    })

    it('should remove closing class and close dialog after animation duration', (done) => {
      // Create a mock matchMedia that returns false for reduced motion
      const originalMatchMedia = window.matchMedia
      window.matchMedia = (query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => true
      })

      animateClose(dialog)

      // Check immediately after calling
      expect(dialog.open).to.be.true
      expect(dialog.classList.contains('closing')).to.be.true

      // Wait for animation to complete (300ms + buffer)
      setTimeout(() => {
        expect(dialog.open).to.be.false
        expect(dialog.classList.contains('closing')).to.be.false
        window.matchMedia = originalMatchMedia
        done()
      }, 350)
    })

    it('should handle already closed dialog', () => {
      dialog.close()
      
      const originalMatchMedia = window.matchMedia
      window.matchMedia = (query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => true
      })

      // Should not throw error
      expect(() => animateClose(dialog)).to.not.throw()

      window.matchMedia = originalMatchMedia
    })
  })
})
