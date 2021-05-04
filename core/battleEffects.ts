import { Participant } from './battleSetup'
import { Race } from './races/race'
import { UnitInstance } from './unit'

export interface BattleEffect {
  name: string
  type: 'promissary' | 'tech' | 'race' | 'race-tech'
  race?: Race
  transformUnit?: (u: UnitInstance) => UnitInstance
  transformEnemyUnit?: (u: UnitInstance) => UnitInstance
  onlyFirstRound: boolean
}

export interface PromissaryNotes {
  warfunding: boolean
}

export const warfunding: BattleEffect = {
  name: 'warfunding',
  type: 'promissary',
  race: undefined,
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

export function getAllBattleEffects(): BattleEffect[] {
  return [warfunding]
}

export function isBattleEffectRelevantForSome(effect: BattleEffect, participant: Participant[]) {
  return participant.some((p) => isBattleEffectRelevant(effect, p))
}

export function isBattleEffectRelevant(effect: BattleEffect, participant: Participant) {
  if (effect.type === 'race' || effect.type === 'race-tech') {
    // TODO if race is necro, show all race-techs
    if (participant.race !== effect.race) {
      return false
    }
  }
  return true
}
