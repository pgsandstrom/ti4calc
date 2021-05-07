import { BattleInstance, ParticipantInstance } from './battle-types'
import { canBattleEffectBeUsed } from './battleeffect/battleEffects'
import { Place } from './enums'
import { getHits } from './roll'
import { UnitInstance, UnitType } from './unit'

// constant is let just to avoid eslint getting confused...
// eslint-disable-next-line
let LOG = false

export function doBattle(battle: BattleInstance) {
  battle.attacker.onStartEffect.forEach((effect) => {
    effect.onStart!(battle.attacker, battle, battle.defender)
  })
  battle.defender.onStartEffect.forEach((effect) => {
    effect.onStart!(battle.defender, battle, battle.attacker)
  })

  if (battle.place === Place.ground) {
    doBombardment(battle)
    resolveHits(battle)
  }

  doPds(battle)
  resolveHits(battle)

  if (battle.place === Place.space) {
    doAfb(battle)
  }

  while (
    isParticipantAlive(battle.attacker, battle.place) &&
    isParticipantAlive(battle.defender, battle.place)
  ) {
    doBattleRolls(battle)
    resolveHits(battle)
    doRepairStep(battle)

    battle.roundNumber += 1

    battle.attacker.roundActionTracker = {}
    battle.defender.roundActionTracker = {}

    if (battle.roundNumber === 1000) {
      // TODO handle it nicer
      throw new Error('infinite fight')
    }
  }

  if (LOG) {
    console.log(`battle resolved after ${battle.roundNumber - 1} rounds`)
  }
}

function doBombardment(battle: BattleInstance) {
  if (battle.defender.units.some((u) => u.planetaryShield)) {
    return
  }

  const hits = battle.attacker.units.map((u) => (u.bombardment ? getHits(u.bombardment) : 0))
  const result = hits.reduce((a, b) => {
    return a + b
  }, 0)
  if (LOG) {
    console.log(`bombardment produced ${result} hits.`)
  }
  battle.defender.hitsToAssign += result
  return result
}

function doPds(battle: BattleInstance) {
  if (battle.place === Place.space) {
    const attackerPdsHits = getPdsHits(battle.attacker)
    battle.defender.hitsToAssign += attackerPdsHits
  }
  const defenderPdsHits = getPdsHits(battle.defender)
  battle.attacker.hitsToAssign += defenderPdsHits
}

function getPdsHits(p: ParticipantInstance) {
  const hits = p.units.map((u) => (u.spaceCannon ? getHits(u.spaceCannon) : 0))
  return hits.reduce((a, b) => {
    return a + b
  }, 0)
}

function doAfb(battle: BattleInstance) {
  const attackerPdsHits = getAfbHits(battle.attacker)
  battle.defender.hitsToAssign += attackerPdsHits
  const defenderPdsHits = getAfbHits(battle.defender)
  battle.attacker.hitsToAssign += defenderPdsHits

  resolveAfbHits(battle.attacker)
  resolveAfbHits(battle.defender)

  battle.attacker.afterAfbEffect.forEach((effect) => {
    effect.afterAfb!(battle.attacker, battle, battle.defender)
  })
  battle.defender.afterAfbEffect.forEach((effect) => {
    effect.afterAfb!(battle.defender, battle, battle.attacker)
  })

  battle.attacker.hitsToAssign = 0
  battle.defender.hitsToAssign = 0
}

function getAfbHits(p: ParticipantInstance) {
  const hits = p.units.map((u) => (u.afb ? getHits(u.afb) : 0))
  return hits.reduce((a, b) => {
    return a + b
  }, 0)
}

function resolveAfbHits(p: ParticipantInstance) {
  while (p.hitsToAssign > 0) {
    const aliveFighter = p.units.find((u) => u.type === UnitType.fighter && !u.isDestroyed)
    if (aliveFighter) {
      aliveFighter.isDestroyed = true
      p.hitsToAssign -= 1
    } else {
      break
    }
  }
}

function doBattleRolls(battle: BattleInstance) {
  doParticipantBattleRolls(battle, battle.attacker, battle.defender)
  doParticipantBattleRolls(battle, battle.defender, battle.attacker)
}

