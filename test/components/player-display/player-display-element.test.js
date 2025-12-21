import { expect } from '@esm-bundle/chai'
import { PlayerDisplayElement } from '../../../components/player-display/player-display-element.js'

describe('PlayerDisplayElement', () => {
  describe('custom element registration', () => {
    it('should be defined as a custom element', () => {
      expect(customElements.get('player-display')).to.equal(PlayerDisplayElement)
    })

    it('should be accessible via globalThis', () => {
      expect(globalThis.PlayerDisplayElement).to.equal(PlayerDisplayElement)
    })
  })

  describe('constructor', () => {
    it('should create element', () => {
      const element = document.createElement('li', { is: 'player-display' })
      expect(element).to.be.instanceof(PlayerDisplayElement)
      expect(element).to.be.instanceof(HTMLLIElement)
    })

    it('should initialize with default values', () => {
      const element = document.createElement('li', { is: 'player-display' })
      expect(element.name).to.be.a('string')
      expect(element.color).to.be.a('string')
      expect(element.rank).to.be.a('string')
    })
  })

  describe('attributes', () => {
    it('should observe all player attributes', () => {
      const observed = PlayerDisplayElement.observedAttributes
      expect(observed).to.include('player-index')
      expect(observed).to.include('name')
      expect(observed).to.include('color')
      expect(observed).to.include('rank')
      expect(observed).to.include('current-stress')
      expect(observed).to.include('max-stress')
    })
  })

  describe('properties', () => {
    it('should get and set playerIndex', () => {
      const element = document.createElement('li', { is: 'player-display' })
      element.playerIndex = 5
      expect(element.playerIndex).to.equal(5)
    })

    it('should get and set name', () => {
      const element = document.createElement('li', { is: 'player-display' })
      element.name = 'Jean-Luc Picard'
      expect(element.name).to.equal('Jean-Luc Picard')
    })

    it('should get and set color', () => {
      const element = document.createElement('li', { is: 'player-display' })
      element.color = 'red'
      expect(element.color).to.equal('red')
    })

    it('should get and set rank', () => {
      const element = document.createElement('li', { is: 'player-display' })
      element.rank = '⬤⬤⬤⬤' // Captain
      expect(element.rank).to.equal('⬤⬤⬤⬤')
    })

    it('should get and set currentStress', () => {
      const element = document.createElement('li', { is: 'player-display' })
      element.currentStress = 5
      expect(element.currentStress).to.equal(5)
    })

    it('should get and set maxStress', () => {
      const element = document.createElement('li', { is: 'player-display' })
      element.maxStress = 12
      expect(element.maxStress).to.equal(12)
    })
  })

  describe('structure', () => {
    it('should link CSS file', () => {
      const element = document.createElement('li', { is: 'player-display' })
      const link = element.querySelector('link[rel="stylesheet"]')
      expect(link).to.not.be.null
      expect(link.getAttribute('href')).to.include('player-display.css')
    })

    it('should have remove button', () => {
      const element = document.createElement('li', { is: 'player-display' })
      const button = element.querySelector('button.remove')
      expect(button).to.not.be.null
      expect(button.textContent).to.equal('⤫')
    })

    it('should have color select', () => {
      const element = document.createElement('li', { is: 'player-display' })
      const select = element.querySelector('select.color')
      expect(select).to.not.be.null
      expect(select.options.length).to.be.greaterThan(0)
    })

    it('should have rank display', () => {
      const element = document.createElement('li', { is: 'player-display' })
      const rankDisplay = element.querySelector('.rank')
      expect(rankDisplay).to.not.be.null

      const rankSelect = rankDisplay.querySelector('select')
      expect(rankSelect).to.not.be.null
    })

    it('should have stress elements', () => {
      const element = document.createElement('li', { is: 'player-display' })
      const stress = element.querySelector('stress')
      expect(stress).to.not.be.null

      const inputProgress = stress.querySelector('input-progress')
      expect(inputProgress).to.not.be.null

      const maxInput = stress.querySelector('input[type="number"]')
      expect(maxInput).to.not.be.null
    })

    it('should have name heading', () => {
      const element = document.createElement('li', { is: 'player-display' })
      const nameEl = element.querySelector('h2.name')
      expect(nameEl).to.not.be.null
      expect(nameEl.contentEditable).to.be.oneOf(['plaintext-only', 'true'])
    })

    it('should have portrait image', () => {
      const element = document.createElement('li', { is: 'player-display' })
      const portrait = element.querySelector('img.portrait')
      expect(portrait).to.not.be.null
    })

    it('should have top area container', () => {
      const element = document.createElement('li', { is: 'player-display' })
      const topArea = element.querySelector('.top-area')
      expect(topArea).to.not.be.null
    })
  })

  describe('removed event', () => {
    it('should dispatch removed event when remove button is clicked', (done) => {
      const element = document.createElement('li', { is: 'player-display' })
      document.body.appendChild(element)

      element.addEventListener('removed', (e) => {
        expect(e).to.be.instanceof(CustomEvent)
        done()
      })

      const removeButton = element.querySelector('button.remove')
      removeButton.click()
    })

    it('should remove element from DOM when remove button is clicked', () => {
      const element = document.createElement('li', { is: 'player-display' })
      document.body.appendChild(element)

      const removeButton = element.querySelector('button.remove')
      removeButton.click()

      expect(element.parentNode).to.be.null
    })
  })

  describe('attributeChangedCallback', () => {
    it('should update properties when attributes change', () => {
      const element = document.createElement('li', { is: 'player-display' })

      element.attributeChangedCallback('name', null, 'Spock')
      expect(element.name).to.equal('Spock')

      element.attributeChangedCallback('color', null, 'blue')
      expect(element.color).to.equal('blue')
    })
  })

  describe('integration', () => {
    it('should work when added to DOM with attributes', () => {
      const element = document.createElement('li', { is: 'player-display' })
      element.setAttribute('name', 'Data')
      element.setAttribute('color', 'yellow')
      document.body.appendChild(element)

      expect(element.name).to.equal('Data')
      expect(element.color).to.equal('yellow')

      document.body.removeChild(element)
    })

    it('should maintain values through DOM operations', () => {
      const element = document.createElement('li', { is: 'player-display' })
      element.name = 'Worf'
      element.color = 'red'
      element.currentStress = 7
      element.maxStress = 10

      document.body.appendChild(element)
      const nameBefore = element.name
      const colorBefore = element.color
      const stressBefore = element.currentStress
      const maxStressBefore = element.maxStress
      document.body.removeChild(element)

      document.body.appendChild(element)
      expect(element.name).to.equal(nameBefore)
      expect(element.color).to.equal(colorBefore)
      expect(element.currentStress).to.equal(stressBefore)
      expect(element.maxStress).to.equal(maxStressBefore)

      document.body.removeChild(element)
    })
  })
})
