import { objectEntries } from '../util/util-object'
import { UnitInstance, UnitType, UNIT_MAP } from './unit'
import _times from 'lodash/times'
import _cloneDeep from 'lodash/cloneDeep'
import { doBattle, isParticipantAlive } from './battle'
import { getRaceBattleEffects, Race } from './races/race'
import { BattleEffect } from './battleeffect/battleEffects'
import { PartialRecord } from '../util/util-types'
import { getUnitUpgrade } from './battleeffect/unitUpgrades'

// export enum BattleType {
// space = 'space',
// ground = 'ground',
// }

export enum Side {
  attacker = 'attacker',
  defender = 'defender',
}

// this returns a new unit
export type UnitEffect = (p: UnitInstance) => UnitInstance

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

  firstRoundEffects: UnitEffect[]
  onSustainEffect: UnitBattleEffect[]
  onRepairEffect: UnitBattleEffect[]

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
    roundNumber: 1,
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
    onRepairEffect: [],

    riskDirectHit: participant.riskDirectHit,

    hitsToAssign: 0,
  }

  // TODO I guess here we should filter out battle effects that are not applicable
  // Say I select baron, choose their race tech, then switch to arborec. That needs to be handled.

  participant.battleEffects.push(...getRaceBattleEffects(participant))

  objectEntries(participant.unitUpgrades).forEach(([unitType, upgraded]) => {
    if (upgraded) {
      const unitUpgrade = getUnitUpgrade(participant.race, unitType)
      if (unitUpgrade) {
        participant.battleEffects.push(unitUpgrade)
      }
    }
  })

  participant.battleEffects.forEach((battleEffect) => {
    if (battleEffect.onSustain) {
      participantInstance.onSustainEffect.push(battleEffect.onSustain)
    }
    if (battleEffect.onRepair) {
      participantInstance.onRepairEffect.push(battleEffect.onRepair)
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
  const participant: Participant = {
    race: Race.barony_of_letnev,
    side,
    units: getUnitMap(),
    unitUpgrades: {},
    battleEffects: [],
    riskDirectHit: false,
  }
  participant.units.destroyer = 2
  return participant
}

export const getUnitMap = () => {
  const unitMap: {
    [key in UnitType]: number
  } = {
    flagship: 0,
    warsun: 0,
    dreadnought: 0,
    carrier: 0,
    cruiser: 0,
    destroyer: 0,
    fighter: 0,
    mech: 0,
    infantry: 0,
    pds: 0,
  }
  return unitMap
}
