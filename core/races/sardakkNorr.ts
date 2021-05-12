import { BattleAura, BattleEffect } from '../battleeffect/battleEffects'
import { defaultRoll, getUnitWithImproved, UnitInstance, UnitType } from '../unit'

export const sardarkkNorr: BattleEffect[] = [
  {
    type: 'race',
    name: 'Sardakk Norr flagship',
    transformUnit: (unit: UnitInstance) => {
      if (unit.type === UnitType.flagship) {
        const flagshipBuff: BattleAura = {
          name: 'Sardakk Norr flagship buff',
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
