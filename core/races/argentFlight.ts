import { BattleInstance, ParticipantInstance } from '../battle-types'
import { BattleEffect } from '../battleeffect/battleEffects'
import { defaultRoll, UnitInstance, UnitType } from '../unit'
import _times from 'lodash/times'
import { getBestSustainUnit } from '../battle'

export const argentFlight: BattleEffect[] = [
  {
    type: 'race',
    name: 'Argent Flight flagship',
    transformUnit: (unit: UnitInstance) => {
      // TODO should also prevent pds
      if (unit.type === UnitType.flagship) {
        return {
          ...unit,
          combat: {
            ...defaultRoll,
            hit: 7,
            count: 2,
          },
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
      _battle: BattleInstance,
      otherParticipant: ParticipantInstance,
    ) => {
      _times(otherParticipant.hitsToAssign, () => {
        const bestSustainUnit = getBestSustainUnit(otherParticipant)
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
    unit: UnitType.destroyer,
    transformUnit: (unit: UnitInstance) => {
      if (unit.type === UnitType.destroyer) {
        unit.combat!.hit = 7
      }
      return unit
    },
    afterAfb: (
      _p: ParticipantInstance,
      _battle: BattleInstance,
      otherParticipant: ParticipantInstance,
    ) => {
      _times(otherParticipant.hitsToAssign, () => {
        const bestSustainUnit = getBestSustainUnit(otherParticipant)
        if (bestSustainUnit) {
          bestSustainUnit.takenDamage = true
          bestSustainUnit.takenDamageRound = 0
        }
      })
    },
  },
]
