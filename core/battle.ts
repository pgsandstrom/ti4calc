import {
  BattleInstance,
  BattleResult,
  BattleWinner,
  HitsToAssign,
  ParticipantInstance,
} from './battle-types'
import { canBattleEffectBeUsed } from './battleeffect/battleEffects'
import { Place } from './enums'
import { getHits, HitInfo } from './roll'
import { UnitInstance, UnitType } from './unit'
import {
  doesUnitFitPlace,
  getLowestWorthSustainUnit,
  getLowestWorthUnit,
  getHighestWorthNonSustainUnit,
  getHighestWorthSustainUnit,
} from './unitGet'
import _cloneDeep from 'lodash/cloneDeep'
import { NUMBER_OF_ROLLS } from './constant'
import { isTest } from '../util/util-debug'
import { getBattleResultUnitString } from './battleResult'

// TODO add retreat?

// eslint-disable-next-line
export const LOG = NUMBER_OF_ROLLS === 1 && !isTest()

export function doBattle(battle: BattleInstance): BattleResult {
  battle.attacker.onStartEffect.forEach((effect) => {
    if (canBattleEffectBeUsed(effect, battle.attacker)) {
      effect.onStart!(battle.attacker, battle, battle.defender, effect.name)
    }
  })
  battle.defender.onStartEffect.forEach((effect) => {
    if (canBattleEffectBeUsed(effect, battle.defender)) {
      effect.onStart!(battle.defender, battle, battle.attacker, effect.name)
    }
  })
  resolveHits(battle)

  doBombardment(battle)

  doSpaceCannon(battle)
  resolveHits(battle)

  doAfb(battle)

  let battleResult: BattleResult | undefined = undefined
  while (!battleResult) {
    doBattleRolls(battle)
    resolveHits(battle)
    doRepairStep(battle)

    battle.attacker.onCombatRoundEnd.forEach((effect) => {
      if (canBattleEffectBeUsed(effect, battle.attacker)) {
        effect.onCombatRoundEnd!(battle.attacker, battle, battle.defender, effect.name)
      }
    })
    battle.defender.onCombatRoundEnd.forEach((effect) => {
      if (canBattleEffectBeUsed(effect, battle.defender)) {
        effect.onCombatRoundEnd!(battle.defender, battle, battle.attacker, effect.name)
      }
    })

    resolveHits(battle)

    battle.roundNumber += 1

    battle.attacker.roundActionTracker = {}
    battle.defender.roundActionTracker = {}

    if (battle.roundNumber === 400) {
      // I guess an infinite fight should be won by the defender, right? But who cares.
      console.warn('Infinite fight detected')
      return {
        winner: BattleWinner.draw,
        units: '',
      }
    }

    addNewUnits(battle.attacker)
    addNewUnits(battle.defender)

    const attackerAlive = isParticipantAlive(battle.attacker, battle.place)
    const defenderAlive = isParticipantAlive(battle.defender, battle.place)

    if (attackerAlive && !defenderAlive) {
      battleResult = {
        winner: BattleWinner.attacker,
        units: getBattleResultUnitString(battle.attacker),
      }
    } else if (!attackerAlive && defenderAlive) {
      battleResult = {
        winner: BattleWinner.defender,
        units: getBattleResultUnitString(battle.defender),
      }
    } else if (!attackerAlive && !defenderAlive) {
      battleResult = {
        winner: BattleWinner.draw,
        units: '',
      }
    }
  }

  if (LOG) {
    console.log(`Battle resolved after ${battle.roundNumber - 1} rounds`)
    if (battleResult.winner === 'attacker') {
      console.log('Attacker won')
    } else if (battleResult.winner === 'defender') {
      console.log('Defender won')
    } else {
      console.log('Battle ended in a draw')
    }
  }

  return battleResult
}

function addNewUnits(p: ParticipantInstance) {
  if (p.newUnits.length > 0) {
    p.units = [...p.units, ...p.newUnits]
    p.newUnits = []
  }
}

