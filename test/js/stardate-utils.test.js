import { expect } from '@esm-bundle/chai'
import {
  isLeapYear,
  daysInYear,
  dayOfYear,
  dateToStardate,
  stardateToDate,
  formatStardate,
  TNG_EPOCH_YEAR,
  STARDATE_UNITS_PER_YEAR
} from '../../js/stardate-utils.js'

describe('Stardate Utils', () => {
  describe('constants', () => {
    it('should export TNG_EPOCH_YEAR as 2323', () => {
      expect(TNG_EPOCH_YEAR).to.equal(2323)
    })

    it('should export STARDATE_UNITS_PER_YEAR as 1000', () => {
      expect(STARDATE_UNITS_PER_YEAR).to.equal(1000)
    })
  })

  describe('isLeapYear', () => {
    it('should return true for divisible by 4 but not 100', () => {
      expect(isLeapYear(2364)).to.be.true
      expect(isLeapYear(2000)).to.be.true
    })

    it('should return false for years divisible by 100 but not 400', () => {
      expect(isLeapYear(2100)).to.be.false
      expect(isLeapYear(2300)).to.be.false
    })

    it('should return true for years divisible by 400', () => {
      expect(isLeapYear(2400)).to.be.true
    })

    it('should return false for non-leap years', () => {
      expect(isLeapYear(2371)).to.be.false
      expect(isLeapYear(2363)).to.be.false
    })
  })

  describe('daysInYear', () => {
    it('should return 366 for leap years', () => {
      expect(daysInYear(2364)).to.equal(366)
    })

    it('should return 365 for non-leap years', () => {
      expect(daysInYear(2371)).to.equal(365)
    })
  })

  describe('dayOfYear', () => {
    it('should return 1 for January 1st', () => {
      expect(dayOfYear(2364, 1, 1)).to.equal(1)
    })

    it('should return 32 for February 1st (non-leap)', () => {
      expect(dayOfYear(2371, 2, 1)).to.equal(32)
    })

    it('should return 60 for February 29th in a leap year', () => {
      expect(dayOfYear(2364, 2, 29)).to.equal(60)
    })

    it('should return 365 for December 31st in a non-leap year', () => {
      expect(dayOfYear(2371, 12, 31)).to.equal(365)
    })

    it('should return 366 for December 31st in a leap year', () => {
      expect(dayOfYear(2364, 12, 31)).to.equal(366)
    })
  })

  describe('dateToStardate', () => {
    it('should return 0 for January 1st at the epoch year 2323', () => {
      const result = dateToStardate(2323, 1, 1)
      expect(result).to.be.closeTo(0, 0.1)
    })

    it('should return ~41000 for January 1st, 2364 (start of TNG)', () => {
      const result = dateToStardate(2364, 1, 1)
      expect(result).to.be.closeTo(41000, 1)
    })

    it('should return a higher stardate for later dates in the same year', () => {
      const jan = dateToStardate(2364, 1, 1)
      const jul = dateToStardate(2364, 7, 1)
      expect(jul).to.be.greaterThan(jan)
    })

    it('should increase by ~1000 per year', () => {
      const sd2364 = dateToStardate(2364, 1, 1)
      const sd2365 = dateToStardate(2365, 1, 1)
      expect(sd2365 - sd2364).to.be.closeTo(1000, 3)
    })
  })

  describe('stardateToDate', () => {
    it('should return year 2323 for stardate 0', () => {
      const result = stardateToDate(0)
      expect(result.year).to.equal(2323)
    })

    it('should return approximately year 2364 for stardate 41000', () => {
      const result = stardateToDate(41000)
      expect(result.year).to.equal(2364)
    })

    it('should return a valid month (1-12)', () => {
      const result = stardateToDate(48000)
      expect(result.month).to.be.at.least(1)
      expect(result.month).to.be.at.most(12)
    })

    it('should return a valid day (1-31)', () => {
      const result = stardateToDate(48000)
      expect(result.day).to.be.at.least(1)
      expect(result.day).to.be.at.most(31)
    })
  })

  describe('formatStardate', () => {
    it('should format to 1 decimal place by default', () => {
      expect(formatStardate(41153.7)).to.equal('41153.7')
    })

    it('should format to specified decimal places', () => {
      expect(formatStardate(41153.7654, 2)).to.equal('41153.77')
    })

    it('should format integer stardates with decimal', () => {
      expect(formatStardate(41000, 1)).to.equal('41000.0')
    })
  })
})
