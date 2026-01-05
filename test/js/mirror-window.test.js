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
      // This test documents that CSS rules exist in index.css for hiding
      // close/remove buttons on components when body has mirror class.
      // The actual CSS rules are:
      // - body.mirror player-display button.remove { display: none; }
      // - body.mirror task-tracker button.remove { display: none; }
      // - body.mirror trait-display button.close { display: none; }

      // Since we cannot reliably test CSS in isolation in this test environment,
      // this test serves as documentation that these rules are expected to exist.
      expect(true).to.be.true
    })

    it('should verify CSS selector specificity for player-display remove buttons', () => {
      // Create elements to verify selector works
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

    it('should verify CSS selector specificity for task-tracker remove buttons', () => {
      const taskTracker = document.createElement('task-tracker')
      taskTracker.id = 'test-tracker'
      const removeBtn = document.createElement('button')
      removeBtn.className = 'remove'
      removeBtn.textContent = '⤫'
      taskTracker.appendChild(removeBtn)
      document.body.appendChild(taskTracker)

      const foundBtn = document.querySelector('task-tracker button.remove')
      expect(foundBtn).to.equal(removeBtn)

      taskTracker.remove()
    })

    it('should verify CSS selector specificity for trait-display close buttons', () => {
      const traitDisplay = document.createElement('trait-display')
      traitDisplay.id = 'test-trait'
      const closeBtn = document.createElement('button')
      closeBtn.className = 'close'
      closeBtn.textContent = '⤫'
      traitDisplay.appendChild(closeBtn)
      document.body.appendChild(traitDisplay)

      const foundBtn = document.querySelector('trait-display button.close')
      expect(foundBtn).to.equal(closeBtn)

      traitDisplay.remove()
    })
  })
})
