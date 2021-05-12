import { OnHitEffect } from './battle-types'
import { BattleAura, BattleEffect } from './battleeffect/battleEffects'

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

  sustainDamage: boolean
  planetaryShield: boolean
  assignHitsToNonFighters?: boolean

  isShip: boolean
  isGroundForce: boolean

  useSustainDamagePriority?: number
  diePriority?: number

  // this is an effect that is only present while the unit is alive (i.e. sardakk flagship)
  // the implementation is a bit weird. We create a temporary version of the unit before firing with the aura
  // this is to make sure that we can apply complex auras, without them leaving permanent changes to the units
  aura?: BattleAura[]

  // these work like any other battle effects
  battleEffects?: BattleEffect[]

  // this is called when the units produces a hit. For example Jol-Nar flagship can use its ability here.
  // it is currently only called for combat rolls, not for unit abilities
  onHit?: OnHitEffect
}

export interface UnitInstance extends Unit {
  takenDamage: boolean
  takenDamageRound?: number
  isDestroyed: boolean
}

export interface Roll {
  hit: number
  hitBonus: number
  hitBonusTmp: number
  count: number
  countBonus: number
  countBonusTmp: number
  reroll: number
  rerollBonus: number
  rerollBonusTmp: number
}

export const defaultRoll: Roll = {
  hit: 0,
  hitBonus: 0,
  hitBonusTmp: 0,
  count: 1,
  countBonus: 0,
  countBonusTmp: 0,
  reroll: 0,
  rerollBonus: 0,
  rerollBonusTmp: 0,
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

// TODO test this
// TODO use this on more places
export function getUnitWithImproved(
  unit: UnitInstance,
  rollType: 'combat' | 'bombardment' | 'spaceCannon' | 'afb',
  how: 'hit' | 'count' | 'reroll',
  duration: 'permanent' | 'temp',
  value = 1,
): UnitInstance {
  if (unit[rollType] === undefined) {
    console.warn(`Tried to improve ${rollType} on unit ${unit.type} but failed.`)
    return unit
  }
  const bonus:
    | 'hitBonus'
    | 'hitBonusTmp'
    | 'countBonus'
    | 'countBonusTmp'
    | 'rerollBonus'
    | 'rerollBonusTmp' = `${how}Bonus${duration === 'temp' ? 'Tmp' : ''}` as const

  return {
    ...unit,
    [rollType]: {
      ...unit[rollType],
      [bonus]: unit[rollType]![bonus] + value,
    },
  }
}
