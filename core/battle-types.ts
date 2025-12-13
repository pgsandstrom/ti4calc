// battle types is in their own file, because I got weird errors from jest
// the errors were enums being undefined, I guess it was dependency cycle related

import { PartialRecord } from '../util/util-types'
import { BattleEffect } from './battleeffect/battleEffects'
import { Faction, Place } from './enums'
import { HitInfo, RollInfo } from './roll'
import { UnitInstance, UnitType } from './unit'

export type Side = 'attacker' | 'defender'

export function isSide(value: unknown): value is Side {
  return value === 'attacker' || value === 'defender'
}

// UnitEffect and UnitAuraEffect returns a new unit instead of modify, since their changes can be temporary
export type UnitEffect = (
  u: UnitInstance,
  p: ParticipantInstance,
  place: Place,
  effectName: string,
) => UnitInstance

export type UnitAuraEffect = (
  auraUnit: UnitInstance,
  participant: ParticipantInstance,
  battle: BattleInstance,
) => UnitInstance

export type UnitAuraGroupEffect = (
  auraUnits: UnitInstance[],
  participant: ParticipantInstance,
  battle: BattleInstance,
  effectName: string,
) => void

// this modifies existing objects
export type UnitBattleEffect = (
  u: UnitInstance,
  participant: ParticipantInstance,
  battle: BattleInstance,
  effectName: string,
  isDuringCombat: boolean,
) => void

export type ParticipantEffect = (
  participant: ParticipantInstance,
  battle: BattleInstance,
  otherParticipant: ParticipantInstance,
  effectName: string,
) => void

export type OnHitEffect = (
  participant: ParticipantInstance,
  battle: BattleInstance,
  otherParticipant: ParticipantInstance,
  hitInfo: HitInfo,
) => void

export type OnDeathEffect = (
  deadUnits: UnitInstance[],
  participant: ParticipantInstance,
  otherParticipant: ParticipantInstance,
  battle: BattleInstance,
  isOwnUnit: boolean,
  effectName: string,
) => void

export interface Battle {
  place: Place
  attacker: Participant
  defender: Participant
}

export interface Participant {
  faction: Faction
  side: Side
  units: {
    [key in UnitType]: number
  }
  // unit upgrades needs to be a map like this, since faction techs might replace unit upgrades
  // this creates weird bugs if we attach battle effects that should be replaced when switching factions
  unitUpgrades: PartialRecord<UnitType, boolean>
  damagedUnits: PartialRecord<UnitType, number>
  battleEffects: Record<string, number | undefined>

  riskDirectHit: boolean
}

export interface BattleInstance {
  place: Place
  attacker: ParticipantInstance
  defender: ParticipantInstance
  roundNumber: number
}

export interface ParticipantInstance {
  side: Side
  faction: Faction
  units: UnitInstance[]

  // we track what unit upgrades we have because it is required by some abilities.
  //For example sardakk norr Exotrireme II self destruct ability.
  unitUpgrades: PartialRecord<UnitType, boolean>

  // Units added during combat. At the very end of each combat round they are moved to normal units
  // This is to prevent them from taking a hit the same round they appeared
  newUnits: UnitInstance[]

  // this are only used when a unit appears later in the battle (mentak hero and yin agent for example)
  // it holds both participants own permanent battleeffect, and the opponents "enemy battle effects"
  allUnitTransform: UnitEffect[]

  beforeStartEffect: BattleEffect[] // for applying effects that should already be present at the start of combat (and bombardment and space cannon)
  onStartEffect: BattleEffect[] // the actual in-game "At start of combat" timing window
  onSustainEffect: BattleEffect[]
  onEnemySustainEffect: BattleEffect[]
  onRepairEffect: BattleEffect[]
  onCombatRoundEnd: BattleEffect[]
  onCombatRoundEndBeforeAssign: BattleEffect[]
  afterAfbEffect: BattleEffect[]

  onSpaceCannon: BattleEffect[]
  onBombardment: BattleEffect[]
  onAfb: BattleEffect[]
  onCombatRound: BattleEffect[]
  onDeath: BattleEffect[]

  onHit: BattleEffect[]
  onBombardmentHit: BattleEffect[]

  // keep tracks of effects in play. For example Mahact flagship depends on a battle effect.
  // the number is important for effects that are used up, for example hacan flagship
  effects: Record<string, number>

  riskDirectHit: boolean

  soakHits: number // number of hits that can be cancelled
  hitsToAssign: HitsToAssign
  afbHitsToAssign: AfbHitsToAssign // to track what happened in anti-fighter barrage separately from combat

  // used to track stuff that can only happen a limited number of times per turn
  roundActionTracker: PartialRecord<string, number>
  // used to track stuff that can only happen a limited number of times per fight
  fightActionTracker: PartialRecord<string, number>
}

export interface HitsToAssign {
  hits: number
  hitsToNonFighters: number
  hitsAssignedByEnemy: number
}

export interface AfbHitsToAssign {
  fighterHitsToAssign: number
  rollInfoList: RollInfo[]
}

export interface BattleResult {
  winner: BattleWinner
  units: string
}

export enum BattleWinner {
  attacker = 'attacker',
  draw = 'draw',
  defender = 'defender',
}

// things that set combat to an absolute value should be done early, so high priority
// also things that add units should be high priority
export const EFFECT_HIGH_PRIORITY = 75
export const EFFECT_DEFAULT_PRIORITY = 50
// effects that removes spacecannon or bombardment should have low prio, so it happens after "+1 to spacecannon" stuff
export const EFFECT_LOW_PRIORITY = 25
