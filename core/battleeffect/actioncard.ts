import { LOG } from '../battle'
import { ParticipantInstance, BattleInstance } from '../battle-types'
import { Place } from '../enums'
import { defaultRoll, getUnitWithImproved, UnitInstance, UnitType } from '../unit'
import { doesUnitFitPlace } from '../unitGet'
import { BattleEffect, registerUse } from './battleEffects'

export function getActioncards() {
  return [
    bunker,
    directHit,
    disable,
    emergencyRepairs,
    // experimentalBattlestation
    fighterPrototype,
    fireTeam,
    maneuveringJets,
    moraleBoost,
    shieldsHolding,
    blitz,
    reflectiveShielding,
    // scrambleFrequency,
    solarFlare,
    waylay,
  ]
}

// During this invasion, apply -4 to the result of each Bombardment roll against planets you control.
export const bunker: BattleEffect = {
  name: 'Bunker',
  type: 'action-card',
  side: 'defender',
  place: Place.ground,
  transformEnemyUnit: (u: UnitInstance) => {
    if (u.bombardment) {
      return getUnitWithImproved(u, 'bombardment', 'hit', 'permanent', -4)
    } else {
      return u
    }
  },
}

// TODO
// Courageous to the End
// After 1 of your ships is destroyed during a space combat:
// Roll 2 dice. For each result equal to or greater than that ship's combat value, your opponent must choose and destroy 1 of their ships.

//	After another player's ship uses Sustain Damage to cancel a hit produced by your units or abilities: Destroy that ship.
export const directHit: BattleEffect = {
  name: 'Direct Hit',
  type: 'action-card',
  place: Place.space,
  count: true,
  onEnemySustain: (
    u: UnitInstance,
    participant: ParticipantInstance,
    _battle: BattleInstance,
    effectName: string,
  ) => {
    if (participant.effects[effectName] > 0) {
      if (!u.isDestroyed) {
        u.isDestroyed = true
        if (LOG) {
          console.log(`${participant.side} used direct hit to destroy ${u.type}`)
        }
        participant.effects[effectName] -= 1
      }
    }
  },
}

// Your opponents' PDS units lose Planetary Shield and Space Cannon during this invasion.
export const disable: BattleEffect = {
  name: 'Disable',
  type: 'action-card',
  place: Place.ground,
  side: 'attacker',
  transformEnemyUnit: (u: UnitInstance) => {
    if (u.type === UnitType.pds) {
      return {
        ...u,
        planetaryShield: false,
        spaceCannon: undefined,
      }
    } else {
      return u
    }
  },
}

// At the start or end of a combat round: Repair all of your units that have Sustain Damage in the active system.
export const emergencyRepairs: BattleEffect = {
  name: 'Emergency Repairs',
  type: 'action-card',
  place: 'both',
  onCombatRound: (
    participant: ParticipantInstance,
    _battle: BattleInstance,
    _otherParticipant: ParticipantInstance,
    effectName: string,
  ) => {
    if (participant.units.some((u) => u.takenDamage)) {
      participant.units.forEach((u) => {
        u.takenDamage = false
      })
      if (LOG) {
        console.log(`${participant.side} used Emergency repair`)
      }
      registerUse(effectName, participant)
    }
  },
  onCombatRoundEnd: (
    participant: ParticipantInstance,
    _battle: BattleInstance,
    _otherParticipant: ParticipantInstance,
    effectName: string,
  ) => {
    if (participant.units.some((u) => u.takenDamage)) {
      participant.units.forEach((u) => {
        u.takenDamage = false
      })
      if (LOG) {
        console.log(`${participant.side} used Emergency repair`)
      }
      registerUse(effectName, participant)
    }
  },
  timesPerFight: 1,
}

// After another player moves ships into a system during a tactical action:
// Choose 1 of your space docks that is either in or adjacent to that system. That space dock uses Space Cannon 5 (x3) against ships in the active system.
export const experimentalBattlestation: BattleEffect = {
  name: 'Experimental Battlestation',
  type: 'action-card',
  place: Place.space,
  onStart: () => {
    // TODO currently this is very complex. It happens in it own phase and could theoretically be used with graviton laser system.
    // But antimass should also be applied.
    // and argent flight flagship should stop this.
    // but pds upgrade should not affect it.
  },
}

