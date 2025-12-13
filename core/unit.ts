import _cloneDeep from 'lodash/cloneDeep'

import { logWrapper } from '../util/util-log'
import { OnHitEffect, ParticipantInstance } from './battle-types'
import { BattleAura, BattleEffect } from './battleeffect/battleEffects'
import { Place } from './enums'

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
  other = 'other', // Used by for example experimental battle station and titans hero
  nonunit = 'nonunit', // Used when an ability is used without being tied to a unit, for example Metali Void Armaments.
}

export interface Unit {
  type: UnitType
  combat?: Roll

  bombardment?: Roll
  afb?: Roll
  spaceCannon?: Roll

  sustainDamage: boolean
  immuneToDirectHit?: boolean
  planetaryShield: boolean
  assignHitsToNonFighters?: boolean
  preventEnemySustain?: boolean
  preventEnemySustainOnPlanet?: boolean

  isShip: boolean
  isGroundForce: boolean

  useSustainDamagePriority?: number
  diePriority?: number

  // this is an effect that is only present while the unit is alive (i.e. sardakk flagship)
  // the battleaura implementation is currently a bit weird. We create a temporary version of the unit before firing with the aura
  // this is to make sure that we can apply complex auras, without them leaving permanent changes to the units
  // This means that auras can ONLY do things that affect attack!
  aura?: BattleAura[]

  // these work like any other battle effects. But remember, they execute ONCE PER UNIT that has the ability!
  battleEffects?: BattleEffect[]

  // this is called when the units produces a hit. For example Jol-Nar flagship can use its ability here.
  // it is currently only called for combat rolls, not for unit abilities
  onHit?: OnHitEffect
}

export interface UnitInstance extends Unit {
  takenDamage: boolean
  usedSustain: boolean
  takenDamageRound?: number
  isDestroyed: boolean
}

export interface UnitWithCombat extends UnitInstance {
  combat: Roll
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

  diePriority: 60,
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
  useSustainDamagePriority: 20,
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
  useSustainDamagePriority: 10,

  battleEffects: [
    {
      name: 'warsun remove planetary shield',
      type: 'other',
      place: Place.ground,
      transformEnemyUnit: (u: UnitInstance) => {
        return {
          ...u,
          planetaryShield: false,
        }
      },
    },
  ],
}

const other: Readonly<Unit> = {
  type: UnitType.other,

  sustainDamage: false,
  planetaryShield: false,

  isGroundForce: false,
  isShip: false,
}

const nonunit: Readonly<Unit> = {
  type: UnitType.nonunit,

  sustainDamage: false,
  planetaryShield: false,

  isGroundForce: false,
  isShip: false,
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
  other,
  nonunit,
}

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
      [bonus]: unit[rollType][bonus] + value,
    },
  }
}

export function createUnit(type: UnitType): UnitInstance {
  const unit = _cloneDeep(UNIT_MAP[type])
  const unitInstance: UnitInstance = {
    ...unit,
    takenDamage: false,
    isDestroyed: false,
    usedSustain: false,
  }
  return unitInstance
}

/**
 * This function takes a `modify` function and returns `Readonly` since it will apply battle effects to the
 * unit, and all modifications needs to be done BEFORE battle effects.
 * So if you want to modify the unit, do it in the `modify` function.
 * `Readonly` is only to prevent accidental modification directly after using this function.
 */
export function createUnitAndApplyEffects(
  type: UnitType,
  participant: ParticipantInstance,
  place: Place,
  modify: (instance: UnitInstance) => void,
): Readonly<UnitInstance> {
  let unit = createUnit(type)
  modify(unit)

  participant.allUnitTransform.forEach((effect) => {
    unit = effect(unit, participant, place, effect.name)
  })
  logWrapper(`${participant.side} created a new unit: ${unit.type}`)
  return unit
}
