import { BattleInstance, ParticipantInstance } from '../battle-types'
import { BattleEffect, registerUse } from '../battleeffect/battleEffects'
import { defaultRoll, UnitInstance, UnitType } from '../unit'
import _times from 'lodash/times'
import { Place, Race } from '../enums'
import { getBestSustainUnit, getHighestHitUnit } from '../unitGet'

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
    onSpaceCannon: (
      p: ParticipantInstance,
      _battle: BattleInstance,
      _otherP: ParticipantInstance,
      effectName: string,
    ) => {
      // TODO say in theory that pds is disabled. Would strike wing ambuscade still be used here, if it could be used for afb instead?
      const highestHitUnit = getHighestHitUnit(p, 'spaceCannon')
      if (highestHitUnit) {
        highestHitUnit.spaceCannon!.countBonusTmp += 1
        registerUse(effectName, p)
      }
    },
    onAfb: (
      p: ParticipantInstance,
      _battle: BattleInstance,
      _otherP: ParticipantInstance,
      effectName: string,
    ) => {
      const highestHitUnit = getHighestHitUnit(p, 'afb')
      if (highestHitUnit) {
        highestHitUnit.afb!.countBonusTmp += 1
        registerUse(effectName, p)
      }
    },
    onBombardment: (
      p: ParticipantInstance,
      battle: BattleInstance,
      _otherP: ParticipantInstance,
      effectName: string,
    ) => {
      if (p.side === 'attacker' && battle.place === Place.ground) {
        const highestHitUnit = getHighestHitUnit(p, 'bombardment')
        if (highestHitUnit) {
          highestHitUnit.bombardment!.countBonusTmp += 1
          registerUse(effectName, p)
        }
      }
    },
    timesPerFight: 1,
  },
  {
    type: 'commander',
    name: 'Argent Flight Commander',
    onAfb: (p: ParticipantInstance) => {
      const highestHitUnit = getHighestHitUnit(p, 'afb')
      if (highestHitUnit) {
        highestHitUnit.afb!.countBonusTmp += 1
      }
    },
    onSpaceCannon: (p: ParticipantInstance) => {
      const highestHitUnit = getHighestHitUnit(p, 'spaceCannon')
      if (highestHitUnit) {
        highestHitUnit.spaceCannon!.countBonusTmp += 1
      }
    },
    onBombardment: (p: ParticipantInstance) => {
      const highestHitUnit = getHighestHitUnit(p, 'bombardment')
      if (highestHitUnit) {
        highestHitUnit.bombardment!.countBonusTmp += 1
      }
    },
  },
]
