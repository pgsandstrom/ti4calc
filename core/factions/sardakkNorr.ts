import _times from 'lodash/times'

import { logWrapper } from '../../util/util-log'
import { destroyUnit, getOtherParticipant, isParticipantAlive } from '../battle'
import { BattleInstance, EFFECT_HIGH_PRIORITY, ParticipantInstance } from '../battle-types'
import { BattleAura, BattleEffect, registerUse } from '../battleeffect/battleEffects'
import { Faction, Place } from '../enums'
import { defaultRoll, getUnitWithImproved, UnitInstance, UnitType } from '../unit'
import { getHighestWorthUnit, getUnits } from '../unitGet'

export const sardarkkNorr: BattleEffect[] = [
  {
    type: 'faction',
    name: 'Sardakk Norr flagship',
    place: Place.space,
    priority: EFFECT_HIGH_PRIORITY,
    transformUnit: (unit: UnitInstance) => {
      if (unit.type === UnitType.flagship) {
        const flagshipBuff: BattleAura = {
          name: 'Sardakk Norr flagship buff',
          place: Place.space,
          transformUnit: (auraUnit: UnitInstance) => {
            // TODO this is a minor thing, but if there are two flagships they should buff each other. Currently, they dont.
            // this could instead be implemented like the jolNar mechs. Just buff each flagship one less than number of participating flagships
            if (auraUnit.combat && auraUnit.type !== UnitType.flagship) {
              // lol, it doesnt matter if  we have temp or permanent here, because how auras work
              return getUnitWithImproved(auraUnit, 'combat', 'hit', 'temp')
            } else {
              return auraUnit
            }
          },
        }

        return {
          ...unit,
          combat: {
            ...defaultRoll,
            hit: 6,
            count: 2,
          },
          aura: [...(unit.aura ?? []), flagshipBuff],
        }
      } else {
        return unit
      }
    },
  },
  {
    type: 'faction',
    name: 'Sardakk mech ability',
    place: Place.ground,
    onSustain: (
      u: UnitInstance,
      participant: ParticipantInstance,
      battle: BattleInstance,
      _effectName: string,
      isDuringCombat: boolean,
    ) => {
      if (u.type === UnitType.mech && isDuringCombat) {
        const otherParticipant = getOtherParticipant(battle, participant)
        otherParticipant.hitsToAssign.hits += 1
        logWrapper(`${participant.side} assigned hit to enemy due to mech sustain.`)
      }
    },
  },
  {
    type: 'faction',
    name: 'Sardakk Norr buff',
    place: 'both',
    transformUnit: (unit: UnitInstance) => {
      if (unit.combat) {
        return getUnitWithImproved(unit, 'combat', 'hit', 'permanent')
      } else {
        return unit
      }
    },
  },
  {
    type: 'faction',
    name: 'Sardakk Norr dreadnoughts',
    place: 'both',
    priority: EFFECT_HIGH_PRIORITY,
    transformUnit: (unit: UnitInstance) => {
      if (unit.type === UnitType.dreadnought) {
        unit.bombardment!.hit = 4
        unit.bombardment!.count = 2
      }
      return unit
    },
  },
  {
    type: 'faction-tech',
    name: 'Exotrireme II',
    place: 'both',
    faction: Faction.sardakk_norr,
    unit: UnitType.dreadnought,
    transformUnit: (unit: UnitInstance) => {
      if (unit.type === UnitType.dreadnought) {
        return {
          ...unit,
          immuneToDirectHit: true,
        }
      } else {
        return unit
      }
    },
  },
  {
    type: 'faction-ability',
    name: 'Exotrireme II should suicide',
    description:
      'If the Sardakk dreadnought is upgraded, it will activate its ability after the first combat round. The ability reads: "After a round of space combat, you may destroy this unit to destroy up to 2 ships in this system. Just enough ships will be sacrified to kill all enemy ships"',
    place: Place.space,
    faction: Faction.sardakk_norr,
    onCombatRoundEnd: (
      participant: ParticipantInstance,
      battle: BattleInstance,
      otherParticipant: ParticipantInstance,
    ) => {
      if (
        participant.unitUpgrades[UnitType.dreadnought] &&
        isParticipantAlive(otherParticipant, battle.place)
      ) {
        const enemyCount = getUnits(otherParticipant, battle.place, true).length

        const units = getUnits(participant, battle.place, false)
        const dreadNoughtsToSuicide = units
          .filter((u) => u.type === UnitType.dreadnought)
          .sort((u1) => (u1.takenDamage ? -1 : 1))
          .slice(0, Math.ceil(enemyCount / 2))
        dreadNoughtsToSuicide.forEach((u) => {
          destroyUnit(battle, u)
        })

        logWrapper(
          `${participant.side} used Exotrireme II ability for ${dreadNoughtsToSuicide.length} ships.`,
        )

        _times(dreadNoughtsToSuicide.length * 2, () => {
          const highestWorthUnit = getHighestWorthUnit(otherParticipant, battle.place, true)
          if (highestWorthUnit) {
            logWrapper(`${highestWorthUnit.type} was destroyed by Exotrireme II ability.`)
            destroyUnit(battle, highestWorthUnit)
          }
        })
      }
    },
  },
  {
    type: 'faction-tech',
    name: 'Valkyrie Particle Weave',
    description:
      'After making combat rolls during a round of ground combat, if your opponent produced 1 or more hits, you produce 1 additional hit',
    place: Place.ground,
    faction: Faction.sardakk_norr,
    onDeath: (
      _deadUnits: UnitInstance[],
      participant: ParticipantInstance,
      otherParticipant: ParticipantInstance,
      _battle: BattleInstance,
      isOwnUnit: boolean,
      effectName: string,
    ) => {
      if (!isOwnUnit) {
        return
      }
      otherParticipant.hitsToAssign.hits += 1
      registerUse(effectName, participant)
      logWrapper(`${participant.side} uses Valkyrie Particle Weave to produce 1 hit`)
    },
    onSustain: (
      _u: UnitInstance,
      participant: ParticipantInstance,
      battle: BattleInstance,
      effectName: string,
    ) => {
      const otherParticipant = getOtherParticipant(battle, participant)
      otherParticipant.hitsToAssign.hits += 1
      registerUse(effectName, participant)
      logWrapper(`${participant.side} uses Valkyrie Particle Weave to produce 1 hit`)
    },
    timesPerRound: 1,
  },
  {
    type: 'promissary',
    name: 'Tekklar Legion',
    description:
      "At the start of an invasion combat: Apply +1 to the result of each of your unit's combat rolls during this combat.  If your opponent is the N'orr player, apply -1 to the result of each of his unit's combat rolls during this combat.",
    place: Place.ground,
    onStart: (
      participant: ParticipantInstance,
      _battle: BattleInstance,
      otherParticipant: ParticipantInstance,
    ) => {
      participant.units.forEach((unit) => {
        if (unit.combat) {
          unit.combat.hitBonus += 1
        }
      })
      if (otherParticipant.faction === Faction.sardakk_norr) {
        otherParticipant.units.forEach((unit) => {
          if (unit.combat) {
            unit.combat.hitBonus -= 1
          }
        })
      }
    },
  },
]
