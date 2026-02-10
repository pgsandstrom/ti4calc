import { BattleInstance, EFFECT_HIGH_PRIORITY, ParticipantInstance } from '@/core/battle-types'
import { BattleEffect } from '@/core/battleeffect/battleEffects'
import { defaultRoll, UnitInstance, UnitType, UnitWithCombat } from '@/core/unit'

export const sol: BattleEffect[] = [
  {
    type: 'faction',
    name: 'Sol flagship',
    place: 'space',
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
    place: 'ground',
    priority: EFFECT_HIGH_PRIORITY,
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
    place: 'ground',
    faction: 'Sol',
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
    place: 'space',
    faction: 'Sol',
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
    place: 'ground',
    onStart: (participant: ParticipantInstance, battle: BattleInstance) => {
      if (battle.place === 'ground') {
        const groundUnit = participant.units.find(
          (u): u is UnitWithCombat => u.isGroundForce && u.combat !== undefined,
        )
        if (groundUnit) {
          groundUnit.combat.countBonusTmp += 1
        }
      }
    },
  },
]
