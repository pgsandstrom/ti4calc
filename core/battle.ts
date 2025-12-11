import _cloneDeep from 'lodash/cloneDeep'

import { logWrapper } from '../util/util-log'
import {
  AfbHitsToAssign,
  BattleInstance,
  BattleResult,
  BattleWinner,
  HitsToAssign,
  ParticipantInstance,
} from './battle-types'
import { canBattleEffectBeUsed } from './battleeffect/battleEffects'
import { getBattleResultUnitString } from './battleResult'
import { LOG } from './constant'
import { Place } from './enums'
import { getHits, HitInfo } from './roll'
import { UnitInstance, UnitType } from './unit'
import {
  doesUnitFitPlace,
  getHighestWorthNonSustainUnit,
  getHighestWorthSustainUnit,
  getLowestWorthSustainUnit,
  getLowestWorthUnit,
} from './unitGet'

// TODO add retreat?

export function doBattle(battle: BattleInstance): BattleResult {
  let isDuringCombat = false
  const isDuringBombardment = false

  battle.attacker.beforeStartEffect.forEach((effect) => {
    if (canBattleEffectBeUsed(effect, battle.attacker)) {
      effect.beforeStart!(battle.attacker, battle, battle.defender, effect.name)
    }
  })
  battle.defender.beforeStartEffect.forEach((effect) => {
    if (canBattleEffectBeUsed(effect, battle.defender)) {
      effect.beforeStart!(battle.defender, battle, battle.attacker, effect.name)
    }
  })
  resolveHits(battle, isDuringCombat, isDuringBombardment)

  doBombardment(battle, isDuringCombat)

  doSpaceCannon(battle)
  resolveHits(battle, isDuringCombat, isDuringBombardment)

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
  resolveHits(battle, isDuringCombat, isDuringBombardment)

  isDuringCombat = true
  doAfb(battle)

  let battleResult: BattleResult | undefined = undefined
  while (!battleResult) {
    doBattleRolls(battle)

    battle.attacker.onCombatRoundEndBeforeAssign.forEach((effect) => {
      if (canBattleEffectBeUsed(effect, battle.attacker)) {
        effect.onCombatRoundEndBeforeAssign!(battle.attacker, battle, battle.defender, effect.name)
      }
    })
    battle.defender.onCombatRoundEndBeforeAssign.forEach((effect) => {
      if (canBattleEffectBeUsed(effect, battle.defender)) {
        effect.onCombatRoundEndBeforeAssign!(battle.defender, battle, battle.attacker, effect.name)
      }
    })

    resolveHits(battle, isDuringCombat, isDuringBombardment)
    doRepairStep(battle, isDuringCombat)

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

    resolveHits(battle, isDuringCombat, isDuringBombardment)

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

  logWrapper(`Battle resolved after ${battle.roundNumber - 1} rounds`)
  if (battleResult.winner === BattleWinner.attacker) {
    logWrapper('Attacker won')
  } else if (battleResult.winner === BattleWinner.defender) {
    logWrapper('Defender won')
  } else {
    logWrapper('Battle ended in a draw')
  }

  return battleResult
}

function clearSustains(p: ParticipantInstance) {
  p.units.forEach((u) => (u.usedSustain = false))
}

function addNewUnits(p: ParticipantInstance) {
  if (p.newUnits.length > 0) {
    p.units = [...p.units, ...p.newUnits]
    p.newUnits = []
  }
}

export function doBombardment(battle: BattleInstance, isDuringCombat: boolean) {
  const isDuringBombardment = true
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

  const hits = battle.attacker.units
    .filter((u) => u.bombardment !== undefined)
    .map((u) => {
      logAttack(battle.attacker, u, 'bombardment')
      return getHits(u.bombardment!)
    })
  battle.attacker.onBombardmentHit.forEach((effect) => {
    if (canBattleEffectBeUsed(effect, battle.attacker)) {
      hits.forEach((hit) => {
        effect.onBombardmentHit!(battle.attacker, battle, battle.defender, hit)
      })
    }
  })

  const totalHits = hits.reduce((a, b) => {
    return a + b.hits
  }, 0)
  logWrapper(`bombardment produced ${totalHits} hits.`)
  battle.defender.hitsToAssign.hits += totalHits
  resolveHits(battle, isDuringCombat, isDuringBombardment)
}

function doSpaceCannon(battle: BattleInstance) {
  if (battle.place === Place.space) {
    const attackerHits = getSpaceCannonHits(battle.attacker, battle, battle.defender)
    if (LOG && battle.attacker.units.some((u) => !!u.spaceCannon)) {
      logHits(battle.attacker, attackerHits, 'spaceCannon')
    }
    battle.defender.hitsToAssign = attackerHits
  }
  const defenderHits = getSpaceCannonHits(battle.defender, battle, battle.attacker)
  if (LOG && battle.defender.units.some((u) => !!u.spaceCannon)) {
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

  battle.defender.afbHitsToAssign = getAfbHits(battle.attacker, battle, battle.defender)
  battle.attacker.afbHitsToAssign = getAfbHits(battle.defender, battle, battle.attacker)

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

  removeDeadUnits(battle.attacker, battle)
  removeDeadUnits(battle.defender, battle)
}

function getAfbHits(
  p: ParticipantInstance,
  battle: BattleInstance,
  otherParticipant: ParticipantInstance,
): AfbHitsToAssign {
  p.onAfb.forEach((effect) => {
    if (canBattleEffectBeUsed(effect, p)) {
      effect.onAfb!(p, battle, otherParticipant, effect.name)
    }
  })

  const hits = p.units.flatMap((u) => {
    logAttack(p, u, 'afb')
    return u.afb ? [getHits(u.afb)] : []
  })
  const fighterHits = hits.reduce((a, b) => {
    return a + b.hits
  }, 0)
  const rollInfoList = hits.flatMap((h) => h.rollInfoList)
  return {
    fighterHitsToAssign: fighterHits,
    rollInfoList: rollInfoList,
  }
}

function resolveAfbHits(p: ParticipantInstance) {
  while (p.afbHitsToAssign.fighterHitsToAssign > 0) {
    const aliveFighter = p.units.find((u) => u.type === UnitType.fighter && !u.isDestroyed)
    if (aliveFighter) {
      aliveFighter.isDestroyed = true
      p.afbHitsToAssign.fighterHitsToAssign -= 1
      logWrapper(`${p.side} lost fighter to anti fighter barrage`)
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
    .filter((unit) => !!unit.aura && unit.aura.length > 0)
    .map((unit) => unit.aura!)
    .flat()
    .filter((aura) => aura.place === battle.place || aura.place === 'both')

  const friendlyAuras = friendlyUnitTransformEffects.filter((effect) => !!effect.transformUnit)
  const onCombatRoundStartAura = friendlyUnitTransformEffects.filter(
    (effect) => !!effect.onCombatRoundStart,
  )

  const enemyAuras = otherParticipant.units
    .filter((unit) => !!unit.aura && unit.aura.length > 0)
    .map((unit) => unit.aura!)
    .flat()
    .filter((effect) => !!effect.transformEnemyUnit)
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
      p.onHit.forEach((effect) => {
        if (canBattleEffectBeUsed(effect, battle.attacker)) {
          effect.onHit!(battle.attacker, battle, battle.defender, hitInfo)
        }
      })

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

function resolveHits(
  battle: BattleInstance,
  isDuringCombat: boolean,
  isDuringBombardment: boolean,
) {
  while (hasHitToAssign(battle.attacker) || hasHitToAssign(battle.defender)) {
    resolveParticipantHits(battle, battle.attacker, isDuringCombat, isDuringBombardment)
    resolveParticipantHits(battle, battle.defender, isDuringCombat, isDuringBombardment)
    removeDeadUnits(battle.attacker, battle)
    removeDeadUnits(battle.defender, battle)
  }
  clearSustains(battle.attacker)
  clearSustains(battle.defender)
}

function hasHitToAssign(p: ParticipantInstance) {
  return (
    p.hitsToAssign.hits > 0 ||
    p.hitsToAssign.hitsToNonFighters > 0 ||
    p.hitsToAssign.hitsAssignedByEnemy > 0
  )
}

function resolveParticipantHits(
  battle: BattleInstance,
  p: ParticipantInstance,
  isDuringCombat: boolean,
  isDuringBombardment: boolean,
) {
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
        logWrapper(
          `${p.side} loses ${highestWorthNonSustainUnit.type} after hits assigned by opponent.`,
        )
        highestWorthNonSustainUnit.isDestroyed = true
      } else {
        // This happens when all units have sustain. We pick the best sustain unit in case we have direct hit.
        const highestWorthSustainUnit = getHighestWorthSustainUnit(p, battle.place, true)
        if (highestWorthSustainUnit) {
          doSustainDamage(battle, p, highestWorthSustainUnit, isDuringCombat)
        }
      }

      p.hitsToAssign.hitsAssignedByEnemy -= 1
    } else if (p.hitsToAssign.hitsToNonFighters > 0) {
      const appliedHitToNonFighter = applyHit(battle, p, false, isDuringCombat, isDuringBombardment)
      if (!appliedHitToNonFighter) {
        applyHit(battle, p, true, isDuringCombat, isDuringBombardment)
      }
      p.hitsToAssign.hitsToNonFighters -= 1
    } else {
      applyHit(battle, p, true, isDuringCombat, isDuringBombardment)
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
  logWrapper(`${p.side} soaked a hit. ${p.soakHits} soaks remaining.`)
}

// returns if the hit was applied to a unit
function applyHit(
  battle: BattleInstance,
  p: ParticipantInstance,
  includeFighter: boolean,
  isDuringCombat: boolean,
  isDuringBombardment: boolean,
): boolean {
  const sustainDisabled = isSustainDisabled(battle, p, isDuringBombardment)

  // If we ever desired to speed up the code, this could be done in a single passover of all units

  // Currently if we don't have riskDirectHit dreadnoughts will die before flagship sustains.
  // I guess that is okay, even though it is most likely not how a human would play.
  const bestSustainUnit = getLowestWorthSustainUnit(p, battle.place, includeFighter)

  if (
    bestSustainUnit &&
    !sustainDisabled &&
    (battle.place === Place.ground || p.riskDirectHit || bestSustainUnit.immuneToDirectHit)
  ) {
    doSustainDamage(battle, p, bestSustainUnit, isDuringCombat)
    return true
  } else {
    const bestDieUnit = getLowestWorthUnit(p, battle.place, includeFighter)
    if (bestDieUnit) {
      if (
        !sustainDisabled &&
        bestDieUnit.sustainDamage &&
        !bestDieUnit.takenDamage &&
        !bestDieUnit.usedSustain
      ) {
        doSustainDamage(battle, p, bestDieUnit, isDuringCombat)
      } else {
        bestDieUnit.isDestroyed = true
        logWrapper(`${p.side} loses ${bestDieUnit.type}`)
      }
      return true
    }
    return false
  }
}

function doSustainDamage(
  battle: BattleInstance,
  p: ParticipantInstance,
  unit: UnitInstance,
  isDuringCombat: boolean,
) {
  unit.takenDamage = true
  unit.takenDamageRound = battle.roundNumber
  unit.usedSustain = true
  p.onSustainEffect.forEach((effect) => {
    if (canBattleEffectBeUsed(effect, p)) {
      effect.onSustain!(unit, p, battle, effect.name, isDuringCombat)
    }
  })
  const otherP = getOtherParticipant(battle, p)
  otherP.onEnemySustainEffect.forEach((effect) => {
    if (canBattleEffectBeUsed(effect, otherP)) {
      effect.onEnemySustain!(unit, otherP, battle, effect.name, isDuringCombat)
    }
  })
  logWrapper(`${p.side} uses sustain on ${unit.type}`)
}

function doRepairStep(battle: BattleInstance, isDuringCombat: boolean) {
  doRepairStepForParticipant(battle, battle.attacker, isDuringCombat)
  doRepairStepForParticipant(battle, battle.defender, isDuringCombat)
}

function doRepairStepForParticipant(
  battle: BattleInstance,
  participant: ParticipantInstance,
  isDuringCombat: boolean,
) {
  if (participant.onRepairEffect.length > 0) {
    participant.units.forEach((unit) => {
      participant.onRepairEffect.forEach((effect) => {
        if (canBattleEffectBeUsed(effect, participant)) {
          effect.onRepair!(
            unit,
            participant,
            battle,
            effect.name,

            isDuringCombat,
          )
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
  if (p.newUnits.length > 0) {
    return true
  }
  return p.units.some((u) => {
    if (!doesUnitFitPlace(u, place)) {
      return false
    }
    return !u.isDestroyed
  })
}

export function isSustainDisabled(
  battle: BattleInstance,
  p: ParticipantInstance,
  isDuringBombardment: boolean,
) {
  const other = getOtherParticipant(battle, p)
  return other.units.some(
    (u) =>
      u.preventEnemySustain === true ||
      (!isDuringBombardment && u.preventEnemySustainOnPlanet === true),
  )
}

export function getOtherParticipant(battle: BattleInstance, p: ParticipantInstance) {
  return p.side === 'attacker' ? battle.defender : battle.attacker
}

/* eslint-disable no-console */
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
