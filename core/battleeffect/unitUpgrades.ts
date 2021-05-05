import { Race } from '../races/race'
import { UnitInstance, UnitType } from '../unit'
import { BattleEffect } from './battleEffects'

const destroyer: BattleEffect = {
  name: 'destroyer upgrade',
  type: 'unit-upgrade',
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
  onlyFirstRound: false,
}

const cruiser: BattleEffect = {
  name: 'cruiser upgrade',
  type: 'unit-upgrade',
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
  onlyFirstRound: false,
}

const carrier: BattleEffect = {
  name: 'carrier upgrade',
  type: 'unit-upgrade',
  unit: UnitType.carrier,
  transformUnit: (unit: UnitInstance) => {
    return unit
  },
  onlyFirstRound: false,
}

const dreadnought: BattleEffect = {
  name: 'dreadnought upgrade',
  type: 'unit-upgrade',
  unit: UnitType.dreadnought,
  transformUnit: (unit: UnitInstance) => {
    if (unit.type === UnitType.dreadnought) {
      return {
        ...unit,
        // TODO make immune to direct hit in the future
      }
    } else {
      return unit
    }
  },
  onlyFirstRound: false,
}

const fighter: BattleEffect = {
  name: 'fighter upgrade',
  type: 'unit-upgrade',
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
  onlyFirstRound: false,
}

const infantry: BattleEffect = {
  name: 'infantry upgrade',
  type: 'unit-upgrade',
  unit: UnitType.infantry,
  transformUnit: (unit: UnitInstance) => {
    if (unit.type === UnitType.infantry) {
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
  onlyFirstRound: false,
}

const pds: BattleEffect = {
  name: 'pds upgrade',
  type: 'unit-upgrade',
  unit: UnitType.pds,
  transformUnit: (unit: UnitInstance) => {
    if (unit.type === UnitType.pds) {
      return {
        ...unit,
        combat: {
          ...unit.combat!,
          hit: 5,
        },
      }
    } else {
      return unit
    }
  },
  onlyFirstRound: false,
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

export function getUnitUpgrade(race: Race, unitType: UnitType) {
  // TODO this should include race techs... it currently dont :(
  const raceSpecific = getAllUnitUpgrades().find(
    (unitUpgrade) => unitUpgrade.race === race && unitUpgrade.unit === unitType,
  )
  if (raceSpecific) {
    return raceSpecific
  } else {
    return getAllUnitUpgrades().find((unitUpgrade) => unitUpgrade.unit === unitType)
  }
}
