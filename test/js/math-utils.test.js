import { expect } from '@esm-bundle/chai'
import { clamp, lerp, Interpolate } from '../../js/math-utils.js'

describe('Math Utils', () => {
  describe('clamp', () => {
    it('should return value if within range', () => {
      expect(clamp(0.5, 0, 1)).to.equal(0.5)
      expect(clamp(5, 0, 10)).to.equal(5)
    })

    it('should return min if value is below min', () => {
      expect(clamp(-1, 0, 1)).to.equal(0)
      expect(clamp(-100, 0, 10)).to.equal(0)
    })

    it('should return max if value is above max', () => {
      expect(clamp(2, 0, 1)).to.equal(1)
      expect(clamp(100, 0, 10)).to.equal(10)
    })

    it('should use default min=0 and max=1', () => {
      expect(clamp(0.5)).to.equal(0.5)
      expect(clamp(-1)).to.equal(0)
      expect(clamp(2)).to.equal(1)
    })

    it('should handle edge values', () => {
      expect(clamp(0, 0, 1)).to.equal(0)
      expect(clamp(1, 0, 1)).to.equal(1)
    })
  })

  describe('Interpolate.identity', () => {
    it('should return clamped value', () => {
      expect(Interpolate.identity(0)).to.equal(0)
      expect(Interpolate.identity(0.5)).to.equal(0.5)
      expect(Interpolate.identity(1)).to.equal(1)
    })

    it('should clamp values outside 0-1 range', () => {
      expect(Interpolate.identity(-0.5)).to.equal(0)
      expect(Interpolate.identity(1.5)).to.equal(1)
    })
  })

  describe('Interpolate.cubic', () => {
    it('should return 0 at start', () => {
      expect(Interpolate.cubic(0)).to.equal(0)
    })

    it('should return 1 at end', () => {
      expect(Interpolate.cubic(1)).to.equal(1)
    })

    it('should return value between 0 and 1 for midpoint', () => {
      const result = Interpolate.cubic(0.5)
      expect(result).to.be.greaterThan(0)
      expect(result).to.be.lessThan(1)
    })

    it('should clamp values outside 0-1 range', () => {
      expect(Interpolate.cubic(-0.5)).to.equal(0)
      expect(Interpolate.cubic(1.5)).to.equal(1)
    })

    it('should follow cubic easing curve', () => {
      const first = Interpolate.cubic(0.25)
      const second = Interpolate.cubic(0.75)
      // Cubic easing should accelerate then decelerate
      expect(first).to.be.lessThan(0.25)
      expect(second).to.be.greaterThan(0.75)
    })
  })

  describe('Interpolate.elastic', () => {
    it('should return 0 at start', () => {
      expect(Interpolate.elastic(0)).to.equal(0)
    })

    it('should return 1 at end', () => {
      expect(Interpolate.elastic(1)).to.equal(1)
    })

    it('should clamp values outside 0-1 range', () => {
      expect(Interpolate.elastic(-0.5)).to.equal(0)
      expect(Interpolate.elastic(1.5)).to.equal(1)
    })

    it('should produce smooth values in range', () => {
      const result = Interpolate.elastic(0.5)
      expect(result).to.be.a('number')
      expect(isNaN(result)).to.be.false
    })
  })

  describe('lerp', () => {
    it('should return start value at t=0', () => {
      expect(lerp(10, 20, 0)).to.equal(10)
    })

    it('should return end value at t=1', () => {
      expect(lerp(10, 20, 1)).to.equal(20)
    })

    it('should return midpoint at t=0.5', () => {
      expect(lerp(10, 20, 0.5)).to.equal(15)
    })

    it('should work with negative values', () => {
      expect(lerp(-10, 10, 0.5)).to.equal(0)
    })

    it('should work with floating point values', () => {
      const result = lerp(0, 1, 0.75)
      expect(result).to.be.closeTo(0.75, 0.001)
    })

    it('should use identity style by default', () => {
      const result = lerp(0, 100, 0.3)
      expect(result).to.equal(30)
    })

    it('should work with cubic style', () => {
      const result = lerp(0, 100, 0.5, Interpolate.cubic)
      expect(result).to.be.greaterThan(0)
      expect(result).to.be.lessThan(100)
    })

    it('should work with elastic style', () => {
      const result = lerp(0, 100, 0.5, Interpolate.elastic)
      // Elastic interpolation can overshoot, so we just check it's a valid number
      expect(result).to.be.a('number')
      expect(isNaN(result)).to.be.false
    })
  })

  describe('Interpolate.style', () => {
    it('should have identity function reference', () => {
      expect(Interpolate.style.identity).to.be.a('function')
    })

    it('should have cubic function reference', () => {
      expect(Interpolate.style.cubic).to.be.a('function')
    })

    it('should have elastic function reference', () => {
      expect(Interpolate.style.elastic).to.be.a('function')
    })

    it('should produce same results as static methods', () => {
      expect(Interpolate.style.identity(0.5)).to.equal(Interpolate.identity(0.5))
      expect(Interpolate.style.cubic(0.5)).to.equal(Interpolate.cubic(0.5))
      expect(Interpolate.style.elastic(0.5)).to.equal(Interpolate.elastic(0.5))
    })
  })
})
