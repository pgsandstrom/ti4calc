import { destroyUnit, LOG } from '../battle'
import { ParticipantInstance, BattleInstance } from '../battle-types'
import { Place } from '../enums'
import { UnitInstance } from '../unit'
import { getBestShip, getHighestHitUnit, getNonFighterShips } from '../unitGet'
import { BattleEffect, registerUse } from './battleEffects'

export function getTechBattleEffects() {
  return [plasmaScoring, magenDefenseGrid, duraniumArmor, assaultCannon]
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

export const x89BacterialWeapon = {
  // TODO
}

export const antimassDeflectors = {
  //TODO
}

export const gravitonLaserSystem = {
  // TODO
}
