import { destroyUnit } from '@/core/battle'
import { BattleInstance, ParticipantInstance } from '@/core/battle-types'
import { BattleEffect, registerUse } from '@/core/battleeffect/battleEffects'
import { Faction, Place } from '@/core/enums'
import { defaultRoll, UnitInstance, UnitType } from '@/core/unit'
import { logWrapper } from '@/util/util-log'

export const obsidian: BattleEffect[] = [
  {
    type: 'faction',
    name: 'The Obsidian flagship',
    place: Place.space,
    transformUnit: (unit: UnitInstance) => {
      if (unit.type === UnitType.flagship) {
        return {
          ...unit,
          combat: {
            ...defaultRoll,
            hit: 5,
            count: 3,
          },
        }
      } else {
        return unit
      }
    },
  },
  {
    type: 'agent',
    name: 'Obsidian Agent',
    description:
      "When 1 of your opponent's ships is destroyed during combat, you may exhaust this card to force that opponent to destroy 1 ship of the same type in the active system, if able.",
    place: Place.space,
    timesPerFight: 1,
    onDeath: (
      deadUnits: UnitInstance[],
      _participant: ParticipantInstance,
      otherParticipant: ParticipantInstance,
      battle: BattleInstance,
      isOwnUnit: boolean,
      effectName: string,
    ) => {
      // Only trigger when enemy ships are destroyed (not own units)
      if (isOwnUnit) {
        return
      }
      if (battle.place !== Place.space) {
        return
      }

      // Try each dead ship type until we find one with a matching ship in the enemy fleet
      for (const deadShip of deadUnits) {
        if (!deadShip.isShip) {
          continue
        }

        // Find another ship of the same type in the enemy fleet
        const matchingShip = otherParticipant.units.find(
          (u) => u.type === deadShip.type && !u.isDestroyed,
        )
        if (matchingShip) {
          destroyUnit(battle, matchingShip)
          logWrapper(`Obsidian Agent forces opponent to destroy an additional ${matchingShip.type}`)
          registerUse(effectName, otherParticipant)
          break
        }
      }
    },
  },
  {
    type: 'commander',
    name: 'Obsidian Commander',
    description: 'Aroz Hollow: Apply +1 to the result of your combat rolls in The Fracture.',
    place: Place.space,
    transformUnit: (unit: UnitInstance) => {
      if (unit.combat) {
        return {
          ...unit,
          combat: {
            ...unit.combat,
            hitBonus: unit.combat.hitBonus + 1,
          },
        }
      }
      return unit
    },
  },
  {
    name: 'Asail (Obsidian)',
    description:
      'Plot Card: Apply +1 to the result of your combat rolls and ability rolls against the puppeted player.',
    type: 'faction-ability',
    place: 'both',
    faction: Faction.obsidian,
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
