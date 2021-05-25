import { ParticipantInstance, BattleInstance } from '../battle-types'
import { BattleEffect, registerUse } from '../battleeffect/battleEffects'
import { Place, Race } from '../enums'
import { defaultRoll, getUnitWithImproved, UnitInstance, UnitType } from '../unit'
import { getHighestHitUnit } from '../unitGet'

export const baronyOfLetnev: BattleEffect[] = [
  {
    type: 'race',
    name: 'Barony of Letnev flagship',
    place: 'both',
    transformUnit: (unit: UnitInstance) => {
      // TODO add repair
      if (unit.type === UnitType.flagship) {
        return {
          ...unit,
          combat: {
            ...defaultRoll,
            hit: 5,
            count: 2,
          },
          bombardment: {
            ...defaultRoll,
            hit: 5,
            count: 3,
          },
          battleEffects: [
            {
              name: 'Barony flagship remove planetary shield',
              type: 'other',
              place: 'both',
              transformEnemyUnit: (u: UnitInstance) => {
                return {
                  ...u,
                  planetaryShield: false,
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
    name: 'Non-Euclidean Shielding',
    type: 'race-tech',
    place: 'both',
    race: Race.barony_of_letnev,
    onSustain: (_unit: UnitInstance, participant: ParticipantInstance, _battle: BattleInstance) => {
      if (participant.hitsToAssign.hitsToNonFighters > 0) {
        participant.hitsToAssign.hitsToNonFighters -= 1
      } else if (participant.hitsToAssign.hits > 0) {
        participant.hitsToAssign.hits -= 1
      }
    },
  },
  {
    name: 'L4 Disruptors',
    type: 'race-tech',
    place: Place.ground,
    race: Race.barony_of_letnev,
    transformEnemyUnit: (unit: UnitInstance) => {
      // TODO Order should not be a problem because transform enemy units happen after transform friendly
      // But are we sure it is NEVER a problem?
      return {
        ...unit,
        spaceCannon: undefined,
      }
    },
  },
  {
    name: 'Munitions reserves',
    type: 'race-tech',
    place: Place.space,
    race: Race.barony_of_letnev,
    transformUnit: (unit: UnitInstance) => {
      // TODO this is the kind of stuff that could be done several times
      return getUnitWithImproved(unit, 'combat', 'reroll', 'temp')
    },
  },
  {
    name: 'warfunding',
    type: 'promissary',
    place: Place.space,
    transformUnit: (unit: UnitInstance) => {
      return getUnitWithImproved(unit, 'combat', 'reroll', 'temp')
    },
  },
  {
    name: 'Barony Agent',
    type: 'agent',
    place: Place.space,
    onCombatRound: (
      p: ParticipantInstance,
      _battle: BattleInstance,
      _otherParticipant: ParticipantInstance,
      effectName: string,
    ) => {
      const highestHitUnit = getHighestHitUnit(p, 'combat')
      if (highestHitUnit) {
        highestHitUnit.spaceCannon!.countBonusTmp += 1
        registerUse(effectName, p)
      }
    },
    timesPerFight: 1,
  },
]
