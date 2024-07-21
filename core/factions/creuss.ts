import { BattleInstance, ParticipantInstance } from '../battle-types'
import { BattleEffect } from '../battleeffect/battleEffects'
import { Faction, Place } from '../enums'
import { defaultRoll, UnitInstance, UnitType } from '../unit'

export const creuss: BattleEffect[] = [
  {
    type: 'faction',
    name: 'Creuss flagship',
    place: Place.space,
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
    type: 'faction-tech',
    name: 'Dimensional Splicer',
    description:
      "At the start of space combat in a system that contains a wormhole and 1 or more of your ships, you may produce 1 hit and assign it to 1 of your opponent's ships.",
    place: Place.space,
    faction: Faction.creuss,
    onStart: (
      _participant: ParticipantInstance,
      _battle: BattleInstance,
      otherParticipant: ParticipantInstance,
    ) => {
      otherParticipant.hitsToAssign.hitsAssignedByEnemy += 1
    },
  },
]
