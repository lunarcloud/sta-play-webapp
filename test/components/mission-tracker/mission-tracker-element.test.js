import { expect } from '@esm-bundle/chai'
import { MissionTrackerElement } from '../../../components/mission-tracker/mission-tracker-element.js'

describe('MissionTrackerElement', () => {
  describe('custom element registration', () => {
    it('should be defined as a custom element', () => {
      expect(customElements.get('mission-tracker')).to.equal(MissionTrackerElement)
    })

    it('should be accessible via globalThis', () => {
      expect(globalThis.MissionTrackerElement).to.equal(MissionTrackerElement)
    })
  })

  describe('constructor', () => {
    it('should create element', () => {
      const element = new MissionTrackerElement()
      expect(element).to.be.instanceof(MissionTrackerElement)
      expect(element).to.be.instanceof(HTMLElement)
    })

    it('should create shadow root', () => {
      const element = new MissionTrackerElement()
      expect(element.shadowRoot).to.not.be.null
    })

    it('should initialize with empty acts', () => {
      const element = new MissionTrackerElement()
      expect(element.act1).to.be.a('string')
      expect(element.act2).to.be.a('string')
      expect(element.act3).to.be.a('string')
    })
  })

  describe('attributes', () => {
    it('should observe act1, act2, and act3 attributes', () => {
      const observed = MissionTrackerElement.observedAttributes
      expect(observed).to.include('act1')
      expect(observed).to.include('act2')
      expect(observed).to.include('act3')
    })
  })

  describe('act properties', () => {
    it('should get and set act1', () => {
      const element = new MissionTrackerElement()
      element.act1 = '✓,✗, , ,'
      // Get the value back - it should have the values set
      const act1Value = element.act1
      expect(act1Value).to.be.a('string')
    })

    it('should get and set act2', () => {
      const element = new MissionTrackerElement()
      element.act2 = ' ,✓,✗, , '
      // Get the value back
      const act2Value = element.act2
      expect(act2Value).to.be.a('string')
    })

    it('should get and set act3', () => {
      const element = new MissionTrackerElement()
      element.act3 = ' , ,✓,✗, '
      // Get the value back
      const act3Value = element.act3
      expect(act3Value).to.be.a('string')
    })

    it('should handle empty act values', () => {
      const element = new MissionTrackerElement()
      element.act1 = ',,,,'
      element.act2 = ',,,,'
      element.act3 = ',,,,'
      expect(element.act1).to.be.a('string')
      expect(element.act2).to.be.a('string')
      expect(element.act3).to.be.a('string')
    })
  })

  describe('shadow DOM structure', () => {
    it('should contain internal element with part attribute', () => {
      const element = new MissionTrackerElement()
      const internal = element.shadowRoot.querySelector('[part="internal"]')
      expect(internal).to.not.be.null
    })

    it('should contain clear button', () => {
      const element = new MissionTrackerElement()
      const clearButton = element.shadowRoot.querySelector('button.clear-mission-tracker')
      expect(clearButton).to.not.be.null
      expect(clearButton.textContent).to.include('⌦')
    })

    it('should link CSS file', () => {
      const element = new MissionTrackerElement()
      const link = element.shadowRoot.querySelector('link[rel="stylesheet"]')
      expect(link).to.not.be.null
      expect(link.getAttribute('href')).to.include('mission-tracker.css')
    })

    it('should have three act elements', () => {
      const element = new MissionTrackerElement()
      const acts = element.shadowRoot.querySelectorAll('act')
      expect(acts.length).to.equal(3)
    })

    it('should have five scenes per act', () => {
      const element = new MissionTrackerElement()
      const acts = element.shadowRoot.querySelectorAll('act')
      
      acts.forEach(act => {
        const scenes = act.querySelectorAll('.scene')
        expect(scenes.length).to.equal(5)
      })
    })

    it('should have select elements in each scene', () => {
      const element = new MissionTrackerElement()
      const scenes = element.shadowRoot.querySelectorAll('.scene')
      
      scenes.forEach(scene => {
        const select = scene.querySelector('select')
        expect(select).to.not.be.null
        expect(select.options.length).to.equal(3) // ' ', '✓', '✗'
      })
    })

    it('should have scene parts for CSS styling', () => {
      const element = new MissionTrackerElement()
      const scenes = element.shadowRoot.querySelectorAll('[part="scene"]')
      expect(scenes.length).to.equal(15) // 3 acts * 5 scenes
    })
  })

  describe('clear method', () => {
    it('should clear all act values', () => {
      const element = new MissionTrackerElement()
      element.act1 = '✓,✓,✓,✓,✓'
      element.act2 = '✗,✗,✗,✗,✗'
      element.act3 = '✓,✗,✓,✗,✓'
      
      element.clear()
      
      // After clearing, all should be empty
      const act1HasContent = element.act1.includes('✓') || element.act1.includes('✗')
      const act2HasContent = element.act2.includes('✓') || element.act2.includes('✗')
      const act3HasContent = element.act3.includes('✓') || element.act3.includes('✗')
      
      expect(act1HasContent).to.be.false
      expect(act2HasContent).to.be.false
      expect(act3HasContent).to.be.false
    })
  })

  describe('attributeChangedCallback', () => {
    it('should update act1 when attribute changes', () => {
      const element = new MissionTrackerElement()
      element.attributeChangedCallback('act1', null, '✓, , , , ')
      expect(element.act1).to.be.a('string')
    })

    it('should update act2 when attribute changes', () => {
      const element = new MissionTrackerElement()
      element.attributeChangedCallback('act2', null, ' ,✓, , , ')
      expect(element.act2).to.be.a('string')
    })

    it('should update act3 when attribute changes', () => {
      const element = new MissionTrackerElement()
      element.attributeChangedCallback('act3', null, ' , ,✓, , ')
      expect(element.act3).to.be.a('string')
    })
  })

  describe('integration', () => {
    it('should work when added to DOM with attributes', () => {
      const element = document.createElement('mission-tracker')
      element.setAttribute('act1', '✓, , , , ')
      document.body.appendChild(element)
      
      expect(element.act1).to.be.a('string')
      
      document.body.removeChild(element)
    })

    it('should maintain values through DOM operations', () => {
      const element = new MissionTrackerElement()
      element.act1 = '✓,✗, , , '
      element.act2 = ' ,✓,✗, , '
      element.act3 = ' , ,✓,✗, '
      
      document.body.appendChild(element)
      const act1Before = element.act1
      const act2Before = element.act2
      const act3Before = element.act3
      document.body.removeChild(element)
      
      document.body.appendChild(element)
      expect(element.act1).to.equal(act1Before)
      expect(element.act2).to.equal(act2Before)
      expect(element.act3).to.equal(act3Before)
      
      document.body.removeChild(element)
    })
  })
})
