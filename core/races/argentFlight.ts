import { BattleInstance, ParticipantInstance } from '../battle-types'
import { BattleEffect, registerUse } from '../battleeffect/battleEffects'
import { defaultRoll, getUnitWithImproved, UnitInstance, UnitType } from '../unit'
import _times from 'lodash/times'
import { Place, Race } from '../enums'
import { getBestSustainUnit, getHighestHitUnit, hasAttackType, isHighestHitUnit } from '../unitGet'

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
                  // TODO Order should not be a problem because transform enemy units happen after transform friendly
                  // But are we sure it is NEVER a problem?
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
          registerUse(effectName, participant)
          return getUnitWithImproved(unit, 'spaceCannon', 'count')
        } else if (
          !hasAttackType(participant, 'spaceCannon') &&
          unit.afb &&
          isHighestHitUnit(unit, participant, 'afb')
        ) {
          registerUse(effectName, participant)
          return getUnitWithImproved(unit, 'afb', 'count')
        }
      }
      return unit
    },
    onlyFirstRound: true,
    timesPerFight: 1,
  },
  {
    type: 'commander',
    name: 'Argent Flight Commander',
    onStart: (
      participant: ParticipantInstance,
      _battle: BattleInstance,
      _otherParticipant: ParticipantInstance,
    ) => {
      // TODO This does have a theoretical weakness. We give one unit each a bonus on their unit ability.
      // But if the unit ability is repeatable and the improved unit dies, then no other unit can use the ability.
      // This is not a problem in TI4 POK, but could be a problem in homebrew factions. But Im unsure on how to solve it in a neat way.
      // I would need to build some new stuff to fix this.

      const bestBomber = getHighestHitUnit(participant, 'bombardment')
      if (bestBomber) {
        bestBomber.bombardment!.countBonus += 1
      }
      const bestAfb = getHighestHitUnit(participant, 'afb')
      if (bestAfb) {
        bestAfb.afb!.countBonus += 1
      }
      const bestSpacecannon = getHighestHitUnit(participant, 'spaceCannon')
      if (bestSpacecannon) {
        bestSpacecannon.spaceCannon!.countBonus += 1
      }
    },
  },
]
