import { objectEntries } from '../util/util-object'
import { UnitInstance, UnitType, UNIT_MAP } from './unit'
import _times from 'lodash/times'
import _cloneDeep from 'lodash/cloneDeep'
import { doBattle, isParticipantAlive } from './battle'
import { getRaceBattleEffects } from './races/race'
import { getUnitUpgrade } from './battleeffect/unitUpgrades'
import {
  Battle,
  BattleResult,
  BattleInstance,
  Side,
  Participant,
  ParticipantInstance,
} from './battle-types'
import { Race } from './enums'

export function setupBattle(battle: Battle): BattleInstance {
  battle = _cloneDeep(battle)
  return createBattleInstance(battle)
}

export function startBattle(battleInstance: BattleInstance) {
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
    attacker: createParticipantInstance(battle.attacker, 'attacker', battle.defender),
    defender: createParticipantInstance(battle.defender, 'defender', battle.attacker),
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
    onStartEffect: [],
    onSustainEffect: [],
    onRepairEffect: [],
    afterAfbEffect: [],

    riskDirectHit: participant.riskDirectHit,

    hitsToAssign: 0,

    roundActionTracker: {},
    fightActionTracker: {},
  }

  // TODO I guess here we should filter out battle effects that are not applicable
  // Say I select baron, choose their race tech, then switch to arborec. That needs to be handled.

  const raceAbilities = getRaceBattleEffects(participant).filter((effect) => effect.type === 'race')
  participant.battleEffects.push(...raceAbilities)

  objectEntries(participant.unitUpgrades).forEach(([unitType, upgraded]) => {
    if (upgraded) {
      const unitUpgrade = getUnitUpgrade(participant.race, unitType)
      if (unitUpgrade) {
        participant.battleEffects.push(unitUpgrade)
      }
    }
  })

  participant.battleEffects.forEach((battleEffect) => {
    if (battleEffect.onStart) {
      participantInstance.onStartEffect.push(battleEffect)
    }
    if (battleEffect.onSustain) {
      participantInstance.onSustainEffect.push(battleEffect)
    }
    if (battleEffect.onRepair) {
      participantInstance.onRepairEffect.push(battleEffect)
    }
    if (battleEffect.afterAfb) {
      participantInstance.afterAfbEffect.push(battleEffect)
    }
    if (battleEffect.transformUnit) {
      if (battleEffect.onlyFirstRound === true) {
        participantInstance.firstRoundEffects.push(battleEffect.transformUnit)
      } else {
        participantInstance.units = participantInstance.units.map((u) =>
          battleEffect.transformUnit!(u, participantInstance),
        )
      }
    }
  })

  otherParticipant.battleEffects.forEach((battleEffect) => {
    if (battleEffect.transformEnemyUnit) {
      if (battleEffect.onlyFirstRound === true) {
        participantInstance.firstRoundEffects.push(battleEffect.transformEnemyUnit)
      } else {
        participantInstance.units = participantInstance.units.map((u) =>
          battleEffect.transformEnemyUnit!(u, participantInstance),
        )
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
