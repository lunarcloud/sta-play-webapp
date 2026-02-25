/**
 * Stardate utilities for Star Trek Adventures.
 *
 * Supports two stardate systems:
 *
 * TOS era (pre-2323):
 *   Approximate formula aligned to Discovery-era stardates.
 *   Year 2255 = stardate 0.0, each year = 1000 units.
 *   DIS Season 1 (2256) ≈ 1000 (matching Memory Alpha's ~1207 for mid-season).
 *   TOS Season 1 (2266) ≈ 11000.
 *
 * TNG era (2323+):
 *   Year 2323 = stardate 0.0, each year = 1000 units.
 *   TNG Season 1 (2364) ≈ 41000. Formula:
 *   stardate = (year - 2323) * 1000 + (dayOfYear / daysInYear) * 1000
 *
 * The switchover year (TOS_SWITCHOVER_YEAR) is set to 2323, the point at which
 * TNG stardates start at 0.0.  This is after 2300 so no TNG stardate is negative.
 */

/**
 * The epoch year for the TOS-era stardate approximation.
 * Stardate 0.0 corresponds to the start of year 2255, placing Discovery Season 1
 * (2256) at approximately stardate 1000–2000 — consistent with Memory Alpha's
 * documented DIS stardates such as 1207.3 for 2256.
 * @type {number}
 */
export const TOS_EPOCH_YEAR = 2255

/**
 * The first year that uses the TNG stardate system.
 * Years before this use the TOS approximation.
 * Chosen as 2323 (TNG epoch) — the first year after 2300 that yields
 * a non-negative TNG stardate, preventing negative values.
 * @type {number}
 */
export const TOS_SWITCHOVER_YEAR = 2323

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
 * @param {number} [hour] - The hour of the day (0–23)
 * @returns {number} The corresponding stardate (e.g. 41153.7)
 */
export function dateToStardate (year, month, day, hour = 0) {
  const doy = dayOfYear(year, month, day)
  const totalDays = daysInYear(year)
  return (year - TNG_EPOCH_YEAR) * STARDATE_UNITS_PER_YEAR +
    ((doy - 1 + hour / 24) / totalDays) * STARDATE_UNITS_PER_YEAR
}

/**
 * Convert a TNG stardate to an approximate in-universe calendar date.
 * @param {number} stardate - The stardate value
 * @returns {{ year: number, month: number, day: number, hour: number }} The approximate date
 */
export function stardateToDate (stardate) {
  const yearOffset = stardate / STARDATE_UNITS_PER_YEAR
  const year = Math.floor(yearOffset) + TNG_EPOCH_YEAR
  const fractionalYear = yearOffset - Math.floor(yearOffset)
  const totalDays = daysInYear(year)
  const dayFraction = fractionalYear * totalDays
  const dayNum = Math.floor(dayFraction) + 1
  const hour = Math.min(23, Math.round((dayFraction % 1) * 24))

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

  return { year, month, day, hour }
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

/**
 * Convert a TOS-era in-universe date to an approximate stardate.
 * Uses the fan-community formula: (year - TOS_EPOCH_YEAR) * 1000 + dayFraction * 1000.
 * Intended for dates before TOS_SWITCHOVER_YEAR (2323).
 * @param {number} year  - The in-universe year (e.g. 2266)
 * @param {number} month - The month (1–12)
 * @param {number} day   - The day (1–31)
 * @param {number} [hour] - The hour of the day (0–23)
 * @returns {number} The approximate TOS stardate (e.g. ~1000 for 2266-01-01)
 */
export function dateToTOSStardate (year, month, day, hour = 0) {
  const doy = dayOfYear(year, month, day)
  const totalDays = daysInYear(year)
  return (year - TOS_EPOCH_YEAR) * STARDATE_UNITS_PER_YEAR +
    ((doy - 1 + hour / 24) / totalDays) * STARDATE_UNITS_PER_YEAR
}

/**
 * Convert a TOS-era stardate back to an approximate in-universe calendar date.
 * @param {number} stardate - The TOS stardate value
 * @returns {{ year: number, month: number, day: number, hour: number }} The approximate date
 */
export function tosStardateToDate (stardate) {
  const yearOffset = stardate / STARDATE_UNITS_PER_YEAR
  const year = Math.floor(yearOffset) + TOS_EPOCH_YEAR
  const fractionalYear = yearOffset - Math.floor(yearOffset)
  const totalDays = daysInYear(year)
  const dayFraction = fractionalYear * totalDays
  const dayNum = Math.floor(dayFraction) + 1
  const hour = Math.min(23, Math.round((dayFraction % 1) * 24))

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

  return { year, month, day, hour }
}
