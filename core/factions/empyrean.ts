import { BattleInstance, ParticipantInstance } from '../battle-types'
import { BattleEffect } from '../battleeffect/battleEffects'
import { Place } from '../enums'
import { UnitInstance, UnitType, defaultRoll } from '../unit'

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
      // TODO currently we have no good way of determining if we already used this ability
      // we need to refactor the assign hit step somehow.
      // or maybe add some weird id system to ships, I dunno.

      // if (u.takenDamageRound === battle.roundNumber) {
      // prevent ability from being used several times the same round
      // return false
      // }

      if (participant.effects[effectName] > 0) {
        u.takenDamage = false
        participant.effects[effectName] -= 1
      }
    },
  },
]
