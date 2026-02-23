/**
 * Stardate utilities for Star Trek Adventures.
 *
 * Supports the TNG-era (24th/25th century) stardate formula.
 * Year 2323 = stardate 0.0, each year = 1000 stardate units.
 * Formula: stardate = (year - 2323) * 1000 + (dayOfYear / daysInYear) * 1000
 *
 * Reference: The TNG system debuted in stardate 41153.7 (Season 1, 2364),
 * which aligns with (2364 - 2323) * 1000 = 41000.
 */

/**
 * The epoch year for the TNG stardate system.
 * @type {number}
 */
export const TNG_EPOCH_YEAR = 2323

/**
 * Stardate units per year.
 * @type {number}
 */
export const STARDATE_UNITS_PER_YEAR = 1000

/**
 * Determine whether a year is a leap year.
 * @param {number} year - The year to check
 * @returns {boolean} Whether the year is a leap year
 */
export function isLeapYear (year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

/**
 * Get the number of days in a year.
 * @param {number} year - The year
 * @returns {number} 366 for leap years, 365 otherwise
 */
export function daysInYear (year) {
  return isLeapYear(year) ? 366 : 365
}

/**
 * Get the day-of-year (1-based) for a given date.
 * @param {number} year  - The year
 * @param {number} month - The month (1–12)
 * @param {number} day   - The day of the month (1-based)
 * @returns {number} The day of the year (1–366)
 */
export function dayOfYear (year, month, day) {
  const daysPerMonth = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  let total = day
  for (let m = 0; m < month - 1; m++) {
    total += daysPerMonth[m]
  }
  return total
}

/**
 * Convert a TNG-era in-universe date to a stardate.
 * @param {number} year  - The in-universe year (e.g. 2364)
 * @param {number} month - The month (1–12)
 * @param {number} day   - The day (1–31)
 * @returns {number} The corresponding stardate (e.g. 41153.7)
 */
export function dateToStardate (year, month, day) {
  const doy = dayOfYear(year, month, day)
  const totalDays = daysInYear(year)
  return (year - TNG_EPOCH_YEAR) * STARDATE_UNITS_PER_YEAR +
    ((doy - 1) / totalDays) * STARDATE_UNITS_PER_YEAR
}

/**
 * Convert a TNG stardate to an approximate in-universe calendar date.
 * @param {number} stardate - The stardate value
 * @returns {{ year: number, month: number, day: number }} The approximate date
 */
export function stardateToDate (stardate) {
  const yearOffset = stardate / STARDATE_UNITS_PER_YEAR
  const year = Math.floor(yearOffset) + TNG_EPOCH_YEAR
  const fractionalYear = yearOffset - Math.floor(yearOffset)
  const totalDays = daysInYear(year)
  const dayNum = Math.floor(fractionalYear * totalDays) + 1

  const daysPerMonth = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  let remaining = dayNum
  let month = 1
  for (let m = 0; m < 12; m++) {
    if (remaining <= daysPerMonth[m]) {
      month = m + 1
      break
    }
    remaining -= daysPerMonth[m]
  }
  const day = Math.max(1, remaining)

  return { year, month, day }
}

/**
 * Format a stardate number to a display string (e.g. "41153.7").
 * @param {number} stardate - The stardate value
 * @param {number} [decimals] - Number of decimal places (default: 1)
 * @returns {string} The formatted stardate string
 */
export function formatStardate (stardate, decimals) {
  return stardate.toFixed(decimals ?? 1)
}
