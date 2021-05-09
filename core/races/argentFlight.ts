import { BattleInstance, ParticipantInstance } from '../battle-types'
import { BattleEffect, registerUse } from '../battleeffect/battleEffects'
import { defaultRoll, getUnitWithImproved, UnitInstance, UnitType } from '../unit'
import _times from 'lodash/times'
import { Place, Race } from '../enums'
import { getBestSustainUnit, hasAttackType, isHighestHitUnit } from '../unitGet'

// TODO it is ugly to have it like this. Maybe transformUnit should take the effect name?

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
    name: 'Strike Wing Alpha II',
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
  {
    type: 'promissary',
    name: 'Strike Wing Ambuscade',
    transformUnit: (
      unit: UnitInstance,
      participant: ParticipantInstance,
      place: Place,
      effectName: string,
    ) => {
      if (place === 'ground') {
        if (participant.side === 'attacker') {
          if (unit.bombardment && isHighestHitUnit(unit, participant, 'bombardment')) {
            registerUse(effectName, participant)
            return getUnitWithImproved(unit, 'bombardment', 'count')
          }
        } else if (
          !hasAttackType(participant, 'bombardment') &&
          unit.spaceCannon &&
          isHighestHitUnit(unit, participant, 'spaceCannon')
        ) {
          registerUse(effectName, participant)
          return getUnitWithImproved(unit, 'spaceCannon', 'count')
        }
      } else {
        // space combat
        if (unit.spaceCannon && isHighestHitUnit(unit, participant, 'spaceCannon')) {
          console.log('improving spacecannon')
          registerUse(effectName, participant)
          return getUnitWithImproved(unit, 'spaceCannon', 'count')
        } else if (
          !hasAttackType(participant, 'spaceCannon') &&
          unit.afb &&
          isHighestHitUnit(unit, participant, 'afb')
        ) {
          console.log('improving afb')
          registerUse(effectName, participant)
          return getUnitWithImproved(unit, 'afb', 'count')
        }
      }
      return unit
    },
    onlyFirstRound: true,
    timesPerFight: 1,
  },
  // TODO commander
]
