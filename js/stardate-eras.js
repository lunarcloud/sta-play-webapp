/**
 * Star Trek era context data for stardate display.
 *
 * Each entry covers a year range and describes:
 *   - `series`:  which Star Trek series are set in this period
 *   - `events`:  notable in-universe events / historical context
 *
 * Years are approximate in-universe calendar years.
 * Data is ordered chronologically; the first matching entry is used.
 */

/**
 * @typedef {object} EraContext
 * @property {string} series  - Series airing / set during this period
 * @property {string} events  - Notable in-universe events
 */

/**
 * @typedef {object} EraEntry
 * @property {number}     startYear - First year of the range (inclusive)
 * @property {number}     endYear   - Last year of the range (inclusive)
 * @property {EraContext} context   - Description for this era
 */

/** @type {EraEntry[]} */
const ERA_DATA = [
  {
    startYear: 2151,
    endYear: 2161,
    context: {
      series: 'During Enterprise (ENT)',
      events: 'Early Starfleet exploration, Romulan War begins'
    }
  },
  {
    startYear: 2162,
    endYear: 2232,
    context: {
      series: 'Pre-series (Lost Era)',
      events: 'United Federation of Planets founding era'
    }
  },
  {
    startYear: 2233,
    endYear: 2269,
    context: {
      series: 'During The Original Series (TOS)',
      events: "Kirk's five-year mission, first contact with many species"
    }
  },
  {
    startYear: 2270,
    endYear: 2293,
    context: {
      series: 'During The Animated Series / TOS Films',
      events: 'Khitomer Accords, end of Klingon-Federation hostilities'
    }
  },
  {
    startYear: 2294,
    endYear: 2344,
    context: {
      series: 'Post-TOS Lost Era',
      events: 'Early Federation-Cardassian tensions, eventual open war'
    }
  },
  {
    startYear: 2345,
    endYear: 2357,
    context: {
      series: 'Pre-TNG Lost Era',
      events: 'Federation-Cardassian War'
    }
  },
  {
    startYear: 2358,
    endYear: 2363,
    context: {
      series: 'Pre-TNG / Between series',
      events: 'Post-Cardassian War, early Bajoran Occupation resistance'
    }
  },
  {
    startYear: 2364,
    endYear: 2368,
    context: {
      series: 'During The Next Generation (TNG)',
      events: 'First contact with the Borg, Romulan re-emergence'
    }
  },
  {
    startYear: 2369,
    endYear: 2375,
    context: {
      series: 'During TNG, Deep Space Nine (DS9) and Voyager (VOY)',
      events: 'Dominion War, Bajoran Occupation ends, Voyager lost in Delta Quadrant'
    }
  },
  {
    startYear: 2376,
    endYear: 2378,
    context: {
      series: 'During Deep Space Nine (DS9) and Voyager (VOY)',
      events: 'Post-Dominion War reconstruction, Voyager in Delta Quadrant'
    }
  },
  {
    startYear: 2379,
    endYear: 2379,
    context: {
      series: 'TNG Films era (Nemesis)',
      events: 'Shinzon coup on Romulus, political instability'
    }
  },
  {
    startYear: 2380,
    endYear: 2386,
    context: {
      series: 'Post-TNG, pre-Picard (Lower Decks / Prodigy era)',
      events: 'Post-Dominion War recovery, Romulan supernova crisis beginning'
    }
  },
  {
    startYear: 2387,
    endYear: 2399,
    context: {
      series: 'During Star Trek: Picard (PIC) Season 1–2',
      events: 'Romulan supernova destroys Romulus, synth ban, Picard retired'
    }
  },
  {
    startYear: 2400,
    endYear: 2401,
    context: {
      series: 'During Star Trek: Picard (PIC) Season 3',
      events: 'Frontier Day crisis, Borg attack on Starfleet'
    }
  },
  {
    startYear: 2402,
    endYear: 2409,
    context: {
      series: 'Post-Picard era',
      events: 'Federation rebuilding, new exploration era begins'
    }
  },
  {
    startYear: 2410,
    endYear: 2499,
    context: {
      series: 'Far future (post-series)',
      events: '25th century Federation expansion'
    }
  },
  {
    startYear: 3067,
    endYear: 3067,
    context: {
      series: 'The Burn era',
      events: 'The Burn destroys most dilithium, Federation near-collapse'
    }
  },
  {
    startYear: 3068,
    endYear: 3188,
    context: {
      series: 'Post-Burn Dark Age',
      events: 'Federation reduced to a few worlds, dilithium trade collapsed'
    }
  },
  {
    startYear: 3189,
    endYear: 3191,
    context: {
      series: 'During Discovery (DIS) Seasons 3–5',
      events: 'Post-Burn Reconstruction, Discovery arrives from 23rd century'
    }
  },
  {
    startYear: 3192,
    endYear: 3200,
    context: {
      series: 'During Starfleet Academy',
      events: 'Post-Burn Reconstruction, new generation of Starfleet officers'
    }
  }
]

/**
 * Get the era context for a given in-universe year.
 * Returns the first era whose range contains the year.
 * Returns a default entry for years outside all defined ranges.
 * @param {number} year - The in-universe year
 * @returns {EraContext} Series and events description for that year
 */
export function getEraContext (year) {
  for (const entry of ERA_DATA) {
    if (year >= entry.startYear && year <= entry.endYear) {
      return entry.context
    }
  }

  if (year < ERA_DATA[0].startYear) {
    return { series: 'Pre-Enterprise era', events: 'Before Starfleet was founded' }
  }

  return { series: 'Far future (beyond known records)', events: 'Outside known Star Trek timeline' }
}
