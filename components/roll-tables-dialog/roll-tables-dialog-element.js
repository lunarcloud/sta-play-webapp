import { animateClose } from '../../js/dialog-utils.js'
import { loadElementFromFile } from '../../js/load-file-element.js'

const setup = async () => {
  const dialogEl = await loadElementFromFile('./components/roll-tables-dialog/roll-tables-dialog.html', 'dialog')

  /**
   * Dialog for managing and rolling on custom roll tables.
   * @tagname roll-tables-dialog
   */
  class RollTablesDialogElement extends HTMLDialogElement {
    /** @type {HTMLElement} */
    #tableListEl

    /** @type {HTMLElement} */
    #tableEditorEl

    /** @type {HTMLInputElement} */
    #tableNameInput

    /** @type {HTMLElement} */
    #entriesListEl

    /** @type {HTMLElement} */
    #rollResultEl

    /** @type {Array<import('../../js/database/roll-table-info.js').RollTableInfo>} */
    #tables = []

    /** @type {import('../../js/database/roll-table-info.js').RollTableInfo|null} */
    #currentTable = null

    /** @type {number} */
    #gameId

    /**
     * Constructor.
     */
    constructor () {
      super()
      this.innerHTML = dialogEl.innerHTML
      this.querySelectorAll('button.close').forEach(el => el.addEventListener('click', () => animateClose(this)))

      this.#tableListEl = /** @type {HTMLElement} */ (this.querySelector('.table-list'))
      this.#tableEditorEl = /** @type {HTMLElement} */ (this.querySelector('.table-editor'))
      this.#tableNameInput = /** @type {HTMLInputElement} */ (this.querySelector('.table-name-input'))
      this.#entriesListEl = /** @type {HTMLElement} */ (this.querySelector('.entries-list'))
      this.#rollResultEl = /** @type {HTMLElement} */ (this.querySelector('.roll-result'))

      this.querySelector('.add-table-btn')?.addEventListener('click', () => this.#createNewTable())
      this.querySelector('.add-entry-btn')?.addEventListener('click', () => this.#addEntry())
      this.querySelector('.save-table-btn')?.addEventListener('click', () => this.#saveCurrentTable())
      this.querySelector('.cancel-edit-btn')?.addEventListener('click', () => this.#cancelEdit())
      this.querySelector('.delete-table-btn')?.addEventListener('click', () => this.#deleteCurrentTable())
    }

    /**
     * Load tables for a game
     * @param {number} gameId - The game ID
     * @param {Array<import('../../js/database/roll-table-info.js').RollTableInfo>} tables - Array of roll tables
     */
    loadTables (gameId, tables) {
      this.#gameId = gameId
      this.#tables = tables
      this.#renderTableList()
      this.#hideEditor()
    }

    /**
     * Get the current tables
     * @returns {Array<import('../../js/database/roll-table-info.js').RollTableInfo>} Current tables
     */
    getTables () {
      return this.#tables
    }

    /**
     * Render the list of tables
     */
    #renderTableList () {
      this.#tableListEl.innerHTML = ''

      if (this.#tables.length === 0) {
        const emptyMsg = document.createElement('div')
        emptyMsg.className = 'empty-message'
        emptyMsg.textContent = 'No roll tables yet. Add one to get started!'
        this.#tableListEl.appendChild(emptyMsg)
        return
      }

      for (const table of this.#tables) {
        const item = document.createElement('div')
        item.className = 'table-item'

        const nameEl = document.createElement('span')
        nameEl.className = 'table-name'
        nameEl.textContent = table.name
        item.appendChild(nameEl)

        const actions = document.createElement('div')
        actions.className = 'table-actions'

        const rollBtn = document.createElement('button')
        rollBtn.textContent = 'Roll'
        rollBtn.addEventListener('click', () => this.#rollOnTable(table))
        actions.appendChild(rollBtn)

        const editBtn = document.createElement('button')
        editBtn.textContent = 'Edit'
        editBtn.addEventListener('click', () => this.#editTable(table))
        actions.appendChild(editBtn)

        item.appendChild(actions)
        this.#tableListEl.appendChild(item)
      }
    }

    /**
     * Create a new table
     */
    #createNewTable () {
      const RollTableInfo = globalThis.RollTableInfo
      // Start with one empty entry to help users get started
      this.#currentTable = new RollTableInfo(this.#gameId, 'New Table', [{ result: '' }])
      this.#showEditor()
      this.#renderEditor()
    }

    /**
     * Edit an existing table
     * @param {import('../../js/database/roll-table-info.js').RollTableInfo} table - Table to edit
     */
    #editTable (table) {
      this.#currentTable = table
      this.#showEditor()
      this.#renderEditor()
    }

    /**
     * Show the editor
     */
    #showEditor () {
      this.#tableEditorEl.classList.add('active')
      this.#rollResultEl.classList.remove('active')
    }

    /**
     * Hide the editor
     */
    #hideEditor () {
      this.#tableEditorEl.classList.remove('active')
      this.#currentTable = null
    }

    /**
     * Render the editor with current table data
     */
    #renderEditor () {
      if (!this.#currentTable) return

      this.#tableNameInput.value = this.#currentTable.name

      this.#entriesListEl.innerHTML = ''
      for (const entry of this.#currentTable.entries) {
        this.#renderEntry(entry)
      }
    }

    /**
     * Render a single entry
     * @param {import('../../js/database/roll-table-info.js').RollTableEntry} entry - Entry to render
     */
    #renderEntry (entry) {
      const item = document.createElement('div')
      item.className = 'entry-item'

      const resultDiv = document.createElement('div')
      resultDiv.className = 'entry-result'

      const resultInput = document.createElement('input')
      resultInput.type = 'text'
      resultInput.value = entry.result
      resultInput.placeholder = 'Result text'
      resultInput.addEventListener('input', () => {
        entry.result = resultInput.value
      })
      resultDiv.appendChild(resultInput)

      item.appendChild(resultDiv)

      const removeBtn = document.createElement('button')
      removeBtn.className = 'entry-remove'
      removeBtn.textContent = '✕'
      removeBtn.addEventListener('click', () => {
        const index = this.#currentTable.entries.indexOf(entry)
        if (index > -1) {
          this.#currentTable.entries.splice(index, 1)
          this.#renderEditor()
        }
      })
      item.appendChild(removeBtn)

      this.#entriesListEl.appendChild(item)
    }

    /**
     * Add a new entry to the current table
     */
    #addEntry () {
      if (!this.#currentTable) return

      const newEntry = {
        result: ''
      }

      this.#currentTable.entries.push(newEntry)
      this.#renderEntry(newEntry)
    }

    /**
     * Save the current table
     */
    #saveCurrentTable () {
      if (!this.#currentTable) return

      this.#currentTable.name = this.#tableNameInput.value

      if (!this.#currentTable.validate()) {
        const errors = []

        // Note: Game ID is handled internally and set when the user saves the game
        // Tables can be created with a temporary game ID before the first save

        // Check table name
        if (!this.#currentTable.name || this.#currentTable.name === '') {
          errors.push('- Table name cannot be empty')
        }

        // Check entries array
        if (!Array.isArray(this.#currentTable.entries)) {
          errors.push('- Entries must be an array')
        } else if (this.#currentTable.entries.length === 0) {
          errors.push('- Add at least one entry')
        } else {
          // Check each entry
          for (let i = 0; i < this.#currentTable.entries.length; i++) {
            const entry = this.#currentTable.entries[i]

            if (!entry.result || entry.result === '') {
              errors.push(`- Entry ${i + 1}: Result text cannot be empty`)
              break
            }
          }
        }

        // If no specific errors were found, add a generic message
        if (errors.length === 0) {
          errors.push('- Unknown validation error. Please check all fields.')
        }

        alert('Please check the following:\n' + errors.join('\n'))
        return
      }

      const existingIndex = this.#tables.findIndex(t => t.id !== undefined && t.id === this.#currentTable.id)
      if (existingIndex > -1) {
        this.#tables[existingIndex] = this.#currentTable
      } else {
        this.#tables.push(this.#currentTable)
      }

      this.#hideEditor()
      this.#renderTableList()

      this.dispatchEvent(new CustomEvent('tables-changed', {
        detail: { tables: this.#tables },
        bubbles: true
      }))
    }

    /**
     * Cancel editing
     */
    #cancelEdit () {
      this.#hideEditor()
    }

    /**
     * Delete the current table
     */
    #deleteCurrentTable () {
      if (!this.#currentTable) return

      const index = this.#tables.findIndex(t => t.id === this.#currentTable.id)
      if (index > -1) {
        this.#tables.splice(index, 1)
      }

      this.#hideEditor()
      this.#renderTableList()

      this.dispatchEvent(new CustomEvent('tables-changed', {
        detail: { tables: this.#tables },
        bubbles: true
      }))
    }

    /**
     * Roll on a table and display the result
     * @param {import('../../js/database/roll-table-info.js').RollTableInfo} table - Table to roll on
     */
    #rollOnTable (table) {
      // Show "Rolling..." state
      this.#rollResultEl.textContent = 'Rolling...'
      this.#rollResultEl.classList.add('active')
      this.#hideEditor()

      // After a brief delay, show the actual result
      setTimeout(() => {
        const result = table.roll()
        this.#rollResultEl.textContent = result
      }, 500) // 500ms delay for rolling animation
    }
  }
  customElements.define('roll-tables-dialog', RollTablesDialogElement, { extends: 'dialog' })
  globalThis.RollTablesDialogElement = RollTablesDialogElement
}

await setup()
