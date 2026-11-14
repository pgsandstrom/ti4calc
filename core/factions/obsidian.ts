import { destroyUnit } from "@/core/battle"
import { BattleInstance, ParticipantInstance } from "@/core/battle-types"
import { BattleEffect, registerUse } from "@/core/battleeffect/battleEffects"
import { defaultRoll, UnitInstance, UnitType } from "@/core/unit"
import { getUnits } from "@/core/unitGet"
import { logWrapper } from "@/util/util-log"

export const obsidian: BattleEffect[] = [
  {
    type: "faction",
    name: "The Obsidian flagship",
    place: "space",
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
    type: "agent",
    name: "Obsidian Agent",
    description:
      "When a player's ship is destroyed during any combat: You may exhaust this card; if you do, that player's opponent must destroy 1 of their ships of the same type in the active system.",
    place: "space",
    timesPerFight: 1,
    onDeath: (
      deadUnits: UnitInstance[],
      participant: ParticipantInstance,
      otherParticipant: ParticipantInstance,
      battle: BattleInstance,
      isOwnUnit: boolean,
      effectName: string,
    ) => {
      if (!isOwnUnit) {
        return
      }

      // Try the most valuable dead ship type first
      const deadShips = deadUnits
        .filter((u) => u.isShip)
        .toSorted((a, b) => (a.diePriority ?? 0) - (b.diePriority ?? 0))

      for (const deadShip of deadShips) {
        // The opponent chooses which ship to destroy, so they will pick a damaged one if possible
        const matchingShips = getUnits(otherParticipant, "space", true).filter(
          (u) => u.type === deadShip.type,
        )
        const matchingShip = matchingShips.find((u) => u.takenDamage) ?? matchingShips.at(0)
        if (matchingShip) {
          registerUse(effectName, participant)
          logWrapper(`Obsidian Agent forces opponent to destroy a ${matchingShip.type}`)
          destroyUnit(battle, matchingShip)
          break
        }
      }
    },
  },
  {
    type: "commander",
    name: "Obsidian Commander",
    description: "Aroz Hollow: Apply +1 to the result of your combat rolls in The Fracture.",
    place: "space",
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
    name: "Asail (Obsidian)",
    description:
      "Plot Card: Apply +1 to the result of your combat rolls and ability rolls against the puppeted player.",
    type: "faction-ability",
    place: "both",
    faction: "Obsidian",
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
