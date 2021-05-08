import { BattleInstance, HitsToAssign, ParticipantInstance } from './battle-types'
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

  doBombardment(battle)

  doPds(battle)
  resolveHits(battle)

  doAfb(battle)

  while (
    isParticipantAlive(battle.attacker, battle.place) &&
    isParticipantAlive(battle.defender, battle.place)
  ) {
    doBattleRolls(battle)
    resolveHits(battle)
    doRepairStep(battle)

    battle.attacker.onCombatRoundEnd.forEach((effect) => {
      effect.onCombatRoundEnd!(battle.attacker, battle, battle.defender)
    })
    battle.defender.afterAfbEffect.forEach((effect) => {
      effect.afterAfb!(battle.defender, battle, battle.attacker)
    })

    battle.roundNumber += 1

    battle.attacker.roundActionTracker = {}
    battle.defender.roundActionTracker = {}

    if (battle.roundNumber === 1000) {
      // TODO handle it nicer
      throw new Error('infinite fight')
    }
  }

  if (LOG) {
    console.log(`Battle resolved after ${battle.roundNumber - 1} rounds`)
    if (isParticipantAlive(battle.attacker, battle.place)) {
      console.log('Attacker won')
    } else if (isParticipantAlive(battle.defender, battle.place)) {
      console.log('Defender won')
    } else {
      console.log('It ended in a draw')
    }
  }
}

export function doBombardment(battle: BattleInstance) {
  if (battle.place !== Place.ground) {
    return
  }

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
  battle.defender.hitsToAssign.hits += result
  resolveHits(battle)
}

function doPds(battle: BattleInstance) {
  if (battle.place === Place.space) {
    const attackerPdsHits = getPdsHits(battle.attacker)
    battle.defender.hitsToAssign.hits += attackerPdsHits
  }
  const defenderPdsHits = getPdsHits(battle.defender)
  battle.attacker.hitsToAssign.hits += defenderPdsHits
}

function getPdsHits(p: ParticipantInstance) {
  const hits = p.units.map((u) => (u.spaceCannon ? getHits(u.spaceCannon) : 0))
  return hits.reduce((a, b) => {
    return a + b
  }, 0)
}

function doAfb(battle: BattleInstance) {
  if (battle.place !== Place.space) {
    return
  }

  const attackerPdsHits = getAfbHits(battle.attacker)
  battle.defender.hitsToAssign.hits += attackerPdsHits
  const defenderPdsHits = getAfbHits(battle.defender)
  battle.attacker.hitsToAssign.hits += defenderPdsHits

  resolveAfbHits(battle.attacker)
  resolveAfbHits(battle.defender)

  battle.attacker.afterAfbEffect.forEach((effect) => {
    effect.afterAfb!(battle.attacker, battle, battle.defender)
  })
  battle.defender.afterAfbEffect.forEach((effect) => {
    effect.afterAfb!(battle.defender, battle, battle.attacker)
  })

  battle.attacker.hitsToAssign = {
    hits: 0,
    hitsToNonFighters: 0,
  }
  battle.defender.hitsToAssign = {
    hits: 0,
    hitsToNonFighters: 0,
  }
}

function getAfbHits(p: ParticipantInstance) {
  const hits = p.units.map((u) => (u.afb ? getHits(u.afb) : 0))
  return hits.reduce((a, b) => {
    return a + b
  }, 0)
}

function resolveAfbHits(p: ParticipantInstance) {
  while (p.hitsToAssign.hits > 0) {
    const aliveFighter = p.units.find((u) => u.type === UnitType.fighter && !u.isDestroyed)
    if (aliveFighter) {
      aliveFighter.isDestroyed = true
      p.hitsToAssign.hits -= 1
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
          unit = effect(unit, p, battle.place)
        })
      }

      unitTransformEffects.forEach((effect) => {
        if (canBattleEffectBeUsed(effect, p)) {
          unit = effect.transformUnit!(unit, p, battle)
        }
      })

      enemyUnitTransformEffects.forEach((effect) => {
        if (canBattleEffectBeUsed(effect, p)) {
          unit = effect.transformEnemyUnit!(unit, p, battle)
        }
      })

      if (LOG && unit.combat) {
        console.log(
          `${p.side} shoots with ${unit.type} at ${unit.combat.hit - unit.combat.hitBonus}`,
        )
      }

      const hits = unit.combat ? getHits(unit.combat) : 0
      return {
        hits: unit.assignHitsToNonFighters === true ? 0 : hits,
        hitsToNonFighters: unit.assignHitsToNonFighters === true ? hits : 0,
      }
    })
    .reduce<HitsToAssign>(
      (a, b) => {
        return {
          hits: a.hits + b.hits,
          hitsToNonFighters: a.hitsToNonFighters + b.hitsToNonFighters,
        }
      },
      {
        hits: 0,
        hitsToNonFighters: 0,
      },
    )

  if (LOG) {
    console.log(
      `${p.side} hits ${hits.hits} normal hits and ${hits.hitsToNonFighters} to non-fighters.`,
    )
  }
  otherParticipant.hitsToAssign = hits
}

