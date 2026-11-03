import { expect } from '@esm-bundle/chai'
import { RollTablesDialogElement } from '../../../components/roll-tables-dialog/roll-tables-dialog-element.js'
import { RollTableInfo } from '../../../js/database/roll-table-info.js'
import '../../../components/message-dialog/message-dialog-element.js'

describe('RollTablesDialogElement', () => {
  let dialog

  beforeEach(() => {
    dialog = document.createElement('dialog', { is: 'roll-tables-dialog' })
    document.body.appendChild(dialog)
  })

  afterEach(() => {
    if (dialog && dialog.parentNode) {
      if (dialog.open) {
        dialog.close()
      }
      document.body.removeChild(dialog)
    }
    document.querySelectorAll('dialog[is="message-dialog"]').forEach(el => el.remove())
  })

  describe('custom element registration', () => {
    it('should be defined as a custom element', () => {
      expect(customElements.get('roll-tables-dialog')).to.equal(RollTablesDialogElement)
    })

    it('should export a class constructor', () => {
      expect(RollTablesDialogElement).to.be.a('function')
      expect(RollTablesDialogElement.prototype).to.be.an.instanceof(HTMLDialogElement)
    })
  })

  describe('structure', () => {
    it('should have header with title and close button', () => {
      const header = dialog.querySelector('header')
      expect(header).to.not.be.null
      expect(header.textContent).to.include('Roll Tables')

      const closeButton = header.querySelector('button.close')
      expect(closeButton).to.not.be.null
    })

    it('should have a table list container', () => {
      expect(dialog.querySelector('.table-list')).to.not.be.null
    })

    it('should have an add-table button', () => {
      const btn = dialog.querySelector('.add-table-btn')
      expect(btn).to.not.be.null
    })

    it('should have a table editor area', () => {
      expect(dialog.querySelector('.table-editor')).to.not.be.null
    })

    it('should have a roll result area', () => {
      expect(dialog.querySelector('.roll-result')).to.not.be.null
    })

    it('should have footer with close button', () => {
      const footer = dialog.querySelector('footer')
      expect(footer).to.not.be.null
      expect(footer.querySelector('button.close')).to.not.be.null
    })
  })

  describe('close buttons', () => {
    it('should close the dialog when a close button is clicked', () => {
      dialog.showModal()
      dialog.querySelector('button.close').click()
      // With prefers-reduced-motion: reduce, animateClose closes immediately
      expect(dialog.open).to.be.false
    })
  })

  describe('loadTables / getTables', () => {
    it('should store and return the tables', () => {
      const tables = [new RollTableInfo(1, 'Table A', [{ result: 'A' }])]
      dialog.loadTables(1, tables)
      expect(dialog.getTables()).to.equal(tables)
    })

    it('should render an empty message when there are no tables', () => {
      dialog.loadTables(1, [])
      const emptyMsg = dialog.querySelector('.table-list .empty-message')
      expect(emptyMsg).to.not.be.null
      expect(emptyMsg.textContent).to.include('No roll tables yet')
    })

    it('should render a table item per table', () => {
      const tables = [
        new RollTableInfo(1, 'Table A', [{ result: 'A' }]),
        new RollTableInfo(1, 'Table B', [{ result: 'B' }])
      ]
      dialog.loadTables(1, tables)
      const items = dialog.querySelectorAll('.table-item')
      expect(items.length).to.equal(2)
      expect(items[0].querySelector('.table-name').textContent).to.equal('Table A')
      expect(items[1].querySelector('.table-name').textContent).to.equal('Table B')
    })

    it('should hide the editor when (re)loading tables', () => {
      dialog.querySelector('.add-table-btn').click()
      expect(dialog.querySelector('.table-editor').classList.contains('active')).to.be.true

      dialog.loadTables(1, [])
      expect(dialog.querySelector('.table-editor').classList.contains('active')).to.be.false
    })

    it('should render roll and edit buttons per table', () => {
      const tables = [new RollTableInfo(1, 'Table A', [{ result: 'A' }])]
      dialog.loadTables(1, tables)
      const buttons = dialog.querySelector('.table-item .table-actions').querySelectorAll('button')
      expect(buttons.length).to.equal(2)
      expect(buttons[0].textContent).to.equal('Roll')
      expect(buttons[1].textContent).to.equal('Edit')
    })
  })

  describe('creating a new table', () => {
    it('should show the editor when the add-table button is clicked', () => {
      dialog.loadTables(1, [])
      dialog.querySelector('.add-table-btn').click()

      expect(dialog.querySelector('.table-editor').classList.contains('active')).to.be.true
    })

    it('should start with a default name of "New Table"', () => {
      dialog.loadTables(1, [])
      dialog.querySelector('.add-table-btn').click()

      expect(dialog.querySelector('.table-name-input').value).to.equal('New Table')
    })

    it('should start with one empty entry', () => {
      dialog.loadTables(1, [])
      dialog.querySelector('.add-table-btn').click()

      const entries = dialog.querySelectorAll('.entry-item')
      expect(entries.length).to.equal(1)
      expect(entries[0].querySelector('input').value).to.equal('')
    })
  })

  describe('editing an existing table', () => {
    it('should populate the editor with the table being edited', () => {
      const table = new RollTableInfo(1, 'Existing Table', [{ result: 'Result 1' }, { result: 'Result 2' }])
      dialog.loadTables(1, [table])

      dialog.querySelector('.table-item .table-actions button:nth-child(2)').click()

      expect(dialog.querySelector('.table-editor').classList.contains('active')).to.be.true
      expect(dialog.querySelector('.table-name-input').value).to.equal('Existing Table')
      const entries = dialog.querySelectorAll('.entry-item')
      expect(entries.length).to.equal(2)
    })
  })

  describe('adding entries', () => {
    it('should add a new empty entry when add-entry is clicked', () => {
      dialog.loadTables(1, [])
      dialog.querySelector('.add-table-btn').click()
      dialog.querySelector('.add-entry-btn').click()

      const entries = dialog.querySelectorAll('.entry-item')
      expect(entries.length).to.equal(2)
    })

    it('should do nothing if there is no current table', () => {
      dialog.loadTables(1, [])
      expect(() => dialog.querySelector('.add-entry-btn').click()).to.not.throw()
      expect(dialog.querySelectorAll('.entry-item').length).to.equal(0)
    })
  })

  describe('removing entries', () => {
    it('should remove an entry when its remove button is clicked', () => {
      dialog.loadTables(1, [])
      dialog.querySelector('.add-table-btn').click()
      dialog.querySelector('.add-entry-btn').click()

      expect(dialog.querySelectorAll('.entry-item').length).to.equal(2)

      dialog.querySelector('.entry-item .entry-remove').click()

      expect(dialog.querySelectorAll('.entry-item').length).to.equal(1)
    })
  })

  describe('saving a table', () => {
    it('should save a valid table and dispatch tables-changed', (done) => {
      dialog.loadTables(1, [])
      dialog.querySelector('.add-table-btn').click()

      dialog.querySelector('.table-name-input').value = 'My Table'
      dialog.querySelector('.entries-list input').value = 'Entry 1'
      dialog.querySelector('.entries-list input').dispatchEvent(new Event('input'))

      dialog.addEventListener('tables-changed', (e) => {
        expect(e.detail.tables.length).to.equal(1)
        expect(e.detail.tables[0].name).to.equal('My Table')
        done()
      })

      dialog.querySelector('.save-table-btn').click()
    })

    it('should hide the editor after a successful save', () => {
      dialog.loadTables(1, [])
      dialog.querySelector('.add-table-btn').click()
      dialog.querySelector('.table-name-input').value = 'My Table'
      dialog.querySelector('.entries-list input').value = 'Entry 1'
      dialog.querySelector('.entries-list input').dispatchEvent(new Event('input'))

      dialog.querySelector('.save-table-btn').click()

      expect(dialog.querySelector('.table-editor').classList.contains('active')).to.be.false
    })

    it('should update an existing table in place rather than duplicating it', () => {
      const table = new RollTableInfo(1, 'Existing', [{ result: 'Old' }], 42)
      dialog.loadTables(1, [table])

      dialog.querySelector('.table-item .table-actions button:nth-child(2)').click()
      dialog.querySelector('.table-name-input').value = 'Renamed'
      dialog.querySelector('.table-name-input').dispatchEvent(new Event('input'))

      dialog.querySelector('.save-table-btn').click()

      expect(dialog.getTables().length).to.equal(1)
      expect(dialog.getTables()[0].name).to.equal('Renamed')
    })

    it('should show a message dialog with validation errors and not save an invalid table', async () => {
      const messageDialog = document.createElement('dialog', { is: 'message-dialog' })
      // createElement's `is` option doesn't reflect the attribute (only HTML parsing does),
      // but the production code looks the dialog up via `dialog[is="message-dialog"]`
      messageDialog.setAttribute('is', 'message-dialog')
      document.body.appendChild(messageDialog)

      dialog.loadTables(1, [])
      dialog.querySelector('.add-table-btn').click()
      dialog.querySelector('.table-name-input').value = ''

      let changed = false
      dialog.addEventListener('tables-changed', () => { changed = true })

      dialog.querySelector('.save-table-btn').click()

      // allow the async save handler to resolve
      await new Promise(resolve => setTimeout(resolve, 20))

      expect(changed).to.be.false
      expect(dialog.getTables().length).to.equal(0)
      expect(messageDialog.querySelector('main').textContent).to.include('Table name cannot be empty')
    })

    it('should do nothing if there is no current table', () => {
      dialog.loadTables(1, [])
      expect(() => dialog.querySelector('.save-table-btn').click()).to.not.throw()
    })
  })

  describe('canceling edits', () => {
    it('should hide the editor without saving changes', () => {
      dialog.loadTables(1, [])
      dialog.querySelector('.add-table-btn').click()
      dialog.querySelector('.table-name-input').value = 'Unsaved'

      dialog.querySelector('.cancel-edit-btn').click()

      expect(dialog.querySelector('.table-editor').classList.contains('active')).to.be.false
      expect(dialog.getTables().length).to.equal(0)
    })
  })

  describe('deleting a table', () => {
    it('should remove the table and dispatch tables-changed', (done) => {
      const table = new RollTableInfo(1, 'To Delete', [{ result: 'X' }], 7)
      dialog.loadTables(1, [table])

      dialog.querySelector('.table-item .table-actions button:nth-child(2)').click() // edit

      dialog.addEventListener('tables-changed', (e) => {
        expect(e.detail.tables.length).to.equal(0)
        done()
      })

      dialog.querySelector('.delete-table-btn').click()
    })

    it('should do nothing if there is no current table', () => {
      dialog.loadTables(1, [])
      expect(() => dialog.querySelector('.delete-table-btn').click()).to.not.throw()
    })
  })

  describe('rolling on a table', () => {
    it('should show a "Rolling..." state and then the result', async () => {
      const table = new RollTableInfo(1, 'Table', [{ result: 'Fixed Result' }])
      dialog.loadTables(1, [table])

      dialog.querySelector('.table-item .table-actions button:first-child').click() // roll

      const resultEl = dialog.querySelector('.roll-result')
      expect(resultEl.classList.contains('active')).to.be.true
      expect(resultEl.textContent).to.equal('Rolling...')

      await new Promise(resolve => setTimeout(resolve, 600))

      expect(resultEl.textContent).to.equal('Fixed Result')
    })

    it('should hide the editor while rolling', () => {
      const table = new RollTableInfo(1, 'Table', [{ result: 'Result' }])
      dialog.loadTables(1, [table])
      dialog.querySelector('.add-table-btn').click()
      expect(dialog.querySelector('.table-editor').classList.contains('active')).to.be.true

      dialog.querySelector('.table-item .table-actions button:first-child').click()

      expect(dialog.querySelector('.table-editor').classList.contains('active')).to.be.false
    })
  })
})
