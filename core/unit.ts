export enum UnitType {
  // pds = 'pds',
  cruiser = 'cruiser',
  destroyer = 'destroyer',
}

export interface Unit {
  type: UnitType
  // cost: number
  combat?: Roll
  // move: number
  // capacity: number

  bombardment?: Roll
  afb?: Roll
  spaceCannon?: Roll

  sustainDamage: boolean
  planetaryShield: boolean
  // production:number

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

  diePriority: 50,
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

  diePriority: 50,
}

// const pds: Readonly<Unit> = {
//   spaceCannon: {
//     hit: 6,
//     count: 1,
//   },

//   sustainDamage: false,
//   planetaryShield: true,

//   isGroundForce: false,
//   isShip: false,
// }

export const UNIT_MAP: Record<UnitType, Readonly<Unit>> = {
  cruiser,
  destroyer,
  // pds,
}
