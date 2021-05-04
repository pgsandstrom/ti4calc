import {
  BattleInstance,
  Participant,
  ParticipantInstance,
  Side,
  UnitBattleEffect,
  UnitEffect,
} from './battleSetup'
import { Race } from './races/race'
import { UnitInstance } from './unit'

export interface BattleEffect {
  name: string
  type: 'general' | 'promissary' | 'tech' | 'race' | 'race-tech'
  race?: Race
  side?: Side
  transformUnit?: UnitEffect
  transformEnemyUnit?: UnitEffect
  onSustain?: UnitBattleEffect
  onRepair?: UnitBattleEffect
  // TODO make optional
  onlyFirstRound: boolean
}

export interface PromissaryNotes {
  warfunding: boolean
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
          reroll: unit.combat.reroll + 1,
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
          hit: unit.combat.hit - 1,
        },
      }
    } else {
      return unit
    }
  },
  onlyFirstRound: false,
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
  onlyFirstRound: false,
}

export const duraniumArmor: BattleEffect = {
  name: 'Duranium Armor',
  type: 'tech',
  onRepair: (unit: UnitInstance, _participant: ParticipantInstance, battle: BattleInstance) => {
    if (unit.takenDamage && unit.takenDamageRound !== battle.roundNumber) {
      unit.takenDamage = false
    }
  },
  onlyFirstRound: false,
}

export function getAllBattleEffects(): BattleEffect[] {
  return [warfunding, defendingInNebula, nonEuclideanShielding, duraniumArmor]
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
