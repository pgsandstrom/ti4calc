import _cloneDeep from 'lodash/cloneDeep'
import _times from 'lodash/times'

import { applyQueryParams } from '../util/query-params'
import { objectEntries } from '../util/util-object'
import { PartialRecord } from '../util/util-types'
import { doBattle } from './battle'
import {
  Battle,
  BattleInstance,
  EFFECT_DEFAULT_PRIORITY,
  Participant,
  ParticipantInstance,
  Side,
} from './battle-types'
import { BattleEffect, getAllBattleEffects } from './battleeffect/battleEffects'
import { getUnitUpgrade } from './battleeffect/unitUpgrades'
import { Faction, Place } from './enums'
import { getFactionBattleEffects } from './factions/faction'
import { createUnit, UnitInstance, UnitType } from './unit'

export function setupBattle(battle: Battle): BattleInstance {
  battle = _cloneDeep(battle)
  return createBattleInstance(battle)
}

export function startBattle(battle: BattleInstance) {
  return doBattle(battle)
}

function createBattleInstance(battle: Battle): BattleInstance {
  // How we create and apply battle effects is a bit complicated, due to two reasons:
  // First, one sides battle effects affect the other side, so we need to create both participants and then apply
  // battle effects to the opponent
  // Also, a battle effect (such as the flagships) can give units new battle effects. So unit battle effects needs
  // to be applied after all other effects.
  const attackerBattleEffects = getParticipantBattleEffects(battle.attacker, battle.place)
  const attacker = createParticipantInstance(
    battle.attacker,
    attackerBattleEffects,
    'attacker',
    battle.place,
  )
  const defenderBattleEffects = getParticipantBattleEffects(battle.defender, battle.place)
  const defender = createParticipantInstance(
    battle.defender,
    defenderBattleEffects,
    'defender',
    battle.place,
  )

  addOtherParticipantsBattleEffects(attacker, defenderBattleEffects, battle.place)
  addOtherParticipantsBattleEffects(defender, attackerBattleEffects, battle.place)

  fixUnitBattleEffects(battle.attacker, attacker, defender, battle.place)
  fixUnitBattleEffects(battle.defender, defender, attacker, battle.place)

  damageUnits(attacker, battle.attacker.damagedUnits)
  damageUnits(defender, battle.defender.damagedUnits)

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
        return createUnit(unitType)
      })
    })
    .flat()
  return units
}

function getParticipantBattleEffects(participant: Participant, place: Place): BattleEffect[] {
  const allBattleEffects = getAllBattleEffects()

  // Say I select baron, choose their faction tech, then switch to arborec. Here we filter out unviable techs like that:
  const battleEffects: BattleEffect[] = []
  for (const effectName in participant.battleEffects) {
    const battleEffectCount = participant.battleEffects[effectName]
    if (battleEffectCount === undefined || battleEffectCount === 0) {
      continue
    }
    const effect = allBattleEffects.find((e) => e.name === effectName)!
    if (
      effect.faction === undefined ||
      effect.faction === participant.faction ||
      participant.faction === Faction.nekro
    ) {
      battleEffects.push(effect)
    }
  }

  const factionAbilities = getFactionBattleEffects(participant).filter(
    (effect) => effect.type === 'faction',
  )
  battleEffects.push(...factionAbilities)

  objectEntries(participant.unitUpgrades).forEach(([unitType, upgraded]) => {
    if (upgraded) {
      const unitUpgrade = getUnitUpgrade(participant.faction, unitType)
      if (unitUpgrade) {
        battleEffects.push(unitUpgrade)
      }
    }
  })

  return battleEffects.filter((effect) => {
    return effect.place === 'both' || effect.place === place
  })
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
    faction: participant.faction,
    units,
    unitUpgrades: participant.unitUpgrades,
    newUnits: [],

    allUnitTransform: [],

    beforeStartEffect: [],
    onStartEffect: [],
    onSustainEffect: [],
    onEnemySustainEffect: [],
    onRepairEffect: [],
    onCombatRoundEnd: [],
    onCombatRoundEndBeforeAssign: [],
    afterAfbEffect: [],
    onDeath: [],

    onHit: [],
    onBombardmentHit: [],

    onSpaceCannon: [],
    onBombardment: [],
    onAfb: [],
    onCombatRound: [],

    effects: {},

    riskDirectHit: participant.riskDirectHit,

    soakHits: 0,
    hitsToAssign: {
      hits: 0,
      hitsToNonFighters: 0,
      hitsAssignedByEnemy: 0,
    },
    afbHitsToAssign: {
      fighterHitsToAssign: 0,
      rollInfoList: [],
    },

    roundActionTracker: {},
    fightActionTracker: {},
  }

  applyBattleEffects(participant, participantInstance, battleEffects, place)

  return participantInstance
}

