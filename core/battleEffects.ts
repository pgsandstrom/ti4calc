import { Participant, ParticipantInstance, Side } from './battleSetup'
import { Race } from './races/race'
import { UnitInstance } from './unit'

export interface BattleEffect {
  name: string
  type: 'general' | 'promissary' | 'tech' | 'race' | 'race-tech'
  race?: Race
  side?: Side
  transformUnit?: (unit: UnitInstance) => UnitInstance
  transformEnemyUnit?: (unit: UnitInstance) => UnitInstance
  onSustain?: (unit: UnitInstance, participant: ParticipantInstance) => void
  // TODO make optional
  onlyFirstRound: boolean
}

export interface PromissaryNotes {
  warfunding: boolean
}

export const warfunding: BattleEffect = {
  name: 'warfunding',
  type: 'promissary',
  race: undefined,
  side: undefined,
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
  race: undefined,
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
  side: undefined,
  onSustain: (_unit: UnitInstance, participant: ParticipantInstance) => {
    if (participant.hitsToAssign > 0) {
      participant.hitsToAssign -= 1
    }
  },
  onlyFirstRound: true,
}

export function getAllBattleEffects(): BattleEffect[] {
  return [warfunding, defendingInNebula, nonEuclideanShielding]
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