function doParticipantBattleRolls(
  battle: BattleInstance,
  p: ParticipantInstance,
  otherParticipant: ParticipantInstance,
) {
  const unitTransformEffects = p.units
    // this filter assumes the ships cannot use battle effects on ground forces
    .filter((unit) => doesUnitFitPlace(unit, battle.place))
    .filter((unit) => unit.aura && unit.aura.length > 0)
    .map((unit) => unit.aura!)
    .flat()
    .filter((effect) => effect.transformUnit)

  const enemyUnitTransformEffects = p.units
    // this filter assumes the ships cannot use battle effects on ground forces
    .filter((unit) => doesUnitFitPlace(unit, battle.place))
    .filter((unit) => unit.aura && unit.aura.length > 0)
    .map((unit) => unit.aura!)
    .flat()
    .filter((effect) => effect.transformEnemyUnit)

  const hits = p.units
    .filter((unit) => doesUnitFitPlace(unit, battle.place))
    .map((unit) => {
      if (battle.roundNumber === 1) {
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

      if (LOG && unit.combat) {
        console.log(
          `${p.side} shoots with ${unit.type} at ${unit.combat.hit - unit.combat.hitBonus}`,
        )
      }

      return unit.combat ? getHits(unit.combat) : 0
    })
    .reduce((a, b) => {
      return a + b
    }, 0)

  otherParticipant.hitsToAssign += hits
}

function resolveHits(battle: BattleInstance) {
  while (battle.attacker.hitsToAssign > 0 || battle.defender.hitsToAssign > 0) {
    resolveParticipantHits(battle, battle.attacker)
    resolveParticipantHits(battle, battle.defender)
  }
}

function resolveParticipantHits(battle: BattleInstance, p: ParticipantInstance) {
  // TODO maybe make this prettier, so we only sustain on one row
  while (p.hitsToAssign > 0) {
    const bestSustainUnit = getBestSustainUnit(p, battle.place)
    if (p.riskDirectHit && bestSustainUnit) {
      bestSustainUnit.takenDamage = true
      bestSustainUnit.takenDamageRound = battle.roundNumber
      p.hitsToAssign -= 1
      p.onSustainEffect.forEach((effect) => {
        if (canBattleEffectBeUsed(effect, p)) {
          effect.onSustain!(bestSustainUnit, p, battle)
        }
      })
      if (LOG) {
        console.log(`${p.side} uses sustain on ${bestSustainUnit.type}`)
      }
    } else {
      const bestDieUnit = getBestDieUnit(p, battle.place)
      if (bestDieUnit) {
        if (bestDieUnit.sustainDamage && !bestDieUnit.takenDamage) {
          bestDieUnit.takenDamage = true
          bestDieUnit.takenDamageRound = battle.roundNumber
          p.hitsToAssign -= 1
          p.onSustainEffect.forEach((effect) => {
            if (canBattleEffectBeUsed(effect, p)) {
              effect.onSustain!(bestDieUnit, p, battle)
            }
          })
          if (LOG) {
            console.log(`${p.side} uses sustain on ${bestDieUnit.type}`)
          }
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

function doRepairStep(battle: BattleInstance) {
  doRepairStepForParticipant(battle, battle.attacker)
  doRepairStepForParticipant(battle, battle.defender)
}

function doRepairStepForParticipant(battle: BattleInstance, participant: ParticipantInstance) {
  if (participant.onRepairEffect.length > 0) {
    participant.units.forEach((unit) => {
      participant.onRepairEffect.forEach((effect) => {
        if (canBattleEffectBeUsed(effect, participant)) {
          effect.onRepair!(unit, participant, battle)
        }
      })
    })
  }
}

function getBestDieUnit(p: ParticipantInstance, place: Place) {
  const units = getAliveUnits(p, place)
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

export function isParticipantAlive(p: ParticipantInstance, place: Place) {
  return p.units.some((u) => {
    if (!doesUnitFitPlace(u, place)) {
      return false
    }
    return !u.isDestroyed
  })
}

function getAliveUnits(p: ParticipantInstance, place: Place) {
  return p.units.filter((u) => {
    if (!doesUnitFitPlace(u, place)) {
      return false
    }
    return !u.isDestroyed
  })
}

export function getBestSustainUnit(p: ParticipantInstance, place: Place) {
  const units = getUnitsWithSustain(p, place)
  if (units.length === 0) {
    return undefined
  } else {
    return units.reduce((a, b) => {
      // TODO
      return a.useSustainDamagePriority! > b.useSustainDamagePriority! ? a : b
    })
  }
}

function getUnitsWithSustain(p: ParticipantInstance, place: Place) {
  return p.units.filter((u) => {
    if (!doesUnitFitPlace(u, place)) {
      return false
    }
    return u.sustainDamage && !u.takenDamage && !u.isDestroyed
  })
}

function doesUnitFitPlace(u: UnitInstance, place: Place) {
  if (place === Place.space && !u.isShip) {
    return false
  }
  if (place === Place.ground && !u.isGroundForce) {
    return false
  }
  return true
}
