import { getTestParticipant, testBattleReport } from '../../util/util.test'
import { TEST_NUMBER_OF_ROLLS } from '../constant'
import { Faction, Place } from '../enums'

describe('Obsidian', () => {
  it('Obsidian flagship should have 3 dice at combat 5', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        flagship: 1,
      },
      Faction.obsidian,
    )

    const defender = getTestParticipant('defender', {
      cruiser: 1,
    })

    // Flagship: 3 dice at 5 (50% each), has sustain
    // Cruiser: 1 die at 7 (40%)
    // Flagship almost always wins due to sustain and superior firepower
    testBattleReport(attacker, defender, Place.space, TEST_NUMBER_OF_ROLLS, [
      { side: 'attacker', percentage: 0.989 },
      { side: 'draw', percentage: 0.01 },
      { side: 'defender', percentage: 0.001 },
    ])
  })

  it('Obsidian Agent should destroy an additional ship of the same type', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        destroyer: 2,
      },
      Faction.obsidian,
      {
        'Obsidian Agent': 1,
      },
    )

    const defender = getTestParticipant('defender', {
      destroyer: 2,
    })

    // Without agent this would be ~46.5% each side (symmetric)
    // With agent, when attacker kills a destroyer, another defender destroyer dies
    // This gives attacker a significant advantage
    testBattleReport(attacker, defender, Place.space, TEST_NUMBER_OF_ROLLS, [
      { side: 'attacker', percentage: 0.68 },
      { side: 'draw', percentage: 0.076 },
      { side: 'defender', percentage: 0.244 },
    ])
  })

  it('Obsidian Agent should try other dead ship types if first has no match', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        dreadnought: 2,
      },
      Faction.obsidian,
      {
        'Obsidian Agent': 1,
      },
    )

    // Defender has 1 destroyer and 2 cruisers
    // If dreadnoughts kill the destroyer first round but there's no other destroyer,
    // agent should find and destroy a cruiser instead if a cruiser also died
    const defender = getTestParticipant('defender', {
      destroyer: 1,
      cruiser: 2,
    })

    testBattleReport(attacker, defender, Place.space, TEST_NUMBER_OF_ROLLS, [
      { side: 'attacker', percentage: 0.905 },
      { side: 'draw', percentage: 0.055 },
      { side: 'defender', percentage: 0.04 },
    ])
  })

  it('Obsidian Agent should not trigger in ground combat', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        infantry: 2,
      },
      Faction.obsidian,
      {
        'Obsidian Agent': 1,
      },
    )

    const defender = getTestParticipant('defender', {
      infantry: 2,
    })

    // Agent only works in space, ground combat is symmetric 2v2 infantry
    testBattleReport(attacker, defender, Place.ground, TEST_NUMBER_OF_ROLLS, [
      { side: 'attacker', percentage: 0.465 },
      { side: 'draw', percentage: 0.07 },
      { side: 'defender', percentage: 0.465 },
    ])
  })

  it('Obsidian Commander should give +1 to combat rolls', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        cruiser: 2,
      },
      Faction.obsidian,
      {
        'Obsidian Commander': 1,
      },
    )

    const defender = getTestParticipant('defender', {
      cruiser: 2,
    })

    // Commander gives +1 to combat, so cruisers hit on 6 instead of 7
    // This should favor the attacker
    testBattleReport(attacker, defender, Place.space, TEST_NUMBER_OF_ROLLS, [
      { side: 'attacker', percentage: 0.54 },
      { side: 'draw', percentage: 0.135 },
      { side: 'defender', percentage: 0.325 },
    ])
  })

  it('Asail plot card should give +1 to all combat rolls', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        cruiser: 2,
      },
      Faction.obsidian,
      {
        'Asail (Obsidian)': 1,
      },
    )

    const defender = getTestParticipant('defender', {
      cruiser: 2,
    })

    // Asail gives +1 to combat, so cruisers hit on 6 instead of 7
    testBattleReport(attacker, defender, Place.space, TEST_NUMBER_OF_ROLLS, [
      { side: 'attacker', percentage: 0.54 },
      { side: 'draw', percentage: 0.135 },
      { side: 'defender', percentage: 0.325 },
    ])
  })
})