export function doBombardment(battle: BattleInstance) {
  if (battle.place !== Place.ground) {
    return
  }

  battle.attacker.onBombardment.forEach((effect) => {
    if (canBattleEffectBeUsed(effect, battle.attacker)) {
      effect.onBombardment!(battle.attacker, battle, battle.defender, effect.name)
    }
  })

  if (battle.defender.units.some((u) => u.planetaryShield)) {
    return
  }

  const hits = battle.attacker.units.map((u) => {
    logAttack(battle.attacker, u, 'bombardment')
    return u.bombardment ? getHits(u.bombardment).hits : 0
  })
  const result = hits.reduce((a, b) => {
    return a + b
  }, 0)
  if (LOG) {
    console.log(`bombardment produced ${result} hits.`)
  }
  battle.defender.hitsToAssign.hits += result
  resolveHits(battle)
}

function doSpaceCannon(battle: BattleInstance) {
  if (battle.place === Place.space) {
    const attackerHits = getSpaceCannonHits(battle.attacker, battle, battle.defender)
    if (LOG && battle.attacker.units.some((u) => u.spaceCannon)) {
      logHits(battle.attacker, attackerHits, 'spaceCannon')
    }
    battle.defender.hitsToAssign = attackerHits
  }
  const defenderHits = getSpaceCannonHits(battle.defender, battle, battle.attacker)
  if (LOG && battle.defender.units.some((u) => u.spaceCannon)) {
    logHits(battle.defender, defenderHits, 'spaceCannon')
  }
  battle.attacker.hitsToAssign = defenderHits
}

function getSpaceCannonHits(
  p: ParticipantInstance,
  battle: BattleInstance,
  otherParticipant: ParticipantInstance,
) {
  p.onSpaceCannon.forEach((effect) => {
    if (canBattleEffectBeUsed(effect, p)) {
      effect.onSpaceCannon!(p, battle, otherParticipant, effect.name)
    }
  })

  return p.units
    .map((u) => {
      logAttack(p, u, 'spaceCannon')

      const hitInfo: HitInfo = u.spaceCannon
        ? getHits(u.spaceCannon)
        : { hits: 0, rollInfoList: [] }

      const hits = hitInfo.hits
      return {
        hits: u.assignHitsToNonFighters ? 0 : hits,
        hitsToNonFighters: u.assignHitsToNonFighters ? hits : 0,
        hitsAssignedByEnemy: 0, // I dont think any unit uses this, so I wont implement it now.
      }
    })
    .reduce<HitsToAssign>(
      (a, b) => {
        return {
          hits: a.hits + b.hits,
          hitsToNonFighters: a.hitsToNonFighters + b.hitsToNonFighters,
          hitsAssignedByEnemy: a.hitsAssignedByEnemy + b.hitsAssignedByEnemy,
        }
      },
      {
        hits: 0,
        hitsToNonFighters: 0,
        hitsAssignedByEnemy: 0,
      },
    )
}

function doAfb(battle: BattleInstance) {
  if (battle.place !== Place.space) {
    return
  }

  const attackerAfbHits = getAfbHits(battle.attacker, battle, battle.defender)
  battle.defender.hitsToAssign.hits += attackerAfbHits
  const defenderAfbHits = getAfbHits(battle.defender, battle, battle.attacker)
  battle.attacker.hitsToAssign.hits += defenderAfbHits

  resolveAfbHits(battle.attacker)
  resolveAfbHits(battle.defender)

  battle.attacker.afterAfbEffect.forEach((effect) => {
    if (canBattleEffectBeUsed(effect, battle.attacker)) {
      effect.afterAfb!(battle.attacker, battle, battle.defender, effect.name)
    }
  })
  battle.defender.afterAfbEffect.forEach((effect) => {
    if (canBattleEffectBeUsed(effect, battle.defender)) {
      effect.afterAfb!(battle.defender, battle, battle.attacker, effect.name)
    }
  })

  battle.attacker.hitsToAssign = {
    hits: 0,
    hitsToNonFighters: 0,
    hitsAssignedByEnemy: 0,
  }
  battle.defender.hitsToAssign = {
    hits: 0,
    hitsToNonFighters: 0,
    hitsAssignedByEnemy: 0,
  }
}

