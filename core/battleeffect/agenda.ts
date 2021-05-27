import { Place } from '../enums'
import { getUnitWithImproved, UnitInstance, UnitType } from '../unit'
import { BattleEffect } from './battleEffects'

export function getAgendas() {
  return [publicizeWeaponSchematics, prophecyOfIxth, articlesOfWar, conventionsOfWar]
}

// All war suns lose SUSTAIN DAMAGE
// TODO this is symmetrical, as in it always affects both attacker and defender. How to handle that?
export const publicizeWeaponSchematics: BattleEffect = {
  name: 'Publicize Weapon Schematics',
  type: 'agenda',
  place: Place.space,
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
  // TODO remove enemy transform? If not, add it to conventionsOfWar as well
  transformEnemyUnit: (u: UnitInstance) => {
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

// The owner of this card applies +1 to the result of their fighter's combat rolls
export const prophecyOfIxth: BattleEffect = {
  name: 'Prophecy of Ixth',
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

// All mechs lose their printed abilities except for SUSTAIN DAMAGE
export const articlesOfWar: BattleEffect = {
  name: 'Articles of War',
  type: 'agenda',
  place: 'both',
  // TODO
}

// No bombardment
export const conventionsOfWar: BattleEffect = {
  name: 'Conventions of War',
  type: 'agenda',
  place: Place.ground,
  transformUnit: (u: UnitInstance) => {
    if (u.bombardment) {
      console.log('lol')
      return {
        ...u,
        bombardment: undefined,
      }
    } else {
      return u
    }
  },
}
