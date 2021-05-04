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

  isShip: boolean
  isGroundForce: boolean

  useSustainDamagePriority?: number
  diePriority?: number
}

export interface UnitInstance extends Unit {
  takenDamage: boolean
  isDestroyed: boolean
}

export interface Roll {
  hit: number
  count: number
  reroll: number
}

const carrier: Readonly<Unit> = {
  type: UnitType.carrier,

  combat: {
    hit: 9,
    count: 1,
    reroll: 0,
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
    hit: 7,
    count: 1,
    reroll: 0,
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
    hit: 9,
    count: 1,
    reroll: 0,
  },

  afb: {
    hit: 9,
    count: 2,
    reroll: 0,
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
    hit: 5,
    count: 1,
    reroll: 0,
  },

  bombardment: {
    hit: 5,
    count: 1,
    reroll: 0,
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
    hit: 9,
    count: 1,
    reroll: 0,
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
    hit: 8,
    count: 1,
    reroll: 0,
  },

  sustainDamage: false,
  planetaryShield: false,

  isGroundForce: true,
  isShip: false,

  diePriority: 80,
}

const mech: Readonly<Unit> = {
  type: UnitType.infantry,

  combat: {
    hit: 6,
    count: 1,
    reroll: 0,
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
    hit: 6,
    count: 1,
    reroll: 0,
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
    hit: 3,
    count: 3,
    reroll: 0,
  },

  bombardment: {
    hit: 3,
    count: 3,
    reroll: 0,
  },

  sustainDamage: true,
  planetaryShield: false,

  isGroundForce: false,
  isShip: true,

  diePriority: 10,
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