function getAfbHits(
  p: ParticipantInstance,
  battle: BattleInstance,
  otherParticipant: ParticipantInstance,
) {
  p.onAfb.forEach((effect) => {
    if (canBattleEffectBeUsed(effect, p)) {
      effect.onAfb!(p, battle, otherParticipant, effect.name)
    }
  })

  const hits = p.units.map((u) => {
    logAttack(p, u, 'afb')
    return u.afb ? getHits(u.afb).hits : 0
  })
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
      if (LOG) {
        console.log(`${p.side} lost fighter to anti fighter barrage`)
      }
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
  const friendlyUnitTransformEffects = p.units
    .filter((unit) => unit.aura && unit.aura.length > 0)
    .map((unit) => unit.aura!)
    .flat()
    .filter((aura) => aura.place === battle.place || aura.place === 'both')

  const friendlyAuras = friendlyUnitTransformEffects.filter((effect) => effect.transformUnit)
  const onCombatRoundStartAura = friendlyUnitTransformEffects.filter(
    (effect) => effect.onCombatRoundStart,
  )

  const enemyAuras = otherParticipant.units
    .filter((unit) => unit.aura && unit.aura.length > 0)
    .map((unit) => unit.aura!)
    .flat()
    .filter((effect) => effect.transformEnemyUnit)
    .filter((aura) => aura.place === battle.place || aura.place === 'both')

  p.onCombatRound.forEach((effect) => {
    if (canBattleEffectBeUsed(effect, p)) {
      effect.onCombatRound!(p, battle, otherParticipant, effect.name)
    }
  })

  let units: UnitInstance[]
  if (onCombatRoundStartAura.length > 0) {
    // clone units before we modify them with temporary effects
    units = _cloneDeep(p.units)
    onCombatRoundStartAura.forEach((effect) => {
      if (canBattleEffectBeUsed(effect, p)) {
        effect.onCombatRoundStart!(units, p, battle, effect.name)
      }
    })
  } else {
    units = p.units
  }

  const hits = units
    .filter((unit) => doesUnitFitPlace(unit, battle.place))
    .map((unit) => {
      friendlyAuras.forEach((effect) => {
        unit = effect.transformUnit!(unit, p, battle)
      })
      enemyAuras.forEach((effect) => {
        unit = effect.transformEnemyUnit!(unit, p, battle)
      })

      logAttack(p, unit, 'combat')

      const hitInfo: HitInfo = unit.combat ? getHits(unit.combat) : { hits: 0, rollInfoList: [] }

      if (unit.onHit) {
        unit.onHit(p, battle, otherParticipant, hitInfo)
      }

      const hits = hitInfo.hits
      return {
        hits: unit.assignHitsToNonFighters ? 0 : hits,
        hitsToNonFighters: unit.assignHitsToNonFighters ? hits : 0,
        hitsAssignedByEnemy: 0, // I dont think any unit uses this, so I wont implement it now.
      }
    })
    .reduce<HitsToAssign>(
      (a, b) => {
        return {
          hits: a.hits + b.hits,
          hitsToNonFighters: a.hitsToNonFighters + b.hitsToNonFighters,
          hitsAssignedByEnemy: a.hitsAssignedByEnemy + b.hitsAssignedByEnemy,
        }
      },
      {
        hits: 0,
        hitsToNonFighters: 0,
        hitsAssignedByEnemy: 0,
      },
    )

  logHits(p, hits, 'combat')
  otherParticipant.hitsToAssign = hits
}

function resolveHits(battle: BattleInstance) {
  while (hasHitToAssign(battle.attacker) || hasHitToAssign(battle.defender)) {
    resolveParticipantHits(battle, battle.attacker)
    resolveParticipantHits(battle, battle.defender)
    removeDeadUnits(battle.attacker, battle)
    removeDeadUnits(battle.defender, battle)
  }
}

