import { BattleInstance, ParticipantInstance } from '../battle-types'
import { BattleEffect } from '../battleeffect/battleEffects'
import { defaultRoll, UnitInstance, UnitType } from '../unit'
import _times from 'lodash/times'
import { getBestSustainUnit } from '../battle'
import { Place, Race } from '../enums'

export const argentFlight: BattleEffect[] = [
  {
    type: 'race',
    name: 'Argent Flight flagship',
    transformUnit: (unit: UnitInstance) => {
      if (unit.type === UnitType.flagship) {
        return {
          ...unit,
          combat: {
            ...defaultRoll,
            hit: 7,
            count: 2,
          },
          battleEffects: [
            {
              name: 'Argent Flight flagship preventing pds',
              type: 'other',
              transformEnemyUnit: (
                unit: UnitInstance,
                _participant: ParticipantInstance,
                place: Place,
              ) => {
                if (place === Place.space) {
                  // TODO Could this ever be a problem? In other battle effects we assume units have pds. Maybe we need a priority system?
                  return {
                    ...unit,
                    spaceCannon: undefined,
                  }
                } else {
                  return unit
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
    type: 'race',
    name: 'Argent Flight destroyers',
    transformUnit: (unit: UnitInstance) => {
      if (unit.type === UnitType.destroyer) {
        unit.combat!.hit = 8
      }
      return unit
    },
    afterAfb: (
      _p: ParticipantInstance,
      battle: BattleInstance,
      otherParticipant: ParticipantInstance,
    ) => {
      _times(otherParticipant.hitsToAssign.hits, () => {
        const bestSustainUnit = getBestSustainUnit(otherParticipant, battle.place, true)
        if (bestSustainUnit) {
          bestSustainUnit.takenDamage = true
          bestSustainUnit.takenDamageRound = 0
        }
      })
    },
  },
  {
    type: 'race-tech',
    name: 'Argent Flight destroyers upgrade',
    race: Race.argent_flight,
    unit: UnitType.destroyer,
    transformUnit: (unit: UnitInstance) => {
      if (unit.type === UnitType.destroyer) {
        unit.combat!.hit = 7
      }
      return unit
    },
    afterAfb: (
      _p: ParticipantInstance,
      battle: BattleInstance,
      otherParticipant: ParticipantInstance,
    ) => {
      _times(otherParticipant.hitsToAssign.hits, () => {
        const bestSustainUnit = getBestSustainUnit(otherParticipant, battle.place, true)
        if (bestSustainUnit) {
          bestSustainUnit.takenDamage = true
          bestSustainUnit.takenDamageRound = 0
        }
      })
    },
  },
]
