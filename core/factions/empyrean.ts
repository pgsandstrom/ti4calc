import { BattleInstance, ParticipantInstance } from '../battle-types'
import { BattleEffect } from '../battleeffect/battleEffects'
import { Place } from '../enums'
import { defaultRoll, UnitInstance, UnitType } from '../unit'

export const empyrean: BattleEffect[] = [
  {
    type: 'faction',
    name: 'Empyrean flagship',
    place: Place.space,
    transformUnit: (unit: UnitInstance) => {
      if (unit.type === UnitType.flagship) {
        return {
          ...unit,
          combat: {
            ...defaultRoll,
            hit: 5,
            count: 2,
          },
        }
      } else {
        return unit
      }
    },
  },
  {
    type: 'general',
    name: 'Empyrean flagship repair',
    description:
      "Empyrean flagship text: After any player's unit in this system or an adjacent system uses SUSTAIN DAMAGE, you may spend 2 influence to repair that unit.",
    place: 'both',
    count: true,
    onSustain: (
      u: UnitInstance,
      participant: ParticipantInstance,
      _battle: BattleInstance,
      effectName: string,
    ) => {
      if (participant.effects[effectName] > 0) {
        u.takenDamage = false
        participant.effects[effectName] -= 1
      }
    },
  },
]
