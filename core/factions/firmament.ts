import { ParticipantInstance } from '@/core/battle-types'
import { BattleEffect } from '@/core/battleeffect/battleEffects'
import { defaultRoll, UnitInstance, UnitType } from '@/core/unit'
import { logWrapper } from '@/util/util-log'

export const firmament: BattleEffect[] = [
  {
    type: 'faction',
    name: 'The Firmament flagship',
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
    name: "Heaven's Eye",
    description:
      'When this unit is in a combat against a player you have puppeted, this ship is repaired at the start of each combat round.',
    type: 'faction-ability',
    place: 'space',
    faction: 'Firmament',
    onCombatRound: (participant: ParticipantInstance) => {
      participant.units.forEach((unit) => {
        if (unit.type === UnitType.flagship && unit.takenDamage) {
          logWrapper(`Heaven's Eye repaired flashship of ${participant.side}`)
          unit.takenDamage = false
        }
      })
    },
  },
  {
    type: 'agent',
    name: 'Firmament Agent',
    description: 'When your ships move, other players cannot use SPACE CANNON against your ships.',
    place: 'space',
    transformEnemyUnit: (unit: UnitInstance) => {
      return {
        ...unit,
        spaceCannon: undefined,
      }
    },
  },
  {
    name: 'Asail (Firmament)',
    description:
      'Plot Card: Apply +1 to the result of your combat rolls and ability rolls against the puppeted player.',
    type: 'faction-ability',
    place: 'both',
    faction: 'Firmament',
    transformUnit: (unit: UnitInstance) => {
      if (unit.combat) {
        unit = {
          ...unit,
          combat: {
            ...unit.combat,
            hitBonus: unit.combat.hitBonus + 1,
          },
        }
      }
      if (unit.bombardment) {
        unit = {
          ...unit,
          bombardment: {
            ...unit.bombardment,
            hitBonus: unit.bombardment.hitBonus + 1,
          },
        }
      }
      if (unit.spaceCannon) {
        unit = {
          ...unit,
          spaceCannon: {
            ...unit.spaceCannon,
            hitBonus: unit.spaceCannon.hitBonus + 1,
          },
        }
      }
      if (unit.afb) {
        unit = {
          ...unit,
          afb: {
            ...unit.afb,
            hitBonus: unit.afb.hitBonus + 1,
          },
        }
      }
      return unit
    },
  },
]
