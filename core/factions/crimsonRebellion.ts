import { ParticipantInstance } from '../battle-types'
import { BattleEffect } from '../battleeffect/battleEffects'
import { Faction, Place } from '../enums'
import { defaultRoll, UnitInstance, UnitType } from '../unit'

export const crimsonRebellion: BattleEffect[] = [
  {
    type: 'faction',
    name: 'Crimson Rebellion flagship',
    place: 'both',
    transformUnit: (unit: UnitInstance) => {
      if (unit.type === UnitType.flagship) {
        return {
          ...unit,
          combat: {
            ...defaultRoll,
            hit: 5,
            count: 2,
          },
        }
      } else {
        return unit
      }
    },
  },
  {
    // TODO units should regain abilities when the flagship is destroyed. Currently they do not. If we fix so "battle aura" can affect all abilites, it should be used instead.
    name: 'Flagship active',
    description:
      "While this unit is in a system that contains an active breach, other players' units in systems with active breaches lose all their unit abilities.",
    type: 'faction-ability',
    place: 'both',
    faction: Faction.crimson_rebellion,
    transformEnemyUnit: (unit: UnitInstance, _p: ParticipantInstance) => {
      return {
        ...unit,
        afb: undefined,
        bombardment: undefined,
        spaceCannon: undefined,
        sustainDamage: false,
        planetaryShield: false,
      }
    },
  },
  {
    type: 'faction',
    name: 'Crimson Rebellion destroyers',
    place: Place.space,
    transformUnit: (unit: UnitInstance) => {
      if (unit.type === UnitType.destroyer) {
        unit.combat!.hit = 8
      }
      return unit
    },
  },
  {
    type: 'faction-tech',
    name: 'Exile II',
    place: Place.space,
    faction: Faction.crimson_rebellion,
    unit: UnitType.destroyer,
    transformUnit: (unit: UnitInstance) => {
      if (unit.type === UnitType.destroyer) {
        return {
          ...unit,
          combat: {
            ...unit.combat!,
            hit: 7,
          },
          afb: {
            ...unit.afb!,
            hit: 6,
            count: 3,
          },
        }
      }
      return unit
    },
  },
]
