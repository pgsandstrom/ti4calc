import { BattleInstance, ParticipantInstance } from '../battle-types'
import { BattleEffect } from '../battleeffect/battleEffects'
import { Place } from '../enums'
import { defaultRoll, getUnitWithImproved, UnitInstance, UnitType } from '../unit'
import { getNonFighterShips } from '../unitGet'

// TODO fix test for flagship, since it has an aura...
export const winnu: BattleEffect[] = [
  {
    type: 'race',
    name: 'Winnu flagship',
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
                  const opponent = p.side === 'attacker' ? battle.defender : battle.attacker
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
    name: 'Winnu commander',
    transformUnit: (u: UnitInstance) => {
      return getUnitWithImproved(u, 'combat', 'hit', 'permanent', 2)
    },
  },
]
