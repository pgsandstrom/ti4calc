import { BattleEffect } from '@/core/battleeffect/battleEffects'

import { EFFECT_HIGH_PRIORITY } from '../battle-types'
import { defaultRoll, UnitInstance, UnitType } from '../unit'

/**
 * Neutral faction is actually tricky. Default strength is higher for the following units:
 *
 * cruiser, destroyers, fighters, infantry
 *
 * And on the other units, we need to prevent upgrade from making them stronger.
 *
 * REMEMBER: Adding an "empty" unit-upgrade does replace the default one. Just check `unitUpgrades.ts`.
 *
 * Reference: https://twilight-imperium.fandom.com/wiki/Thunder%27s_Edge#Neutral_Units
 */

export const neutral: BattleEffect[] = [
  {
    type: 'faction',
    name: 'Neutral flagship',
    place: 'both',
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

  // no changes to war sun needed

  {
    name: 'dreadnaught upgrade',
    type: 'faction-tech',
    faction: 'Neutral',
    place: 'both',
    unit: UnitType.dreadnought,
    transformUnit: (unit: UnitInstance) => {
      // just ensure nothing changes...
      return unit
    },
  },

  // no changes needed to carrier

  {
    type: 'faction',
    name: 'Neutral cruiser',
    place: 'both',
    transformUnit: (unit: UnitInstance) => {
      if (unit.type === UnitType.cruiser) {
        return {
          ...unit,
          combat: {
            ...defaultRoll,
            hit: 6,
          },
        }
      } else {
        return unit
      }
    },
  },

  {
    type: 'faction',
    name: 'Neutral destroyers',
    place: 'both',
    transformUnit: (unit: UnitInstance) => {
      if (unit.type === UnitType.destroyer) {
        return {
          ...unit,
          combat: {
            ...defaultRoll,
            hit: 8,
          },
          afb: {
            ...defaultRoll,
            hit: 6,
            count: 3,
          },
        }
      } else {
        return unit
      }
    },
  },

  {
    type: 'faction',
    name: 'Neutral fighter',
    place: 'both',
    transformUnit: (unit: UnitInstance) => {
      if (unit.type === UnitType.fighter) {
        return {
          ...unit,
          combat: {
            ...defaultRoll,
            hit: 8,
          },
        }
      } else {
        return unit
      }
    },
  },

  // no changes to mech needed

  {
    type: 'faction',
    name: 'Neutral infantry',
    place: 'both',
    priority: EFFECT_HIGH_PRIORITY,
    transformUnit: (unit: UnitInstance) => {
      if (unit.type === UnitType.infantry) {
        return {
          ...unit,
          combat: {
            ...defaultRoll,
            hit: 8,
          },
        }
      } else {
        return unit
      }
    },
  },

  {
    name: 'infantry upgrade',
    type: 'faction-tech',
    faction: 'Neutral',
    place: 'both',
    unit: UnitType.infantry,
    transformUnit: (unit: UnitInstance) => {
      // just ensure nothing changes...
      return unit
    },
  },

  {
    name: 'pds upgrade',
    type: 'faction-tech',
    faction: 'Neutral',
    place: 'both',
    unit: UnitType.pds,
    transformUnit: (unit: UnitInstance) => {
      // just ensure nothing changes...
      return unit
    },
  },
]
