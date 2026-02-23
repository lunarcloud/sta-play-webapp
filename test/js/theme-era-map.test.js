import { expect } from '@esm-bundle/chai'
import { getSuggestedTheme } from '../../js/theme-era-map.js'

describe('Theme Era Map', () => {
  describe('getSuggestedTheme', () => {
    it('should return null when year is already matched by current theme', () => {
      expect(getSuggestedTheme(2366, 'lcars-24')).to.be.null
    })

    it('should suggest lcars-24 for TNG-era year when on a different era theme', () => {
      const result = getSuggestedTheme(2366, 'starfleet-22')
      expect(result).to.not.be.null
      expect(result.theme).to.equal('lcars-24')
      expect(result.label).to.include('24')
    })

    it('should suggest starfleet-22 for 22nd century year', () => {
      const result = getSuggestedTheme(2151, 'lcars-24')
      expect(result).to.not.be.null
      expect(result.theme).to.equal('starfleet-22')
    })

    it('should suggest starfleet-23 for mid-23rd century year', () => {
      const result = getSuggestedTheme(2266, 'lcars-24')
      expect(result).to.not.be.null
      expect(result.theme).to.equal('starfleet-23')
    })

    it('should suggest excelsior for late-23rd century year', () => {
      const result = getSuggestedTheme(2285, 'lcars-24')
      expect(result).to.not.be.null
      expect(result.theme).to.equal('excelsior')
    })

    it('should suggest lcars-late-24 for late 24th century year', () => {
      const result = getSuggestedTheme(2371, 'lcars-24')
      expect(result).to.not.be.null
      expect(result.theme).to.equal('lcars-late-24')
    })

    it('should suggest lcars-25 for early 25th century year', () => {
      const result = getSuggestedTheme(2400, 'lcars-24')
      expect(result).to.not.be.null
      expect(result.theme).to.equal('lcars-25')
    })

    it('should suggest tcars for 26th-29th century year', () => {
      const result = getSuggestedTheme(2600, 'lcars-24')
      expect(result).to.not.be.null
      expect(result.theme).to.equal('tcars')
    })

    it('should suggest starfleet-32 for 32nd century year', () => {
      const result = getSuggestedTheme(3189, 'lcars-24')
      expect(result).to.not.be.null
      expect(result.theme).to.equal('starfleet-32')
    })

    it('should return null for klingon theme (no era restriction)', () => {
      expect(getSuggestedTheme(2371, 'klingon')).to.be.null
    })

    it('should return null for lcars-holo when in the late-24th century era', () => {
      expect(getSuggestedTheme(2375, 'lcars-holo')).to.be.null
    })

    it('should suggest a theme for lcars-holo when outside its era', () => {
      const result = getSuggestedTheme(2266, 'lcars-holo')
      expect(result).to.not.be.null
      expect(result.theme).to.equal('starfleet-23')
    })

    it('should return null for year outside all known ranges', () => {
      expect(getSuggestedTheme(1900, 'lcars-24')).to.be.null
    })

    it('should suggest starfleet-32 for far future year (post-Academy)', () => {
      const result = getSuggestedTheme(4000, 'lcars-24')
      expect(result).to.not.be.null
      expect(result.theme).to.equal('starfleet-32')
    })

    it('should return null when already on the correct theme', () => {
      expect(getSuggestedTheme(2420, 'lcars-25')).to.be.null
      expect(getSuggestedTheme(2266, 'starfleet-23')).to.be.null
    })

    it('should handle era boundaries correctly', () => {
      // 2322 = end of excelsior era
      expect(getSuggestedTheme(2322, 'excelsior')).to.be.null
      // 2323 = start of lcars-24
      const r = getSuggestedTheme(2323, 'excelsior')
      expect(r).to.not.be.null
      expect(r.theme).to.equal('lcars-24')
    })
  })
})
