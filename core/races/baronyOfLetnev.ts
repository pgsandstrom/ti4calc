import { ParticipantInstance, BattleInstance } from '../battle-types'
import { BattleEffect } from '../battleeffect/battleEffects'
import { Race } from '../enums'
import { defaultRoll, UnitInstance, UnitType } from '../unit'

export const baronyOfLetnev: BattleEffect[] = [
  {
    type: 'race',
    name: 'Barony of Letnev flagship',
    transformUnit: (unit: UnitInstance) => {
      // TODO add repair
      if (unit.type === UnitType.flagship) {
        return {
          ...unit,
          combat: {
            ...defaultRoll,
            hit: 5,
            count: 2,
          },
          bombardment: {
            ...defaultRoll,
            hit: 5,
            count: 3,
          },
          battleEffects: [
            {
              name: 'Barony flagship remove planetary shield',
              type: 'other',
              transformEnemyUnit: (u: UnitInstance) => {
                return {
                  ...u,
                  planetaryShield: false,
                }
              },
            },
          ],
        }
      } else {
        return unit
      }
    },
  },
  {
    name: 'Non-Euclidean Shielding',
    type: 'race-tech',
    race: Race.barony_of_letnev,
    onSustain: (_unit: UnitInstance, participant: ParticipantInstance, _battle: BattleInstance) => {
      if (participant.hitsToAssign.hitsToNonFighters > 0) {
        participant.hitsToAssign.hitsToNonFighters -= 1
      } else if (participant.hitsToAssign.hits > 0) {
        participant.hitsToAssign.hits -= 1
      }
    },
  },
]