function hasHitToAssign(p: ParticipantInstance) {
  return (
    p.hitsToAssign.hits > 0 ||
    p.hitsToAssign.hitsToNonFighters > 0 ||
    p.hitsToAssign.hitsAssignedByEnemy > 0
  )
}

function resolveParticipantHits(battle: BattleInstance, p: ParticipantInstance) {
  while (hasHitToAssign(p)) {
    if (p.soakHits > 0) {
      soakHit(p)
      continue
    }

    if (p.hitsToAssign.hitsAssignedByEnemy > 0) {
      if (p.hitsToAssign.hitsAssignedByEnemy > 1) {
        // This currently cant happen, so lets not bother to implement it
        console.warn(
          'hitsAssignedByEnemy is larger than one, we should assign them to best sustain unit! But that aint implemented!',
        )
      }
      const highestWorthNonSustainUnit = getHighestWorthNonSustainUnit(p, battle.place, true)
      if (highestWorthNonSustainUnit) {
        if (LOG) {
          console.log(
            `${p.side} loses ${highestWorthNonSustainUnit.type} after hits assigned by opponent.`,
          )
        }
        highestWorthNonSustainUnit.isDestroyed = true
      } else {
        // This happens when all units have sustain. We pick the best sustain unit in case we have direct hit.
        const highestWorthSustainUnit = getHighestWorthSustainUnit(p, battle.place, true)
        if (highestWorthSustainUnit) {
          doSustainDamage(battle, p, highestWorthSustainUnit)
        }
      }

      p.hitsToAssign.hitsAssignedByEnemy -= 1
    } else if (p.hitsToAssign.hitsToNonFighters > 0) {
      const appliedHitToNonFighter = applyHit(battle, p, false)
      if (!appliedHitToNonFighter) {
        applyHit(battle, p, true)
      }
      p.hitsToAssign.hitsToNonFighters -= 1
    } else {
      applyHit(battle, p, true)
      p.hitsToAssign.hits -= 1
    }
  }
}

export function destroyUnit(battle: BattleInstance, unit: UnitInstance) {
  unit.isDestroyed = true
  removeDeadUnits(battle.attacker, battle)
  removeDeadUnits(battle.defender, battle)
}

function removeDeadUnits(p: ParticipantInstance, battle: BattleInstance) {
  const deadUnits = p.units.filter((u) => u.isDestroyed)
  p.units = p.units.filter((u) => !u.isDestroyed)

  if (deadUnits.length > 0) {
    const otherParticipant = getOtherParticipant(battle, p)
    p.onDeath.forEach((effect) => {
      if (canBattleEffectBeUsed(effect, p)) {
        effect.onDeath!(deadUnits, p, otherParticipant, battle, true, effect.name)
      }
    })

    otherParticipant.onDeath.forEach((effect) => {
      if (canBattleEffectBeUsed(effect, otherParticipant)) {
        effect.onDeath!(deadUnits, otherParticipant, p, battle, false, effect.name)
      }
    })
  }
}

function soakHit(p: ParticipantInstance) {
  p.soakHits -= 1
  if (p.hitsToAssign.hitsAssignedByEnemy > 0) {
    p.hitsToAssign.hitsAssignedByEnemy -= 1
  } else if (p.hitsToAssign.hitsToNonFighters > 0) {
    p.hitsToAssign.hitsToNonFighters -= 1
  } else if (p.hitsToAssign.hits > 0) {
    p.hitsToAssign.hits -= 1
  } else {
    throw new Error('soak hits called without reason')
  }
  if (LOG) {
    console.log(`${p.side} soaked a hit. ${p.soakHits} soaks remaining.`)
  }
}

