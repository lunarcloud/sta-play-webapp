import { animateClose } from '../../js/dialog-utils.js'
import { loadElementFromFile } from '../../js/load-file-element.js'

const dialogEl = await loadElementFromFile('./components/scene-switcher/scene-switcher.html', 'dialog')

/**
 * Dialog to switch between scenes and manage scenes.
 * @tagname scene-switcher
 */
export class SceneSwitcherElement extends HTMLDialogElement {
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
   * @type {number|null}
   */
  #renameSceneId = null

  /**
   * Constructor.
   */
  constructor () {
    super()
    this.innerHTML = dialogEl.innerHTML

    this.querySelectorAll('button.close').forEach(el => {
      el.addEventListener('click', () => animateClose(this))
    })

    const actionBtn = this.querySelector('button.scene-action-btn')
    const cancelBtn = this.querySelector('button.scene-cancel-btn')
    const sceneInput = this.querySelector('input.scene-input')

    actionBtn?.addEventListener('click', async () => {
      await this.#handleSceneAction()
    })

    cancelBtn?.addEventListener('click', () => {
      this.#switchToAddMode()
    })

    sceneInput?.addEventListener('keydown', async (e) => {
      if (e.key === 'Enter') {
        await this.#handleSceneAction()
      } else if (e.key === 'Escape') {
        this.#switchToAddMode()
      }
    })
  }

  /**
   * Switch to add mode.
   */
  #switchToAddMode () {
    this.#renameSceneId = null
    const inputArea = this.querySelector('.scene-input-area')
    const label = this.querySelector('.scene-input-label')
    const input = this.querySelector('input.scene-input')
    const actionBtn = this.querySelector('button.scene-action-btn')
    const cancelBtn = this.querySelector('button.scene-cancel-btn')

    inputArea?.classList.remove('rename-mode')
    if (label) label.textContent = 'New scene name:'
    if (input) {
      input.value = ''
      input.placeholder = 'Enter scene name...'
    }
    if (actionBtn) actionBtn.textContent = 'Add Scene'
    if (cancelBtn) cancelBtn.style.display = 'none'
  }

  /**
   * Switch to rename mode.
   * @param {number} sceneId - The scene ID to rename
   * @param {string} currentName - The current scene name
   */
  #switchToRenameMode (sceneId, currentName) {
    this.#renameSceneId = sceneId
    const inputArea = this.querySelector('.scene-input-area')
    const label = this.querySelector('.scene-input-label')
    const input = this.querySelector('input.scene-input')
    const actionBtn = this.querySelector('button.scene-action-btn')
    const cancelBtn = this.querySelector('button.scene-cancel-btn')

    inputArea?.classList.add('rename-mode')
    if (label) label.textContent = 'Rename scene:'
    if (input) {
      input.value = currentName
      input.placeholder = 'Enter new name...'
      setTimeout(() => {
        input.focus()
        input.select()
      }, 100)
    }
    if (actionBtn) actionBtn.textContent = 'Rename'
    if (cancelBtn) cancelBtn.style.display = 'inline-block'
  }

  /**
   * Handle the scene action (add or rename).
   */
  async #handleSceneAction () {
    if (this.#renameSceneId !== null) {
      await this.#handleRenameSceneAction()
    } else {
      await this.#handleAddScene()
    }
  }

  /**
   * Handle adding a new scene.
   */
  async #handleAddScene () {
    const sceneInput = this.querySelector('input.scene-input')
    if (!sceneInput || !(sceneInput instanceof HTMLInputElement)) {
      return
    }

    const sceneName = sceneInput.value.trim()
    if (!sceneName) {
      return
    }

    if (this.#onSceneAdd) {
      const newSceneId = await this.#onSceneAdd(sceneName)
      if (newSceneId !== undefined) {
        sceneInput.value = ''
        // The caller should refresh the scene list
      }
    }
  }

  /**
   * Handle renaming a scene (action button clicked).
   */
  async #handleRenameSceneAction () {
    const sceneInput = this.querySelector('input.scene-input')
    if (!sceneInput || !(sceneInput instanceof HTMLInputElement)) {
      return
    }

    const newName = sceneInput.value.trim()
    if (!newName || this.#renameSceneId === null) {
      return
    }

    const scene = this.#scenes.find(s => s.id === this.#renameSceneId)
    if (scene && newName !== scene.name) {
      if (this.#onSceneRename) {
        await this.#onSceneRename(this.#renameSceneId, newName)
      }
    }

    this.#switchToAddMode()
  }

  /**
   * Handle renaming a scene.
   * @param {number} sceneId - The scene ID to rename
   */
  async #handleRenameScene (sceneId) {
    const scene = this.#scenes.find(s => s.id === sceneId)
    if (!scene) return

    this.#switchToRenameMode(sceneId, scene.name)
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
    this.#switchToAddMode()
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
