import { EFFECT_LOW_PRIORITY } from '../battle-types'
import { Place } from '../enums'
import { getUnitWithImproved, UnitInstance, UnitType } from '../unit'
import { BattleEffect } from './battleEffects'

export function getAgendas() {
  return [
    publicizeWeaponSchematics,
    prophecyOfIxth,
    // articlesOfWar,
    conventionsOfWar,
  ]
}

export const publicizeWeaponSchematics: BattleEffect = {
  name: 'Publicize Weapon Schematics',
  description: 'All war suns lose SUSTAIN DAMAGE.',
  type: 'agenda',
  place: Place.space,
  symmetrical: true,
  transformUnit: (u: UnitInstance) => {
    if (u.type === UnitType.warsun) {
      return {
        ...u,
        sustainDamage: false,
      }
    } else {
      return u
    }
  },
}

export const prophecyOfIxth: BattleEffect = {
  name: 'Prophecy of Ixth',
  description: "The owner of this card applies +1 to the result of their fighter's combat rolls.",
  type: 'agenda',
  place: Place.space,
  transformUnit: (u: UnitInstance) => {
    if (u.type === UnitType.fighter) {
      return getUnitWithImproved(u, 'combat', 'hit', 'permanent')
    } else {
      return u
    }
  },
}

export const articlesOfWar: BattleEffect = {
  name: 'Articles of War',
  description: 'All mechs lose their printed abilities except for SUSTAIN DAMAGE.',
  type: 'agenda',
  place: 'both',
  symmetrical: true,
  // TODO
}

export const conventionsOfWar: BattleEffect = {
  name: 'Conventions of War',
  description: 'No BOMBARDMENT.',
  type: 'agenda',
  place: Place.ground,
  symmetrical: true,
  priority: EFFECT_LOW_PRIORITY,
  transformUnit: (u: UnitInstance) => {
    if (u.bombardment) {
      return {
        ...u,
        bombardment: undefined,
      }
    } else {
      return u
    }
  },
}
