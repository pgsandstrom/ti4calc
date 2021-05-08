import { BattleAura, BattleEffect } from '../battleeffect/battleEffects'
import { Place } from '../enums'
import { defaultRoll, UnitInstance, UnitType } from '../unit'

export const sardarkkNorr: BattleEffect[] = [
  {
    type: 'race',
    name: 'Sardakk Norr flagship',
    transformUnit: (unit: UnitInstance) => {
      if (unit.type === UnitType.flagship) {
        const flagshipBuff: BattleAura = {
          name: 'Sardakk Norr flagship buff',
          place: Place.space,
          transformUnit: (unit: UnitInstance) => {
            if (unit.combat && unit.type !== UnitType.flagship) {
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
]
