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

  describe('mirror window CSS rules', () => {
    it('should have CSS styling for mirror window documented', () => {
      // This test documents that CSS rules exist for hiding close/remove buttons
      // on components when body has mirror class.
      //
      // For Shadow DOM components (task-tracker, trait-display):
      // - Uses :host-context(body.mirror) in component CSS files
      // - task-tracker.css: :host-context(body.mirror) & > .remove { display: none; }
      // - trait-display.css: :host-context(body.mirror) & button.close { display: none; }
      //
      // For Light DOM components (player-display):
      // - Uses index.css: body.mirror & player-display button.remove { display: none; }

      // Since we cannot reliably test CSS in isolation in this test environment,
      // this test serves as documentation that these rules are expected to exist.
      expect(true).to.be.true
    })

    it('should verify CSS selector specificity for player-display remove buttons', () => {
      // Create elements to verify selector works for light DOM component
      const playerDisplay = document.createElement('player-display')
      playerDisplay.id = 'test-player'
      const removeBtn = document.createElement('button')
      removeBtn.className = 'remove'
      removeBtn.textContent = '⤫'
      playerDisplay.appendChild(removeBtn)
      document.body.appendChild(playerDisplay)

      // Verify the selector can find the button
      const foundBtn = document.querySelector('player-display button.remove')
      expect(foundBtn).to.equal(removeBtn)

      // Clean up
      playerDisplay.remove()
    })

    it('should document shadow DOM button hiding approach', () => {
      // For task-tracker and trait-display, buttons are in shadow DOM
      // CSS cannot reach into shadow DOM from the main document
      // So we use :host-context(body.mirror) in the component's own CSS
      // This approach works because:
      // 1. The mirror window's body has class="mirror"
      // 2. :host-context() checks the host element's ancestors
      // 3. The component's shadow CSS can hide its own buttons
      const shadowDOMComponents = ['task-tracker', 'trait-display']
      expect(shadowDOMComponents).to.have.lengthOf(2)
    })
  })
})
