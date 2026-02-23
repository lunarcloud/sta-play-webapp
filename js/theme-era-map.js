/**
 * Maps app themes to their appropriate in-universe year ranges and display labels.
 * Themes without a specific era (klingon, lcars-holo) are omitted so they are
 * never suggested automatically, but will also never trigger a suggestion when
 * they are the current theme.
 */

/**
 * @typedef {object} ThemeEraEntry
 * @property {string} theme       - Theme identifier (value used in <select>)
 * @property {string} label       - Human-readable theme name for confirmation dialog
 * @property {number} startYear   - First in-universe year this theme is appropriate for
 * @property {number} endYear     - Last in-universe year this theme is appropriate for
 */

/** @type {ThemeEraEntry[]} */
const THEME_ERA_RANGES = [
  { theme: 'starfleet-22', label: '22nd Century', startYear: 2100, endYear: 2232 },
  { theme: 'starfleet-23', label: 'Mid-23rd Century', startYear: 2233, endYear: 2270 },
  { theme: 'excelsior', label: 'Late-23rd Century', startYear: 2271, endYear: 2322 },
  { theme: 'lcars-24', label: 'Mid 24th Century', startYear: 2323, endYear: 2370 },
  { theme: 'lcars-late-24', label: 'Late 24th Century', startYear: 2371, endYear: 2399 },
  { theme: 'lcars-holo', label: 'Late 24th Century', startYear: 2371, endYear: 2399 },
  { theme: 'lcars-25', label: 'Early 25th Century', startYear: 2400, endYear: 2499 },
  { theme: 'tcars', label: '26th–29th Century', startYear: 2500, endYear: 2999 },
  { theme: 'starfleet-32', label: '32nd Century', startYear: 3000, endYear: 9999 }
]

/**
 * Find the best-matching theme for a given in-universe year.
 * Returns null if the current theme already matches, if the year is outside all
 * known ranges, or if the current theme has no era restriction (klingon, lcars-holo).
 * @param {number} year         - In-universe calendar year
 * @param {string} currentTheme - The currently active theme identifier
 * @returns {{ theme: string, label: string }|null} Suggested theme entry, or null
 */
export function getSuggestedTheme (year, currentTheme) {
  const suggested = THEME_ERA_RANGES.find(e => year >= e.startYear && year <= e.endYear)

  // No coverage for this year
  if (!suggested) return null

  // If the current theme has no era mapping (klingon, etc.), don't suggest
  const currentEntry = THEME_ERA_RANGES.find(e => e.theme === currentTheme)
  if (!currentEntry) return null

  // If the current theme already covers this year (e.g. lcars-holo and lcars-late-24
  // share the same range), no suggestion needed
  if (year >= currentEntry.startYear && year <= currentEntry.endYear) return null

  return { theme: suggested.theme, label: suggested.label }
}
