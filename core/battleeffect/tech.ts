import { logWrapper } from '../../util/util-log'
import { destroyUnit } from '../battle'
import { BattleInstance, ParticipantInstance } from '../battle-types'
import { Place } from '../enums'
import { HitInfo } from '../roll'
import { getUnitWithImproved, UnitInstance } from '../unit'
import { getHighestHitUnit, getLowestWorthUnit, getNonFighterShips } from '../unitGet'
import { BattleEffect, registerUse } from './battleEffects'

export function getTechBattleEffects() {
  return [
    plasmaScoring,
    magenDefenseGrid,
    duraniumArmor,
    assaultCannon,
    x89BacterialWeapon,
    antimassDeflectors,
    gravitonLaserSystem,
  ]
}

export const plasmaScoring: BattleEffect = {
  name: 'Plasma Scoring',
  description:
    'When 1 or more of your units use BOMBARDMENT or SPACE CANNON, 1 of those units may roll 1 additional die.',
  type: 'tech',
  place: 'both',
  beforeStart: (participant: ParticipantInstance) => {
    // TODO doing this on beforeStart might not be correct... maybe this unit is destroyed by some other effect before the relevant step.
    // It would be more correct to do it at the appropriate time. Like onBombard and onSpaceCannon
    const bestBomber = getHighestHitUnit(participant, 'bombardment', undefined)
    if (bestBomber?.bombardment) {
      bestBomber.bombardment.countBonus += 1
    }
    const bestSpacecannon = getHighestHitUnit(participant, 'spaceCannon', undefined)
    if (bestSpacecannon?.spaceCannon) {
      bestSpacecannon.spaceCannon.countBonus += 1
    }
  },
}

export const magenDefenseGrid: BattleEffect = {
  name: 'Magen Defense Grid',
  description:
    "When any player activates a system that contains 1 or more of your structures, place 1 infantry from your reinforcements with each of those structures. At the start of ground combat on a planet that contains 1 or more of your structures, produce 1 hit and assign it to 1 of your opponent's ground forces.\nPLEASE NOTE: We dont place extra infantry, increase the count yourself. Checking this assumes you have at least one structure.",
  type: 'tech',
  place: Place.ground,
  side: 'defender',
  onStart: (
    _participant: ParticipantInstance,
    _battle: BattleInstance,
    otherParticipant: ParticipantInstance,
  ) => {
    otherParticipant.hitsToAssign.hitsAssignedByEnemy += 1
  },
}

export const duraniumArmor: BattleEffect = {
  name: 'Duranium Armor',
  description:
    'During each combat round, after you assign hits to your units, repair 1 of your damaged units that did not use SUSTAIN DAMAGE during this combat round.',
  type: 'tech',
  place: 'both',
  onRepair: (
    unit: UnitInstance,
    participant: ParticipantInstance,
    battle: BattleInstance,
    effectName: string,
  ) => {
    if (unit.takenDamage && unit.takenDamageRound !== battle.roundNumber) {
      // make sure we dont repair something that is not participating in battle
      if (!unit.isGroundForce && battle.place === Place.ground) {
        return
      }
      if (!unit.isShip && battle.place === Place.space) {
        return
      }
      unit.takenDamage = false
      registerUse(effectName, participant)
      logWrapper(`${participant.side} used duranium armor in round ${battle.roundNumber}`)
    }
  },
  timesPerRound: 1,
}

export const assaultCannon: BattleEffect = {
  name: 'Assault Cannon',
  description:
    'At the start of a space combat in a system that contains 3 or more of your non-fighter ships, your opponent must destroy 1 of their non-fighter ships.',
  type: 'tech',
  place: Place.space,
  onStart: (
    participant: ParticipantInstance,
    battle: BattleInstance,
    otherParticipant: ParticipantInstance,
  ) => {
    if (getNonFighterShips(participant).length >= 3) {
      const worstShip = getLowestWorthUnit(otherParticipant, Place.space, false)
      if (worstShip) {
        destroyUnit(battle, worstShip)
        logWrapper(`Assault cannon destroyed ${worstShip.type}`)
      }
    }
  },
}

export const x89BacterialWeapon: BattleEffect = {
  name: 'X-89 Bacterial Weapon',
  description:
    "Double the hits produced by your units' BOMBARDMENT and ground combat rolls. Exhaust each planet you use BOMBARDMENT against.",
  type: 'tech',
  place: Place.ground,
  onBombardmentHit: (
    _participant: ParticipantInstance,
    _battle: BattleInstance,
    _otherParticipant: ParticipantInstance,
    hitInfo: HitInfo,
  ) => {
    if (hitInfo.hits > 0) {
      logWrapper(`X-89 Bacterial Weapon adds ${hitInfo.hits} hits to bombardment`)
      hitInfo.hits *= 2
    }
  },
  onHit: (
    _participant: ParticipantInstance,
    _battle: BattleInstance,
    _otherParticipant: ParticipantInstance,
    hitInfo: HitInfo,
  ) => {
    if (hitInfo.hits > 0) {
      logWrapper(`X-89 Bacterial Weapon adds ${hitInfo.hits} hits to ground combat hit.`)
      hitInfo.hits *= 2
    }
  },
}

export const antimassDeflectors: BattleEffect = {
  name: 'Antimass Deflectors',
  description:
    'When other players’ units use SPACE CANNON against your units, apply -1 to the result of each die roll.',
  type: 'tech',
  place: 'both',
  transformEnemyUnit: (u: UnitInstance) => {
    if (u.spaceCannon) {
      return getUnitWithImproved(u, 'spaceCannon', 'hit', 'permanent', -1)
    } else {
      return u
    }
  },
}

// In theory graviton could cause problems. It gives permanent 'assignHitsToNonFighters' which is incorrect.
export const gravitonLaserSystem: BattleEffect = {
  name: 'Graviton Laser System',
  description:
    'You may exhaust this card before 1 or more of your units uses SPACE CANNON; hits produced by those units must be assigned to non-fighter ships if able.',
  type: 'tech',
  place: Place.space,
  transformUnit: (u: UnitInstance) => {
    // TODO if a carrier is destroyed here, the fighters should be destroyed prior to combat.
    if (u.spaceCannon) {
      u.assignHitsToNonFighters = true
      return u
    } else {
      return u
    }
  },
}