// returns if the hit was applied to a unit
function applyHit(
  battle: BattleInstance,
  p: ParticipantInstance,
  includeFighter: boolean,
): boolean {
  const sustainDisabled = isSustainDisabled(battle, p)

  // If we ever desired to speed up the code, this could be done in a single passover of all units

  // Currently if we don't have riskDirectHit dreadnoughts will die before flagship sustains.
  // I guess that is okay, even though it is most likely not how a human would play.
  const bestSustainUnit = getLowestWorthSustainUnit(p, battle.place, includeFighter)

  if (
    bestSustainUnit &&
    !sustainDisabled &&
    (battle.place === Place.ground || p.riskDirectHit || bestSustainUnit.immuneToDirectHit)
  ) {
    doSustainDamage(battle, p, bestSustainUnit)
    return true
  } else {
    const bestDieUnit = getLowestWorthUnit(p, battle.place, includeFighter)
    if (bestDieUnit) {
      if (!sustainDisabled && bestDieUnit.sustainDamage && !bestDieUnit.takenDamage) {
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
      effect.onSustain!(unit, p, battle, effect.name)
    }
  })
  const otherP = getOtherParticipant(battle, p)
  otherP.onEnemySustainEffect.forEach((effect) => {
    if (canBattleEffectBeUsed(effect, otherP)) {
      effect.onEnemySustain!(unit, otherP, battle, effect.name)
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
          effect.onRepair!(unit, participant, battle, effect.name)
        }
      })
    })
  }
}

export function isBattleOngoing(battle: BattleInstance) {
  return (
    isParticipantAlive(battle.attacker, battle.place) &&
    isParticipantAlive(battle.defender, battle.place)
  )
}

export function isParticipantAlive(p: ParticipantInstance, place: Place) {
  return p.units.some((u) => {
    if (!doesUnitFitPlace(u, place)) {
      return false
    }
    return !u.isDestroyed
  })
}

export function isSustainDisabled(battle: BattleInstance, p: ParticipantInstance) {
  const other = getOtherParticipant(battle, p)
  return other.units.some((u) => u.preventEnemySustain)
}

export function getOtherParticipant(battle: BattleInstance, p: ParticipantInstance) {
  return p.side === 'attacker' ? battle.defender : battle.attacker
}

function logAttack(
  p: ParticipantInstance,
  unit: UnitInstance,
  rollType: 'combat' | 'bombardment' | 'spaceCannon' | 'afb',
) {
  const roll = unit[rollType]
  if (LOG && roll) {
    const hit = roll.hit - roll.hitBonus - roll.hitBonusTmp
    const count = roll.count + roll.countBonus + roll.countBonusTmp
    const reroll = roll.reroll + roll.rerollBonus + roll.rerollBonusTmp
    if (count === 1 && reroll === 0) {
      console.log(`${p.side} does ${rollType} with ${unit.type} at ${hit}.`)
    } else if (reroll === 0) {
      console.log(`${p.side} does ${rollType} with ${unit.type} at ${hit}, using ${count} dices`)
    } else if (count === 1) {
      console.log(`${p.side} does ${rollType} with ${unit.type} at ${hit}, using ${reroll} rerolls`)
    } else {
      console.log(
        `${p.side} does ${rollType} with ${unit.type} at ${hit}, using ${count} dices and ${reroll} rerolls.`,
      )
    }
  }
}

function logHits(
  p: ParticipantInstance,
  hits: HitsToAssign,
  rollType: 'combat' | 'bombardment' | 'spaceCannon' | 'afb',
) {
  if (LOG) {
    if (hits.hits === 0 && hits.hitsToNonFighters === 0) {
      console.log(`${p.side} ${rollType} missed all`)
    } else if (hits.hitsToNonFighters === 0) {
      console.log(`${p.side} ${rollType} hits ${hits.hits} normal hits.`)
    } else if (hits.hits === 0) {
      console.log(`${p.side} ${rollType} hits ${hits.hitsToNonFighters} to non-fighters.`)
    } else {
      console.log(
        `${p.side} ${rollType} hits ${hits.hits} normal hits and ${hits.hitsToNonFighters} to non-fighters.`,
      )
    }
  }
}
