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
import { Place, Race } from './enums'
import { BattleEffect } from './battleeffect/battleEffects'

export function setupBattle(battle: Battle): BattleInstance {
  battle = _cloneDeep(battle)
  return createBattleInstance(battle)
}

export function startBattle(battle: BattleInstance) {
  doBattle(battle)

  if (isParticipantAlive(battle.attacker, battle.place)) {
    return BattleResult.attacker
  } else if (isParticipantAlive(battle.defender, battle.place)) {
    return BattleResult.defender
  } else {
    return BattleResult.draw
  }
}

function createBattleInstance(battle: Battle): BattleInstance {
  // How we create and apply battle effects is a bit complicated, due to two reasons:
  // First, one sides battle effects affect the other side, so we need to create both participants and then apply
  // battle effects to the opponent
  // Also, a battle effect (such as the flagships) can give units new battle effects. So unit battle effects needs
  // to be applied after all other effects.
  const attackerBattleEffects = getParticipantBattleEffects(battle.attacker)
  const attacker = createParticipantInstance(
    battle.attacker,
    attackerBattleEffects,
    'attacker',
    battle.place,
  )
  const defenderBattleEffects = getParticipantBattleEffects(battle.defender)
  const defender = createParticipantInstance(
    battle.defender,
    defenderBattleEffects,
    'defender',
    battle.place,
  )

  addOtherParticipantsBattleEffects(attacker, defenderBattleEffects, battle.place)
  addOtherParticipantsBattleEffects(defender, attackerBattleEffects, battle.place)

  fixUnitBattleEffects(attacker, defender, battle.place)
  fixUnitBattleEffects(defender, attacker, battle.place)

  return {
    place: battle.place,
    attacker,
    defender,
    roundNumber: 1,
  }
}

function getParticipantUnits(participant: Participant) {
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
  return units
}

function getParticipantBattleEffects(participant: Participant) {
  // Say I select baron, choose their race tech, then switch to arborec. Here we filter out unviable techs like that:
  const battleEffects = participant.battleEffects.filter((effect) => {
    // TODO add exception for necro
    if (effect.race && effect.race !== participant.race) {
      return false
    } else {
      return true
    }
  })

  const raceAbilities = getRaceBattleEffects(participant).filter((effect) => effect.type === 'race')
  battleEffects.push(...raceAbilities)

  objectEntries(participant.unitUpgrades).forEach(([unitType, upgraded]) => {
    if (upgraded) {
      const unitUpgrade = getUnitUpgrade(participant.race, unitType)
      if (unitUpgrade) {
        battleEffects.push(unitUpgrade)
      }
    }
  })
  return battleEffects
}

function createParticipantInstance(
  participant: Participant,
  battleEffects: BattleEffect[],
  side: Side,
  place: Place,
): ParticipantInstance {
  const units = getParticipantUnits(participant)

  const participantInstance: ParticipantInstance = {
    side,
    race: participant.race,
    units,
    firstRoundEffects: [],
    firstRoundEnemyEffects: [],
    onStartEffect: [],
    onSustainEffect: [],
    onRepairEffect: [],
    onCombatRoundEnd: [],
    afterAfbEffect: [],

    riskDirectHit: participant.riskDirectHit,

    hitsToAssign: {
      hits: 0,
      hitsToNonFighters: 0,
    },

    roundActionTracker: {},
    fightActionTracker: {},
  }

  applyBattleEffects(participantInstance, battleEffects, place)

  return participantInstance
}

function fixUnitBattleEffects(p: ParticipantInstance, other: ParticipantInstance, place: Place) {
  const attackerUnitBattleEffects = p.units
    .filter((u) => u.battleEffects)
    .map((u) => u.battleEffects!)
    .flat()

  applyBattleEffects(p, attackerUnitBattleEffects, place)
  addOtherParticipantsBattleEffects(other, attackerUnitBattleEffects, place)
}

function addOtherParticipantsBattleEffects(
  participantInstance: ParticipantInstance,
  battleEffects: BattleEffect[],
  place: Place,
) {
  battleEffects.forEach((battleEffect) => {
    if (battleEffect.transformEnemyUnit) {
      if (battleEffect.onlyFirstRound === true) {
        participantInstance.firstRoundEnemyEffects.push(battleEffect)
      } else {
        participantInstance.units = participantInstance.units.map((u) => {
          return battleEffect.transformEnemyUnit!(u, participantInstance, place, battleEffect.name)
        })
      }
    }
  })
}

function applyBattleEffects(
  participantInstance: ParticipantInstance,
  battleEffects: BattleEffect[],
  place: Place,
) {
  battleEffects.forEach((battleEffect) => {
    if (battleEffect.onStart) {
      participantInstance.onStartEffect.push(battleEffect)
    }
    if (battleEffect.onSustain) {
      participantInstance.onSustainEffect.push(battleEffect)
    }
    if (battleEffect.onRepair) {
      participantInstance.onRepairEffect.push(battleEffect)
    }
    if (battleEffect.onCombatRoundEnd) {
      participantInstance.onCombatRoundEnd.push(battleEffect)
    }
    if (battleEffect.afterAfb) {
      participantInstance.afterAfbEffect.push(battleEffect)
    }
    if (battleEffect.transformUnit) {
      if (battleEffect.onlyFirstRound === true) {
        participantInstance.firstRoundEffects.push(battleEffect)
      } else {
        participantInstance.units = participantInstance.units.map((u) =>
          battleEffect.transformUnit!(u, participantInstance, place, battleEffect.name),
        )
      }
    }
  })
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
