import { objectEntries } from '../util/util-object'
import { UnitInstance, UnitType, UNIT_MAP } from './unit'
import _times from 'lodash/times'
import _cloneDeep from 'lodash/cloneDeep'
import { doBattle, isParticipantAlive } from './battle'
import { doRaceBuff, Race } from './races/race'

// export enum BattleType {
// space = 'space',
// ground = 'ground',
// }

export interface Battle {
  left: Participant
  right: Participant
}

export interface Participant {
  race: Race
  units: {
    [key in UnitType]: number
  }
}

export interface BattleInstance {
  left: ParticipantInstance
  right: ParticipantInstance
}

export interface ParticipantInstance {
  side: 'left' | 'right'
  race: Race
  units: UnitInstance[]
  hitsToAssign: number
}

export enum BattleResult {
  left = 'left',
  draw = 'draw',
  right = 'right',
}

export function setupBattle(battle: Battle): BattleResult {
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
    left: createParticipantInstance(battle.left, 'left'),
    right: createParticipantInstance(battle.right, 'right'),
  }
}

function createParticipantInstance(
  participant: Participant,
  side: 'left' | 'right',
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

  const participantInstance = {
    side,
    race: participant.race,
    units,
    hitsToAssign: 0,
  }
  doRaceBuff(participantInstance)
  return participantInstance
}

export function createParticipant(): Participant {
  return {
    race: Race.arborec,
    units: {
      cruiser: 0,
      destroyer: 10,
    },
  }
}