function resolveHits(battle: BattleInstance) {
  while (hasHitToAssign(battle.attacker) || hasHitToAssign(battle.defender)) {
    resolveParticipantHits(battle, battle.attacker)
    resolveParticipantHits(battle, battle.defender)
  }
}

function hasHitToAssign(p: ParticipantInstance) {
  return p.hitsToAssign.hits > 0 || p.hitsToAssign.hitsToNonFighters > 0
}

function resolveParticipantHits(battle: BattleInstance, p: ParticipantInstance) {
  while (hasHitToAssign(p)) {
    if (p.hitsToAssign.hitsToNonFighters > 0) {
      const appliedHitToNonFighter = applyHit(battle, p, false)
      if (!appliedHitToNonFighter) {
        applyHit(battle, p, true)
      }
      p.hitsToAssign.hitsToNonFighters -= 1
    } else {
      applyHit(battle, p, true)
      p.hitsToAssign.hits -= 1
    }

    // TODO can we remove them directly and remove isDestroyed flag?
    p.units = p.units.filter((u) => !u.isDestroyed)
  }
}

// returns if the hit was applied to a unit
function applyHit(
  battle: BattleInstance,
  p: ParticipantInstance,
  includeFighter: boolean,
): boolean {
  // Currently if we dont have riskDirectHit dreadnaughts will die before flagship sustains.
  // I guess that is okay, even though it is most likely not how a human would play.
  const bestSustainUnit = getBestSustainUnit(p, battle.place, includeFighter)
  if (p.riskDirectHit && bestSustainUnit) {
    doSustainDamage(battle, p, bestSustainUnit)
    return true
  } else {
    const bestDieUnit = getBestDieUnit(p, battle.place, includeFighter)
    if (bestDieUnit) {
      if (bestDieUnit.sustainDamage && !bestDieUnit.takenDamage) {
        doSustainDamage(battle, p, bestDieUnit)
      } else {
        bestDieUnit.isDestroyed = true
        if (LOG) {
          console.log(`${p.side} loses ${bestDieUnit.type}`)
        }
      }
      return true
    }
    return false
  }
}

function doSustainDamage(battle: BattleInstance, p: ParticipantInstance, unit: UnitInstance) {
  unit.takenDamage = true
  unit.takenDamageRound = battle.roundNumber
  p.onSustainEffect.forEach((effect) => {
    if (canBattleEffectBeUsed(effect, p)) {
      effect.onSustain!(unit, p, battle)
    }
  })
  if (LOG) {
    console.log(`${p.side} uses sustain on ${unit.type}`)
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

function getBestDieUnit(p: ParticipantInstance, place: Place, includeFighter: boolean) {
  const units = getAliveUnits(p, place, includeFighter)
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

function getAliveUnits(p: ParticipantInstance, place: Place, includeFighter: boolean) {
  return p.units.filter((u) => {
    if (!includeFighter && u.type === UnitType.fighter) {
      return false
    }
    if (!doesUnitFitPlace(u, place)) {
      return false
    }
    return !u.isDestroyed
  })
}

export function getBestSustainUnit(p: ParticipantInstance, place: Place, includeFighter: boolean) {
  const units = getUnitsWithSustain(p, place, includeFighter)
  if (units.length === 0) {
    return undefined
  } else {
    return units
      .filter((u) => includeFighter || u.type !== UnitType.fighter)
      .reduce((a, b) => {
        // TODO could it work to just pre-sort this and then never sort again?
        return a.useSustainDamagePriority! > b.useSustainDamagePriority! ? a : b
      })
  }
}

function getUnitsWithSustain(p: ParticipantInstance, place: Place, includeFighter: boolean) {
  return p.units.filter((u) => {
    if (!includeFighter && u.type === UnitType.fighter) {
      return false
    }
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
