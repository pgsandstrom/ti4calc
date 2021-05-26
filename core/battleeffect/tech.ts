import { destroyUnit, LOG } from '../battle'
import { ParticipantInstance, BattleInstance } from '../battle-types'
import { Place } from '../enums'
import { getUnitWithImproved, UnitInstance, UnitType } from '../unit'
import { getBestShip, getHighestHitUnit, getNonFighterShips } from '../unitGet'
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
  type: 'tech',
  place: 'both',
  onStart: (participant: ParticipantInstance) => {
    // TODO when we do these things on onStart... maybe this unit is destroyed by assault cannon or something similar.
    // It would be more correct to do it at the appropriate time. Like onBombard and onSpaceCannon
    const bestBomber = getHighestHitUnit(participant, 'bombardment')
    if (bestBomber?.bombardment) {
      bestBomber.bombardment.countBonus += 1
    }
    const bestSpacecannon = getHighestHitUnit(participant, 'spaceCannon')
    if (bestSpacecannon?.spaceCannon) {
      bestSpacecannon.spaceCannon.countBonus += 1
    }
  },
}

export const magenDefenseGrid: BattleEffect = {
  name: 'Magen Defense Grid',
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
  type: 'tech',
  place: Place.space,
  onStart: (
    participant: ParticipantInstance,
    battle: BattleInstance,
    otherParticipant: ParticipantInstance,
  ) => {
    if (getNonFighterShips(participant).length >= 3) {
      const bestShip = getBestShip(otherParticipant)
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
// But currently it has no negative impact.
export const gravitonLaserSystem: BattleEffect = {
  name: 'Graviton Laser System',
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
