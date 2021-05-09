// battle types is in their own file, because I got weird errors from jest
// the errors were enums being undefined, I guess it was dependency cycle related

// export enum BattleType {
// space = 'space',
// ground = 'ground',
// }

import { PartialRecord } from '../util/util-types'
import { BattleEffect } from './battleeffect/battleEffects'
import { Place, Race } from './enums'
import { UnitInstance, UnitType } from './unit'

export type Side = 'attacker' | 'defender'

// UnitEffect and UnitAuraEffect returns a new unit instead of modify, since their changes can be temporary
export type UnitEffect = (u: UnitInstance, p: ParticipantInstance, place: Place) => UnitInstance

export type UnitAuraEffect = (
  p: UnitInstance,
  participant: ParticipantInstance,
  battle: BattleInstance,
) => UnitInstance

// this modifies existing objects
export type UnitBattleEffect = (
  p: UnitInstance,
  participant: ParticipantInstance,
  battle: BattleInstance,
) => void

export type ParticipantEffect = (
  participant: ParticipantInstance,
  battle: BattleInstance,
  otherParticipant: ParticipantInstance,
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
  // TODO actually, maybe we should do this with all battle effects...
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

  // firstRoundEffects is only active during the attack
  // a firstRoundEffects that tries to give sustain damage or planetary shield, for example, wouldn't work
  //TODO refactor this to battleeffect as well maybe
  firstRoundEffects: BattleEffect[]
  firstRoundEnemyEffects: BattleEffect[]
  onStartEffect: BattleEffect[]
  onSustainEffect: BattleEffect[]
  onRepairEffect: BattleEffect[]
  onCombatRoundEnd: BattleEffect[]
  afterAfbEffect: BattleEffect[]

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
}

export enum BattleResult {
  attacker = 'attacker',
  draw = 'draw',
  defender = 'defender',
}
