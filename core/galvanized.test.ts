import { getTestParticipant, testBattleReport } from '../util/util.test'
import { TEST_NUMBER_OF_ROLLS } from './constant'
import { Place } from './enums'

describe('Galvanized', () => {
  it('galvanized cruiser should win more often than non-galvanized', () => {
    // A galvanized cruiser gets +1 die (2 dice total instead of 1)
    // This gives a significant combat advantage
    const attacker = getTestParticipant(
      'attacker',
      { cruiser: 1 },
      undefined,
      {},
      {},
      {},
      { cruiser: 1 }, // galvanized
    )

    const defender = getTestParticipant('defender', { cruiser: 1 })

    // Galvanized cruiser (2 dice at 40%) vs normal cruiser (1 die at 40%)
    // Attacker has ~64% chance to hit vs defender's ~40%
    testBattleReport(attacker, defender, Place.space, TEST_NUMBER_OF_ROLLS, [
      { side: 'attacker', percentage: 0.49 },
      { side: 'draw', percentage: 0.325 },
      { side: 'defender', percentage: 0.185 },
    ])
  })

  it('galvanized dreadnought should get +1 die in combat', () => {
    // Dreadnought normally hits on 5+ (60% per die) with 1 die
    // Galvanized gets 2 dice, so 84% chance of at least one hit
    const attacker = getTestParticipant(
      'attacker',
      { dreadnought: 1 },
      undefined,
      {},
      {},
      {},
      { dreadnought: 1 }, // galvanized
    )

    const defender = getTestParticipant('defender', { dreadnought: 1 })

    // Galvanized dreadnought (2 dice at 60%) vs normal dreadnought (1 die at 60%)
    // From test run: attacker wins ~71%, draw ~21%
    testBattleReport(attacker, defender, Place.space, TEST_NUMBER_OF_ROLLS, [
      { side: 'attacker', percentage: 0.71 },
      { side: 'draw', percentage: 0.21 },
      { side: 'defender', percentage: 0.08 },
    ])
  })

  it('galvanized unit should get +1 die for bombardment', () => {
    // Dreadnought bombardment hits on 5+ (60% per die)
    // Galvanized gets 2 dice for bombardment
    // Add infantry to attacker so they can win ground combat after bombardment
    const attacker = getTestParticipant(
      'attacker',
      { dreadnought: 1, infantry: 1 },
      undefined,
      {},
      {},
      {},
      { dreadnought: 1 }, // galvanized dreadnought
    )

    const defender = getTestParticipant('defender', { infantry: 2 })

    // Galvanized dreadnought has 2 bombardment dice (84% chance of at least 1 hit)
    // This kills ~1.2 infantry on average before ground combat
    // Then 1 infantry vs ~0.8 infantry
    testBattleReport(attacker, defender, Place.ground, TEST_NUMBER_OF_ROLLS, [
      { side: 'attacker', percentage: 0.57 },
      { side: 'draw', percentage: 0.09 },
      { side: 'defender', percentage: 0.34 },
    ])
  })
})
