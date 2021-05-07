import { BattleEffect } from '../battleeffect/battleEffects'
import { Race } from '../enums'
import { defaultRoll, UnitInstance, UnitType } from '../unit'

export const titansOfUl: BattleEffect[] = [
  {
    type: 'race',
    name: 'Titans of Ul flagship',
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
    type: 'race',
    name: 'Titans of Ul pds',
    transformUnit: (unit: UnitInstance) => {
      if (unit.type === UnitType.pds) {
        return {
          ...unit,
          combat: {
            ...defaultRoll,
            hit: 7,
          },
          isGroundForce: true,
          sustainDamage: true,
        }
      } else {
        return unit
      }
    },
  },
  {
    type: 'race-tech',
    name: 'Titans of Ul pds upgrade',
    race: Race.titans_of_ul,
    unit: UnitType.pds,
    transformUnit: (unit: UnitInstance) => {
      if (unit.type === UnitType.pds) {
        return {
          ...unit,
          combat: {
            ...unit.combat!,
            hit: 6,
          },
          spaceCannon: {
            ...unit.spaceCannon!,
            hit: 5,
          },
          isGroundForce: true,
          sustainDamage: true,
        }
      } else {
        return unit
      }
    },
  },
  {
    type: 'race-tech',
    name: 'Titans of Ul cruiser upgrade',
    race: Race.titans_of_ul,
    unit: UnitType.cruiser,
    transformUnit: (unit: UnitInstance) => {
      if (unit.type === UnitType.cruiser) {
        return {
          ...unit,
          combat: {
            ...unit.combat!,
            hit: 6,
          },
          // sustainDamage: true,
        }
      } else {
        return unit
      }
    },
  },
]
