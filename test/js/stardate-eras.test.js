import { expect } from '@esm-bundle/chai'
import { getEraContext } from '../../js/stardate-eras.js'

describe('Stardate Eras', () => {
  describe('getEraContext', () => {
    it('should return TOS era for year 2265', () => {
      const ctx = getEraContext(2265)
      expect(ctx.series).to.include('TOS')
    })

    it('should return Discovery S1-2 era for year 2257', () => {
      const ctx = getEraContext(2257)
      expect(ctx.series).to.include('DIS')
      expect(ctx.events).to.include('Klingon')
    })

    it('should return SNW+TOS era for year 2262', () => {
      const ctx = getEraContext(2262)
      expect(ctx.series).to.include('SNW')
      expect(ctx.series).to.include('TOS')
    })

    it('should return TAS era for year 2270', () => {
      const ctx = getEraContext(2270)
      expect(ctx.series).to.include('TAS')
    })

    it('should return TOS Films era for year 2275', () => {
      const ctx = getEraContext(2275)
      expect(ctx.series).to.include('TOS Films')
    })

    it('should return season-level detail for TNG S3 (year 2366)', () => {
      const ctx = getEraContext(2366)
      expect(ctx.series).to.include('Season 3')
    })

    it('should return season-level detail for DS9 S3 / VOY S1 (year 2371)', () => {
      const ctx = getEraContext(2371)
      expect(ctx.series).to.include('DS9')
      expect(ctx.series).to.include('VOY')
      expect(ctx.series).to.include('Season')
    })

    it('should return ENT season detail for year 2153', () => {
      const ctx = getEraContext(2153)
      expect(ctx.series).to.include('ENT')
      expect(ctx.series).to.include('Season 3')
    })

    it('should return TNG era for year 2366', () => {
      const ctx = getEraContext(2366)
      expect(ctx.series).to.include('TNG')
    })

    it('should return DS9/VOY era for year 2372', () => {
      const ctx = getEraContext(2372)
      expect(ctx.series).to.include('DS9')
      expect(ctx.series).to.include('VOY')
    })

    it('should return Picard era for year 2399', () => {
      const ctx = getEraContext(2399)
      expect(ctx.series).to.include('Picard')
    })

    it('should return Discovery / Starfleet Academy era for year 3190', () => {
      const ctx = getEraContext(3190)
      expect(ctx.series).to.include('Discovery')
    })

    it('should return Post-Burn info for year 3100', () => {
      const ctx = getEraContext(3100)
      expect(ctx.events).to.include('dilithium')
    })

    it('should return early Starfleet era for year 2240', () => {
      const ctx = getEraContext(2240)
      expect(ctx.series).to.include('early Starfleet')
    })

    it('should return pre-Enterprise era for year 2100', () => {
      const ctx = getEraContext(2100)
      expect(ctx.series).to.include('Pre-Enterprise')
    })

    it('should return far future era for year 4000', () => {
      const ctx = getEraContext(4000)
      expect(ctx.series).to.include('Far future')
    })

    it('should return LD Season 5 for year 2384', () => {
      const ctx = getEraContext(2384)
      expect(ctx.series).to.include('LD')
      expect(ctx.series).to.include('Season 5')
    })

    it('should return PRO Season 2 / Mars attack for year 2385', () => {
      const ctx = getEraContext(2385)
      expect(ctx.series).to.include('PRO')
      expect(ctx.events).to.include('Mars')
      expect(ctx.events).to.include('synth')
    })

    it('should not describe individual crew member actions in events', () => {
      const individualPhrases = ['Guinan joins', 'Seven of Nine', 'Picard assimilated', 'Picard retired', 'Odo returns', "Kirk's five-year", 'Spock revived', "Khan's revenge"]
      for (let year = 2151; year <= 3200; year++) {
        const ctx = getEraContext(year)
        for (const phrase of individualPhrases) {
          expect(ctx.events, `year ${year} should not mention "${phrase}"`).to.not.include(phrase)
        }
      }
    })

    it('should return an object with series and events strings', () => {
      const ctx = getEraContext(2370)
      expect(ctx).to.have.property('series').that.is.a('string')
      expect(ctx).to.have.property('events').that.is.a('string')
    })

    it('should handle boundary year at era start (2364)', () => {
      const ctx = getEraContext(2364)
      expect(ctx.series).to.include('TNG')
    })

    it('should handle boundary year at era end (2368)', () => {
      const ctx = getEraContext(2368)
      expect(ctx.series).to.include('TNG')
    })

    it('should return DS9/VOY era for boundary year 2369', () => {
      const ctx = getEraContext(2369)
      expect(ctx.series).to.include('DS9')
    })
  })
})