// 	At the start of the first round of a space combat: 	Apply +2 to the result of each of your fighters' combat rolls during this combat round.
export const fighterPrototype: BattleEffect = {
  name: 'Fighter Prototype',
  type: 'action-card',
  place: Place.space,
  transformUnit: (u: UnitInstance) => {
    if (u.type === UnitType.fighter) {
      return getUnitWithImproved(u, 'combat', 'hit', 'temp', 2)
    } else {
      return u
    }
  },
}

// After your ground forces make combat rolls during a round of ground combat: 	Reroll any number of your dice.
export const fireTeam: BattleEffect = {
  name: 'Fire Team',
  type: 'action-card',
  place: Place.ground,
  transformUnit: (u: UnitInstance) => {
    if (u.type === UnitType.infantry || u.type === UnitType.mech) {
      return getUnitWithImproved(u, 'combat', 'reroll', 'temp', 1)
    } else {
      return u
    }
  },
}

//  	4 	Before you assign hits produced by another player's Space Cannon roll: 	Cancel 1 hit.
export const maneuveringJets: BattleEffect = {
  name: 'Maneuvering Jets',
  type: 'action-card',
  place: 'both',
  // TODO
}

// Morale Boost 	4 	At the start of a combat round: 	Apply +1 to the result of each of your unit's combat rolls during this combat round.
export const moraleBoost: BattleEffect = {
  name: 'Morale Boost',
  type: 'action-card',
  place: 'both',
  // TODO
}

// Shields Holding 	4 	Before you assign hits to your ships during a space combat: 	Cancel up to 2 hits.
export const shieldsHolding: BattleEffect = {
  name: 'Shields Holding',
  type: 'action-card',
  place: Place.space,
  // TODO
}

// Blitz 	1 	At the start of an invasion: 	Each of your non-fighter ships in the active system that do not have BOMBARDMENT gain BOMBARDMENT 6 until the end of the invasion.
export const blitz: BattleEffect = {
  name: 'Blitz',
  type: 'action-card',
  place: Place.ground,
  transformUnit: (u: UnitInstance, _p: ParticipantInstance, place: Place) => {
    if (!doesUnitFitPlace(u, place) && u.type !== UnitType.fighter && !u.bombardment) {
      return {
        ...u,
        bombardment: {
          ...defaultRoll,
          hit: 6,
        },
      }
    } else {
      return u
    }
  },
}

// Reflective Shielding 	1 	When one of your ships uses SUSTAIN DAMAGE during combat: 	Produce 2 hits against your opponent's ships in the active system.
export const reflectiveShielding: BattleEffect = {
  name: 'Reflective Shielding',
  type: 'action-card',
  place: Place.space,
  // TODO
}

// Scramble Frequency 	1 	After another player makes a BOMBARDMENT, SPACE CANNON, or ANTI-FIGHTER BARRAGE roll: 	That player rerolls all of their dice.
export const scrambleFrequency: BattleEffect = {
  name: 'Scramble Frequency',
  type: 'action-card',
  place: 'both',
  // TODO another thing that would require "worse than average" detection
}

// After you activate a system: 	During this movement, other players cannot use SPACE CANNON against your ships.
export const solarFlare: BattleEffect = {
  name: 'Solar Flare',
  type: 'action-card',
  place: Place.space,
  transformEnemyUnit: (u) => {
    if (u.spaceCannon) {
      return {
        ...u,
        spaceCannon: undefined,
      }
    } else {
      return u
    }
  },
}

// Waylay 	1 	Before you roll dice for ANTI-FIGHTER BARRAGE 	Hits from this roll are produced against all ships (not just fighters).
export const waylay: BattleEffect = {
  name: 'Waylay',
  type: 'action-card',
  place: Place.space,
  // TODO
}
