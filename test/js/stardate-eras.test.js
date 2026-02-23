import { expect } from '@esm-bundle/chai'
import { getEraContext } from '../../js/stardate-eras.js'

describe('Stardate Eras', () => {
  describe('getEraContext', () => {
    it('should return TOS era for year 2265', () => {
      const ctx = getEraContext(2265)
      expect(ctx.series).to.include('TOS')
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

    it('should return pre-Enterprise era for year 2100', () => {
      const ctx = getEraContext(2100)
      expect(ctx.series).to.include('Pre-Enterprise')
    })

    it('should return far future era for year 4000', () => {
      const ctx = getEraContext(4000)
      expect(ctx.series).to.include('Far future')
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
