import { expect } from '@esm-bundle/chai'
import { SceneSwitcherElement } from '../../../components/scene-switcher/scene-switcher-element.js'

describe('SceneSwitcherElement', () => {
  describe('custom element registration', () => {
    it('should be defined as a custom element', () => {
      expect(customElements.get('scene-switcher')).to.equal(SceneSwitcherElement)
    })

    it('should be accessible via globalThis', () => {
      expect(globalThis.SceneSwitcherElement).to.equal(SceneSwitcherElement)
    })

    it('should extend HTMLDialogElement', () => {
      const element = document.createElement('dialog', { is: 'scene-switcher' })
      expect(element).to.be.instanceof(HTMLDialogElement)
    })
  })

  describe('constructor', () => {
    it('should create element with dialog structure', () => {
      const element = document.createElement('dialog', { is: 'scene-switcher' })
      expect(element).to.be.instanceof(HTMLDialogElement)
    })

    it('should have close buttons', () => {
      const element = document.createElement('dialog', { is: 'scene-switcher' })
      const closeButtons = element.querySelectorAll('button.close')
      expect(closeButtons.length).to.be.greaterThan(0)
    })

    it('should have add scene button', () => {
      const element = document.createElement('dialog', { is: 'scene-switcher' })
      const addButton = element.querySelector('.scene-action-btn')
      expect(addButton).to.not.be.null
      expect(addButton.textContent.trim()).to.equal('Add Scene')
    })

    it('should have scene list container', () => {
      const element = document.createElement('dialog', { is: 'scene-switcher' })
      const sceneList = element.querySelector('.scene-list')
      expect(sceneList).to.not.be.null
    })
  })

  describe('setScenes method', () => {
    it('should accept array of scenes', () => {
      const element = document.createElement('dialog', { is: 'scene-switcher' })
      const scenes = [
        { id: 1, name: 'Scene 1' },
        { id: 2, name: 'Scene 2' }
      ]

      expect(() => element.setScenes(scenes, 1)).to.not.throw()
    })

    it('should render scenes in the list', () => {
      const element = document.createElement('dialog', { is: 'scene-switcher' })
      const scenes = [
        { id: 1, name: 'Scene 1' },
        { id: 2, name: 'Scene 2' }
      ]

      element.setScenes(scenes, 1)
      const sceneItems = element.querySelectorAll('.scene-list li')
      expect(sceneItems.length).to.equal(2)
    })

    it('should mark current scene with .current class', () => {
      const element = document.createElement('dialog', { is: 'scene-switcher' })
      const scenes = [
        { id: 1, name: 'Scene 1' },
        { id: 2, name: 'Scene 2' }
      ]

      element.setScenes(scenes, 2)
      const activeScene = element.querySelector('.scene-list li.current')
      expect(activeScene).to.not.be.null
      expect(activeScene.textContent).to.include('Scene 2')
    })

    it('should handle empty scenes array', () => {
      const element = document.createElement('dialog', { is: 'scene-switcher' })

      expect(() => element.setScenes([], undefined)).to.not.throw()
      const sceneItems = element.querySelectorAll('.scene-list li')
      expect(sceneItems.length).to.equal(0)
    })
  })

  describe('callback methods', () => {
    it('should have onSceneSwitch method', () => {
      const element = document.createElement('dialog', { is: 'scene-switcher' })
      expect(element.onSceneSwitch).to.be.a('function')
    })

    it('should have onSceneAdd method', () => {
      const element = document.createElement('dialog', { is: 'scene-switcher' })
      expect(element.onSceneAdd).to.be.a('function')
    })

    it('should have onSceneRename method', () => {
      const element = document.createElement('dialog', { is: 'scene-switcher' })
      expect(element.onSceneRename).to.be.a('function')
    })

    it('should have onSceneDelete method', () => {
      const element = document.createElement('dialog', { is: 'scene-switcher' })
      expect(element.onSceneDelete).to.be.a('function')
    })

    it('should call callback when scene is clicked', (done) => {
      const element = document.createElement('dialog', { is: 'scene-switcher' })
      const scenes = [
        { id: 1, name: 'Scene 1' },
        { id: 2, name: 'Scene 2' }
      ]

      element.setScenes(scenes, 1)
      element.onSceneSwitch((sceneId) => {
        expect(sceneId).to.equal(2)
        done()
      })

      const sceneItems = element.querySelectorAll('.scene-list li')
      sceneItems[1].click()
    })
  })

  describe('scene actions', () => {
    it('should show action buttons for each scene', () => {
      const element = document.createElement('dialog', { is: 'scene-switcher' })
      const scenes = [
        { id: 1, name: 'Scene 1' },
        { id: 2, name: 'Scene 2' }
      ]

      element.setScenes(scenes, 1)
      const sceneActions = element.querySelectorAll('.scene-actions')
      expect(sceneActions.length).to.equal(2)
    })

    it('should have rename and delete buttons for each scene', () => {
      const element = document.createElement('dialog', { is: 'scene-switcher' })
      const scenes = [
        { id: 1, name: 'Scene 1' },
        { id: 2, name: 'Scene 2' }
      ]

      element.setScenes(scenes, 1)
      const firstSceneActions = element.querySelector('.scene-actions')
      const buttons = firstSceneActions.querySelectorAll('button')
      expect(buttons.length).to.equal(2)
      expect(buttons[0].textContent).to.equal('Rename')
      expect(buttons[1].textContent).to.equal('Delete')
    })
  })

  describe('integration', () => {
    it('should work when added to DOM', () => {
      const element = document.createElement('dialog', { is: 'scene-switcher' })
      document.body.appendChild(element)

      expect(element.parentNode).to.equal(document.body)

      document.body.removeChild(element)
    })

    it('should maintain scenes after DOM operations', () => {
      const element = document.createElement('dialog', { is: 'scene-switcher' })
      const scenes = [
        { id: 1, name: 'Scene 1' }
      ]

      element.setScenes(scenes, 1)
      document.body.appendChild(element)

      const sceneItems = element.querySelectorAll('.scene-list li')
      expect(sceneItems.length).to.equal(1)

      document.body.removeChild(element)
    })
  })
})
