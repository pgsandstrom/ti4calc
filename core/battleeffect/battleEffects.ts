import {
  Side,
  UnitEffect,
  UnitBattleEffect,
  ParticipantInstance,
  Participant,
  ParticipantEffect,
  UnitAuraEffect,
  UnitAuraGroupEffect,
  OnDeathEffect,
} from '../battle-types'
import { Place, Race } from '../enums'
import {
  getRaceStuffNonUnit,
  getPromissary,
  getAgent,
  getCommanders,
  getGeneralEffectFromRaces,
} from '../races/race'
import { UnitInstance, UnitType } from '../unit'
import { getActioncards } from './actioncard'
import { getAgendas } from './agenda'
import { getTechBattleEffects } from './tech'

export type BattleEffect = NormalBattleEffect | RaceBattleEffect

export interface NormalBattleEffect extends SharedStuffBattleEffect {
  type:
    | 'general'
    | 'promissary'
    | 'commander'
    | 'agent'
    | 'tech'
    | 'agenda'
    | 'action-card'
    | 'unit-upgrade'
    | 'other'
    // 'race' is race-stuff that is automatically used
    | 'race'
  race?: undefined
}

export interface RaceBattleEffect extends SharedStuffBattleEffect {
  type: // race-tech is tech (can be stolen by nekro)
  | 'race-tech'
    // race-ability is something race-specific that is not automatically used (munitions reserves for example)
    | 'race-ability'
  race: Race
}

interface SharedStuffBattleEffect {
  name: string
  side?: Side
  place: Place | 'both'
  // "unit" signals where it should be placed in the ui. 'race-tech' will replace 'unit-upgrade' in the ui
  unit?: UnitType

  count?: boolean // If the effect needs a counter. For example Letnevs racial ability Munitions reserves uses this.

  symmetrical?: boolean // If true, then the UI will restrict this effect to being activated for both or neither player. Mostly used by agendas.

  // transformUnit are done before battle (or whenever a unit appears, see mentak hero and yin agent)
  transformUnit?: UnitEffect
  transformEnemyUnit?: UnitEffect

  onStart?: ParticipantEffect
  onSustain?: UnitBattleEffect
  onEnemySustain?: UnitBattleEffect
  onRepair?: UnitBattleEffect
  onCombatRoundEnd?: ParticipantEffect
  afterAfb?: ParticipantEffect
  onDeath?: OnDeathEffect

  onSpaceCannon?: ParticipantEffect
  onBombardment?: ParticipantEffect
  onAfb?: ParticipantEffect
  onCombatRound?: ParticipantEffect

  // these restrictors does not work for transformUnit, they always happen to all units
  timesPerRound?: number
  timesPerFight?: number
}

export interface BattleAura {
  name: string
  place: Place | 'both'
  transformUnit?: UnitAuraEffect
  transformEnemyUnit?: UnitAuraEffect

  onCombatRoundStart?: UnitAuraGroupEffect

  // these restrictors does not work for transformUnit, they always happen to all units
  timesPerRound?: number
  timesPerFight?: number
}

export const defendingInNebula: BattleEffect = {
  name: 'Defending in nebula',
  type: 'general',
  side: 'defender',
  place: Place.space,
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

// TODO add test to make sure this never returns duplicate names
export function getAllBattleEffects() {
  const otherBattleEffects = getOtherBattleEffects()
  const techs = getTechBattleEffects()
  const raceTechs = getRaceStuffNonUnit()
  const promissary = getPromissary()
  const agents = getAgent()
  const commanders = getCommanders()
  const general = getGeneralEffectFromRaces()
  const actioncards = getActioncards()
  const agendas = getAgendas()
  return [
    ...otherBattleEffects,
    ...techs,
    ...raceTechs,
    ...promissary,
    ...agents,
    ...commanders,
    ...general,
    ...actioncards,
    ...agendas,
  ]
}

export function getOtherBattleEffects(): BattleEffect[] {
  return [defendingInNebula]
}

export function isBattleEffectRelevantForSome(effect: BattleEffect, participant: Participant[]) {
  return participant.some((p) => isBattleEffectRelevant(effect, p))
}

export function isBattleEffectRelevant(effect: BattleEffect, participant: Participant) {
  if (effect.side !== undefined && effect.side !== participant.side) {
    return false
  }
  if (effect.type === 'race' || effect.type === 'race-ability') {
    if (participant.race !== effect.race) {
      return false
    }
  }
  if (effect.type === 'race-tech') {
    if (participant.race !== effect.race && participant.race !== Race.nekro) {
      return false
    }
  }
  return true
}

export function registerUse(effectName: string, p: ParticipantInstance) {
  p.roundActionTracker[effectName] = (p.roundActionTracker[effectName] ?? 0) + 1
  p.fightActionTracker[effectName] = (p.roundActionTracker[effectName] ?? 0) + 1
}

export function canBattleEffectBeUsed(
  effect: BattleEffect | BattleAura,
  participant: ParticipantInstance,
) {
  if (effect.timesPerFight !== undefined) {
    const timesUsedThisFight = participant.fightActionTracker[effect.name]
    if (timesUsedThisFight !== undefined && timesUsedThisFight >= effect.timesPerFight) {
      return false
    }
  }

  if (effect.timesPerRound !== undefined) {
    const timesUsedThisRound = participant.roundActionTracker[effect.name]
    if (timesUsedThisRound !== undefined && timesUsedThisRound >= effect.timesPerRound) {
      return false
    }
  }

  return true
}
