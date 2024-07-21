import { BattleInstance, ParticipantInstance } from '../battle-types'
import { BattleEffect } from '../battleeffect/battleEffects'
import { Faction, Place } from '../enums'
import { defaultRoll, UnitInstance, UnitType, UnitWithCombat } from '../unit'

export const sol: BattleEffect[] = [
  {
    type: 'faction',
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
    type: 'faction',
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
    type: 'faction-tech',
    name: 'Spec Ops II',
    place: Place.ground,
    faction: Faction.sol,
    unit: UnitType.infantry,
    transformUnit: (unit: UnitInstance) => {
      if (unit.type === UnitType.infantry) {
        unit.combat!.hit = 6
      }
      return unit
    },
  },
  {
    type: 'faction-tech',
    name: 'Advanced Carrier II',
    place: Place.space,
    faction: Faction.sol,
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
    description:
      'At the start of a ground combat round: You may exhaust this card to choose 1 ground force in the active system; that ground force rolls 1 additional die during that combat round.',
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
