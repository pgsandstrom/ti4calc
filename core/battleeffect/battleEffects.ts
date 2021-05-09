import {
  Side,
  UnitEffect,
  UnitBattleEffect,
  ParticipantInstance,
  BattleInstance,
  Participant,
  ParticipantEffect,
  UnitAuraEffect,
} from '../battle-types'
import { Place, Race } from '../enums'
import { defaultRoll, UnitInstance, UnitType } from '../unit'
import { getWorstNonFighterShip } from '../unitGet'

export interface BattleEffect {
  name: string
  type:
    | 'general'
    | 'promissary'
    | 'commander'
    | 'agent'
    | 'tech'
    | 'race'
    | 'race-tech'
    | 'unit-upgrade'
    | 'other'
  race?: Race
  side?: Side
  place?: Place
  // "unit" signals where it should be placed in the ui. 'race-tech' will replace 'unit-upgrade' in the ui
  unit?: UnitType
  transformUnit?: UnitEffect
  transformEnemyUnit?: UnitEffect
  onStart?: ParticipantEffect
  onSustain?: UnitBattleEffect
  onRepair?: UnitBattleEffect
  onCombatRoundEnd?: ParticipantEffect
  afterAfb?: ParticipantEffect
  onlyFirstRound?: boolean // default false

  timesPerRound?: number
  timesPerFight?: number
}

export interface BattleAura {
  name: string
  place?: Place
  transformUnit?: UnitAuraEffect
  transformEnemyUnit?: UnitAuraEffect

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

export const memoria1: BattleEffect = {
  name: 'Memoria I',
  type: 'promissary',
  place: Place.space,
  onStart: (participant: ParticipantInstance, battle: BattleInstance) => {
    const worstNonFighterShip = getWorstNonFighterShip(participant)
    if (!worstNonFighterShip) {
      return
    }
    worstNonFighterShip.combat = {
      ...defaultRoll,
      hit: 7,
      countBonus: 2,
    }
    worstNonFighterShip.afb = {
      ...defaultRoll,
      hit: 5,
      countBonus: 3,
    }
    worstNonFighterShip.sustainDamage = true
  },
}

export const memoria2: BattleEffect = {
  name: 'Memoria II',
  type: 'promissary',
  place: Place.space,
  onStart: (participant: ParticipantInstance, battle: BattleInstance) => {
    const worstNonFighterShip = getWorstNonFighterShip(participant)
    if (!worstNonFighterShip) {
      return
    }
    worstNonFighterShip.combat = {
      ...defaultRoll,
      hit: 5,
      countBonus: 2,
    }
    worstNonFighterShip.afb = {
      ...defaultRoll,
      hit: 5,
      countBonus: 3,
    }
    worstNonFighterShip.sustainDamage = true
  },
}

export function getOtherBattleEffects(): BattleEffect[] {
  // TODO move out some of these
  const normal = [defendingInNebula, memoria1, memoria2]
  return normal
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

export function registerUse(effect: BattleEffect, p: ParticipantInstance) {
  p.roundActionTracker[effect.name] = (p.roundActionTracker[effect.name] ?? 0) + 1
  p.fightActionTracker[effect.name] = (p.roundActionTracker[effect.name] ?? 0) + 1
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
