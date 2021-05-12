// battle types is in their own file, because I got weird errors from jest
// the errors were enums being undefined, I guess it was dependency cycle related

// export enum BattleType {
// space = 'space',
// ground = 'ground',
// }

import { PartialRecord } from '../util/util-types'
import { BattleEffect } from './battleeffect/battleEffects'
import { Place, Race } from './enums'
import { HitInfo } from './roll'
import { UnitInstance, UnitType } from './unit'

export type Side = 'attacker' | 'defender'

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

export interface Battle {
  place: Place
  attacker: Participant
  defender: Participant
}

export interface Participant {
  race: Race
  side: Side
  units: {
    [key in UnitType]: number
  }
  // unit upgrades needs to be a map like this, since race techs might replace unit upgrades
  // this creates weird bugs if we attach battle effects that should be replaced when switching races
  unitUpgrades: PartialRecord<UnitType, boolean>
  battleEffects: BattleEffect[]

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
  race: Race
  units: UnitInstance[]

  onStartEffect: BattleEffect[]
  onSustainEffect: BattleEffect[]
  onRepairEffect: BattleEffect[]
  onCombatRoundEnd: BattleEffect[]
  afterAfbEffect: BattleEffect[]

  onSpaceCannon: BattleEffect[]
  onBombardment: BattleEffect[]
  onAfb: BattleEffect[]
  onCombatRound: BattleEffect[]

  // keep tracks of effects in play. For example Mahact flagship depends on a battle effect.
  effects: Record<string, boolean>

  riskDirectHit: boolean

  hitsToAssign: HitsToAssign

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

export enum BattleResult {
  attacker = 'attacker',
  draw = 'draw',
  defender = 'defender',
}
