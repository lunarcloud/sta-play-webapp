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
    startYear: 1893,
    endYear: 1893,
    context: {
      series: "The Next Generation (TNG): Time's Arrow",
      events: 'Temporal incursion in San Francisco, Devidian activity, encounter with Mark Twain'
    }
  },
  {
    startYear: 1930,
    endYear: 1930,
    context: {
      series: 'The Original Series (TOS): The City on the Edge of Forever',
      events: 'Great Depression-era New York, Edith Keeler, history threatened through the Guardian of Forever'
    }
  },
  {
    startYear: 1947,
    endYear: 1947,
    context: {
      series: 'Deep Space Nine (DS9): Little Green Men',
      events: 'Roswell incident involving time-displaced Ferengi'
    }
  },
  {
    startYear: 1968,
    endYear: 1968,
    context: {
      series: 'The Original Series (TOS): Assignment: Earth',
      events: 'Gary Seven operates on Earth, orbital nuclear weapons crisis'
    }
  },
  {
    startYear: 1969,
    endYear: 1969,
    context: {
      series: 'The Original Series (TOS): Tomorrow Is Yesterday',
      events: 'Enterprise detected by the US Air Force, temporal incident before the first Moon landing'
    }
  },
  {
    startYear: 1986,
    endYear: 1986,
    context: {
      series: 'Star Trek IV: The Voyage Home',
      events: 'Time-travel mission to San Francisco to retrieve humpback whales'
    }
  },
  {
    startYear: 1992,
    endYear: 1995,
    context: {
      series: 'Pre-Enterprise era',
      events: 'Eugenics Wars (original TOS chronology: 1992–1996; shifted to the 21st century in SNW), Augment rule'
    }
  },
  {
    startYear: 1996,
    endYear: 1996,
    context: {
      series: "Voyager (VOY): Future's End / original Eugenics Wars chronology",
      events: 'Voyager visits Los Angeles, 29th-century technology threatens history; Eugenics Wars end in the original TOS chronology (shifted to the 21st century in SNW)'
    }
  },
  {
    startYear: 2024,
    endYear: 2024,
    context: {
      series: 'Deep Space Nine (DS9): Past Tense / Picard (PIC) Season 2',
      events: 'Bell Riots in San Francisco, Europa Mission launch, temporal interference'
    }
  },
  {
    startYear: 2030,
    endYear: 2039,
    context: {
      series: 'Pre-Enterprise era / Strange New Worlds revised chronology',
      events: 'Eugenics Wars (approximate 2030s placement; exact revised dates uncertain), shifted from 1992–1996 by temporal interference'
    }
  },
  {
    startYear: 2063,
    endYear: 2063,
    context: {
      series: 'Star Trek: First Contact',
      events: 'First Contact Day (April 5): Phoenix warp flight, official first contact between humans and Vulcans'
    }
  },
  {
    startYear: 2151,
    endYear: 2151,
    context: {
      series: 'Enterprise (ENT) Season 1',
      events: 'Enterprise NX-01 launches, early Starfleet deep-space exploration'
    }
  },
  {
    startYear: 2152,
    endYear: 2152,
    context: {
      series: 'Enterprise (ENT) Season 2',
      events: 'Deep-space exploration, first contact missions, mounting regional tensions'
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
    endYear: 2155,
    context: {
      series: 'Enterprise (ENT) Season 4',
      events: 'Xindi crisis aftermath, Vulcan reformation, Coalition of Planets talks'
    }
  },
  {
    startYear: 2156,
    endYear: 2161,
    context: {
      series: 'Post-Enterprise era / Enterprise finale (2161)',
      events: 'Earth–Romulan War (2156–2160), UFP founded (2161)'
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
      events: 'Enterprise exploration missions, early Federation diplomacy'
    }
  },
  {
    startYear: 2262,
    endYear: 2265,
    context: {
      series: 'Strange New Worlds (SNW) Season 3 / early TOS',
      events: 'Enterprise command transition, Federation-Klingon border tensions'
    }
  },
  {
    startYear: 2266,
    endYear: 2266,
    context: {
      series: 'The Original Series (TOS) Season 1',
      events: 'Five-year mission begins, first contact with many new species, Klingon border conflicts'
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
      series: 'The Original Series (TOS) Season 3 / STA Living Campaign',
      events: 'Five-year mission concludes'
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
      events: "V'Ger crisis, Genesis Project, Klingon-Federation tensions rise"
    }
  },
  {
    startYear: 2286,
    endYear: 2293,
    context: {
      series: 'TOS Films: The Voyage Home to The Undiscovered Country',
      events: 'Probe crisis, Khitomer Accords signed'
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
      events: 'Borg first encountered in the Delta Quadrant'
    }
  },
  {
    startYear: 2366,
    endYear: 2366,
    context: {
      series: 'The Next Generation (TNG) Season 3',
      events: 'Borg invasion of the Alpha Quadrant, Battle of Wolf 359'
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
      events: 'DS9 station established, Bajoran wormhole to Gamma Quadrant discovered, Narendra Station operational'
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
      series: 'DS9 Season 3 / Voyager (VOY) Season 1 / STA Living Campaign',
      events: 'Voyager lost in Delta Quadrant, Dominion threat escalates, Defiant launched, Starfleet and KDF explore the Shackleton Expanse'
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
      events: 'Dominion occupies DS9, retaken by Federation, Borg collective infiltrated'
    }
  },
  {
    startYear: 2375,
    endYear: 2375,
    context: {
      series: 'DS9 Season 7 / VOY Season 5',
      events: 'Dominion War ends, Cardassia Prime devastated, Dominion withdraws to Gamma Quadrant'
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
      series: 'Lower Decks (LD) Seasons 1–2',
      events: 'Post-Dominion War Federation recovery, new crew assignments fleet-wide'
    }
  },
  {
    startYear: 2382,
    endYear: 2383,
    context: {
      series: 'Lower Decks (LD) Seasons 3–4 / Prodigy (PRO) Season 1',
      events: 'Romulan supernova relief efforts begin, young cadets encounter Starfleet'
    }
  },
  {
    startYear: 2384,
    endYear: 2384,
    context: {
      series: 'Lower Decks (LD) Season 5',
      events: 'Federation fleet assignments, Romulan relief preparations'
    }
  },
  {
    startYear: 2385,
    endYear: 2385,
    context: {
      series: 'Prodigy (PRO) Season 2',
      events: 'Synth attack on Mars / Utopia Planitia destroys Romulan relief fleet, synthetic life banned'
    }
  },
  {
    startYear: 2386,
    endYear: 2399,
    context: {
      series: 'Pre-Picard / Star Trek: Picard (PIC) Seasons 1–2',
      events: 'Romulan supernova destroys Romulus (2387), Federation withdraws from relief efforts, synth ban in effect'
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

  if (year < 2151) {
    return { series: 'Pre-Enterprise era', events: 'Before Starfleet was founded' }
  }

  return { series: 'Far future (beyond known records)', events: 'Outside known Star Trek timeline' }
}
