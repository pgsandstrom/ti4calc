export enum UnitTypes {
  // pds = 'pds',
  cruiser = 'cruiser',
  destroyer = 'destroyer',
}

export interface Unit {
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
  hit: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  count: number
}

const cruiser: Readonly<Unit> = {
  combat: {
    hit: 7,
    count: 1,
  },

  sustainDamage: false,
  planetaryShield: false,

  isGroundForce: false,
  isShip: true,

  diePriority: 50,
}

const destroyer: Readonly<Unit> = {
  combat: {
    hit: 9,
    count: 1,
  },

  afb: {
    hit: 9,
    count: 2,
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

export const UNIT_MAP: Record<UnitTypes, Readonly<Unit>> = {
  cruiser,
  destroyer,
  // pds,
}
