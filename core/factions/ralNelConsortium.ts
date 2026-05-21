import { BattleInstance, ParticipantInstance } from '@/core/battle-types'
import { BattleEffect, registerUse } from '@/core/battleeffect/battleEffects'
import {
  createUnitAndApplyEffects,
  defaultRoll,
  galvanizeUnit,
  UnitInstance,
  UnitType,
} from '@/core/unit'
import { logWrapper } from '@/util/util-log'

interface StructureInSpace {
  effectName: string
  unitType: UnitType
  modify: (unit: UnitInstance) => void
}

const ralNelPdsInSpace = 'Ral Nel PDS in space'
const ralNelGalvanizedPdsInSpace = 'Ral Nel galvanized PDS in space'
const ralNelSpaceDockInSpace = 'Ral Nel space dock with Lightrail Ordnance in space'
const ralNelGalvanizedSpaceDockInSpace =
  'Ral Nel galvanized space dock with Lightrail Ordnance in space'

export const ralNelConsortium: BattleEffect[] = [
  {
    type: 'faction',
    name: 'Ral Nel Consortium flagship',
    description: 'Last Dispatch: Combat 8x2, sustain damage.',
    place: 'space',
    transformUnit: (unit: UnitInstance) => {
      if (unit.type === UnitType.flagship) {
        return {
          ...unit,
          combat: {
            ...defaultRoll,
            hit: 8,
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
    name: 'Ral Nel Consortium destroyer',
    description:
      'Each of your destroyers can use the SPACE CANNON ability of one of your structures in its space area. A structure can only be used once, unless the destroyers have the Linkship upgrade.',
    place: 'space',
    transformUnit: (unit: UnitInstance) => {
      if (unit.type === UnitType.destroyer) {
        return {
          ...unit,
          battleEffects: [...(unit.battleEffects ?? []), ralNelDestroyerStructureAbility],
        }
      }
      return unit
    },
  },
  {
    type: 'faction-ability',
    name: 'Alarum reinforcements',
    description:
      'Mech ability: At the end of a round of ground combat, spawn infantry (up to 2 per round, requires a mech to be alive).',
    place: 'ground',
    faction: 'Ral Nel Consortium',
    count: true,
    onCombatRoundEnd: (
      participant: ParticipantInstance,
      battle: BattleInstance,
      _otherParticipant: ParticipantInstance,
      effectName: string,
    ) => {
      // Check if a mech is alive
      const hasMech = participant.units.some((u) => u.type === UnitType.mech && !u.isDestroyed)
      if (!hasMech) {
        return
      }

      // Get the count of infantry to spawn (up to 2 per round, limited by remaining pool)
      const remaining = participant.effects[effectName] ?? 0
      const count = Math.min(remaining, 2)
      if (count <= 0) {
        return
      }

      for (let i = 0; i < count; i++) {
        const newInfantry = createUnitAndApplyEffects(
          UnitType.infantry,
          participant,
          battle.place,
          () => {},
        )
        participant.newUnits.push(newInfantry)
      }

      // Reduce the pool by the number spawned
      participant.effects[effectName] -= count

      logWrapper(
        `${participant.side} uses Alarum mech ability to spawn ${count} infantry (${participant.effects[effectName]} remaining)`,
      )
      registerUse(effectName, participant)
    },
  },
  {
    type: 'faction-tech',
    name: 'Linkship',
    description:
      'Destroyer upgrade. Combat 8, anti-fighter barrage 6x3. Each Linkship can trigger the same structure, so a structure in your space area can fire SPACE CANNON once per Linkship.',
    place: 'both',
    faction: 'Ral Nel Consortium',
    unit: UnitType.destroyer,
    transformUnit: (unit: UnitInstance) => {
      if (unit.type === UnitType.destroyer) {
        return {
          ...unit,
          combat: {
            ...unit.combat!,
            hit: 8,
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
  produceStructureFactionAbility(
    ralNelPdsInSpace,
    'Number of PDS in your space area. Each fires SPACE CANNON 6 when used by a destroyer.',
  ),
  produceStructureFactionAbility(
    ralNelGalvanizedPdsInSpace,
    'Number of galvanized PDS in your space area. Each fires SPACE CANNON 6 (x2) when used by a destroyer.',
  ),
  produceStructureFactionAbility(
    ralNelSpaceDockInSpace,
    'Number of space docks with Lightrail Ordnance in your space area. Each fires SPACE CANNON 5 (x2) when used by a destroyer.',
  ),
  produceStructureFactionAbility(
    ralNelGalvanizedSpaceDockInSpace,
    'Number of galvanized space docks with Lightrail Ordnance in your space area. Each fires SPACE CANNON 5 (x3) when used by a destroyer.',
  ),
]

// This ability is attached to every Ral Nel destroyer, so it runs once per destroyer.
// Each destroyer uses the SPACE CANNON of the strongest structure in its space area. A normal
// destroyer claims that structure (decreasing the pool, so it can only be used once), but with the
// Linkship upgrade the same structure can be triggered by every destroyer, so it is not claimed.
const ralNelDestroyerStructureAbility: BattleEffect = {
  name: 'Ral Nel destroyer structure SPACE CANNON',
  type: 'other',
  place: 'space',
  beforeStart: (participant: ParticipantInstance, battle: BattleInstance) => {
    if (battle.place !== 'space') {
      return
    }
    const isUpgraded = participant.unitUpgrades[UnitType.destroyer] === true
    for (const structure of ralNelStructures) {
      if ((participant.effects[structure.effectName] ?? 0) <= 0) {
        continue
      }
      const unit = createUnitAndApplyEffects(
        structure.unitType,
        participant,
        battle.place,
        structure.modify,
      )
      participant.units.push(unit)
      if (!isUpgraded) {
        participant.effects[structure.effectName] -= 1
      }
      logWrapper(
        `${participant.side} destroyer uses the SPACE CANNON of a structure in its space area`,
      )
      break
    }
  },
}

// These must be ordered by strength: Strongest first
const ralNelStructures: StructureInSpace[] = [
  {
    // Galvanized space dock with Lightrail Ordnance: SPACE CANNON 5 (x2), galvanize grants the
    // extra die (x3)
    effectName: ralNelGalvanizedSpaceDockInSpace,
    unitType: UnitType.other,
    modify: (unit: UnitInstance) => {
      unit.spaceCannon = {
        ...defaultRoll,
        hit: 5,
        count: 2,
      }
      galvanizeUnit(unit)
    },
  },
  {
    // Space dock with Lightrail Ordnance: SPACE CANNON 5 (x2)
    effectName: ralNelSpaceDockInSpace,
    unitType: UnitType.other,
    modify: (unit: UnitInstance) => {
      unit.spaceCannon = {
        ...defaultRoll,
        hit: 5,
        count: 2,
      }
    },
  },
  {
    // Galvanized PDS: SPACE CANNON 6, galvanize grants the extra die (x2)
    effectName: ralNelGalvanizedPdsInSpace,
    unitType: UnitType.pds,
    modify: (unit: UnitInstance) => {
      galvanizeUnit(unit)
    },
  },
  {
    // Plain PDS: SPACE CANNON 6 (x1)
    effectName: ralNelPdsInSpace,
    unitType: UnitType.pds,
    modify: () => {},
  },
]

function produceStructureFactionAbility(name: string, description: string): BattleEffect {
  return {
    type: 'faction-ability',
    name,
    description,
    place: 'space',
    faction: 'Ral Nel Consortium',
    count: true,
  }
}
