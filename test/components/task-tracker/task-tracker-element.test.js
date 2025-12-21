import { expect } from '@esm-bundle/chai'
import { TaskTrackerElement } from '../../../components/task-tracker/task-tracker-element.js'

describe('TaskTrackerElement', () => {
  describe('custom element registration', () => {
    it('should be defined as a custom element', () => {
      expect(customElements.get('task-tracker')).to.equal(TaskTrackerElement)
    })

    it('should be accessible via globalThis', () => {
      expect(globalThis.TaskTrackerElement).to.equal(TaskTrackerElement)
    })
  })

  describe('constructor', () => {
    it('should create element', () => {
      const element = new TaskTrackerElement()
      expect(element).to.be.instanceof(TaskTrackerElement)
      expect(element).to.be.instanceof(HTMLElement)
    })

    it('should create shadow root', () => {
      const element = new TaskTrackerElement()
      expect(element.shadowRoot).to.not.be.null
    })

    it('should initialize with default values', () => {
      const element = new TaskTrackerElement()
      expect(element.name).to.be.a('string')
      expect(element.resistance).to.be.a('number')
      expect(element.complicationRange).to.be.a('number')
    })
  })

  describe('attributes', () => {
    it('should observe all task tracker attributes', () => {
      const observed = TaskTrackerElement.observedAttributes
      expect(observed).to.include('name')
      expect(observed).to.include('resistance')
      expect(observed).to.include('complication-range')
      expect(observed).to.include('attribute')
      expect(observed).to.include('department')
      expect(observed).to.include('ship-system')
      expect(observed).to.include('ship-department')
      expect(observed).to.include('progress')
      expect(observed).to.include('max-progress')
      expect(observed).to.include('breakthroughs')
      expect(observed).to.include('legacy-controls')
      expect(observed).to.include('manual-breakthroughs')
    })
  })

  describe('properties', () => {
    it('should get and set name', () => {
      const element = new TaskTrackerElement()
      element.name = 'Repair Warp Drive'
      expect(element.name).to.equal('Repair Warp Drive')
    })

    it('should get and set resistance', () => {
      const element = new TaskTrackerElement()
      element.resistance = 10
      expect(element.resistance).to.equal(10)
    })

    it('should get and set complicationRange', () => {
      const element = new TaskTrackerElement()
      element.complicationRange = 3
      expect(element.complicationRange).to.equal(3)
    })

    it('should get and set attribute', () => {
      const element = new TaskTrackerElement()
      element.attribute = 'Control'
      expect(element.attribute).to.equal('Control')
    })

    it('should get and set department', () => {
      const element = new TaskTrackerElement()
      element.department = 'Engineering'
      expect(element.department).to.equal('Engineering')
    })

    it('should get and set shipSystem', () => {
      const element = new TaskTrackerElement()
      element.shipSystem = 'Engines'
      expect(element.shipSystem).to.equal('Engines')
    })

    it('should get and set shipDepartment', () => {
      const element = new TaskTrackerElement()
      element.shipDepartment = 'Engineering'
      expect(element.shipDepartment).to.equal('Engineering')
    })

    it('should get and set progress', () => {
      const element = new TaskTrackerElement()
      element.progress = 5
      expect(element.progress).to.equal(5)
    })

    it('should get and set maxProgress', () => {
      const element = new TaskTrackerElement()
      element.maxProgress = 15
      expect(element.maxProgress).to.equal(15)
    })

    it('should get and set breakthroughs', () => {
      const element = new TaskTrackerElement()
      element.breakthroughs = 2
      expect(element.breakthroughs).to.equal(2)
    })
  })

  describe('shadow DOM structure', () => {
    it('should link CSS file', () => {
      const element = new TaskTrackerElement()
      const link = element.shadowRoot.querySelector('link[rel="stylesheet"]')
      expect(link).to.not.be.null
      expect(link.getAttribute('href')).to.include('task-tracker.css')
    })

    it('should have remove button', () => {
      const element = new TaskTrackerElement()
      const button = element.shadowRoot.querySelector('button.remove')
      expect(button).to.not.be.null
      expect(button.textContent).to.equal('⤫')
    })

    it('should have name element', () => {
      const element = new TaskTrackerElement()
      const nameEl = element.shadowRoot.querySelector('.name')
      expect(nameEl).to.not.be.null
    })

    it('should have resistance input', () => {
      const element = new TaskTrackerElement()
      const inputs = element.shadowRoot.querySelectorAll('input[type="number"]')
      expect(inputs.length).to.be.greaterThan(0)
    })

    it('should have complication range input', () => {
      const element = new TaskTrackerElement()
      const inputs = element.shadowRoot.querySelectorAll('input[type="number"]')
      expect(inputs.length).to.be.greaterThan(0)
    })

    it('should have attribute select', () => {
      const element = new TaskTrackerElement()
      const selects = element.shadowRoot.querySelectorAll('select')
      expect(selects.length).to.be.greaterThan(0)
    })

    it('should have department select', () => {
      const element = new TaskTrackerElement()
      const selects = element.shadowRoot.querySelectorAll('select')
      expect(selects.length).to.be.greaterThan(0)
    })

    it('should have progress visualization', () => {
      const element = new TaskTrackerElement()
      const progressViz = element.shadowRoot.querySelector('.progress-visual')
      expect(progressViz).to.not.be.null
    })
  })

  describe('removed event', () => {
    it('should dispatch removed event when remove button is clicked', (done) => {
      const element = new TaskTrackerElement()
      document.body.appendChild(element)

      element.addEventListener('removed', (e) => {
        expect(e).to.be.instanceof(CustomEvent)
        done()
      })

      const removeButton = element.shadowRoot.querySelector('button.remove')
      removeButton.click()
    })

    it('should remove element from DOM when remove button is clicked', () => {
      const element = new TaskTrackerElement()
      document.body.appendChild(element)

      const removeButton = element.shadowRoot.querySelector('button.remove')
      removeButton.click()

      expect(element.parentNode).to.be.null
    })
  })

  describe('attributeChangedCallback', () => {
    it('should update properties when attributes change', () => {
      const element = new TaskTrackerElement()
      
      element.attributeChangedCallback('name', null, 'Beam Cargo')
      expect(element.name).to.equal('Beam Cargo')
      
      element.attributeChangedCallback('resistance', null, '8')
      expect(element.resistance).to.equal(8)
    })
  })

  describe('integration', () => {
    it('should work when added to DOM with attributes', () => {
      const element = document.createElement('task-tracker')
      element.setAttribute('name', 'Scan Anomaly')
      element.setAttribute('resistance', '12')
      document.body.appendChild(element)
      
      expect(element.name).to.equal('Scan Anomaly')
      expect(element.resistance).to.equal(12)
      
      document.body.removeChild(element)
    })

    it('should maintain values through DOM operations', () => {
      const element = new TaskTrackerElement()
      element.name = 'Extended Task'
      element.resistance = 15
      element.progress = 7
      element.maxProgress = 15
      
      document.body.appendChild(element)
      const nameBefore = element.name
      const resistanceBefore = element.resistance
      const progressBefore = element.progress
      const maxProgressBefore = element.maxProgress
      document.body.removeChild(element)
      
      document.body.appendChild(element)
      expect(element.name).to.equal(nameBefore)
      expect(element.resistance).to.equal(resistanceBefore)
      expect(element.progress).to.equal(progressBefore)
      expect(element.maxProgress).to.equal(maxProgressBefore)
      
      document.body.removeChild(element)
    })
  })
})
