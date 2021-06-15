import { getOtherParticipant, LOG } from '../battle'
import { BattleInstance, ParticipantInstance } from '../battle-types'
import { BattleAura, BattleEffect, registerUse } from '../battleeffect/battleEffects'
import { Place, Race } from '../enums'
import { defaultRoll, getUnitWithImproved, UnitInstance, UnitType } from '../unit'

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
  // TODO dreadnought and its upgrade
]
