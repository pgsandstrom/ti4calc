import { ParticipantInstance, BattleInstance } from '../battle-types'
import { BattleEffect } from '../battleeffect/battleEffects'
import { HitInfo } from '../roll'
import { defaultRoll, UnitInstance, UnitType } from '../unit'

export const jolNar: BattleEffect[] = [
  {
    type: 'race',
    name: 'Jol-Nar flagship',
    transformUnit: (unit: UnitInstance) => {
      if (unit.type === UnitType.flagship) {
        return {
          ...unit,
          combat: {
            ...defaultRoll,
            hit: 6,
            count: 2,
          },
          onHit: (
            _participant: ParticipantInstance,
            _battle: BattleInstance,
            _otherParticipant: ParticipantInstance,
            hitInfo: HitInfo,
          ) => {
            hitInfo.rollInfo.forEach((roll) => {
              if (roll > 9) {
                console.log('omg jol-nar!!')
                hitInfo.hits += 2
              }
            })
          },
        }
      } else {
        return unit
      }
    },
  },
  // TODO add racial ability
  // TODO add mech
  // TODO add commander
]
