import { objectEntries } from '../util/util-object'
import { UnitInstance, UnitType, UNIT_MAP } from './unit'
import _times from 'lodash/times'
import _cloneDeep from 'lodash/cloneDeep'
import { doBattle, isParticipantAlive } from './battle'
import { getRaceBattleEffects, Race } from './races/race'
import { BattleEffect } from './battleEffects'

// export enum BattleType {
// space = 'space',
// ground = 'ground',
// }

type UnitEffect = (p: UnitInstance) => UnitInstance

export interface Battle {
  left: Participant
  right: Participant
}

export interface Participant {
  race: Race
  units: {
    [key in UnitType]: number
  }
  battleEffects: BattleEffect[]
}

export interface BattleInstance {
  left: ParticipantInstance
  right: ParticipantInstance
}

export interface ParticipantInstance {
  side: 'left' | 'right'
  race: Race
  units: UnitInstance[]

  firstRoundEffects: UnitEffect[]

  hitsToAssign: number
}

export enum BattleResult {
  left = 'left',
  draw = 'draw',
  right = 'right',
}

export function setupBattle(battle: Battle): BattleResult {
  battle = _cloneDeep(battle)
  // TODO fix so createBattleInstance is only called once and then cloned, not 1000 times
  const battleInstance = createBattleInstance(battle)
  doBattle(battleInstance)

  if (isParticipantAlive(battleInstance.left)) {
    return BattleResult.left
  } else if (isParticipantAlive(battleInstance.right)) {
    return BattleResult.right
  } else {
    return BattleResult.draw
  }
}

function createBattleInstance(battle: Battle): BattleInstance {
  return {
    left: createParticipantInstance(battle.left, 'left', battle.right),
    right: createParticipantInstance(battle.right, 'right', battle.left),
  }
}

function createParticipantInstance(
  participant: Participant,
  side: 'left' | 'right',
  otherParticipant: Participant,
): ParticipantInstance {
  const units = objectEntries(participant.units)
    .map<UnitInstance[]>(([unitType, number]) => {
      return _times(number, () => {
        const unit = _cloneDeep(UNIT_MAP[unitType])
        const unitInstance: UnitInstance = {
          ...unit,
          takenDamage: false,
          isDestroyed: false,
        }
        return unitInstance
      })
    })
    .flat()

  const participantInstance: ParticipantInstance = {
    side,
    race: participant.race,
    units,
    firstRoundEffects: [],

    hitsToAssign: 0,
  }

  participant.battleEffects.push(...getRaceBattleEffects(participant))

  participant.battleEffects.forEach((battleEffect) => {
    if (battleEffect.transformUnit) {
      if (battleEffect.onlyFirstRound) {
        participantInstance.firstRoundEffects.push(battleEffect.transformUnit)
      } else {
        participantInstance.units.forEach(battleEffect.transformUnit)
      }
    }
  })

  otherParticipant.battleEffects.forEach((battleEffect) => {
    if (battleEffect.transformEnemyUnit) {
      if (battleEffect.onlyFirstRound) {
        participantInstance.firstRoundEffects.push(battleEffect.transformEnemyUnit)
      } else {
        participantInstance.units.forEach(battleEffect.transformEnemyUnit)
      }
    }
  })

  return participantInstance
}

export function createParticipant(): Participant {
  return {
    race: Race.arborec,
    units: {
      flagship: 0,
      warsun: 0,
      dreadnought: 0,
      carrier: 0,
      cruiser: 0,
      destroyer: 10,
      fighter: 0,
      mech: 0,
      infantry: 0,
      pds: 0,
    },
    battleEffects: [],
  }
}
