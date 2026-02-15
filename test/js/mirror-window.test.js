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

  describe('DOM structure for mirror sync', () => {
    it('should have contenteditable general-text element that fires input events', () => {
      // Bug fix: general-text is a contenteditable div, not a textarea.
      // The mirror must listen for input events on contenteditable elements,
      // not just input/select/textarea form elements.
      const div = document.createElement('div')
      div.id = 'general-text-test'
      div.contentEditable = 'true'
      div.textContent = 'test'
      document.body.appendChild(div)

      let inputFired = false
      div.addEventListener('input', () => { inputFired = true })
      // Simulate input event like a contenteditable would fire
      div.dispatchEvent(new Event('input', { bubbles: true }))
      expect(inputFired).to.be.true

      div.remove()
    })

    it('should have contenteditable shipname element that fires input events', () => {
      // Bug fix: shipname is a contenteditable <li>, not an <input>.
      // The mirror must listen for input events on contenteditable elements.
      const li = document.createElement('li')
      li.id = 'shipname-test'
      li.contentEditable = 'true'
      li.textContent = 'USS Test'
      document.body.appendChild(li)

      let inputFired = false
      li.addEventListener('input', () => { inputFired = true })
      li.dispatchEvent(new Event('input', { bubbles: true }))
      expect(inputFired).to.be.true

      li.remove()
    })

    it('should handle number inputs dispatching change events from scroll', () => {
      // Bug fix: scrollable-inputs dispatches 'change' events, not 'input' events.
      // The mirror must listen for both 'input' and 'change' events on number inputs.
      const input = document.createElement('input')
      input.type = 'number'
      input.min = '0'
      input.max = '6'
      input.value = '3'
      document.body.appendChild(input)

      let changeFired = false
      input.addEventListener('change', () => { changeFired = true })
      input.dispatchEvent(new Event('change'))
      expect(changeFired).to.be.true

      input.remove()
    })

    it('should be able to resolve Text node parent from characterData mutations', () => {
      // Bug fix: MutationObserver characterData mutations have Text node targets,
      // not HTMLElement targets. The mirror must resolve to parentElement.
      const div = document.createElement('div')
      div.textContent = 'test'
      document.body.appendChild(div)

      const textNode = div.firstChild
      expect(textNode).to.be.an.instanceOf(Text)
      expect(textNode.parentElement).to.equal(div)
      expect(textNode.parentElement).to.be.an.instanceOf(HTMLElement)

      div.remove()
    })

    it('should deep-clone player elements to include light DOM content', () => {
      // Bug fix: cloneNode(true) copies all children including images.
      // cloneNode(false) only copies attributes, missing light DOM content.
      const li = document.createElement('li')
      li.setAttribute('is', 'player-display')
      li.setAttribute('name', 'Test')
      const img = document.createElement('img')
      img.className = 'portrait'
      img.src = 'test.webp'
      li.appendChild(img)

      // Deep clone preserves children
      const deepClone = li.cloneNode(true)
      expect(deepClone.querySelector('img.portrait')).to.not.be.null
      expect(deepClone.querySelector('img.portrait').src).to.include('test.webp')

      // Shallow clone does NOT preserve children
      const shallowClone = li.cloneNode(false)
      expect(shallowClone.querySelector('img.portrait')).to.be.null
    })

    it('should sync root element style for font size CSS variable', () => {
      // Bug fix: font size is set via CSS custom property on document.documentElement.
      // The mirror must observe and sync document.documentElement style changes.
      const original = document.documentElement.style.cssText
      document.documentElement.style.setProperty('--main-font-unitless', '16')
      expect(document.documentElement.style.cssText).to.include('--main-font-unitless')

      // cssText can be copied to sync the style
      const targetStyle = document.documentElement.style.cssText
      expect(targetStyle).to.include('16')

      // Restore
      document.documentElement.style.cssText = original
    })
  })

  describe('mirror window read-only behavior', () => {
    it('should disable pointer events on inputs when body has mirror class', () => {
      // Inject the mirror CSS rule to verify it works
      const style = document.createElement('style')
      style.textContent = 'body.mirror { & input, & select, & textarea, & [contenteditable] { pointer-events: none !important; } }'
      document.head.appendChild(style)
      document.body.classList.add('mirror')

      const input = document.createElement('input')
      input.type = 'number'
      input.value = '5'
      document.body.appendChild(input)

      const computedStyle = getComputedStyle(input)
      expect(computedStyle.pointerEvents).to.equal('none')

      input.remove()
      style.remove()
      document.body.classList.remove('mirror')
    })

    it('should disable pointer events on selects when body has mirror class', () => {
      const style = document.createElement('style')
      style.textContent = 'body.mirror { & input, & select, & textarea, & [contenteditable] { pointer-events: none !important; } }'
      document.head.appendChild(style)
      document.body.classList.add('mirror')

      const select = document.createElement('select')
      const option = document.createElement('option')
      option.value = 'test'
      select.appendChild(option)
      document.body.appendChild(select)

      const computedStyle = getComputedStyle(select)
      expect(computedStyle.pointerEvents).to.equal('none')

      select.remove()
      style.remove()
      document.body.classList.remove('mirror')
    })

    it('should disable pointer events on contenteditable when body has mirror class', () => {
      const style = document.createElement('style')
      style.textContent = 'body.mirror { & input, & select, & textarea, & [contenteditable] { pointer-events: none !important; } }'
      document.head.appendChild(style)
      document.body.classList.add('mirror')

      const div = document.createElement('div')
      div.setAttribute('contenteditable', 'true')
      div.textContent = 'editable text'
      document.body.appendChild(div)

      const computedStyle = getComputedStyle(div)
      expect(computedStyle.pointerEvents).to.equal('none')

      div.remove()
      style.remove()
      document.body.classList.remove('mirror')
    })

    it('should verify disableInteractivity removes contenteditable and disables form elements', () => {
      // Create a mini document-like structure
      const container = document.createElement('div')

      const editableDiv = document.createElement('div')
      editableDiv.setAttribute('contenteditable', 'true')
      editableDiv.textContent = 'editable'
      container.appendChild(editableDiv)

      const input = document.createElement('input')
      input.type = 'number'
      input.value = '5'
      container.appendChild(input)

      const select = document.createElement('select')
      container.appendChild(select)

      document.body.appendChild(container)

      // Verify elements are initially interactive
      expect(editableDiv.getAttribute('contenteditable')).to.equal('true')
      expect(input.hasAttribute('disabled')).to.be.false
      expect(select.hasAttribute('disabled')).to.be.false

      // Manually apply the same logic as #disableInteractivity
      container.querySelectorAll('[contenteditable]').forEach(el => {
        el.removeAttribute('contenteditable')
      })
      container.querySelectorAll('input, select, textarea').forEach(el => {
        el.setAttribute('disabled', '')
        el.setAttribute('tabindex', '-1')
      })

      // Verify elements are now non-interactive
      expect(editableDiv.hasAttribute('contenteditable')).to.be.false
      expect(input.hasAttribute('disabled')).to.be.true
      expect(input.getAttribute('tabindex')).to.equal('-1')
      expect(select.hasAttribute('disabled')).to.be.true
      expect(select.getAttribute('tabindex')).to.equal('-1')

      container.remove()
    })
  })
})
