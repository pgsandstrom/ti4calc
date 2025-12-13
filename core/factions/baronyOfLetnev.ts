import { logWrapper } from '../../util/util-log'
import { BattleInstance, EFFECT_LOW_PRIORITY, ParticipantInstance } from '../battle-types'
import { BattleEffect, registerUse } from '../battleeffect/battleEffects'
import { Faction, Place } from '../enums'
import { defaultRoll, getUnitWithImproved, UNIT_MAP, UnitInstance, UnitType } from '../unit'
import { getHighestDiceCountUnit, getHighestHitUnit, getUnits } from '../unitGet'

export const baronyOfLetnev: BattleEffect[] = [
  {
    type: 'faction',
    name: 'Barony of Letnev flagship',
    place: 'both',
    transformUnit: (unit: UnitInstance) => {
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
            {
              name: 'Barony flagship repair',
              type: 'other',
              place: Place.space,
              onCombatRound: (participant: ParticipantInstance) => {
                participant.units.forEach((unit) => {
                  if (unit.type === UnitType.flagship) {
                    unit.takenDamage = false
                  }
                })
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
    name: 'Mech deploy',
    description:
      'At the start of a round of ground combat, you may spend 2 resources to replace 1 of your infantry in that combat with 1 mech.',
    type: 'faction-ability',
    place: Place.ground,
    faction: Faction.barony_of_letnev,
    count: true,
    onCombatRound: (
      participant: ParticipantInstance,
      _battle: BattleInstance,
      _otherParticipant: ParticipantInstance,
      effectName: string,
    ) => {
      if (participant.effects[effectName] > 0) {
        const infantryIndex = participant.units.findIndex((u) => u.type === UnitType.infantry)
        if (infantryIndex !== -1) {
          const infantry = participant.units[infantryIndex]
          const genericMech = UNIT_MAP[UnitType.mech]
          participant.units[infantryIndex] = {
            ...genericMech,
            takenDamage: false,
            usedSustain: false,
            isDestroyed: false,
            combat: {
              ...infantry.combat!,
              hit: genericMech.combat!.hit,
            },
          }
          logWrapper(
            `${participant.side} used mech deploy ability to transform an infantry into a mech`,
          )
        }

        participant.effects[effectName] -= 1
      }
    },
  },
  {
    name: 'Non-Euclidean Shielding',
    description: 'When 1 of your units uses SUSTAIN DAMAGE, cancel 2 hits instead of 1.',
    type: 'faction-tech',
    place: 'both',
    faction: Faction.barony_of_letnev,
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
    description: 'During an invasion, units cannot use SPACE CANNON against your units.',
    type: 'faction-tech',
    place: Place.ground,
    faction: Faction.barony_of_letnev,
    priority: EFFECT_LOW_PRIORITY,
    transformEnemyUnit: (unit: UnitInstance) => {
      return {
        ...unit,
        spaceCannon: undefined,
      }
    },
  },
  {
    name: 'Munitions Reserves',
    description:
      'At the start of each round of space combat, you may spend 2 trade goods;  you may re-roll any number of your dice during that combat round.',
    type: 'faction-ability',
    place: Place.space,
    faction: Faction.barony_of_letnev,
    count: true,
    onCombatRound: (
      participant: ParticipantInstance,
      _battle: BattleInstance,
      _otherParticipant: ParticipantInstance,
      effectName: string,
    ) => {
      if (participant.effects[effectName] > 0) {
        participant.units.forEach((unit) => {
          if (unit.combat) {
            unit.combat.rerollBonusTmp += 1
          }
        })
        participant.effects[effectName] -= 1
      }
    },
  },
  {
    name: 'War Funding',
    // TODO this could use the "worse than average" thingy
    description:
      "After you and your opponent roll dice during space combat: You may reroll all of your opponent's dice.  You may reroll any number of your dice. In this simulation it only rerolls your dice.",
    type: 'promissary',
    place: Place.space,
    transformUnit: (unit: UnitInstance) => {
      return getUnitWithImproved(unit, 'combat', 'reroll', 'temp')
    },
  },
  {
    name: 'Barony Agent',
    description:
      'At the start of a Space Combat round: You may exhaust this card to choose 1 ship in the active system. That ship rolls 1 additional die during this combat round.',
    type: 'agent',
    place: Place.space,
    onCombatRound: (
      p: ParticipantInstance,
      _battle: BattleInstance,
      _otherParticipant: ParticipantInstance,
      effectName: string,
    ) => {
      const highestHitUnit = getHighestHitUnit(p, 'combat', Place.space)
      if (highestHitUnit?.combat) {
        highestHitUnit.combat.countBonusTmp += 1
        registerUse(effectName, p)
      }
    },
    timesPerFight: 1,
  },

  //TODO: Currently just picks the unit with the highest dice count. It could be smarter and include the "cap" on hit-bonus, reroll-value and stuff like that.
  {
    name: 'Gravleash Maneuvers',
    description:
      "Barony Breakthrough: Before you roll dice during space combat, apply +X to the results of 1 of your ship's rolls, where X is the number of ship types you have in the combat.",
    type: 'faction-ability',
    place: Place.space,
    faction: Faction.barony_of_letnev,
    onStart: (p: ParticipantInstance, _b: BattleInstance, _op: ParticipantInstance) => {
      const highestDiceCountUnit = getHighestDiceCountUnit(p, 'combat', Place.space)
      if (highestDiceCountUnit && highestDiceCountUnit.combat) {
        const units = getUnits(p, Place.space, true)
        const numUniqueUnits = [...new Set(units.map((unit: UnitInstance) => unit.type))].length
        highestDiceCountUnit.combat.hitBonus += numUniqueUnits
        logWrapper(
          `${p.side} used Gravleash Maneuvers to give ${highestDiceCountUnit.type} with their ${highestDiceCountUnit.combat.count + highestDiceCountUnit.combat.countBonus + highestDiceCountUnit.combat.countBonusTmp} dice a +${numUniqueUnits} to hit.`,
        )
      }
    },
    priority: EFFECT_LOW_PRIORITY,
  },
]
