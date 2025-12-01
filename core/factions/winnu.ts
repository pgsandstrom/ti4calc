import { logWrapper } from '../../util/util-log'
import { getOtherParticipant } from '../battle'
import { BattleInstance, ParticipantInstance } from '../battle-types'
import { BattleEffect } from '../battleeffect/battleEffects'
import { Faction, Place } from '../enums'
import { defaultRoll, getUnitWithImproved, UnitInstance, UnitType } from '../unit'
import { getNonFighterShips } from '../unitGet'

// TODO fix test for flagship, since it has an aura...
export const winnu: BattleEffect[] = [
  {
    type: 'faction',
    name: 'Winnu flagship',
    place: Place.space,
    transformUnit: (unit: UnitInstance) => {
      if (unit.type === UnitType.flagship) {
        return {
          ...unit,
          combat: {
            ...defaultRoll,
            hit: 7,
            count: 1,
          },
          aura: [
            {
              name: 'Winnu Flagship ability',
              type: 'other',
              place: Place.space,
              transformUnit: (
                auraUnit: UnitInstance,
                p: ParticipantInstance,
                battle: BattleInstance,
              ) => {
                if (auraUnit.type === UnitType.flagship) {
                  const opponent = getOtherParticipant(battle, p)
                  const nonFighterShips = getNonFighterShips(opponent)
                  return {
                    ...auraUnit,
                    combat: {
                      ...auraUnit.combat!,
                      count: nonFighterShips.length,
                    },
                  }
                }
                return auraUnit
              },
            },
          ],
        }
      } else {
        return unit
      }
    },
  },
  {
    type: 'commander',
    description:
      "During combat: Apply +2 to the result of each of your unit's combat rolls in the Mecatol Rex system, your home system, and each system that contains a legendary planet.",
    name: 'Winnu commander',
    place: 'both',
    transformUnit: (u: UnitInstance) => {
      return getUnitWithImproved(u, 'combat', 'hit', 'permanent', 2)
    },
  },

  {
    name: 'Imperator',
    type: 'faction-ability',
    description:
      'Winnu Breakthrough: Apply +1 to the results of each of your unit\'s combat rolls for each "Support for the Throne" in your opponent\'s play area.',
    place: 'both',
    faction: Faction.winnu,
    count: true,
    onStart: (
      p: ParticipantInstance,
      _battle: BattleInstance,
      _op: ParticipantInstance,
      effectName: string,
    ) => {
      p.units.forEach((u) => {
        if (u.combat) {
          u.combat.hitBonus += p.effects[effectName]
          logWrapper(
            `${p.side} used Imperator to give all units a +${p.effects[effectName]} to hit.`,
          )
        }
      })
    },
  },
]
