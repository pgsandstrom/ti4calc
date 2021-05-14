import {
  Side,
  UnitEffect,
  UnitBattleEffect,
  ParticipantInstance,
  BattleInstance,
  Participant,
  ParticipantEffect,
  UnitAuraEffect,
  UnitAuraGroupEffect,
} from '../battle-types'
import { Place, Race } from '../enums'
import { getRaceTechsNonUnit, getPromissary, getAgent, getCommanders } from '../races/race'
import { defaultRoll, UnitInstance, UnitType } from '../unit'
import { getWorstNonFighterShip } from '../unitGet'
import { getActioncards } from './actioncard'
import { getAgendas } from './agenda'
import { getTechBattleEffects } from './tech'

export interface BattleEffect {
  name: string
  type:
    | 'general'
    | 'promissary'
    | 'commander'
    | 'agent'
    | 'tech'
    | 'race'
    | 'race-tech' // TODO rename to race-specific or something
    | 'unit-upgrade'
    | 'other'
  race?: Race
  side?: Side
  place?: Place
  // "unit" signals where it should be placed in the ui. 'race-tech' will replace 'unit-upgrade' in the ui
  unit?: UnitType

  count?: boolean // TODO describe this

  // transformUnit are done before battle
  transformUnit?: UnitEffect
  transformEnemyUnit?: UnitEffect

  onStart?: ParticipantEffect
  onSustain?: UnitBattleEffect
  onRepair?: UnitBattleEffect
  onCombatRoundEnd?: ParticipantEffect
  afterAfb?: ParticipantEffect

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

export function getAllBattleEffects() {
  const otherBattleEffects = getOtherBattleEffects()
  const techs = getTechBattleEffects()
  const raceTechs = getRaceTechsNonUnit()
  const promissary = getPromissary()
  const agents = getAgent()
  const commanders = getCommanders()
  const actioncards = getActioncards()
  const agendas = getAgendas()
  return [
    ...otherBattleEffects,
    ...techs,
    ...raceTechs,
    ...promissary,
    ...agents,
    ...commanders,
    ...actioncards,
    ...agendas,
  ]
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
