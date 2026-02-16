import { expect } from '@esm-bundle/chai'
import '../../../components/dice-dialog/dice-dialog-element.js'

describe('DiceDialogElement', () => {
  let dialog

  beforeEach(() => {
    dialog = document.createElement('dialog', { is: 'dice-dialog' })
    document.body.appendChild(dialog)
  })

  afterEach(() => {
    if (dialog && dialog.parentNode) {
      if (dialog.open) {
        dialog.close()
      }
      document.body.removeChild(dialog)
    }
  })

  describe('custom element registration', () => {
    it('should be defined as a custom element', () => {
      expect(customElements.get('dice-dialog')).to.equal(globalThis.DiceDialogElement)
    })

    it('should be accessible via globalThis', () => {
      expect(globalThis.DiceDialogElement).to.not.be.undefined
    })
  })

  describe('showModal method', () => {
    it('should show the dialog', () => {
      dialog.showModal()
      expect(dialog.open).to.be.true
    })
  })

  describe('close animation', () => {
    it('should close dialog when close button is clicked', (done) => {
      dialog.showModal()

      const closeButton = dialog.querySelector('button.close')
      closeButton.click()

      setTimeout(() => {
        expect(dialog.open).to.be.false
        done()
      }, 400)
    })
  })

  describe('structure', () => {
    it('should have header with title and close button', () => {
      const header = dialog.querySelector('header')
      expect(header).to.not.be.null
      expect(header.textContent).to.include('D20 Dice Roller')

      const closeButton = header.querySelector('button.close')
      expect(closeButton).to.not.be.null
    })

    it('should have main content area', () => {
      const main = dialog.querySelector('main')
      expect(main).to.not.be.null
    })

    it('should have footer with close button', () => {
      const footer = dialog.querySelector('footer')
      expect(footer).to.not.be.null

      const closeButton = footer.querySelector('button.close')
      expect(closeButton).to.not.be.null
    })

    it('should have dice count input defaulting to 2', () => {
      const input = dialog.querySelector('input.dice-count')
      expect(input).to.not.be.null
      expect(input.value).to.equal('2')
      expect(input.min).to.equal('1')
      expect(input.max).to.equal('5')
    })

    it('should have target number input defaulting to 10', () => {
      const input = dialog.querySelector('input.target-number')
      expect(input).to.not.be.null
      expect(input.value).to.equal('10')
    })

    it('should have focus range input defaulting to 1', () => {
      const input = dialog.querySelector('input.focus-range')
      expect(input).to.not.be.null
      expect(input.value).to.equal('1')
    })

    it('should have complication range input defaulting to 1', () => {
      const input = dialog.querySelector('input.complication-range')
      expect(input).to.not.be.null
      expect(input.value).to.equal('1')
    })

    it('should have a roll button', () => {
      const rollBtn = dialog.querySelector('button.roll-btn')
      expect(rollBtn).to.not.be.null
      expect(rollBtn.textContent).to.equal('Roll')
    })

    it('should have dice results area', () => {
      const results = dialog.querySelector('.dice-results')
      expect(results).to.not.be.null
    })

    it('should have dice summary area', () => {
      const summary = dialog.querySelector('.dice-summary')
      expect(summary).to.not.be.null
    })
  })

  describe('roll method', () => {
    it('should return an object with rolls, successes, and complications', () => {
      const result = dialog.roll()
      expect(result).to.have.property('rolls')
      expect(result).to.have.property('successes')
      expect(result).to.have.property('complications')
    })

    it('should roll the correct number of dice', () => {
      dialog.querySelector('input.dice-count').value = '3'
      const result = dialog.roll()
      expect(result.rolls).to.have.length(3)
    })

    it('should roll between 1 and 20 for each die', () => {
      dialog.querySelector('input.dice-count').value = '5'
      const result = dialog.roll()
      for (const roll of result.rolls) {
        expect(roll).to.be.at.least(1)
        expect(roll).to.be.at.most(20)
      }
    })

    it('should create die result elements in the results area', () => {
      dialog.querySelector('input.dice-count').value = '4'
      dialog.roll()
      const dieElements = dialog.querySelectorAll('.die-result')
      expect(dieElements.length).to.equal(4)
    })

    it('should display a summary after rolling', () => {
      dialog.roll()
      const summary = dialog.querySelector('.dice-summary')
      expect(summary.textContent).to.include('success')
    })

    it('should clear previous results on re-roll', () => {
      dialog.querySelector('input.dice-count').value = '3'
      dialog.roll()
      dialog.roll()
      const dieElements = dialog.querySelectorAll('.die-result')
      expect(dieElements.length).to.equal(3)
    })

    it('should add success class for rolls at or under target number', () => {
      dialog.querySelector('input.dice-count').value = '5'
      dialog.querySelector('input.target-number').value = '20'
      dialog.querySelector('input.focus-range').value = '0'
      dialog.roll()
      const dieElements = dialog.querySelectorAll('.die-result')
      for (const el of dieElements) {
        // All rolls 1-20 should be marked as success (or critical for 1)
        const hasSuccess = el.classList.contains('success') || el.classList.contains('critical')
        expect(hasSuccess).to.be.true
      }
    })

    it('should mark rolls of 1 as critical successes', () => {
      // With focus range of 1 (default), roll of 1 should always be critical
      dialog.querySelector('input.dice-count').value = '5'
      dialog.querySelector('input.focus-range').value = '1'
      dialog.roll()
      const dieElements = dialog.querySelectorAll('.die-result')
      for (const el of dieElements) {
        if (el.textContent === '1') {
          expect(el.classList.contains('critical')).to.be.true
        }
      }
    })

    it('should mark rolls of 20 as complications with default complication range', () => {
      dialog.querySelector('input.dice-count').value = '5'
      dialog.querySelector('input.complication-range').value = '1'
      dialog.roll()
      const dieElements = dialog.querySelectorAll('.die-result')
      for (const el of dieElements) {
        if (el.textContent === '20') {
          expect(el.classList.contains('complication')).to.be.true
        }
      }
    })

    it('should handle complication range of 2 (marking 19 and 20)', () => {
      dialog.querySelector('input.dice-count').value = '5'
      dialog.querySelector('input.complication-range').value = '2'
      dialog.roll()
      const dieElements = dialog.querySelectorAll('.die-result')
      for (const el of dieElements) {
        const value = parseInt(el.textContent)
        if (value >= 19) {
          expect(el.classList.contains('complication')).to.be.true
        }
      }
    })

    it('should count successes correctly with target number', () => {
      const numDice = 5
      dialog.querySelector('input.dice-count').value = String(numDice)
      dialog.querySelector('input.target-number').value = '20'
      dialog.querySelector('input.focus-range').value = '0'
      const result = dialog.roll()
      // With target 20 and focus 0, all dice are successes (at least 1 each)
      // Rolls of 1 are always critical (2 successes), so total >= numDice
      expect(result.successes).to.be.at.least(numDice)
    })

    it('should handle roll button click', () => {
      const rollBtn = dialog.querySelector('button.roll-btn')
      rollBtn.click()
      const dieElements = dialog.querySelectorAll('.die-result')
      expect(dieElements.length).to.be.at.least(1)
    })
  })
})
