import _times from 'lodash/times'

import { logWrapper } from '../../util/util-log'
import { BattleInstance, ParticipantInstance } from '../battle-types'
import { BattleEffect, registerUse } from '../battleeffect/battleEffects'
import { Faction, Place } from '../enums'
import { defaultRoll, UnitInstance, UnitType } from '../unit'
import { getHighestHitUnit, getLowestWorthSustainUnit, getUnits } from '../unitGet'

export const argentFlight: BattleEffect[] = [
  {
    type: 'faction',
    name: 'Argent Flight flagship',
    place: Place.space,
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
              place: Place.space,
              transformEnemyUnit: (
                unit: UnitInstance,
                _participant: ParticipantInstance,
                place: Place,
              ) => {
                if (place === Place.space) {
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
    type: 'faction',
    name: 'Argent Flight destroyers',
    place: Place.space,
    transformUnit: (unit: UnitInstance) => {
      if (unit.type === UnitType.destroyer) {
        unit.combat!.hit = 8
      }
      return unit
    },
    afterAfb: (
      p: ParticipantInstance,
      battle: BattleInstance,
      otherParticipant: ParticipantInstance,
    ) => {
      // raid formation
      _times(otherParticipant.afbHitsToAssign.fighterHitsToAssign, () => {
        const bestSustainUnit = getLowestWorthSustainUnit(otherParticipant, battle.place, true)
        if (bestSustainUnit) {
          logWrapper(
            `${
              p.side === 'attacker' ? 'defender' : 'attacker'
            } used sustain damage from Argent anti fighter barrage`,
          )
          bestSustainUnit.takenDamage = true
          bestSustainUnit.takenDamageRound = 0
        }
      })
    },
  },
  {
    type: 'faction-tech',
    name: 'Strike Wing Alpha II',
    place: Place.space,
    faction: Faction.argent_flight,
    unit: UnitType.destroyer,
    transformUnit: (unit: UnitInstance) => {
      if (unit.type === UnitType.destroyer) {
        return {
          ...unit,
          combat: {
            ...unit.combat!,
            hit: 7,
          },
          afb: {
            ...unit.afb!,
            hit: 6,
            count: 3,
          },
        }
      }
      return unit
    },
    afterAfb: (
      p: ParticipantInstance,
      battle: BattleInstance,
      otherParticipant: ParticipantInstance,
    ) => {
      // raid formation
      _times(otherParticipant.afbHitsToAssign.fighterHitsToAssign, () => {
        const bestSustainUnit = getLowestWorthSustainUnit(otherParticipant, battle.place, true)
        if (bestSustainUnit) {
          logWrapper(
            `${
              p.side === 'attacker' ? 'defender' : 'attacker'
            } used sustain damage from Argent anti fighter barrage`,
          )
          bestSustainUnit.takenDamage = true
          bestSustainUnit.takenDamageRound = 0
        }
      })
      // strike wing alpha II
      for (const rollInfo of otherParticipant.afbHitsToAssign.rollInfoList) {
        if (rollInfo.roll >= 9) {
          const infantryToDestroy = getUnits(otherParticipant, undefined, false) // place must be undefined or infantry are filtered out
            .find((u) => u.type === UnitType.infantry && !u.isDestroyed)
          if (infantryToDestroy) {
            logWrapper(
              `${
                p.side === 'attacker' ? 'defender' : 'attacker'
              } destroyed infantry from Strike Wing Alpha II`,
            )
            infantryToDestroy.isDestroyed = true
          }
        }
      }
    },
  },
  {
    type: 'promissary',
    description:
      'When 1 or more of your units make a roll for a unit ability: Choose 1 of those units to roll 1 additional die',
    name: 'Strike Wing Ambuscade',
    place: 'both',
    onSpaceCannon: (
      p: ParticipantInstance,
      _battle: BattleInstance,
      _otherP: ParticipantInstance,
      effectName: string,
    ) => {
      // TODO say in theory that pds is disabled. Would strike wing ambuscade still be used here, if it could be used for afb instead?
      const highestHitUnit = getHighestHitUnit(p, 'spaceCannon', undefined)
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
      const highestHitUnit = getHighestHitUnit(p, 'afb', undefined)
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
        const highestHitUnit = getHighestHitUnit(p, 'bombardment', undefined)
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
    description:
      'When 1 or more of your units make a roll for a unit ability: You may choose 1 of those units to roll 1 additional die.',
    name: 'Argent Flight Commander',
    place: 'both',
    onAfb: (p: ParticipantInstance) => {
      const highestHitUnit = getHighestHitUnit(p, 'afb', undefined)
      if (highestHitUnit) {
        highestHitUnit.afb!.countBonusTmp += 1
      }
    },
    onSpaceCannon: (p: ParticipantInstance) => {
      const highestHitUnit = getHighestHitUnit(p, 'spaceCannon', undefined)
      if (highestHitUnit) {
        highestHitUnit.spaceCannon!.countBonusTmp += 1
      }
    },
    onBombardment: (p: ParticipantInstance) => {
      const highestHitUnit = getHighestHitUnit(p, 'bombardment', undefined)
      if (highestHitUnit) {
        highestHitUnit.bombardment!.countBonusTmp += 1
      }
    },
  },
]
