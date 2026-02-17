import { animateClose } from '../../js/dialog-utils.js'
import { loadElementFromFile } from '../../js/load-file-element.js'

const setup = async () => {
  const dialogEl = await loadElementFromFile('./components/scene-switcher/scene-switcher.html', 'dialog')

  /**
   * Dialog to switch between scenes and manage scenes.
   * @tagname scene-switcher
   */
  class SceneSwitcherElement extends HTMLDialogElement {
    /**
     * @type {Array<{id: number, name: string, description: string}>}
     */
    #scenes = []

    /**
     * @type {number|undefined}
     */
    #currentSceneId

    /**
     * @type {((sceneId: number|undefined) => void)|null}
     */
    #onSceneSwitch = null

    /**
     * @type {((sceneName: string) => Promise<number|undefined>)|null}
     */
    #onSceneAdd = null

    /**
     * @type {((sceneId: number, newName: string) => Promise<void>)|null}
     */
    #onSceneRename = null

    /**
     * @type {((sceneId: number) => Promise<void>)|null}
     */
    #onSceneDelete = null

    /**
     * Constructor.
     */
    constructor () {
      super()
      this.innerHTML = dialogEl.innerHTML

      this.querySelectorAll('button.close').forEach(el => {
        el.addEventListener('click', () => animateClose(this))
      })

      const addSceneBtn = this.querySelector('button.add-scene-btn')
      const newSceneInput = this.querySelector('input.new-scene-name')

      addSceneBtn?.addEventListener('click', async () => {
        await this.#handleAddScene()
      })

      newSceneInput?.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter') {
          await this.#handleAddScene()
        }
      })
    }

    /**
     * Handle adding a new scene.
     */
    async #handleAddScene () {
      const newSceneInput = this.querySelector('input.new-scene-name')
      if (!newSceneInput || !(newSceneInput instanceof HTMLInputElement)) {
        return
      }

      const sceneName = newSceneInput.value.trim()
      if (!sceneName) {
        return
      }

      if (this.#onSceneAdd) {
        const newSceneId = await this.#onSceneAdd(sceneName)
        if (newSceneId !== undefined) {
          newSceneInput.value = ''
          // The caller should refresh the scene list
        }
      }
    }

    /**
     * Handle renaming a scene.
     * @param {number} sceneId - The scene ID to rename
     */
    async #handleRenameScene (sceneId) {
      const scene = this.#scenes.find(s => s.id === sceneId)
      if (!scene) return

      const newName = prompt('Enter new scene name:', scene.name)
      if (newName && newName.trim() && newName !== scene.name) {
        if (this.#onSceneRename) {
          await this.#onSceneRename(sceneId, newName.trim())
        }
      }
    }

    /**
     * Handle deleting a scene.
     * @param {number} sceneId - The scene ID to delete
     */
    async #handleDeleteScene (sceneId) {
      const scene = this.#scenes.find(s => s.id === sceneId)
      if (!scene) return

      const confirmDialog = document.querySelector('dialog[is="confirm-dialog"]')
      if (confirmDialog && typeof confirmDialog.confirm === 'function') {
        const confirmed = await confirmDialog.confirm(`Are you sure you want to delete scene "${scene.name}"?`)
        if (confirmed && this.#onSceneDelete) {
          await this.#onSceneDelete(sceneId)
        }
      }
    }

    /**
     * Handle switching to a scene.
     * @param {number} sceneId - The scene ID to switch to
     */
    #handleSwitchScene (sceneId) {
      if (this.#onSceneSwitch) {
        this.#onSceneSwitch(sceneId)
      }
      animateClose(this)
    }

    /**
     * Render the scene list.
     */
    #renderSceneList () {
      const listEl = this.querySelector('.scene-list')
      if (!listEl) return

      listEl.innerHTML = ''

      for (const scene of this.#scenes) {
        const li = document.createElement('li')
        if (scene.id === this.#currentSceneId) {
          li.classList.add('current')
        }

        const nameSpan = document.createElement('span')
        nameSpan.className = 'scene-name'
        nameSpan.textContent = scene.name
        li.appendChild(nameSpan)

        const actionsDiv = document.createElement('div')
        actionsDiv.className = 'scene-actions'

        const renameBtn = document.createElement('button')
        renameBtn.textContent = 'Rename'
        renameBtn.addEventListener('click', async (e) => {
          e.stopPropagation()
          await this.#handleRenameScene(scene.id)
        })
        actionsDiv.appendChild(renameBtn)

        const deleteBtn = document.createElement('button')
        deleteBtn.textContent = 'Delete'
        deleteBtn.addEventListener('click', async (e) => {
          e.stopPropagation()
          await this.#handleDeleteScene(scene.id)
        })
        actionsDiv.appendChild(deleteBtn)

        li.appendChild(actionsDiv)

        li.addEventListener('click', () => {
          this.#handleSwitchScene(scene.id)
        })

        listEl.appendChild(li)
      }
    }

    /**
     * Set the scenes to display.
     * @param {Array<{id: number, name: string, description: string}>} scenes - The scenes
     * @param {number|undefined} currentSceneId - The current scene ID
     */
    setScenes (scenes, currentSceneId) {
      this.#scenes = scenes
      this.#currentSceneId = currentSceneId
      this.#renderSceneList()
    }

    /**
     * Set the callback for when a scene is switched.
     * @param {(sceneId: number|undefined) => void} callback - The callback
     */
    onSceneSwitch (callback) {
      this.#onSceneSwitch = callback
    }

    /**
     * Set the callback for when a scene is added.
     * @param {(sceneName: string) => Promise<number|undefined>} callback - The callback
     */
    onSceneAdd (callback) {
      this.#onSceneAdd = callback
    }

    /**
     * Set the callback for when a scene is renamed.
     * @param {(sceneId: number, newName: string) => Promise<void>} callback - The callback
     */
    onSceneRename (callback) {
      this.#onSceneRename = callback
    }

    /**
     * Set the callback for when a scene is deleted.
     * @param {(sceneId: number) => Promise<void>} callback - The callback
     */
    onSceneDelete (callback) {
      this.#onSceneDelete = callback
    }
  }

  customElements.define('scene-switcher', SceneSwitcherElement, { extends: 'dialog' })
  globalThis.SceneSwitcherElement = SceneSwitcherElement
  
  return SceneSwitcherElement
}

export const SceneSwitcherElement = await setup()
