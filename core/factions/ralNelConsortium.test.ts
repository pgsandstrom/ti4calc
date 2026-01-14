import { getTestParticipant, testBattleReport } from '../../util/util.test'
import { TEST_NUMBER_OF_ROLLS } from '../constant'
import { Faction, Place } from '../enums'

describe('Ral Nel Consortium', () => {
  describe('Flagship', () => {
    it('should have combat 8x2 with sustain damage', () => {
      const attacker = getTestParticipant(
        'attacker',
        {
          flagship: 1,
        },
        Faction.ral_nel_consortium,
      )

      const defender = getTestParticipant('defender', {
        dreadnought: 1,
      })

      // Flagship (8x2 = 30% per die, 51% to hit at least once) vs Dreadnought (5 = 60%)
      // Both have sustain damage, draws are common
      testBattleReport(attacker, defender, Place.space, TEST_NUMBER_OF_ROLLS, [
        { side: 'attacker', percentage: 0.38 },
        { side: 'draw', percentage: 0.2 },
        { side: 'defender', percentage: 0.42 },
      ])
    })
  })

  describe('Alarum mech', () => {
    it('should spawn infantry each round when mech is alive', () => {
      const attacker = getTestParticipant(
        'attacker',
        {
          mech: 1,
        },
        Faction.ral_nel_consortium,
        {
          'Alarum reinforcements': 2, // Spawn 2 infantry per round
        },
      )

      const defender = getTestParticipant('defender', {
        infantry: 3,
      })

      // Mech (combat 6, sustain) + 2 infantry spawned once vs 3 infantry
      // The reinforcements give attacker an advantage
      testBattleReport(attacker, defender, Place.ground, TEST_NUMBER_OF_ROLLS, [
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
        Faction.ral_nel_consortium,
        {
          'Alarum reinforcements': 2,
        },
      )

      const defender = getTestParticipant('defender', {
        infantry: 1,
      })

      // Without a mech, reinforcements don't work - it's just 1v1 infantry
      testBattleReport(attacker, defender, Place.ground, TEST_NUMBER_OF_ROLLS, [
        { side: 'attacker', percentage: 0.41 },
        { side: 'draw', percentage: 0.18 },
        { side: 'defender', percentage: 0.41 },
      ])
    })
  })
})
