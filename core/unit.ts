import { ParticipantInstance } from './battle-types'
import { BattleEffect } from './battleeffect/battleEffects'

export enum UnitType {
  cruiser = 'cruiser',
  carrier = 'carrier',
  destroyer = 'destroyer',
  dreadnought = 'dreadnought',
  fighter = 'fighter',
  flagship = 'flagship',
  infantry = 'infantry',
  mech = 'mech',
  pds = 'pds',
  warsun = 'warsun',
}

export interface Unit {
  type: UnitType
  combat?: Roll

  bombardment?: Roll
  afb?: Roll
  spaceCannon?: Roll

  // TODO maybe make these optional as well
  sustainDamage: boolean
  planetaryShield: boolean

  isShip: boolean
  isGroundForce: boolean

  useSustainDamagePriority?: number
  diePriority?: number

  // this is an effect that is only present while the unit is alive (i.e. sardakk flagship)
  // it only works for transforming friendly or enemy units
  aura?: BattleEffect[]

  // these work like any other battle effects
  battleEffects?: BattleEffect[]
}

export interface UnitInstance extends Unit {
  takenDamage: boolean
  takenDamageRound?: number
  isDestroyed: boolean
}

export interface Roll {
  hit: number
  hitBonus: number
  count: number
  countBonus: number
  reroll: number
  rerollBonus: number
}

export const defaultRoll: Roll = {
  hit: 0,
  hitBonus: 0,
  count: 1,
  countBonus: 0,
  reroll: 0,
  rerollBonus: 0,
}

const carrier: Readonly<Unit> = {
  type: UnitType.carrier,

  combat: {
    ...defaultRoll,
    hit: 9,
  },

  sustainDamage: false,
  planetaryShield: false,

  isGroundForce: false,
  isShip: true,

  diePriority: 40,
}

const cruiser: Readonly<Unit> = {
  type: UnitType.cruiser,

  combat: {
    ...defaultRoll,
    hit: 7,
  },

  sustainDamage: false,
  planetaryShield: false,

  isGroundForce: false,
  isShip: true,

  diePriority: 70,
}

const destroyer: Readonly<Unit> = {
  type: UnitType.destroyer,

  combat: {
    ...defaultRoll,
    hit: 9,
  },

  afb: {
    ...defaultRoll,
    hit: 9,
    count: 2,
  },

  sustainDamage: false,
  planetaryShield: false,

  isGroundForce: false,
  isShip: true,

  diePriority: 80,
}

const dreadnought: Readonly<Unit> = {
  type: UnitType.dreadnought,

  combat: {
    ...defaultRoll,
    hit: 5,
  },

  bombardment: {
    ...defaultRoll,
    hit: 5,
  },

  sustainDamage: true,
  planetaryShield: false,

  isGroundForce: false,
  isShip: true,

  useSustainDamagePriority: 100,
  diePriority: 40,
}

const fighter: Readonly<Unit> = {
  type: UnitType.fighter,

  combat: {
    ...defaultRoll,
    hit: 9,
  },

  sustainDamage: false,
  planetaryShield: false,

  isGroundForce: false,
  isShip: true,

  diePriority: 100,
}

// flagship has minimal data, the factions modify it.
const flagship: Readonly<Unit> = {
  type: UnitType.flagship,

  sustainDamage: true,
  planetaryShield: false,

  isGroundForce: false,
  isShip: true,

  diePriority: 20,
}

const infantry: Readonly<Unit> = {
  type: UnitType.infantry,

  combat: {
    ...defaultRoll,
    hit: 8,
  },

  sustainDamage: false,
  planetaryShield: false,

  isGroundForce: true,
  isShip: false,

  diePriority: 80,
}

const mech: Readonly<Unit> = {
  type: UnitType.mech,

  combat: {
    ...defaultRoll,
    hit: 6,
  },

  sustainDamage: true,
  planetaryShield: false,

  isGroundForce: true,
  isShip: false,

  diePriority: 50,
  useSustainDamagePriority: 50,
}

const pds: Readonly<Unit> = {
  type: UnitType.pds,

  spaceCannon: {
    ...defaultRoll,
    hit: 6,
  },

  sustainDamage: false,
  planetaryShield: true,

  isGroundForce: false,
  isShip: false,
}

const warsun: Readonly<Unit> = {
  // TODO warsun should disable planetary shield somehow
  type: UnitType.warsun,

  combat: {
    ...defaultRoll,
    hit: 3,
    count: 3,
  },

  bombardment: {
    ...defaultRoll,
    hit: 3,
    count: 3,
  },

  sustainDamage: true,
  planetaryShield: false,

  isGroundForce: false,
  isShip: true,

  diePriority: 10,

  battleEffects: [
    {
      name: 'warsun remove planetary shield',
      type: 'other',
      transformEnemyUnit: (u: UnitInstance) => {
        return {
          ...u,
          planetaryShield: false,
        }
      },
    },
  ],
}

export const UNIT_MAP: Record<UnitType, Readonly<Unit>> = {
  carrier,
  cruiser,
  destroyer,
  dreadnought,
  fighter,
  flagship,
  infantry,
  mech,
  pds,
  warsun,
}

const NON_FIGHTER_SHIP_BY_USELESSNESS = [carrier, destroyer, cruiser, dreadnought, flagship, warsun]

export function getWorstNonFighter(p: ParticipantInstance) {
  if (p.units.length === 0) {
    return undefined
  }
  return p.units.reduce((a, b) => {
    const aIndex = NON_FIGHTER_SHIP_BY_USELESSNESS.findIndex((u) => u.type === a.type)
    const bIndex = NON_FIGHTER_SHIP_BY_USELESSNESS.findIndex((u) => u.type === b.type)
    if (aIndex === -1) {
      return b
    }
    if (bIndex === -1) {
      return a
    }
    if (a < b) {
      return a
    } else {
      return b
    }
  })
}
