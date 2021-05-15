import { BattleInstance, BattleResult, HitsToAssign, ParticipantInstance } from './battle-types'
import { canBattleEffectBeUsed } from './battleeffect/battleEffects'
import { Place } from './enums'
import { getHits, HitInfo } from './roll'
import { UnitInstance, UnitType } from './unit'
import {
  doesUnitFitPlace,
  getBestSustainUnit,
  getBestDieUnit,
  getBestNonSustainUnit,
} from './unitGet'
import _cloneDeep from 'lodash/cloneDeep'
import { NUMBER_OF_ROLLS } from './constant'
import { isTest } from '../util/util-debug'

// eslint-disable-next-line
export const LOG = NUMBER_OF_ROLLS === 1 && !isTest()

export function doBattle(battle: BattleInstance) {
  battle.attacker.onStartEffect.forEach((effect) => {
    effect.onStart!(battle.attacker, battle, battle.defender, effect.name)
  })
  battle.defender.onStartEffect.forEach((effect) => {
    effect.onStart!(battle.defender, battle, battle.attacker, effect.name)
  })
  resolveHits(battle)

  doBombardment(battle)

  doPds(battle)
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
      if (canBattleEffectBeUsed(effect, battle.attacker)) {
        effect.onCombatRoundEnd!(battle.defender, battle, battle.attacker, effect.name)
      }
    })

    resolveHits(battle)

    battle.roundNumber += 1

    battle.attacker.roundActionTracker = {}
    battle.defender.roundActionTracker = {}

    if (battle.roundNumber === 400) {
      // TODO in theory we could start detecting if the battle state changes after 400 turns and only end prematurely if it is static
      console.warn('Infinite fight detected')
      return BattleResult.draw
    }

    addNewUnits(battle.attacker)
    addNewUnits(battle.defender)

    const attackerAlive = isParticipantAlive(battle.attacker, battle.place)
    const defenderAlive = isParticipantAlive(battle.defender, battle.place)

    if (attackerAlive && !defenderAlive) {
      battleResult = BattleResult.attacker
    } else if (!attackerAlive && defenderAlive) {
      battleResult = BattleResult.defender
    } else if (!attackerAlive && !defenderAlive) {
      battleResult = BattleResult.draw
    }
  }

  if (LOG) {
    console.log(`Battle resolved after ${battle.roundNumber - 1} rounds`)
    if (battleResult === BattleResult.attacker) {
      console.log('Attacker won')
    } else if (battleResult === BattleResult.defender) {
      console.log('Defender won')
    } else {
      console.log('It ended in a draw')
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

function doPds(battle: BattleInstance) {
  if (battle.place === Place.space) {
    const attackerPdsHits = getPdsHits(battle.attacker, battle, battle.defender)
    if (LOG && battle.attacker.units.some((u) => u.spaceCannon)) {
      console.log(`attacker pds produced ${attackerPdsHits} hits.`)
    }
    battle.defender.hitsToAssign.hits += attackerPdsHits
  }
  const defenderPdsHits = getPdsHits(battle.defender, battle, battle.attacker)
  if (LOG && battle.defender.units.some((u) => u.spaceCannon)) {
    console.log(`defender pds produced ${defenderPdsHits} hits.`)
  }
  battle.attacker.hitsToAssign.hits += defenderPdsHits
}

function getPdsHits(
  p: ParticipantInstance,
  battle: BattleInstance,
  otherParticipant: ParticipantInstance,
) {
  p.onSpaceCannon.forEach((effect) => {
    if (canBattleEffectBeUsed(effect, p)) {
      effect.onSpaceCannon!(p, battle, otherParticipant, effect.name)
    }
  })

  const hits = p.units.map((u) => {
    return u.spaceCannon ? getHits(u.spaceCannon).hits : 0
  })
  return hits.reduce((a, b) => {
    return a + b
  }, 0)
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
    if (canBattleEffectBeUsed(effect, battle.attacker)) {
      effect.onAfb!(p, battle, otherParticipant, effect.name)
    }
  })

  const hits = p.units.map((u) => {
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

  p.onCombatRound.forEach((effect) =>
    effect.onCombatRound!(p, battle, otherParticipant, effect.name),
  )

  let units: UnitInstance[]
  if (onCombatRoundStartAura.length > 0) {
    // clone units before we modify them with temporary effects
    units = _cloneDeep(p.units)
    onCombatRoundStartAura.forEach((effect) => {
      if (canBattleEffectBeUsed(effect, battle.attacker)) {
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

      if (LOG && unit.combat) {
        console.log(
          `${p.side} shoots with ${unit.type} at ${
            unit.combat.hit - unit.combat.hitBonus - unit.combat.hitBonusTmp
          }`,
        )
      }

      const hitInfo: HitInfo = unit.combat ? getHits(unit.combat) : { hits: 0, rollInfoList: [] }

      if (unit.onHit) {
        unit.onHit(p, battle, otherParticipant, hitInfo)
      }

      const hits = hitInfo.hits
      return {
        hits: unit.assignHitsToNonFighters === true ? 0 : hits,
        hitsToNonFighters: unit.assignHitsToNonFighters === true ? hits : 0,
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
  return (
    p.hitsToAssign.hits > 0 ||
    p.hitsToAssign.hitsToNonFighters > 0 ||
    p.hitsToAssign.hitsAssignedByEnemy > 0
  )
}

// TODO do we really sort out units that cant take a hit? Like mechs in space battle etc?
function resolveParticipantHits(battle: BattleInstance, p: ParticipantInstance) {
  while (hasHitToAssign(p)) {
    if (p.soakHits > 0) {
      soakHit(p)
      continue
    }

    if (p.hitsToAssign.hitsAssignedByEnemy > 0) {
      if (p.hitsToAssign.hitsAssignedByEnemy > 1) {
        // TODO
        console.warn(
          'hitsAssignedByEnemy is larger than one, we should assign them to best sustain unit! But that aint implemented!',
        )
      }
      const bestUnit = getBestNonSustainUnit(p)
      if (bestUnit) {
        if (LOG) {
          console.log(`${p.side} loses ${bestUnit.type} after hits assigned by opponent.`)
        }
        bestUnit.isDestroyed = true
      } else {
        const hitNonFighter = applyHit(battle, p, true)
        if (!hitNonFighter) {
          applyHit(battle, p, true)
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

    const deadUnits = p.units.filter((u) => u.isDestroyed)
    p.units = p.units.filter((u) => !u.isDestroyed)

    const otherParticipant = p.side === 'attacker' ? battle.defender : battle.attacker

    p.onDeath.forEach((effect) => {
      if (canBattleEffectBeUsed(effect, battle.attacker)) {
        effect.onDeath!(deadUnits, p, otherParticipant, battle, true, effect.name)
      }
    })

    otherParticipant.onDeath.forEach((effect) => {
      if (canBattleEffectBeUsed(effect, battle.attacker)) {
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
      effect.onSustain!(unit, p, battle, effect.name)
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