function fixUnitBattleEffects(
  participant: Participant,
  participantInstance: ParticipantInstance,
  other: ParticipantInstance,
  place: Place,
) {
  const participantUnitBattleEffects = participantInstance.units
    .filter((u) => !!u.battleEffects)
    .map((u) => u.battleEffects!)
    .flat()

  applyBattleEffects(participant, participantInstance, participantUnitBattleEffects, place)
  addOtherParticipantsBattleEffects(other, participantUnitBattleEffects, place)
}

function addOtherParticipantsBattleEffects(
  participantInstance: ParticipantInstance,
  battleEffects: BattleEffect[],
  place: Place,
) {
  battleEffects.forEach((battleEffect) => {
    if (battleEffect.transformEnemyUnit) {
      participantInstance.allUnitTransform.push(battleEffect.transformEnemyUnit)
      participantInstance.units = participantInstance.units.map((u) => {
        return battleEffect.transformEnemyUnit!(u, participantInstance, place, battleEffect.name)
      })
    }
  })
}

function applyBattleEffects(
  participant: Participant,
  participantInstance: ParticipantInstance,
  battleEffects: BattleEffect[],
  place: Place,
) {
  battleEffects
    .sort((a, b) => {
      const prioDiff =
        (b.priority ?? EFFECT_DEFAULT_PRIORITY) - (a.priority ?? EFFECT_DEFAULT_PRIORITY)

      if (prioDiff === 0) {
        // faction abilities take priority
        return a.type === 'faction' ? -1 : 1
      }
      return prioDiff
    })
    .forEach((battleEffect) => {
      if (battleEffect.beforeStart) {
        participantInstance.beforeStartEffect.push(battleEffect)
      }
      if (battleEffect.onStart) {
        participantInstance.onStartEffect.push(battleEffect)
      }
      if (battleEffect.onSustain) {
        participantInstance.onSustainEffect.push(battleEffect)
      }
      if (battleEffect.onEnemySustain) {
        participantInstance.onEnemySustainEffect.push(battleEffect)
      }
      if (battleEffect.onRepair) {
        participantInstance.onRepairEffect.push(battleEffect)
      }
      if (battleEffect.onCombatRoundEnd) {
        participantInstance.onCombatRoundEnd.push(battleEffect)
      }
      if (battleEffect.onCombatRoundEndBeforeAssign) {
        participantInstance.onCombatRoundEndBeforeAssign.push(battleEffect)
      }
      if (battleEffect.afterAfb) {
        participantInstance.afterAfbEffect.push(battleEffect)
      }
      if (battleEffect.onDeath) {
        participantInstance.onDeath.push(battleEffect)
      }

      if (battleEffect.onSpaceCannon) {
        participantInstance.onSpaceCannon.push(battleEffect)
      }
      if (battleEffect.onBombardment) {
        participantInstance.onBombardment.push(battleEffect)
      }
      if (battleEffect.onAfb) {
        participantInstance.onAfb.push(battleEffect)
      }
      if (battleEffect.onCombatRound) {
        participantInstance.onCombatRound.push(battleEffect)
      }
      if (battleEffect.onHit) {
        participantInstance.onHit.push(battleEffect)
      }
      if (battleEffect.onBombardmentHit) {
        participantInstance.onBombardmentHit.push(battleEffect)
      }

      if (battleEffect.transformUnit) {
        participantInstance.allUnitTransform.push(battleEffect.transformUnit)
        participantInstance.units = participantInstance.units.map((u) =>
          battleEffect.transformUnit!(u, participantInstance, place, battleEffect.name),
        )
      }

      const effectNumber = participant.battleEffects[battleEffect.name]
      if (effectNumber !== undefined) {
        participantInstance.effects[battleEffect.name] = effectNumber
      }
    })
}

export function createParticipant(
  side: Side,
  faction?: Faction,
  query?: Record<string, string | string[] | undefined>,
): Participant {
  const participant: Participant = {
    faction: faction ?? Faction.barony_of_letnev,
    side,
    units: getUnitMap(),
    unitUpgrades: {},
    damagedUnits: {},
    battleEffects: {},
    riskDirectHit: true,
  }
  if (query) {
    applyQueryParams(participant, query)
  }
  return participant
}

export const getUnitMap = (units?: PartialRecord<UnitType, number>) => {
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
    other: 0,
    nonunit: 0,
    ...units,
  }
  return unitMap
}

function damageUnits(
  participant: ParticipantInstance,
  damagedUnits: PartialRecord<UnitType, number>,
) {
  objectEntries(damagedUnits).forEach(([unitType, n]) => {
    _times(n, () => {
      const unit = participant.units.find((u) => {
        return u.type === unitType && u.sustainDamage && !u.takenDamage
      })
      if (unit) {
        unit.takenDamage = true
        unit.takenDamageRound = 0
      }
    })
  })
}
