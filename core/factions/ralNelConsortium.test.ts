import { describe, it } from 'node:test'

import { TEST_NUMBER_OF_ROLLS } from '@/core/constant'
import { getTestParticipant, testBattleReport } from '@/util/util.test'

describe('Ral Nel Consortium', () => {
  describe('Alarum mech', () => {
    it('should spawn infantry each round when mech is alive', () => {
      const attacker = getTestParticipant(
        'attacker',
        {
          mech: 1,
        },
        'Ral Nel Consortium',
        {
          'Alarum reinforcements': 2, // Spawn 2 infantry per round
        },
      )

      const defender = getTestParticipant('defender', {
        infantry: 3,
      })

      // Mech (combat 6, sustain) + 2 infantry spawned once vs 3 infantry
      // The reinforcements give attacker an advantage
      testBattleReport(attacker, defender, 'ground', TEST_NUMBER_OF_ROLLS, [
        { side: 'attacker', percentage: 0.64 },
        { side: 'defender', percentage: 0.33 },
      ])
    })

    it('should not spawn infantry if no mech is present', () => {
      const attacker = getTestParticipant(
        'attacker',
        {
          infantry: 1,
        },
        'Ral Nel Consortium',
        {
          'Alarum reinforcements': 2,
        },
      )

      const defender = getTestParticipant('defender', {
        infantry: 1,
      })

      // Without a mech, reinforcements don't work - it's just 1v1 infantry
      testBattleReport(attacker, defender, 'ground', TEST_NUMBER_OF_ROLLS, [
        { side: 'attacker', percentage: 0.41 },
        { side: 'draw', percentage: 0.18 },
        { side: 'defender', percentage: 0.41 },
      ])
    })
  })

  describe('PDS in space and Linkship', () => {
    it('a normal destroyer can use a PDS in space to fire SPACE CANNON', () => {
      const attacker = getTestParticipant(
        'attacker',
        {
          destroyer: 1,
        },
        'Ral Nel Consortium',
        {
          'Ral Nel PDS in space': 1,
        },
      )

      const defender = getTestParticipant('defender', {
        destroyer: 1,
      })

      // 1 PDS shot at 6+ (50%) before combat, then destroyer (9+) vs destroyer (9+)
      testBattleReport(attacker, defender, 'space', TEST_NUMBER_OF_ROLLS, [
        { side: 'attacker', percentage: 0.722 },
        { side: 'draw', percentage: 0.055 },
        { side: 'defender', percentage: 0.222 },
      ])
    })

    it('a PDS in space does not fire without a destroyer to use it', () => {
      const attacker = getTestParticipant(
        'attacker',
        {
          cruiser: 1,
        },
        'Ral Nel Consortium',
        {
          'Ral Nel PDS in space': 1,
        },
      )

      const defender = getTestParticipant('defender', {
        cruiser: 1,
      })

      // No destroyer present, so the PDS in space cannot fire. Symmetric 1v1 cruiser battle.
      testBattleReport(attacker, defender, 'space', TEST_NUMBER_OF_ROLLS, [
        { side: 'attacker', percentage: 0.375 },
        { side: 'draw', percentage: 0.25 },
        { side: 'defender', percentage: 0.375 },
      ])
    })

    it('a PDS in space can only be used once by normal destroyers', () => {
      const attacker = getTestParticipant(
        'attacker',
        {
          destroyer: 3,
        },
        'Ral Nel Consortium',
        {
          'Ral Nel PDS in space': 1,
        },
      )

      const defender = getTestParticipant('defender', {
        destroyer: 3,
      })

      // 3 normal destroyers but only 1 PDS in space, so just 1 PDS shot at 6+ (50%),
      // then 3 destroyers (9+) vs 3 destroyers (9+).
      testBattleReport(attacker, defender, 'space', TEST_NUMBER_OF_ROLLS, [
        { side: 'attacker', percentage: 0.643 },
        { side: 'draw', percentage: 0.023 },
        { side: 'defender', percentage: 0.334 },
      ])
    })

    it('each Linkship can trigger the same PDS in space', () => {
      const attacker = getTestParticipant(
        'attacker',
        {
          destroyer: 3,
        },
        'Ral Nel Consortium',
        {
          'Ral Nel PDS in space': 1,
        },
        {
          destroyer: true,
        },
      )

      const defender = getTestParticipant('defender', {
        destroyer: 3,
      })

      // 3 Linkships each trigger the single PDS in space = 3 PDS shots at 6+ (50%),
      // then 3 Linkships (combat 8+) vs 3 destroyers (combat 9+).
      testBattleReport(attacker, defender, 'space', TEST_NUMBER_OF_ROLLS, [
        { side: 'attacker', percentage: 0.924 },
        { side: 'draw', percentage: 0.01 },
        { side: 'defender', percentage: 0.066 },
      ])
    })

    it('a galvanized PDS in space fires SPACE CANNON 6 (x2)', () => {
      const attacker = getTestParticipant(
        'attacker',
        {
          destroyer: 1,
        },
        'Ral Nel Consortium',
        {
          'Ral Nel galvanized PDS in space': 1,
        },
      )

      const defender = getTestParticipant('defender', {
        destroyer: 1,
      })

      // Galvanized PDS shot at 6+ (x2) before combat, then destroyer (9+) vs destroyer (9+).
      testBattleReport(attacker, defender, 'space', TEST_NUMBER_OF_ROLLS, [
        { side: 'attacker', percentage: 0.861 },
        { side: 'draw', percentage: 0.028 },
        { side: 'defender', percentage: 0.111 },
      ])
    })

    it('a space dock with Lightrail Ordnance in space fires SPACE CANNON 5 (x2)', () => {
      const attacker = getTestParticipant(
        'attacker',
        {
          destroyer: 1,
        },
        'Ral Nel Consortium',
        {
          'Ral Nel space dock with Lightrail Ordnance in space': 1,
        },
      )

      const defender = getTestParticipant('defender', {
        destroyer: 1,
      })

      // Space dock shot at 5+ (x2) before combat, then destroyer (9+) vs destroyer (9+).
      testBattleReport(attacker, defender, 'space', TEST_NUMBER_OF_ROLLS, [
        { side: 'attacker', percentage: 0.911 },
        { side: 'draw', percentage: 0.018 },
        { side: 'defender', percentage: 0.071 },
      ])
    })

    it('a destroyer uses the strongest available structure first', () => {
      const attacker = getTestParticipant(
        'attacker',
        {
          destroyer: 1,
        },
        'Ral Nel Consortium',
        {
          'Ral Nel PDS in space': 1,
          'Ral Nel galvanized PDS in space': 1,
          'Ral Nel space dock with Lightrail Ordnance in space': 1,
        },
      )

      const defender = getTestParticipant('defender', {
        destroyer: 1,
      })

      // The single destroyer picks the strongest structure: the space dock (5+ x2).
      // The galvanized PDS and plain PDS go unused, so this matches the space dock test.
      testBattleReport(attacker, defender, 'space', TEST_NUMBER_OF_ROLLS, [
        { side: 'attacker', percentage: 0.911 },
        { side: 'draw', percentage: 0.018 },
        { side: 'defender', percentage: 0.071 },
      ])
    })

    it('Linkship does not trigger in ground combat', () => {
      const attacker = getTestParticipant(
        'attacker',
        {
          infantry: 2,
        },
        'Ral Nel Consortium',
        {
          'Ral Nel PDS in space': 1,
        },
        {
          destroyer: true,
        },
      )

      const defender = getTestParticipant('defender', {
        infantry: 2,
      })

      // Ground combat, PDS-in-space and linkships have no effect.
      // Symmetrical 2v2 infantry battle.
      testBattleReport(attacker, defender, 'ground', TEST_NUMBER_OF_ROLLS, [
        { side: 'attacker', percentage: 0.46 },
        { side: 'draw', percentage: 0.08 },
        { side: 'defender', percentage: 0.46 },
      ])
    })
  })
})
