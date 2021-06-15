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
    // waylay,
  ]
}

export const bunker: BattleEffect = {
  name: 'Bunker',
  description:
    'During this invasion, apply -4 to the result of each BOMBARDMENT roll against planets you control.',
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

// TODO maybe add a test to direct hit
// TODO also test riskDirectHit and that stuff there
export const directHit: BattleEffect = {
  name: 'Direct Hit',
  description:
    "After another player's ship uses SUSTAIN DAMAGE to cancel a hit produced by your units or abilities: Destroy that ship.",
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
      if (!u.immuneToDirectHit && !u.isDestroyed) {
        u.isDestroyed = true
        if (LOG) {
          console.log(`${participant.side} used direct hit to destroy ${u.type}`)
        }
        participant.effects[effectName] -= 1
      }
    }
  },
}

export const disable: BattleEffect = {
  name: 'Disable',
  description:
    "Your opponents' PDS units lose Planetary Shield and Space Cannon during this invasion.",
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

export const emergencyRepairs: BattleEffect = {
  name: 'Emergency Repairs',
  description:
    'At the start or end of a combat round: Repair all of your units that have SUSTAIN DAMAGE in the active system.',
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

export const experimentalBattlestation: BattleEffect = {
  name: 'Experimental Battlestation',
  description:
    'After another player moves ships into a system during a tactical action: Choose 1 of your space docks that is either in or adjacent to that system. That space dock uses Space Cannon 5 (x3) against ships in the active system.',
  type: 'action-card',
  place: Place.space,
  onStart: () => {
    // TODO currently this is very complex. It happens in it own phase and could theoretically be used with graviton laser system.
    // But antimass should also be applied.
    // and argent flight flagship should stop this.
    // but pds upgrade should not affect it.
  },
}

export const fighterPrototype: BattleEffect = {
  name: 'Fighter Prototype',
  description:
    "At the start of the first round of a space combat: Apply +2 to the result of each of your fighters' combat rolls during this combat round.",
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

export const fireTeam: BattleEffect = {
  name: 'Fire Team',
  description:
    'After your ground forces make combat rolls during a round of ground combat: Reroll any number of your dice.',
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

export const maneuveringJets: BattleEffect = {
  name: 'Maneuvering Jets',
  description:
    "Before you assign hits produced by another player's Space Cannon roll: Cancel 1 hit.",
  type: 'action-card',
  place: 'both',
  // TODO
}

export const moraleBoost: BattleEffect = {
  name: 'Morale Boost',
  description:
    "At the start of a combat round: Apply +1 to the result of each of your unit's combat rolls during this combat round.",
  type: 'action-card',
  place: 'both',
  count: true,
  onCombatRound: (
    participant: ParticipantInstance,
    _battle: BattleInstance,
    _otherParticipant: ParticipantInstance,
    effectName: string,
  ) => {
    if (participant.effects[effectName] > 0) {
      participant.units.forEach((u) => {
        if (u.combat) {
          u.combat.hitBonusTmp += 1
        }
      })
      participant.effects[effectName] -= 1
    }
  },
}

export const shieldsHolding: BattleEffect = {
  name: 'Shields Holding',
  description: 'Before you assign hits to your ships during a space combat: Cancel up to 2 hits.',
  type: 'action-card',
  place: Place.space,
  // TODO can only be played once per round per player
}

export const blitz: BattleEffect = {
  name: 'Blitz',
  description:
    'At the start of an invasion: Each of your non-fighter ships in the active system that do not have BOMBARDMENT gain BOMBARDMENT 6 until the end of the invasion.',
  type: 'action-card',
  place: Place.ground,
  side: 'attacker',
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

export const reflectiveShielding: BattleEffect = {
  name: 'Reflective Shielding',
  description:
    "When one of your ships uses SUSTAIN DAMAGE during combat: Produce 2 hits against your opponent's ships in the active system.",
  type: 'action-card',
  place: Place.space,
  // TODO
}

export const scrambleFrequency: BattleEffect = {
  name: 'Scramble Frequency',
  description:
    'After another player makes a BOMBARDMENT, SPACE CANNON, or ANTI-FIGHTER BARRAGE roll: That player rerolls all of their dice.',
  type: 'action-card',
  place: 'both',
  // TODO another thing that would require "worse than average" detection
}

export const solarFlare: BattleEffect = {
  name: 'Solar Flare',
  description:
    'After you activate a system: During this movement, other players cannot use SPACE CANNON against your ships.',
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

export const waylay: BattleEffect = {
  name: 'Waylay',
  description:
    'Before you roll dice for ANTI-FIGHTER BARRAGE: Hits from this roll are produced against all ships (not just fighters).',
  type: 'action-card',
  place: Place.space,
  // TODO
}
