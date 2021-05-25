import { BattleInstance, ParticipantInstance } from '../battle-types'
import { BattleEffect } from '../battleeffect/battleEffects'
import { Place, Race } from '../enums'
import { defaultRoll, UnitInstance, UnitType, UnitWithCombat } from '../unit'

export const sol: BattleEffect[] = [
  {
    type: 'race',
    name: 'Sol flagship',
    place: Place.space,
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
    type: 'race',
    name: 'Sol infantry',
    place: Place.ground,
    transformUnit: (unit: UnitInstance) => {
      if (unit.type === UnitType.infantry) {
        unit.combat!.hit = 7
      }
      return unit
    },
  },
  {
    type: 'race-tech',
    name: 'Spec Ops II',
    place: Place.ground,
    race: Race.sol,
    unit: UnitType.infantry,
    transformUnit: (unit: UnitInstance) => {
      if (unit.type === UnitType.infantry) {
        unit.combat!.hit = 6
      }
      return unit
    },
  },
  {
    type: 'race-tech',
    name: 'Advanced Carrier II',
    place: Place.space,
    race: Race.sol,
    unit: UnitType.carrier,
    transformUnit: (unit: UnitInstance) => {
      if (unit.type === UnitType.carrier) {
        return {
          ...unit,
          sustainDamage: true,
          // really hard to determine sustain priority here... lets keep it low
          useSustainDamagePriority: 25,
        }
      }
      return unit
    },
  },
  {
    type: 'agent',
    name: 'Sol agent',
    place: Place.ground,
    onStart: (participant: ParticipantInstance, battle: BattleInstance) => {
      if (battle.place === Place.ground) {
        const infantry = participant.units.find(
          (u): u is UnitWithCombat => u.type === UnitType.infantry && u.combat !== undefined,
        )
        if (infantry) {
          infantry.combat.countBonusTmp += 1
        }
      }
    },
  },
]
