import { describe, it } from 'node:test'

import { TEST_NUMBER_OF_ROLLS } from '@/core/constant'
import { getTestParticipant, testBattleReport } from '@/util/util.test'

describe('Last Bastion', () => {
  it('flagship should have combat 9x2', () => {
    // Flagship has combat 9x2 (20% per die, ~36% at least one hit)
    // vs cruiser with combat 7 (40%)
    // Flagship sustains, so it should win most of the time
    const attacker = getTestParticipant('attacker', { flagship: 1 }, 'Last Bastion')
    const defender = getTestParticipant('defender', { cruiser: 1 })

    // Flagship 9x2 with sustain vs cruiser 7
    // attacker ~73%, draw ~10%, defender ~17%
    testBattleReport(attacker, defender, 'space', TEST_NUMBER_OF_ROLLS, [
      { side: 'attacker', percentage: 0.73 },
      { side: 'draw', percentage: 0.1 },
      { side: 'defender', percentage: 0.17 },
    ])
  })

  it('flagship planet bonus should add +1 per planet to combat', () => {
    // With 3 planets, flagship has combat 6x2 instead of 9x2
    // (9 - 3 = 6 to hit, 50% per die, ~75% at least one hit)
    const attacker = getTestParticipant('attacker', { flagship: 1 }, 'Last Bastion', {
      'The Egeiro planet bonus': 3,
    })
    const defender = getTestParticipant('defender', { cruiser: 1 })

    // Flagship 6x2 with sustain vs cruiser 7
    // attacker ~94.5%, draw ~4.2%, defender ~1.4%
    testBattleReport(attacker, defender, 'space', TEST_NUMBER_OF_ROLLS, [
      { side: 'attacker', percentage: 0.945 },
      { side: 'draw', percentage: 0.042 },
      { side: 'defender', percentage: 0.014 },
    ])
  })

  it('mech galvanize ability should galvanize infantry when galvanized mech dies', () => {
    // 1 galvanized mech + 2 infantry vs 3 infantry
    // When mech dies while galvanized, it galvanizes up to 3 infantry
    // Mech has sustain + combat 6 (50%), infantry combat 8 (30%)
    const attacker = getTestParticipant(
      'attacker',
      { mech: 1, infantry: 2 },
      'Last Bastion',
      { 'A3 Valiance galvanize': 1 },
      {},
      {},
      { mech: 1 }, // galvanized
    )
    const defender = getTestParticipant('defender', { infantry: 3 })

    // Galvanized mech (2 dice, sustain) + 2 infantry vs 3 infantry
    // Infantry get galvanized when mech dies, giving them advantage
    // attacker ~94%, draw ~2.5%, defender ~3.5%
    testBattleReport(attacker, defender, 'ground', TEST_NUMBER_OF_ROLLS, [
      { side: 'attacker', percentage: 0.94 },
      { side: 'draw', percentage: 0.025 },
      { side: 'defender', percentage: 0.035 },
    ])
  })

  it('agent should galvanize a unit when own unit dies', () => {
    // Compare agent vs no agent in symmetric battle
    // 3 infantry with agent vs 3 infantry
    // When one infantry dies, agent galvanizes another (+1 die)
    const attacker = getTestParticipant('attacker', { infantry: 3 }, 'Last Bastion', {
      'Last Bastion agent': 1,
    })
    const defender = getTestParticipant('defender', { infantry: 3 })

    // 3v3 infantry is normally ~40/20/40
    // Agent provides significant advantage by galvanizing when unit dies
    // attacker ~58%, draw ~7%, defender ~35%
    testBattleReport(attacker, defender, 'ground', TEST_NUMBER_OF_ROLLS, [
      { side: 'attacker', percentage: 0.58 },
      { side: 'draw', percentage: 0.07 },
      { side: 'defender', percentage: 0.35 },
    ])
  })

  it('agent should galvanize the highest worth unit', () => {
    // 1 dreadnought (diePriority=40) + 2 fighters (diePriority=100) vs 2 dreadnoughts
    // Agent should galvanize the dreadnought (highest worth), not a fighter
    // Galvanized dreadnought gets combat 5x2 (sustain) which is much more valuable
    const attacker = getTestParticipant(
      'attacker',
      { dreadnought: 1, fighter: 2 },
      'Last Bastion',
      {
        'Last Bastion agent': 1,
      },
    )
    const defender = getTestParticipant('defender', { dreadnought: 2 })

    // Dreadnought 5 (60%) + 2 fighters 9x1 (20% each) vs 2 dreadnoughts 5 (60% each)
    // Agent galvanizes dreadnought when a fighter dies, giving +1 die
    // attacker ~44%, draw ~19%, defender ~37%
    testBattleReport(attacker, defender, 'space', TEST_NUMBER_OF_ROLLS, [
      { side: 'attacker', percentage: 0.44 },
      { side: 'draw', percentage: 0.19 },
      { side: 'defender', percentage: 0.37 },
    ])
  })

  it('hero should roll against enemy units when galvanized unit dies', () => {
    // 2 galvanized infantry vs 2 infantry
    // When galvanized units die, hero rolls vs each enemy unit
    // Infantry combat 8, so hero needs 8+ (30% each)
    const attacker = getTestParticipant(
      'attacker',
      { infantry: 2 },
      'Last Bastion',
      { 'Last Bastion hero': 1 },
      {},
      {},
      { infantry: 2 }, // galvanized
    )
    const defender = getTestParticipant('defender', { infantry: 2 })

    // Galvanized infantry get +1 die (60% hit vs 30%)
    // Hero can destroy enemy units when galvanized unit dies (once per fight)
    // attacker ~76%, draw ~10%, defender ~14%
    testBattleReport(attacker, defender, 'ground', TEST_NUMBER_OF_ROLLS, [
      { side: 'attacker', percentage: 0.76 },
      { side: 'draw', percentage: 0.1 },
      { side: 'defender', percentage: 0.14 },
    ])
  })

  it('hero should use dead galvanized unit combat value for rolls', () => {
    // 1 galvanized war sun vs 3 destroyers with assault cannon
    // Assault cannon destroys the war sun (only non-fighter ship)
    // Hero triggers: war sun combat 3, rolls d10 per enemy, destroys on >= 3 (80% each)
    // P(all 3 destroyed) = 0.8^3 ≈ 0.512 -> draw
    // P(any survive) ≈ 0.488 -> defender wins
    const attacker = getTestParticipant(
      'attacker',
      { warsun: 1 },
      'Last Bastion',
      { 'Last Bastion hero': 1 },
      {},
      {},
      { warsun: 1 }, // galvanized
    )
    const defender = getTestParticipant('defender', { destroyer: 3 }, undefined, {
      'Assault Cannon': 1,
    })

    testBattleReport(attacker, defender, 'space', TEST_NUMBER_OF_ROLLS, [
      { side: 'attacker', percentage: 0 },
      { side: 'draw', percentage: 0.51 },
      { side: 'defender', percentage: 0.49 },
    ])
  })

  it('faction tech should cancel bombardment hits based on galvanized ground forces', () => {
    // Defender has galvanized infantry which should cancel bombardment hits
    // Dreadnought bombardment 5 (60% hit) with 1 infantry vs 2 galvanized infantry
    const attacker = getTestParticipant('attacker', { dreadnought: 1, infantry: 1 })
    const defender = getTestParticipant(
      'defender',
      { infantry: 2 },
      'Last Bastion',
      { 'Proxima Targeting VI': 1 },
      {},
      {},
      { infantry: 2 }, // galvanized
    )

    // 2 galvanized infantry can cancel 2 bombardment hits (soakHits)
    // After bombardment, 1 infantry vs 2 galvanized infantry (with +1 die each)
    // Defender should win heavily
    // attacker ~0.1%, draw ~0.1%, defender ~99.8%
    testBattleReport(attacker, defender, 'ground', TEST_NUMBER_OF_ROLLS, [
      { side: 'attacker', percentage: 0.001 },
      { side: 'draw', percentage: 0.001 },
      { side: 'defender', percentage: 0.998 },
    ])
  })

  it('faction tech bombardment should hit both sides', () => {
    // Attacker has faction tech which gives bombardment 8x3 that hits both sides
    // 3 infantry vs 3 infantry, attacker uses Proxima bombardment
    const attacker = getTestParticipant('attacker', { infantry: 3 }, 'Last Bastion', {
      'Proxima Targeting VI': 1,
    })
    const defender = getTestParticipant('defender', { infantry: 3 })

    // Bombardment 8 (x3) = 30% per die, hits both sides equally
    // This should make the battle slightly favor the defender
    // attacker ~45%, draw ~11%, defender ~44%
    testBattleReport(attacker, defender, 'ground', TEST_NUMBER_OF_ROLLS, [
      { side: 'attacker', percentage: 0.45 },
      { side: 'draw', percentage: 0.11 },
      { side: 'defender', percentage: 0.44 },
    ])
  })
})
