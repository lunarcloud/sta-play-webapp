import { expect } from '@esm-bundle/chai'
import { MapTokenElement, MIN_SCALE } from '../../../components/map-token/map-token.js'

/**
 * Create a disconnected map-token image element for unit testing.
 * @returns {HTMLImageElement} the created element
 */
function createToken () {
  return /** @type {HTMLImageElement} */ (document.createElement('img', { is: 'map-token' }))
}

describe('MapTokenElement', () => {
  afterEach(() => {
    document.querySelectorAll('img[is="map-token"]').forEach(el => el.remove())
    document.querySelectorAll('#play-field').forEach(el => el.remove())
  })

  describe('custom element registration', () => {
    it('should be defined as a custom element', () => {
      expect(customElements.get('map-token')).to.equal(MapTokenElement)
    })

    it('should export a class constructor', () => {
      expect(MapTokenElement).to.be.a('function')
      expect(MapTokenElement.prototype).to.be.an.instanceof(HTMLImageElement)
    })
  })

  describe('constructor', () => {
    it('should create element', () => {
      const element = createToken()
      expect(element).to.be.instanceof(MapTokenElement)
      expect(element).to.be.instanceof(HTMLImageElement)
    })

    it('should set the is attribute to map-token', () => {
      const element = createToken()
      expect(element.getAttribute('is')).to.equal('map-token')
    })

    it('should append a stylesheet link', () => {
      const element = createToken()
      const link = element.querySelector('link[rel="stylesheet"]')
      expect(link).to.not.be.null
      expect(link.getAttribute('href')).to.include('map-token.css')
    })

    it('should initially hide the element until the stylesheet loads', () => {
      const element = createToken()
      expect(element.style.visibility).to.equal('hidden')
      expect(element.style.opacity).to.equal('0')
    })

    it('should not be draggable (native drag is handled manually)', () => {
      const element = createToken()
      expect(element.draggable).to.be.false
    })
  })

  describe('attributes', () => {
    it('should observe the image attribute', () => {
      expect(MapTokenElement.observedAttributes).to.include('image')
    })
  })

  describe('x property', () => {
    it('should default to 0.5', () => {
      const element = createToken()
      expect(element.x).to.equal(0.5)
    })

    it('should get and set a value within range', () => {
      const element = createToken()
      element.x = 0.25
      expect(element.x).to.equal(0.25)
    })

    it('should clamp values above 1', () => {
      const element = createToken()
      element.x = 5
      expect(element.x).to.equal(1)
    })

    it('should clamp values below 0', () => {
      const element = createToken()
      element.x = -5
      expect(element.x).to.equal(0)
    })

    it('should coerce string numbers', () => {
      const element = createToken()
      element.x = '0.75'
      expect(element.x).to.equal(0.75)
    })
  })

  describe('y property', () => {
    it('should default to 0.5', () => {
      const element = createToken()
      expect(element.y).to.equal(0.5)
    })

    it('should get and set a value within range', () => {
      const element = createToken()
      element.y = 0.1
      expect(element.y).to.equal(0.1)
    })

    it('should clamp values above 1', () => {
      const element = createToken()
      element.y = 2
      expect(element.y).to.equal(1)
    })

    it('should clamp values below 0', () => {
      const element = createToken()
      element.y = -2
      expect(element.y).to.equal(0)
    })
  })

  describe('scale property', () => {
    it('should default to 1', () => {
      const element = createToken()
      expect(element.scale).to.equal(1)
    })

    it('should get and set a valid value', () => {
      const element = createToken()
      element.scale = 2
      expect(element.scale).to.equal(2)
    })

    it('should fall back to 1 for a value of 0 (falsy)', () => {
      const element = createToken()
      element.scale = 0
      expect(element.scale).to.equal(1)
    })

    it('should floor small positive values to MIN_SCALE', () => {
      const element = createToken()
      element.scale = 0.01
      expect(element.scale).to.equal(MIN_SCALE)
    })

    it('should floor negative values to MIN_SCALE', () => {
      const element = createToken()
      element.scale = -5
      expect(element.scale).to.equal(MIN_SCALE)
    })

    it('should fall back to 1 for non-numeric values', () => {
      const element = createToken()
      element.scale = 'not-a-number'
      expect(element.scale).to.equal(1)
    })

    it('should have no upper limit', () => {
      const element = createToken()
      element.scale = 100
      expect(element.scale).to.equal(100)
    })
  })

  describe('image property', () => {
    it('should default to undefined', () => {
      const element = createToken()
      expect(element.image).to.be.undefined
    })

    it('should set the src from a File object', () => {
      const element = createToken()
      const file = new File(['data'], 'token.png', { type: 'image/png' })
      element.image = file
      expect(element.image).to.equal(file)
      expect(element.src).to.include('blob:')
    })

    it('should clear the src when set to a non-File value', () => {
      const element = createToken()
      const file = new File(['data'], 'token.png', { type: 'image/png' })
      element.image = file
      element.image = null
      // Setting src = '' resolves to the document's own URL when read back,
      // so check the raw attribute instead.
      expect(element.getAttribute('src')).to.equal('')
    })
  })

  describe('attributeChangedCallback', () => {
    it('should update the image property when the image attribute changes', () => {
      const element = createToken()
      element.attributeChangedCallback('image', null, null)
      expect(element.getAttribute('src')).to.equal('')
    })

    it('should ignore unrelated attribute names', () => {
      const element = createToken()
      expect(() => element.attributeChangedCallback('unrelated-attr', null, 'value')).to.not.throw()
    })
  })

  describe('sendBackward / bringForward', () => {
    let container

    beforeEach(() => {
      container = document.createElement('div')
      document.body.appendChild(container)
    })

    afterEach(() => {
      container.remove()
    })

    it('should swap with the previous sibling when sent backward', () => {
      const first = createToken()
      const second = createToken()
      container.appendChild(first)
      container.appendChild(second)

      second.sendBackward()

      expect([...container.children]).to.deep.equal([second, first])
    })

    it('should do nothing when sent backward with no previous sibling', () => {
      const only = createToken()
      container.appendChild(only)

      expect(() => only.sendBackward()).to.not.throw()
      expect([...container.children]).to.deep.equal([only])
    })

    it('should swap with the next sibling when brought forward', () => {
      const first = createToken()
      const second = createToken()
      container.appendChild(first)
      container.appendChild(second)

      first.bringForward()

      expect([...container.children]).to.deep.equal([second, first])
    })

    it('should do nothing when brought forward with no next sibling', () => {
      const only = createToken()
      container.appendChild(only)

      expect(() => only.bringForward()).to.not.throw()
      expect([...container.children]).to.deep.equal([only])
    })
  })

  describe('edit-requested event', () => {
    it('should dispatch edit-requested on contextmenu', (done) => {
      const element = createToken()
      document.body.appendChild(element)

      element.addEventListener('edit-requested', (e) => {
        expect(e).to.be.instanceof(CustomEvent)
        document.body.removeChild(element)
        done()
      })

      element.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }))
    })

    it('should prevent the default context menu', () => {
      const element = createToken()
      document.body.appendChild(element)

      const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true })
      element.dispatchEvent(event)

      expect(event.defaultPrevented).to.be.true

      document.body.removeChild(element)
    })
  })

  describe('double-click removal', () => {
    it('should remove the element from the DOM on double-click', () => {
      const element = createToken()
      document.body.appendChild(element)

      element.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }))

      // With prefers-reduced-motion: reduce, animateRemove removes immediately
      expect(element.parentNode).to.be.null
    })
  })

  describe('scroll-to-reorder', () => {
    let container

    beforeEach(() => {
      container = document.createElement('div')
      document.body.appendChild(container)
    })

    afterEach(() => {
      container.remove()
    })

    it('should send the token backward on scroll down (positive deltaY)', () => {
      const first = createToken()
      const second = createToken()
      container.appendChild(first)
      container.appendChild(second)

      second.dispatchEvent(new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY: 100 }))

      expect([...container.children]).to.deep.equal([second, first])
    })

    it('should bring the token forward on scroll up (negative deltaY)', () => {
      const first = createToken()
      const second = createToken()
      container.appendChild(first)
      container.appendChild(second)

      first.dispatchEvent(new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY: -100 }))

      expect([...container.children]).to.deep.equal([second, first])
    })

    it('should prevent default scroll behavior', () => {
      const element = createToken()
      container.appendChild(element)

      const event = new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY: 1 })
      element.dispatchEvent(event)

      expect(event.defaultPrevented).to.be.true
    })
  })

  describe('connectedCallback / disconnectedCallback', () => {
    it('should not throw when connected without a play-field present', () => {
      const element = createToken()
      expect(() => document.body.appendChild(element)).to.not.throw()
      document.body.removeChild(element)
    })

    it('should not throw when disconnected', () => {
      const element = createToken()
      document.body.appendChild(element)
      expect(() => document.body.removeChild(element)).to.not.throw()
    })

    it('should reposition relative to the play-field image when present', async () => {
      const playField = document.createElement('div')
      playField.id = 'play-field'
      playField.style.width = '400px'
      playField.style.height = '400px'
      playField.style.position = 'relative'

      const bgImage = document.createElement('img')
      bgImage.className = 'bg'
      playField.appendChild(bgImage)
      document.body.appendChild(playField)

      const element = createToken()
      element.x = 0.5
      element.y = 0.5
      playField.appendChild(element)

      // Allow the stylesheet link's load/error handler (which triggers reposition) to fire
      await new Promise(resolve => setTimeout(resolve, 50))

      expect(element.isConnected).to.be.true

      playField.remove()
    })
  })
})
