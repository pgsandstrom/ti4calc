import { destroyUnit, LOG } from '../battle'
import { ParticipantInstance, BattleInstance } from '../battle-types'
import { Place } from '../enums'
import { getUnitWithImproved, UnitInstance, UnitType } from '../unit'
import { getHighestWorthUnit, getHighestHitUnit, getNonFighterShips } from '../unitGet'
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
  onStart: (participant: ParticipantInstance) => {
    // TODO when we do these things on onStart... maybe this unit is destroyed by assault cannon or something similar.
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
    "At the start of ground combat on a planet that contains 1 or more of your structures, you may produce 1 hit and assign it to 1 of your opponent's ground forces.",
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
      unit.takenDamage = false
      registerUse(effectName, participant)
      if (LOG) {
        console.log(`${participant.side} used duranium armor in round ${battle.roundNumber}`)
      }
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
      const bestShip = getHighestWorthUnit(otherParticipant, Place.space)
      if (bestShip) {
        destroyUnit(battle, bestShip)
        if (LOG) {
          console.log(`Assault cannon destroyed ${bestShip.type}`)
        }
      }
    }
  },
}

export const x89BacterialWeapon: BattleEffect = {
  name: 'X-89 Bacterial Weapon',
  description:
    "After 1 or more of your units use BOMBARDMENT against a planet, if at least 1 of your opponent's infantry was destroyed, you may destroy all of your opponent's infantry on that planet.",
  type: 'tech',
  place: Place.ground,
  side: 'attacker',
  onDeath: (
    deadUnits: UnitInstance[],
    _participant: ParticipantInstance,
    otherParticipant: ParticipantInstance,
    battle: BattleInstance,
    isOwnUnit: boolean,
  ) => {
    if (isOwnUnit) {
      return
    }
    if (deadUnits.some((u) => u.type === UnitType.infantry)) {
      otherParticipant.units.forEach((unit) => {
        if (unit.type === UnitType.infantry) {
          destroyUnit(battle, unit)
        }
      })
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
// But currently it has no negative impact. But be wary when we implement experimental battlestation...
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
