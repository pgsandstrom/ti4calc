// battle types is in their own file, because I got weird errors from jest
// the errors were enums being undefined, I guess it was dependency cycle related

// export enum BattleType {
// space = 'space',
// ground = 'ground',
// }

import { PartialRecord } from '../util/util-types'
import { BattleEffect } from './battleeffect/battleEffects'
import { Race } from './races/race'
import { UnitInstance, UnitType } from './unit'

export enum Side {
  attacker = 'attacker',
  defender = 'defender',
}

// this returns a new unit
export type UnitEffect = (u: UnitInstance, p: ParticipantInstance) => UnitInstance

// this modifies existing objects
export type UnitBattleEffect = (
  p: UnitInstance,
  participant: ParticipantInstance,
  battle: BattleInstance,
) => void

export interface Battle {
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
  attacker: ParticipantInstance
  defender: ParticipantInstance
  roundNumber: number
}

export interface ParticipantInstance {
  side: Side
  race: Race
  units: UnitInstance[]

  // firstRoundEffects only works for changing attack currently
  // TODO refactor this to battleeffect as well
  firstRoundEffects: UnitEffect[]
  onSustainEffect: BattleEffect[]
  onRepairEffect: BattleEffect[]

  riskDirectHit: boolean

  hitsToAssign: number

  // used to track stuff that can only happen a limited number of times per turn
  roundActionTracker: PartialRecord<string, number>
  // used to track stuff that can only happen a limited number of times per fight
  fightActionTracker: PartialRecord<string, number>
}

export enum BattleResult {
  attacker = 'attacker',
  draw = 'draw',
  defender = 'defender',
}
