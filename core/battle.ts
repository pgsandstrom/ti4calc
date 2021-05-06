import { BattleInstance, ParticipantInstance } from './battle-types'
import { canBattleEffectBeUsed } from './battleeffect/battleEffects'
import { getHits } from './roll'

export function doBattle(battleInstance: BattleInstance) {
  doPds(battleInstance)
  resolveHits(battleInstance)

  while (
    isParticipantAlive(battleInstance.attacker) &&
    isParticipantAlive(battleInstance.defender)
  ) {
    doBattleRolls(battleInstance)
    resolveHits(battleInstance)
    doRepairStep(battleInstance)

    battleInstance.roundNumber += 1

    battleInstance.attacker.roundActionTracker = {}
    battleInstance.defender.roundActionTracker = {}

    if (battleInstance.roundNumber === 1000) {
      // TODO handle it nicer
      throw new Error('infinite fight')
    }
  }

  // console.log(`battle resolved after ${battleInstance.roundNumber - 1} rounds`)
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

function doBattleRolls(battleInstance: BattleInstance) {
  doParticipantBattleRolls(battleInstance, battleInstance.attacker, battleInstance.defender)
  doParticipantBattleRolls(battleInstance, battleInstance.defender, battleInstance.attacker)
}

function doParticipantBattleRolls(
  battleInstance: BattleInstance,
  p: ParticipantInstance,
  otherParticipant: ParticipantInstance,
) {
  const unitTransformEffects = p.units
    .filter((unit) => unit.battleEffect && unit.battleEffect.length > 0)
    .map((unit) => unit.battleEffect!)
    .flat()
    .filter((effect) => effect.transformUnit)

  const enemyUnitTransformEffects = p.units
    .filter((unit) => unit.battleEffect && unit.battleEffect.length > 0)
    .map((unit) => unit.battleEffect!)
    .flat()
    .filter((effect) => effect.transformEnemyUnit)

  const hits = p.units
    .map((unit) => {
      if (battleInstance.roundNumber === 1) {
        p.firstRoundEffects.forEach((effect) => {
          unit = effect(unit, p)
        })
      }

      unitTransformEffects.forEach((effect) => {
        if (canBattleEffectBeUsed(effect, p)) {
          unit = effect.transformUnit!(unit, p)
        }
      })

      enemyUnitTransformEffects.forEach((effect) => {
        if (canBattleEffectBeUsed(effect, p)) {
          unit = effect.transformEnemyUnit!(unit, p)
        }
      })

      // if (unit.combat) {
      //   console.log(
      //     `${p.side} shoots with ${unit.type} at ${unit.combat.hit - unit.combat.hitBonus}`,
      //   )
      // }

      return unit.combat ? getHits(unit.combat) : 0
    })
    .reduce((a, b) => {
      return a + b
    }, 0)

  otherParticipant.hitsToAssign += hits
}

function resolveHits(battleInstance: BattleInstance) {
  while (battleInstance.attacker.hitsToAssign > 0 || battleInstance.defender.hitsToAssign > 0) {
    resolveParticipantHits(battleInstance, battleInstance.attacker)
    resolveParticipantHits(battleInstance, battleInstance.defender)
  }
}

function resolveParticipantHits(battleInstance: BattleInstance, p: ParticipantInstance) {
  // TODO maybe make this prettier, so we only sustain on one row
  while (p.hitsToAssign > 0) {
    const bestSustainUnit = getBestSustainUnit(p)
    if (p.riskDirectHit && bestSustainUnit) {
      bestSustainUnit.takenDamage = true
      bestSustainUnit.takenDamageRound = battleInstance.roundNumber
      p.hitsToAssign -= 1
      p.onSustainEffect.forEach((effect) => {
        if (canBattleEffectBeUsed(effect, p)) {
          effect.onSustain!(bestSustainUnit, p, battleInstance)
        }
      })
    } else {
      const bestDieUnit = getBestDieUnit(p)
      if (bestDieUnit) {
        if (bestDieUnit.sustainDamage && !bestDieUnit.takenDamage) {
          bestDieUnit.takenDamage = true
          bestDieUnit.takenDamageRound = battleInstance.roundNumber
          p.hitsToAssign -= 1
          p.onSustainEffect.forEach((effect) => {
            if (canBattleEffectBeUsed(effect, p)) {
              effect.onSustain!(bestDieUnit, p, battleInstance)
            }
          })
        } else {
          bestDieUnit.isDestroyed = true
          p.hitsToAssign -= 1
        }
      } else {
        // redundant hit
        p.hitsToAssign -= 1
      }
    }

    // TODO can we remove them directly and remove isDestroyed flag?
    p.units = p.units.filter((u) => !u.isDestroyed)
  }
}

function doRepairStep(battleInstance: BattleInstance) {
  doRepairStepForParticipant(battleInstance, battleInstance.attacker)
  doRepairStepForParticipant(battleInstance, battleInstance.defender)
}

function doRepairStepForParticipant(
  battleInstance: BattleInstance,
  participant: ParticipantInstance,
) {
  if (participant.onRepairEffect.length > 0) {
    participant.units.forEach((unit) => {
      participant.onRepairEffect.forEach((effect) => {
        if (canBattleEffectBeUsed(effect, participant)) {
          effect.onRepair!(unit, participant, battleInstance)
        }
      })
    })
  }
}

function getBestDieUnit(p: ParticipantInstance) {
  const units = getAliveUnits(p)
  if (units.length === 0) {
    return undefined
  } else {
    return units.reduce((a, b) => {
      if (a.diePriority === b.diePriority && a.takenDamage !== b.takenDamage) {
        return a.takenDamage ? b : a
      }
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
