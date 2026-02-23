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
    endYear: 2152,
    context: {
      series: 'Enterprise (ENT) Seasons 1–2',
      events: 'Early Starfleet deep-space exploration, first contact missions'
    }
  },
  {
    startYear: 2153,
    endYear: 2153,
    context: {
      series: 'Enterprise (ENT) Season 3',
      events: 'Xindi weapon crisis, mission to the Delphic Expanse'
    }
  },
  {
    startYear: 2154,
    endYear: 2161,
    context: {
      series: 'Enterprise (ENT) Season 4 / Earth–Romulan War',
      events: 'Coalition of Planets forms, Earth–Romulan War, UFP founded (2161)'
    }
  },
  {
    startYear: 2162,
    endYear: 2232,
    context: {
      series: 'Post-ENT Lost Era',
      events: 'Federation founding era, early expansion'
    }
  },
  {
    startYear: 2233,
    endYear: 2255,
    context: {
      series: 'Pre-series (early Starfleet)',
      events: 'Starfleet expansion, USS Discovery commissioned'
    }
  },
  {
    startYear: 2256,
    endYear: 2256,
    context: {
      series: 'Discovery (DIS) Season 1',
      events: 'Federation-Klingon War'
    }
  },
  {
    startYear: 2257,
    endYear: 2258,
    context: {
      series: 'Discovery (DIS) Season 2',
      events: 'Post-Klingon War recovery, Red Angel temporal crisis, Section 31 conflict'
    }
  },
  {
    startYear: 2259,
    endYear: 2261,
    context: {
      series: 'Strange New Worlds (SNW) Seasons 1–2',
      events: 'Pike commands the Enterprise, early Federation diplomacy'
    }
  },
  {
    startYear: 2262,
    endYear: 2265,
    context: {
      series: 'Strange New Worlds (SNW) Season 3 / early TOS',
      events: 'Pike–Kirk command transition, Enterprise exploration missions'
    }
  },
  {
    startYear: 2266,
    endYear: 2266,
    context: {
      series: 'The Original Series (TOS) Season 1',
      events: "Kirk's five-year mission begins, Corbomite Maneuver, first Klingon encounters"
    }
  },
  {
    startYear: 2267,
    endYear: 2267,
    context: {
      series: 'The Original Series (TOS) Season 2',
      events: 'Mirror Universe discovered, Trouble with Tribbles, Amok Time'
    }
  },
  {
    startYear: 2268,
    endYear: 2269,
    context: {
      series: 'The Original Series (TOS) Season 3',
      events: 'Five-year mission concludes, Turnabout Intruder'
    }
  },
  {
    startYear: 2270,
    endYear: 2270,
    context: {
      series: 'The Animated Series (TAS)',
      events: 'Extended five-year mission adventures'
    }
  },
  {
    startYear: 2271,
    endYear: 2285,
    context: {
      series: 'TOS Films: The Motion Picture to The Search for Spock',
      events: "V'Ger encounter, Khan's revenge, Genesis Project, Spock revived"
    }
  },
  {
    startYear: 2286,
    endYear: 2293,
    context: {
      series: 'TOS Films: The Voyage Home to The Undiscovered Country',
      events: 'Probe crisis, Sybok and Sha Ka Ree, Khitomer Accords'
    }
  },
  {
    startYear: 2294,
    endYear: 2344,
    context: {
      series: 'Post-TOS Lost Era',
      events: 'Federation-Cardassian tensions, early conflict begins'
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
      events: 'Post-Cardassian War recovery, early Bajoran Occupation resistance'
    }
  },
  {
    startYear: 2364,
    endYear: 2364,
    context: {
      series: 'The Next Generation (TNG) Season 1',
      events: 'Enterprise-D launched, Q introduces humanity to the Borg'
    }
  },
  {
    startYear: 2365,
    endYear: 2365,
    context: {
      series: 'The Next Generation (TNG) Season 2',
      events: 'Borg first encountered, Guinan joins crew'
    }
  },
  {
    startYear: 2366,
    endYear: 2366,
    context: {
      series: 'The Next Generation (TNG) Season 3',
      events: 'Borg invasion, Picard assimilated, Battle of Wolf 359'
    }
  },
  {
    startYear: 2367,
    endYear: 2367,
    context: {
      series: 'The Next Generation (TNG) Season 4',
      events: 'Post-Wolf 359 recovery, Klingon civil war'
    }
  },
  {
    startYear: 2368,
    endYear: 2368,
    context: {
      series: 'The Next Generation (TNG) Season 5',
      events: 'Romulan unification attempts, Federation-Cardassian armistice'
    }
  },
  {
    startYear: 2369,
    endYear: 2369,
    context: {
      series: 'TNG Season 6 / DS9 Season 1',
      events: 'DS9 station established, Bajoran wormhole to Gamma Quadrant discovered'
    }
  },
  {
    startYear: 2370,
    endYear: 2370,
    context: {
      series: 'TNG Season 7 / DS9 Season 2',
      events: 'Dominion first contact, Maquis uprising, TNG series finale'
    }
  },
  {
    startYear: 2371,
    endYear: 2371,
    context: {
      series: 'DS9 Season 3 / Voyager (VOY) Season 1',
      events: 'Voyager lost in Delta Quadrant, Dominion threat escalates, Defiant launched'
    }
  },
  {
    startYear: 2372,
    endYear: 2372,
    context: {
      series: 'DS9 Season 4 / VOY Season 2',
      events: "Klingon-Federation war resumes, Jem'Hadar attacks on Alpha Quadrant"
    }
  },
  {
    startYear: 2373,
    endYear: 2373,
    context: {
      series: 'DS9 Season 5 / VOY Season 3',
      events: 'Dominion War begins, Cardassians join Dominion, Borg attack on Earth'
    }
  },
  {
    startYear: 2374,
    endYear: 2374,
    context: {
      series: 'DS9 Season 6 / VOY Season 4',
      events: 'Dominion occupies DS9, retaken by Federation, Seven of Nine joins Voyager'
    }
  },
  {
    startYear: 2375,
    endYear: 2375,
    context: {
      series: 'DS9 Season 7 / VOY Season 5',
      events: 'Dominion War ends, Cardassia Prime devastated, Odo returns to the Link'
    }
  },
  {
    startYear: 2376,
    endYear: 2376,
    context: {
      series: 'Voyager (VOY) Season 6',
      events: 'Post-Dominion War Alpha Quadrant recovery, Voyager deep in Delta Quadrant'
    }
  },
  {
    startYear: 2377,
    endYear: 2378,
    context: {
      series: 'Voyager (VOY) Season 7',
      events: 'Voyager returns home via Borg transwarp conduit'
    }
  },
  {
    startYear: 2379,
    endYear: 2379,
    context: {
      series: 'TNG Films: Nemesis',
      events: 'Shinzon coup on Romulus, political instability in the Romulan Star Empire'
    }
  },
  {
    startYear: 2380,
    endYear: 2381,
    context: {
      series: 'Lower Decks (LD) Seasons 1–2 / Prodigy (PRO) Season 1',
      events: 'Post-Dominion War Federation recovery, new crew assignments fleet-wide'
    }
  },
  {
    startYear: 2382,
    endYear: 2384,
    context: {
      series: 'Lower Decks (LD) Seasons 3–4 / Prodigy (PRO) Season 2',
      events: 'Romulan supernova relief efforts, synth research controversy'
    }
  },
  {
    startYear: 2385,
    endYear: 2399,
    context: {
      series: 'Pre-Picard / Star Trek: Picard (PIC) Seasons 1–2',
      events: 'Romulan supernova destroys Romulus (2387), synth ban, Picard retired'
    }
  },
  {
    startYear: 2400,
    endYear: 2401,
    context: {
      series: 'Star Trek: Picard (PIC) Season 3',
      events: 'Frontier Day crisis, Borg-changeling attack on Starfleet'
    }
  },
  {
    startYear: 2402,
    endYear: 3066,
    context: {
      series: 'Post-Picard / Far future',
      events: 'Federation expansion into 25th–30th centuries'
    }
  },
  {
    startYear: 3067,
    endYear: 3067,
    context: {
      series: 'The Burn',
      events: 'The Burn destroys most dilithium across the galaxy, Federation near-collapse'
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
      series: 'Discovery (DIS) Seasons 3–5',
      events: 'Post-Burn Reconstruction, Discovery arrives from 23rd century'
    }
  },
  {
    startYear: 3192,
    endYear: 3200,
    context: {
      series: 'Starfleet Academy',
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
