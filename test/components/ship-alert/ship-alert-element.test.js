import { expect } from '@esm-bundle/chai'
import { ShipAlertElement } from '../../../components/ship-alert/ship-alert-element.js'

describe('ShipAlertElement', () => {
  describe('custom element registration', () => {
    it('should be defined as a custom element', () => {
      expect(customElements.get('ship-alert')).to.equal(ShipAlertElement)
    })

    it('should be accessible via globalThis', () => {
      expect(globalThis.ShipAlertElement).to.equal(ShipAlertElement)
    })
  })

  describe('Colors constant', () => {
    it('should define alert colors', () => {
      expect(ShipAlertElement.Colors).to.be.an('array')
      expect(ShipAlertElement.Colors.length).to.be.greaterThan(0)
    })

    it('should have Yellow alert', () => {
      const yellow = ShipAlertElement.Colors.find(c => c.name === 'Yellow')
      expect(yellow).to.not.be.undefined
      expect(yellow.description).to.equal('caution')
    })

    it('should have Red alert', () => {
      const red = ShipAlertElement.Colors.find(c => c.name === 'Red')
      expect(red).to.not.be.undefined
      expect(red.description).to.equal('battle stations')
    })

    it('should have Blue alert', () => {
      const blue = ShipAlertElement.Colors.find(c => c.name === 'Blue')
      expect(blue).to.not.be.undefined
      expect(blue.description).to.equal('ship landing')
    })

    it('should have Grey alert', () => {
      const grey = ShipAlertElement.Colors.find(c => c.name === 'Grey')
      expect(grey).to.not.be.undefined
      expect(grey.description).to.equal('low or reserve power')
    })

    it('should have Black alert', () => {
      const black = ShipAlertElement.Colors.find(c => c.name === 'Black')
      expect(black).to.not.be.undefined
      expect(black.description).to.equal('top-secret action')
    })

    it('should have Cloak alert', () => {
      const cloak = ShipAlertElement.Colors.find(c => c.name === 'Cloak')
      expect(cloak).to.not.be.undefined
      expect(cloak.description).to.equal('cloaking device active')
    })
  })

  describe('constructor', () => {
    it('should create element', () => {
      const element = new ShipAlertElement()
      expect(element).to.be.instanceof(ShipAlertElement)
      expect(element).to.be.instanceof(HTMLElement)
    })

    it('should create shadow root', () => {
      const element = new ShipAlertElement()
      expect(element.shadowRoot).to.not.be.null
    })

    it('should initialize without color attribute', () => {
      const element = new ShipAlertElement()
      expect(element.color).to.equal('hidden')
    })

    it('should initialize with color attribute', () => {
      const element = new ShipAlertElement()
      element.setAttribute('color', 'red')
      document.body.appendChild(element)
      expect(element.color).to.equal('red')
      document.body.removeChild(element)
    })
  })

  describe('attributes', () => {
    it('should observe color attribute', () => {
      const observed = ShipAlertElement.observedAttributes
      expect(observed).to.include('color')
    })
  })

  describe('color property', () => {
    it('should get and set color', () => {
      const element = new ShipAlertElement()
      element.color = 'Red'
      expect(element.color).to.equal('red')
    })

    it('should handle lowercase color names', () => {
      const element = new ShipAlertElement()
      element.color = 'yellow'
      expect(element.color).to.equal('yellow')
    })

    it('should handle uppercase color names', () => {
      const element = new ShipAlertElement()
      element.color = 'BLUE'
      expect(element.color).to.equal('blue')
    })

    it('should handle mixed case color names', () => {
      const element = new ShipAlertElement()
      element.color = 'ReD'
      expect(element.color).to.equal('red')
    })

    it('should reject invalid color names', () => {
      const element = new ShipAlertElement()
      element.color = 'red'
      const initialColor = element.color
      element.color = 'invalid-color'
      expect(element.color).to.equal(initialColor)
    })

    it('should accept null/undefined to set hidden', () => {
      const element = new ShipAlertElement()
      element.color = 'red'
      element.color = null
      expect(element.color).to.equal('hidden')
    })
  })

  describe('shadow DOM structure', () => {
    it('should contain alert title', () => {
      const element = new ShipAlertElement()
      const h1 = element.shadowRoot.querySelector('h1')
      expect(h1).to.not.be.null
      expect(h1.textContent).to.equal('ALERT')
    })

    it('should contain condition text area', () => {
      const element = new ShipAlertElement()
      const p = element.shadowRoot.querySelector('p')
      expect(p).to.not.be.null
    })

    it('should link CSS file', () => {
      const element = new ShipAlertElement()
      const link = element.shadowRoot.querySelector('link[rel="stylesheet"]')
      expect(link).to.not.be.null
      expect(link.getAttribute('href')).to.include('ship-alert.css')
    })

    it('should have internal element with part attribute', () => {
      const element = new ShipAlertElement()
      const internal = element.shadowRoot.querySelector('[part="internal"]')
      expect(internal).to.not.be.null
    })
  })

  describe('color display', () => {
    it('should display RED when color is red', () => {
      const element = new ShipAlertElement()
      element.color = 'red'
      const colorSpan = element.shadowRoot.querySelector('p span:last-child')
      expect(colorSpan.textContent).to.equal('RED')
    })

    it('should display YELLOW when color is yellow', () => {
      const element = new ShipAlertElement()
      element.color = 'yellow'
      const colorSpan = element.shadowRoot.querySelector('p span:last-child')
      expect(colorSpan.textContent).to.equal('YELLOW')
    })

    it('should display BLUE when color is blue', () => {
      const element = new ShipAlertElement()
      element.color = 'blue'
      const colorSpan = element.shadowRoot.querySelector('p span:last-child')
      expect(colorSpan.textContent).to.equal('BLUE')
    })

    it('should display GREY MODE when color is grey', () => {
      const element = new ShipAlertElement()
      element.color = 'grey'
      const colorSpan = element.shadowRoot.querySelector('p span:last-child')
      expect(colorSpan.textContent).to.equal('GREY MODE')
    })

    it('should display CLOAK ACTIVE when color is cloak', () => {
      const element = new ShipAlertElement()
      element.color = 'cloak'
      const colorSpan = element.shadowRoot.querySelector('p span:last-child')
      expect(colorSpan.textContent).to.equal('CLOAK ACTIVE')
    })

    it('should display BLACK when color is black', () => {
      const element = new ShipAlertElement()
      element.color = 'black'
      const colorSpan = element.shadowRoot.querySelector('p span:last-child')
      expect(colorSpan.textContent).to.equal('BLACK')
    })

    it('should display HIDDEN when color is null', () => {
      const element = new ShipAlertElement()
      element.color = null
      const colorSpan = element.shadowRoot.querySelector('p span:last-child')
      expect(colorSpan.textContent).to.equal('HIDDEN')
    })
  })

  describe('condition text visibility', () => {
    it('should hide condition text for grey mode', () => {
      const element = new ShipAlertElement()
      element.color = 'grey'
      const conditionText = element.shadowRoot.querySelector('p span:first-child')
      expect(conditionText.hidden).to.be.true
    })

    it('should hide condition text for cloak mode', () => {
      const element = new ShipAlertElement()
      element.color = 'cloak'
      const conditionText = element.shadowRoot.querySelector('p span:first-child')
      expect(conditionText.hidden).to.be.true
    })

    it('should show condition text for red alert', () => {
      const element = new ShipAlertElement()
      element.color = 'red'
      const conditionText = element.shadowRoot.querySelector('p span:first-child')
      expect(conditionText.hidden).to.be.false
    })

    it('should show condition text for yellow alert', () => {
      const element = new ShipAlertElement()
      element.color = 'yellow'
      const conditionText = element.shadowRoot.querySelector('p span:first-child')
      expect(conditionText.hidden).to.be.false
    })
  })

  describe('attribute synchronization', () => {
    it('should update attribute when color property is set', () => {
      const element = new ShipAlertElement()
      element.setAttribute('color', 'red')
      element.color = 'blue'
      expect(element.getAttribute('color')).to.equal('blue')
    })

    it('should create attribute when property is set', () => {
      const element = new ShipAlertElement()
      element.color = 'red'
      expect(element.hasAttribute('color')).to.be.true
      expect(element.getAttribute('color')).to.equal('red')
    })
  })

  describe('attributeChangedCallback', () => {
    it('should not update if old and new values are the same', () => {
      const element = new ShipAlertElement()
      element.color = 'red'
      const initialColor = element.color
      element.attributeChangedCallback('color', 'red', 'red')
      expect(element.color).to.equal(initialColor)
    })

    it('should update color when attribute changes', () => {
      const element = new ShipAlertElement()
      element.attributeChangedCallback('color', null, 'yellow')
      expect(element.color).to.equal('yellow')
    })
  })
})
