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

export enum Side {
  attacker = 'attacker',
  defender = 'defender',
}

type UnitEffect = (p: UnitInstance) => UnitInstance

type ParticipantEffect = (unit: UnitInstance, participant: ParticipantInstance) => void

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
  battleEffects: BattleEffect[]

  riskDirectHit: boolean
}

export interface BattleInstance {
  attacker: ParticipantInstance
  defender: ParticipantInstance
}

export interface ParticipantInstance {
  side: Side
  race: Race
  units: UnitInstance[]

  firstRoundEffects: UnitEffect[]
  onSustainEffect: ParticipantEffect[]

  riskDirectHit: boolean

  hitsToAssign: number
}

export enum BattleResult {
  attacker = 'attacker',
  draw = 'draw',
  defender = 'defender',
}

export function setupBattle(battle: Battle): BattleResult {
  battle = _cloneDeep(battle)
  // TODO fix so createBattleInstance is only called once and then cloned, not 1000 times
  const battleInstance = createBattleInstance(battle)
  doBattle(battleInstance)

  if (isParticipantAlive(battleInstance.attacker)) {
    return BattleResult.attacker
  } else if (isParticipantAlive(battleInstance.defender)) {
    return BattleResult.defender
  } else {
    return BattleResult.draw
  }
}

function createBattleInstance(battle: Battle): BattleInstance {
  return {
    attacker: createParticipantInstance(battle.attacker, Side.attacker, battle.defender),
    defender: createParticipantInstance(battle.defender, Side.defender, battle.attacker),
  }
}

function createParticipantInstance(
  participant: Participant,
  side: Side,
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
    onSustainEffect: [],

    riskDirectHit: participant.riskDirectHit,

    hitsToAssign: 0,
  }

  participant.battleEffects.push(...getRaceBattleEffects(participant))

  participant.battleEffects.forEach((battleEffect) => {
    if (battleEffect.onSustain) {
      participantInstance.onSustainEffect.push(battleEffect.onSustain)
    }
    if (battleEffect.transformUnit) {
      if (battleEffect.onlyFirstRound) {
        participantInstance.firstRoundEffects.push(battleEffect.transformUnit)
      } else {
        participantInstance.units = participantInstance.units.map(battleEffect.transformUnit)
      }
    }
  })

  otherParticipant.battleEffects.forEach((battleEffect) => {
    if (battleEffect.transformEnemyUnit) {
      if (battleEffect.onlyFirstRound) {
        participantInstance.firstRoundEffects.push(battleEffect.transformEnemyUnit)
      } else {
        participantInstance.units = participantInstance.units.map(battleEffect.transformEnemyUnit)
      }
    }
  })

  return participantInstance
}

export function createParticipant(side: Side): Participant {
  return {
    race: Race.arborec,
    side,
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
    riskDirectHit: false,
  }
}
