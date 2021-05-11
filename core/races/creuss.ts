import { ParticipantInstance, BattleInstance } from '../battle-types'
import { BattleEffect } from '../battleeffect/battleEffects'
import { Race } from '../enums'
import { defaultRoll, UnitInstance, UnitType } from '../unit'

export const creuss: BattleEffect[] = [
  {
    type: 'race',
    name: 'Creuss flagship',
    transformUnit: (unit: UnitInstance) => {
      if (unit.type === UnitType.flagship) {
        return {
          ...unit,
          combat: {
            ...defaultRoll,
            hit: 5,
            count: 1,
          },
        }
      } else {
        return unit
      }
    },
  },
  {
    type: 'race-tech',
    name: 'Dimensional Splicer',
    race: Race.creuss,
    onStart: (
      _participant: ParticipantInstance,
      _battle: BattleInstance,
      otherParticipant: ParticipantInstance,
    ) => {
      otherParticipant.hitsToAssign.hitsAssignedByEnemy += 1
    },
  },
]
