import { Faction } from '../enums'
import { getFactionBattleEffects } from '../factions/faction'
import { UnitInstance, UnitType } from '../unit'
import { BattleEffect } from './battleEffects'

const destroyer: BattleEffect = {
  name: 'destroyer upgrade',
  type: 'unit-upgrade',
  place: 'both',
  unit: UnitType.destroyer,
  transformUnit: (unit: UnitInstance) => {
    if (unit.type === UnitType.destroyer) {
      return {
        ...unit,
        combat: {
          ...unit.combat!,
          hit: 8,
        },
        afb: {
          ...unit.afb!,
          hit: 6,
          count: 3,
        },
      }
    } else {
      return unit
    }
  },
}

const cruiser: BattleEffect = {
  name: 'cruiser upgrade',
  type: 'unit-upgrade',
  place: 'both',
  unit: UnitType.cruiser,
  transformUnit: (unit: UnitInstance) => {
    if (unit.type === UnitType.cruiser) {
      return {
        ...unit,
        combat: {
          ...unit.combat!,
          hit: 6,
        },
      }
    } else {
      return unit
    }
  },
}

const carrier: BattleEffect = {
  name: 'carrier upgrade',
  type: 'unit-upgrade',
  place: 'both',
  unit: UnitType.carrier,
  transformUnit: (unit: UnitInstance) => {
    return unit
  },
}

const dreadnought: BattleEffect = {
  name: 'dreadnought upgrade',
  type: 'unit-upgrade',
  place: 'both',
  unit: UnitType.dreadnought,
  transformUnit: (unit: UnitInstance) => {
    if (unit.type === UnitType.dreadnought) {
      return {
        ...unit,
        immuneToDirectHit: true,
      }
    } else {
      return unit
    }
  },
}

const fighter: BattleEffect = {
  name: 'fighter upgrade',
  type: 'unit-upgrade',
  place: 'both',
  unit: UnitType.fighter,
  transformUnit: (unit: UnitInstance) => {
    if (unit.type === UnitType.fighter) {
      return {
        ...unit,
        combat: {
          ...unit.combat!,
          hit: 8,
        },
      }
    } else {
      return unit
    }
  },
}

const infantry: BattleEffect = {
  name: 'infantry upgrade',
  type: 'unit-upgrade',
  place: 'both',
  unit: UnitType.infantry,
  transformUnit: (unit: UnitInstance) => {
    if (unit.type === UnitType.infantry) {
      return {
        ...unit,
        combat: {
          ...unit.combat!,
          hit: 7,
        },
      }
    } else {
      return unit
    }
  },
}

const pds: BattleEffect = {
  name: 'pds upgrade',
  type: 'unit-upgrade',
  place: 'both',
  unit: UnitType.pds,
  transformUnit: (unit: UnitInstance) => {
    if (unit.type === UnitType.pds) {
      return {
        ...unit,
        spaceCannon: {
          ...unit.spaceCannon!,
          hit: 5,
        },
      }
    } else {
      return unit
    }
  },
}

export const getAllUnitUpgrades = () => [
  destroyer,
  cruiser,
  carrier,
  dreadnought,
  fighter,
  infantry,
  pds,
]

export function getUnitUpgrade(faction: Faction, unitType: UnitType) {
  const factionTechs = getFactionBattleEffects(faction).filter(
    (effect) => effect.type === 'faction-tech',
  )

  const factionTech = factionTechs.find((tech) => tech.unit === unitType)
  if (factionTech) {
    return factionTech
  } else {
    return getAllUnitUpgrades().find((unitUpgrade) => unitUpgrade.unit === unitType)
  }
}
