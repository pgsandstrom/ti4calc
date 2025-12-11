import { BattleInstance, ParticipantInstance } from '../battle-types'
import { BattleEffect } from '../battleeffect/battleEffects'
import { Faction, Place } from '../enums'
import { createUnitAndApplyEffects, defaultRoll, UnitInstance, UnitType } from '../unit'

export const keleres: BattleEffect[] = [
  {
    type: 'faction',
    name: 'Keleres flagship',
    place: Place.space,
    transformUnit: (unit: UnitInstance) => {
      if (unit.type === UnitType.flagship) {
        return {
          ...unit,
          combat: {
            ...defaultRoll,
            hit: 7,
            count: 2,
          },
        }
      } else {
        return unit
      }
    },
  },
  {
    type: 'faction-ability',
    description:
      'The faction tech I.I.H.Q. MODERNIZATION gives Mecatol Rex a space cannon that hits on 5.',
    name: 'I.I.H.Q. MODERNIZATION space cannon',
    place: 'both',
    faction: Faction.keleres,
    beforeStart: (p: ParticipantInstance, battle: BattleInstance) => {
      const modify = (instance: UnitInstance) => {
        instance.spaceCannon = {
          ...defaultRoll,
          hit: 5,
          count: 1,
        }
      }
      const planetUnit = createUnitAndApplyEffects(UnitType.other, p, battle.place, modify)
      p.units.push(planetUnit)
    },
  },
]
