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
      const addButton = element.querySelector('button#add-scene')
      expect(addButton).to.not.be.null
      expect(addButton.textContent.trim()).to.equal('Add Scene')
    })

    it('should have scene list container', () => {
      const element = document.createElement('dialog', { is: 'scene-switcher' })
      const sceneList = element.querySelector('#scene-list')
      expect(sceneList).to.not.be.null
    })
  })

  describe('loadScenes method', () => {
    it('should accept array of scenes', () => {
      const element = document.createElement('dialog', { is: 'scene-switcher' })
      const scenes = [
        { id: 1, name: 'Scene 1' },
        { id: 2, name: 'Scene 2' }
      ]
      
      expect(() => element.loadScenes(scenes, 1)).to.not.throw()
    })

    it('should render scenes in the list', () => {
      const element = document.createElement('dialog', { is: 'scene-switcher' })
      const scenes = [
        { id: 1, name: 'Scene 1' },
        { id: 2, name: 'Scene 2' }
      ]
      
      element.loadScenes(scenes, 1)
      const sceneItems = element.querySelectorAll('.scene-item')
      expect(sceneItems.length).to.equal(2)
    })

    it('should mark current scene as active', () => {
      const element = document.createElement('dialog', { is: 'scene-switcher' })
      const scenes = [
        { id: 1, name: 'Scene 1' },
        { id: 2, name: 'Scene 2' }
      ]
      
      element.loadScenes(scenes, 2)
      const activeScene = element.querySelector('.scene-item.active')
      expect(activeScene).to.not.be.null
      expect(activeScene.textContent).to.include('Scene 2')
    })

    it('should handle empty scenes array', () => {
      const element = document.createElement('dialog', { is: 'scene-switcher' })
      
      expect(() => element.loadScenes([], undefined)).to.not.throw()
      const sceneItems = element.querySelectorAll('.scene-item')
      expect(sceneItems.length).to.equal(0)
    })
  })

  describe('callbacks', () => {
    it('should have onSceneSwitch callback property', () => {
      const element = document.createElement('dialog', { is: 'scene-switcher' })
      expect(element).to.have.property('onSceneSwitch')
    })

    it('should have onSceneAdd callback property', () => {
      const element = document.createElement('dialog', { is: 'scene-switcher' })
      expect(element).to.have.property('onSceneAdd')
    })

    it('should have onSceneRename callback property', () => {
      const element = document.createElement('dialog', { is: 'scene-switcher' })
      expect(element).to.have.property('onSceneRename')
    })

    it('should have onSceneDelete callback property', () => {
      const element = document.createElement('dialog', { is: 'scene-switcher' })
      expect(element).to.have.property('onSceneDelete')
    })

    it('should call onSceneSwitch when scene is clicked', (done) => {
      const element = document.createElement('dialog', { is: 'scene-switcher' })
      const scenes = [
        { id: 1, name: 'Scene 1' },
        { id: 2, name: 'Scene 2' }
      ]
      
      element.loadScenes(scenes, 1)
      element.onSceneSwitch = (sceneId) => {
        expect(sceneId).to.equal(2)
        done()
      }
      
      const sceneItems = element.querySelectorAll('.scene-item')
      sceneItems[1].click()
    })

    it('should call onSceneAdd when add button is clicked', (done) => {
      const element = document.createElement('dialog', { is: 'scene-switcher' })
      
      element.onSceneAdd = () => {
        done()
      }
      
      const addButton = element.querySelector('#add-scene')
      addButton.click()
    })
  })

  describe('delete scene functionality', () => {
    it('should show delete button for each scene', () => {
      const element = document.createElement('dialog', { is: 'scene-switcher' })
      const scenes = [
        { id: 1, name: 'Scene 1' },
        { id: 2, name: 'Scene 2' }
      ]
      
      element.loadScenes(scenes, 1)
      const deleteButtons = element.querySelectorAll('.delete-scene')
      expect(deleteButtons.length).to.equal(2)
    })

    it('should disable delete button when only one scene exists', () => {
      const element = document.createElement('dialog', { is: 'scene-switcher' })
      const scenes = [
        { id: 1, name: 'Scene 1' }
      ]
      
      element.loadScenes(scenes, 1)
      const deleteButton = element.querySelector('.delete-scene')
      expect(deleteButton.disabled).to.be.true
    })

    it('should enable delete buttons when multiple scenes exist', () => {
      const element = document.createElement('dialog', { is: 'scene-switcher' })
      const scenes = [
        { id: 1, name: 'Scene 1' },
        { id: 2, name: 'Scene 2' }
      ]
      
      element.loadScenes(scenes, 1)
      const deleteButtons = element.querySelectorAll('.delete-scene')
      deleteButtons.forEach(button => {
        expect(button.disabled).to.be.false
      })
    })
  })

  describe('rename scene functionality', () => {
    it('should show rename button for each scene', () => {
      const element = document.createElement('dialog', { is: 'scene-switcher' })
      const scenes = [
        { id: 1, name: 'Scene 1' },
        { id: 2, name: 'Scene 2' }
      ]
      
      element.loadScenes(scenes, 1)
      const renameButtons = element.querySelectorAll('.rename-scene')
      expect(renameButtons.length).to.equal(2)
    })

    it('should call onSceneRename with correct scene id', (done) => {
      const element = document.createElement('dialog', { is: 'scene-switcher' })
      const scenes = [
        { id: 1, name: 'Scene 1' },
        { id: 2, name: 'Scene 2' }
      ]
      
      element.loadScenes(scenes, 1)
      element.onSceneRename = (sceneId) => {
        expect(sceneId).to.equal(1)
        done()
      }
      
      const renameButton = element.querySelector('.rename-scene')
      renameButton.click()
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
      
      element.loadScenes(scenes, 1)
      document.body.appendChild(element)
      
      const sceneItems = element.querySelectorAll('.scene-item')
      expect(sceneItems.length).to.equal(1)
      
      document.body.removeChild(element)
    })
  })
})
