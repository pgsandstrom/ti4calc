import { BattleInstance, ParticipantInstance } from './battleSetup'
import { Roll } from './unit'
import _times from 'lodash/times'

export function doBattle(battleInstance: BattleInstance) {
  doPds(battleInstance)
  resolveHits(battleInstance)

  while (isParticipantAlive(battleInstance.left) && isParticipantAlive(battleInstance.right)) {
    console.log('doBattleRolls')
    doBattleRolls(battleInstance)
    resolveHits(battleInstance)
  }
  console.log(
    `fight end: ${isParticipantAlive(battleInstance.left)}, ${isParticipantAlive(
      battleInstance.right,
    )}`,
  )
}

function doPds(battleInstance: BattleInstance) {
  const leftPdsHits = getPdsHits(battleInstance.left)
  battleInstance.right.hitsToAssign += leftPdsHits
  const rightPdsHits = getPdsHits(battleInstance.right)
  battleInstance.left.hitsToAssign += rightPdsHits
}

function getPdsHits(p: ParticipantInstance) {
  const hits = p.units.map((u) => (u.spaceCannon ? getHits(u.spaceCannon) : 0))
  return hits.reduce((a, b) => {
    return a + b
  }, 0)
}

function doBattleRolls(battleInstance: BattleInstance) {
  doParticipantBattleRolls(battleInstance.left, battleInstance.right)
  doParticipantBattleRolls(battleInstance.right, battleInstance.left)
}

function doParticipantBattleRolls(p: ParticipantInstance, otherParticipant: ParticipantInstance) {
  const hits = p.units
    .map((unit) => {
      return unit.combat ? getHits(unit.combat) : 0
    })
    .reduce((a, b) => {
      return a + b
    }, 0)

  if (hits) {
    console.log(`hits for ${p.side}: ${hits}`)
  } else {
    console.log(`${p.side} misses`)
  }
  otherParticipant.hitsToAssign += hits
}

function resolveHits(battleInstance: BattleInstance) {
  while (battleInstance.left.hitsToAssign > 0 || battleInstance.right.hitsToAssign > 0) {
    resolveParticipantHits(battleInstance.left)
    resolveParticipantHits(battleInstance.right)
  }
}

function resolveParticipantHits(p: ParticipantInstance) {
  while (p.hitsToAssign > 0) {
    const bestSustainUnit = getBestSustainUnit(p)
    if (bestSustainUnit) {
      bestSustainUnit.takenDamage = true
    } else {
      const bestDieUnit = getBestDieUnit(p)
      if (bestDieUnit) {
        bestDieUnit.isDestroyed = true
      }
    }
    p.hitsToAssign -= 1
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
function getHits(roll: Roll): number {
  return _times(roll.count, () => {
    return Math.random() * 10 > roll.hit
  }).filter((r) => r).length
}
