import { expect } from '@esm-bundle/chai'
import { StardateDialogElement } from '../../../components/stardate-dialog/stardate-dialog-element.js'

describe('StardateDialogElement', () => {
  let dialog

  beforeEach(() => {
    dialog = document.createElement('dialog', { is: 'stardate-dialog' })
    document.body.appendChild(dialog)
  })

  afterEach(() => {
    if (dialog?.parentNode) {
      if (dialog.open) {
        dialog.close()
      }
      dialog.remove()
    }
  })

  describe('custom element registration', () => {
    it('should be registered as a customized dialog element', () => {
      expect(customElements.get('stardate-dialog')).to.equal(StardateDialogElement)
      expect(dialog).to.be.instanceof(HTMLDialogElement)
      expect(dialog).to.be.instanceof(StardateDialogElement)
    })
  })

  describe('calendar mode structure', () => {
    it('should show First Contact context by default and update historical eras with the date', () => {
      const context = dialog.querySelector('.calendar-era-context')
      const dateInput = dialog.querySelector('input.calendar-date')
      expect(context.hidden).to.be.false
      expect(context.querySelector('.era-events').textContent).to.include('April 5')
      for (const [date, event] of [
        ['1968-01-01', 'Gary Seven'],
        ['1996-01-01', 'Eugenics Wars'],
        ['2035-01-01', 'exact revised dates uncertain'],
        ['2153-01-01', 'Xindi']
      ]) {
        dateInput.value = date
        dateInput.dispatchEvent(new Event('input'))
        expect(context.querySelector('.era-events').textContent).to.include(event)
      }
      dateInput.value = ''
      dateInput.dispatchEvent(new Event('input'))
      expect(context.hidden).to.be.true
    })

    it('should provide a calendar mode button and native date input with supported bounds', () => {
      const modeButton = dialog.querySelector('.mode-btn[data-mode="calendar"]')
      const dateInput = dialog.querySelector('input.calendar-date')

      expect(modeButton).to.not.be.null
      expect(dateInput).to.not.be.null
      expect(dateInput.type).to.equal('date')
      expect(dateInput.required).to.be.true
      expect(dateInput.value).to.equal('2063-04-05')
      expect(dateInput.min).to.equal('0001-01-01')
      expect(dateInput.max).to.equal('9999-12-31')
    })

    it('should show a localized calendar date preview', () => {
      const dateInput = dialog.querySelector('input.calendar-date')
      const preview = dialog.querySelector('output.calendar-preview')

      dateInput.value = '2063-01-02'
      dateInput.dispatchEvent(new Event('input', { bubbles: true }))

      const expected = new Intl.DateTimeFormat(undefined, {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        timeZone: 'UTC'
      }).format(new Date('2063-01-02T00:00:00Z'))
      expect(preview.value).to.equal(expected)
    })

    it('should clear the preview for an invalid or empty date value', () => {
      const dateInput = dialog.querySelector('input.calendar-date')
      const preview = dialog.querySelector('output.calendar-preview')

      dateInput.value = ''
      dateInput.dispatchEvent(new Event('input', { bubbles: true }))

      expect(preview.value).to.equal('')
    })
  })

  describe('mode selection', () => {
    it('should open in TNG mode by default and expose the current value', () => {
      const result = dialog.editStardate('41153.7')

      expect(dialog.open).to.be.true
      expect(dialog.activeMode).to.equal('tng')
      expect(dialog.isTOS).to.be.false
      expect(dialog.querySelector('.mode-btn[data-mode="tng"]').classList.contains('active')).to.be.true
      expect(dialog.querySelector('fieldset[data-mode="tng"]').classList.contains('active')).to.be.true
      expect(dialog.querySelector('.current-value').textContent).to.equal('41153.7')

      dialog.querySelector('button.close').click()
      return result.then(value => expect(value).to.equal(null))
    })

    it('should switch modes while preserving each mode input value', async () => {
      const result = dialog.editStardate()
      const tngYear = dialog.querySelector('input.calc-year')
      const tosYear = dialog.querySelector('input.tos-year')
      const calendarDate = dialog.querySelector('input.calendar-date')

      tngYear.value = '2401'
      tosYear.value = '2270'
      calendarDate.value = '2064-02-29'
      calendarDate.dispatchEvent(new Event('input', { bubbles: true }))

      dialog.querySelector('.mode-btn[data-mode="tos"]').click()
      expect(dialog.activeMode).to.equal('tos')
      expect(dialog.isTOS).to.be.true
      dialog.querySelector('.mode-btn[data-mode="calendar"]').click()
      expect(dialog.activeMode).to.equal('calendar')
      expect(dialog.isTOS).to.be.false
      dialog.querySelector('.mode-btn[data-mode="tng"]').click()

      expect(tngYear.value).to.equal('2401')
      expect(tosYear.value).to.equal('2270')
      expect(calendarDate.value).to.equal('2064-02-29')
      dialog.querySelector('button.close').click()
      expect(await result).to.equal(null)
    })
  })

  describe('editing stored values', () => {
    it('should automatically select calendar mode for an ISO date even when isTOS is false', async () => {
      const result = dialog.editStardate('2063-04-05', false)

      expect(dialog.activeMode).to.equal('calendar')
      expect(dialog.isTOS).to.be.false
      expect(dialog.querySelector('input.calendar-date').value).to.equal('2063-04-05')
      expect(dialog.querySelector('.current-value').textContent).to.equal(
        new Intl.DateTimeFormat(undefined, {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
          timeZone: 'UTC'
        }).format(new Date('2063-04-05T00:00:00Z'))
      )

      dialog.querySelector('button.close').click()
      expect(await result).to.equal(null)
    })

    it('should automatically select calendar mode for an ISO date even when isTOS is true', async () => {
      const result = dialog.editStardate('2064-02-29', true)

      expect(dialog.activeMode).to.equal('calendar')
      expect(dialog.isTOS).to.be.false
      expect(dialog.querySelector('input.calendar-date').value).to.equal('2064-02-29')

      dialog.querySelector('button.close').click()
      expect(await result).to.equal(null)
    })

    it('should keep numeric TNG stardates in TNG mode and allow using the original value', async () => {
      const result = dialog.editStardate('41153.7', false)

      expect(dialog.activeMode).to.equal('tng')
      expect(dialog.querySelector('input.tng-stardate').value).to.equal('41153.7')
      expect(dialog.querySelector('input.calc-year').value).to.equal('2364')

      dialog.querySelector('button.use-calculated').click()
      expect(await result).to.equal('41153.7')
    })

    it('should keep numeric TOS stardates in TOS mode and allow using the original value', async () => {
      const result = dialog.editStardate('11000.0', true)

      expect(dialog.activeMode).to.equal('tos')
      expect(dialog.isTOS).to.be.true
      expect(dialog.querySelector('input.tos-stardate').value).to.equal('11000.0')
      expect(dialog.querySelector('input.tos-year').value).to.equal('2266')

      dialog.querySelector('button.use-tos').click()
      expect(await result).to.equal('11000.0')
    })

    it('should not treat an ISO date as a numeric TNG stardate', async () => {
      const result = dialog.editStardate('2063-01-01', false)

      // A numeric-mode calculator is reset to its normal default output; the
      // calendar year must not be parsed as a stardate or copied into the TNG fields.
      expect(dialog.querySelector('input.tng-stardate').value).to.equal('48000.0')
      expect(dialog.querySelector('input.tng-stardate').value).to.not.equal('2063')
      expect(dialog.querySelector('input.calc-year').value).to.equal('2371')
      expect(dialog.activeMode).to.equal('calendar')

      dialog.querySelector('button.close').click()
      expect(await result).to.equal(null)
    })

    it('should reset the calendar date when a later numeric edit is opened', async () => {
      const initialResult = dialog.editStardate('2064-02-29')
      const closed = new Promise(resolve => dialog.addEventListener('close', resolve, { once: true }))
      dialog.querySelector('button.close').click()
      expect(await initialResult).to.equal(null)
      await closed

      const numericResult = dialog.editStardate('41153.7')
      expect(dialog.activeMode).to.equal('tng')
      expect(dialog.querySelector('input.calendar-date').value).to.equal('2063-04-05')

      dialog.querySelector('button.close').click()
      expect(await numericResult).to.equal(null)
    })
  })

  describe('calendar confirmation and cancellation', () => {
    it('should resolve with the selected ISO date when Use is clicked', async () => {
      const result = dialog.editStardate('2063-01-01')
      const dateInput = dialog.querySelector('input.calendar-date')
      dateInput.value = '2064-02-29'

      dialog.querySelector('button.use-calendar').click()

      expect(await result).to.equal('2064-02-29')
      expect(dialog.open).to.be.false
    })

    it('should remain open and unresolved when the required calendar date is invalid', async () => {
      const result = dialog.editStardate('2063-01-01')
      const dateInput = dialog.querySelector('input.calendar-date')
      const nativeReportValidity = dateInput.reportValidity.bind(dateInput)
      let reportValidityCalled = false
      dateInput.reportValidity = () => {
        reportValidityCalled = true
        return nativeReportValidity()
      }
      dateInput.value = ''

      dialog.querySelector('button.use-calendar').click()

      expect(reportValidityCalled).to.be.true
      expect(dateInput.validity.valid).to.be.false
      expect(dialog.open).to.be.true
      dialog.querySelector('button.close').click()
      expect(await result).to.equal(null)
    })

    it('should resolve with null when cancelled', async () => {
      const result = dialog.editStardate('2063-01-01')

      dialog.querySelector('button.close').click()

      expect(await result).to.equal(null)
      expect(dialog.open).to.be.false
    })
  })
})
