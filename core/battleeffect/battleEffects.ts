import {
  OnDeathEffect,
  OnHitEffect,
  Participant,
  ParticipantEffect,
  ParticipantInstance,
  Side,
  UnitAuraEffect,
  UnitAuraGroupEffect,
  UnitBattleEffect,
  UnitEffect,
} from '../battle-types'
import { Faction, Place } from '../enums'
import {
  getAgent,
  getCommanders,
  getFactionStuffNonUnit,
  getGeneralEffectFromFactions,
  getPromissary,
} from '../factions/faction'
import { UnitInstance, UnitType } from '../unit'
import { getActioncards } from './actioncard'
import { getAgendas } from './agenda'
import { getTechBattleEffects } from './tech'

export type BattleEffect = NormalBattleEffect | FactionBattleEffect

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
    // 'faction' is faction-stuff that is automatically used
    | 'faction'
  faction?: undefined
}

export interface FactionBattleEffect extends SharedStuffBattleEffect {
  type: // faction-tech is tech (can be stolen by nekro)
  | 'faction-tech'
    // faction-ability is something faction-specific that is not automatically used (munitions reserves for example)
    | 'faction-ability'
  faction: Faction
}

interface SharedStuffBattleEffect {
  name: string
  description?: string
  side?: Side
  place: Place | 'both'
  // "unit" signals where it should be placed in the ui. 'faction-tech' will replace 'unit-upgrade' in the ui
  unit?: UnitType

  count?: boolean // If the effect needs a counter. For example Letnevs racial ability Munitions reserves uses this.

  symmetrical?: boolean // If true, then the UI will restrict this effect to being activated for both or neither player. Mostly used by agendas.

  // priority rules:
  // transformEnemyUnits always happens last
  // faction abilities goes first when the priority is the same
  priority?: number

  // transformUnit are done before battle (or whenever a unit appears, see mentak hero and yin agent)
  transformUnit?: UnitEffect
  transformEnemyUnit?: UnitEffect

  beforeStart?: ParticipantEffect
  onStart?: ParticipantEffect
  onSustain?: UnitBattleEffect
  onEnemySustain?: UnitBattleEffect
  onRepair?: UnitBattleEffect
  onCombatRoundEnd?: ParticipantEffect
  onCombatRoundEndBeforeAssign?: ParticipantEffect
  afterAfb?: ParticipantEffect
  onDeath?: OnDeathEffect

  onSpaceCannon?: ParticipantEffect
  onBombardment?: ParticipantEffect
  onAfb?: ParticipantEffect
  onCombatRound?: ParticipantEffect

  onHit?: OnHitEffect
  onBombardmentHit?: OnHitEffect

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
  description:
    'If a space combat occurs in a nebula, the defender applies +1 to each combat roll of their ships during that combat.',
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

export function getAllBattleEffects() {
  const otherBattleEffects = getOtherBattleEffects()
  const techs = getTechBattleEffects()
  const factionTechs = getFactionStuffNonUnit()
  const promissary = getPromissary()
  const agents = getAgent()
  const commanders = getCommanders()
  const general = getGeneralEffectFromFactions()
  const actioncards = getActioncards()
  const agendas = getAgendas()
  return [
    ...otherBattleEffects,
    ...techs,
    ...factionTechs,
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
  if (effect.type === 'faction' || effect.type === 'faction-ability') {
    if (participant.faction !== effect.faction) {
      return false
    }
  }
  if (effect.type === 'faction-tech') {
    if (participant.faction !== effect.faction && participant.faction !== Faction.nekro) {
      return false
    }
  }
  return true
}

export function registerUse(effectName: string, p: ParticipantInstance) {
  p.roundActionTracker[effectName] = (p.roundActionTracker[effectName] ?? 0) + 1
  p.fightActionTracker[effectName] = (p.fightActionTracker[effectName] ?? 0) + 1
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
