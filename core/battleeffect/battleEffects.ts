import {
  BattleInstance,
  Participant,
  ParticipantInstance,
  Side,
  UnitBattleEffect,
  UnitEffect,
} from '../battleSetup'
import { Race } from '../races/race'
import { UnitInstance, UnitType } from '../unit'
import { getAllUnitUpgrades } from './unitUpgrades'

export interface BattleEffect {
  name: string
  type: 'general' | 'promissary' | 'tech' | 'race' | 'race-tech' | 'unit-upgrade' | 'other'
  race?: Race
  side?: Side
  // "unit" signals where it should be placed in the ui. 'race-tech' will replace 'unit-upgrade' in the ui
  unit?: UnitType
  transformUnit?: UnitEffect
  transformEnemyUnit?: UnitEffect
  onSustain?: UnitBattleEffect
  onRepair?: UnitBattleEffect
  onlyFirstRound?: boolean // default false
}

export const warfunding: BattleEffect = {
  name: 'warfunding',
  type: 'promissary',
  transformUnit: (unit: UnitInstance) => {
    if (unit.combat) {
      return {
        ...unit,
        combat: {
          ...unit.combat,
          rerollBonus: unit.combat.rerollBonus + 1,
        },
      }
    } else {
      return unit
    }
  },
  onlyFirstRound: true,
}

export const defendingInNebula: BattleEffect = {
  name: 'Defending in nebula',
  type: 'general',
  side: Side.defender,
  transformUnit: (unit: UnitInstance) => {
    if (unit.combat) {
      return {
        ...unit,
        combat: {
          ...unit.combat,
          hitBonus: unit.combat.hitBonus + 1,
        },
      }
    } else {
      return unit
    }
  },
}

export const nonEuclideanShielding: BattleEffect = {
  name: 'Non-Euclidean Shielding',
  type: 'race-tech',
  race: Race.barony_of_letnev,
  onSustain: (_unit: UnitInstance, participant: ParticipantInstance, _battle: BattleInstance) => {
    if (participant.hitsToAssign > 0) {
      participant.hitsToAssign -= 1
    }
  },
}

export const duraniumArmor: BattleEffect = {
  name: 'Duranium Armor',
  type: 'tech',
  onRepair: (unit: UnitInstance, _participant: ParticipantInstance, battle: BattleInstance) => {
    if (unit.takenDamage && unit.takenDamageRound !== battle.roundNumber) {
      unit.takenDamage = false
    }
  },
}

export function getAllBattleEffects(): BattleEffect[] {
  const normal = [warfunding, defendingInNebula, nonEuclideanShielding, duraniumArmor]
  const unitUpgrades = getAllUnitUpgrades()
  return [...normal, ...unitUpgrades]
}

export function isBattleEffectRelevantForSome(effect: BattleEffect, participant: Participant[]) {
  return participant.some((p) => isBattleEffectRelevant(effect, p))
}

export function isBattleEffectRelevant(effect: BattleEffect, participant: Participant) {
  if (effect.side !== undefined && effect.side !== participant.side) {
    return false
  }

  if (effect.type === 'race' || effect.type === 'race-tech') {
    // TODO if race is necro, show all race-techs
    if (participant.race !== effect.race) {
      return false
    }
  }
  return true
}
