import { destroyUnit, getOtherParticipant, isParticipantAlive, LOG } from '../battle'
import { BattleInstance, ParticipantInstance } from '../battle-types'
import { BattleAura, BattleEffect, registerUse } from '../battleeffect/battleEffects'
import { Place, Race } from '../enums'
import { defaultRoll, getUnitWithImproved, UnitInstance, UnitType } from '../unit'
import { getHighestWorthUnit, getUnits } from '../unitGet'
import _times from 'lodash/times'

export const sardarkkNorr: BattleEffect[] = [
  {
    type: 'race',
    name: 'Sardakk Norr flagship',
    place: Place.space,
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
          aura: [...(unit.aura ? unit.aura : []), flagshipBuff],
        }
      } else {
        return unit
      }
    },
  },
  {
    type: 'race',
    name: 'Sardakk mech ability',
    place: Place.ground,
    onSustain: (u: UnitInstance, participant: ParticipantInstance, battle: BattleInstance) => {
      if (u.type === UnitType.mech) {
        const otherParticipant = getOtherParticipant(battle, participant)
        otherParticipant.hitsToAssign.hits += 1
        if (LOG) {
          console.log(`${participant.side} assigned hit to enemy due to mech sustain.`)
        }
      }
    },
  },
  {
    type: 'race',
    name: 'Sardakk Norr buff',
    place: 'both',
    transformUnit: (unit: UnitInstance) => {
      if (unit.combat) {
        return {
          ...unit,
          combat: {
            ...unit.combat,
            hitBonus: unit.combat.hitBonus + 1,
          },
        }
      } else {
        return unit
      }
    },
  },
  {
    type: 'race',
    name: 'Sardakk Norr dreadnoughts',
    place: 'both',
    transformUnit: (unit: UnitInstance) => {
      if (unit.type === UnitType.dreadnought) {
        unit.bombardment!.hit = 4
        unit.bombardment!.count = 2
      }
      return unit
    },
  },
  {
    type: 'race-tech',
    name: 'Exotrireme II',
    place: 'both',
    race: Race.sardakk_norr,
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
    type: 'race-ability',
    name: 'Exotrireme II should suicide',
    description:
      'If the Sardakk dreadnought is upgraded, it will activate its ability after the first combat round. The ability reads: "After a round of space combat, you may destroy this unit to destroy up to 2 ships in this system."',
    place: Place.space,
    race: Race.sardakk_norr,
    onCombatRoundEnd: (
      participant: ParticipantInstance,
      battle: BattleInstance,
      otherParticipant: ParticipantInstance,
    ) => {
      if (
        participant.unitUpgrades[UnitType.dreadnought] &&
        isParticipantAlive(otherParticipant, battle.place)
      ) {
        const units = getUnits(participant, battle.place, false)
        const dreadNoughts = units.filter((u) => u.type === UnitType.dreadnought)
        dreadNoughts.forEach((u) => {
          destroyUnit(battle, u)
        })

        if (LOG) {
          console.log(
            `${participant.side} used Exotrireme II ability for ${dreadNoughts.length} ships.`,
          )
        }

        _times(dreadNoughts.length * 2, () => {
          const highestWorthUnit = getHighestWorthUnit(otherParticipant, battle.place, true)
          if (highestWorthUnit) {
            if (LOG) {
              console.log(`${highestWorthUnit.type} was destroyed by Exotrireme II ability.`)
            }
            destroyUnit(battle, highestWorthUnit)
          }
        })
      }
    },
  },
  {
    type: 'race-tech',
    name: 'Valkyrie Particle Weave',
    description:
      'After making combat rolls during a round of ground combat, if your opponent produced 1 or more hits, you produce 1 additional hit',
    place: Place.ground,
    race: Race.sardakk_norr,
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
      if (LOG) {
        console.log(`${participant.side} uses Valkyrie Particle Weave to produce 1 hit`)
      }
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
      if (LOG) {
        console.log(`${participant.side} uses Valkyrie Particle Weave to produce 1 hit`)
      }
    },
    timesPerRound: 1,
  },
]
