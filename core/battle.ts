import { BattleInstance, ParticipantInstance } from './battleSetup'
import { Roll } from './unit'
import _times from 'lodash/times'

export function doBattle(battleInstance: BattleInstance) {
  doPds(battleInstance)
  resolveHits(battleInstance)

  let isFirstRound = true
  while (
    isParticipantAlive(battleInstance.attacker) &&
    isParticipantAlive(battleInstance.defender)
  ) {
    doBattleRolls(battleInstance, isFirstRound)
    resolveHits(battleInstance)
    isFirstRound = false
  }
}

function doPds(battleInstance: BattleInstance) {
  const attackerPdsHits = getPdsHits(battleInstance.attacker)
  battleInstance.defender.hitsToAssign += attackerPdsHits
  const defenderPdsHits = getPdsHits(battleInstance.defender)
  battleInstance.attacker.hitsToAssign += defenderPdsHits
}

function getPdsHits(p: ParticipantInstance) {
  const hits = p.units.map((u) => (u.spaceCannon ? getHits(u.spaceCannon) : 0))
  return hits.reduce((a, b) => {
    return a + b
  }, 0)
}

function doBattleRolls(battleInstance: BattleInstance, isFirstRound: boolean) {
  doParticipantBattleRolls(battleInstance.attacker, battleInstance.defender, isFirstRound)
  doParticipantBattleRolls(battleInstance.defender, battleInstance.attacker, isFirstRound)
}

function doParticipantBattleRolls(
  p: ParticipantInstance,
  otherParticipant: ParticipantInstance,
  isFirstRound: boolean,
) {
  const hits = p.units
    .map((unit) => {
      if (isFirstRound) {
        p.firstRoundEffects.forEach((effect) => {
          unit = effect(unit)
        })
      }

      return unit.combat ? getHits(unit.combat) : 0
    })
    .reduce((a, b) => {
      return a + b
    }, 0)

  otherParticipant.hitsToAssign += hits
}

function resolveHits(battleInstance: BattleInstance) {
  while (battleInstance.attacker.hitsToAssign > 0 || battleInstance.defender.hitsToAssign > 0) {
    resolveParticipantHits(battleInstance.attacker)
    resolveParticipantHits(battleInstance.defender)
  }
}

function resolveParticipantHits(p: ParticipantInstance) {
  while (p.hitsToAssign > 0) {
    const bestSustainUnit = getBestSustainUnit(p)
    if (p.riskDirectHit && bestSustainUnit) {
      bestSustainUnit.takenDamage = true
    } else {
      const bestDieUnit = getBestDieUnit(p)
      if (bestDieUnit) {
        if (bestDieUnit.sustainDamage && !bestDieUnit.takenDamage) {
          bestDieUnit.takenDamage = true
        } else {
          bestDieUnit.isDestroyed = true
        }
      }
    }
    p.hitsToAssign -= 1

    // TODO can we remove them directly and remove isDestroyed flag?
    p.units = p.units.filter((u) => !u.isDestroyed)
  }
}

function getBestDieUnit(p: ParticipantInstance) {
  const units = getAliveUnits(p)
  if (units.length === 0) {
    return undefined
  } else {
    return units.reduce((a, b) => {
      return a.diePriority! > b.diePriority! ? a : b
    })
  }
}

export function isParticipantAlive(p: ParticipantInstance) {
  return p.units.some((u) => !u.isDestroyed)
}

function getAliveUnits(p: ParticipantInstance) {
  return p.units.filter((u) => {
    return !u.isDestroyed
  })
}

function getBestSustainUnit(p: ParticipantInstance) {
  const units = getUnitsWithSustain(p)
  if (units.length === 0) {
    return undefined
  } else {
    return units.reduce((a, b) => {
      // TODO
      return a.useSustainDamagePriority! > b.useSustainDamagePriority! ? a : b
    })
  }
}

function getUnitsWithSustain(p: ParticipantInstance) {
  return p.units.filter((u) => {
    return u.sustainDamage && !u.takenDamage && !u.isDestroyed
  })
}

// TODO build test for this
export function getHits(roll: Roll): number {
  return _times(roll.count, () => {
    let reroll = roll.reroll
    let result = false
    while (!result && reroll >= 0) {
      result = Math.random() * 10 + 1 > roll.hit
      reroll -= 1
    }
    return result
  }).filter((r) => r).length
}
