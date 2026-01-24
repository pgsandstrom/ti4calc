import { BattleInstance, ParticipantInstance } from '@/core/battle-types'
import { BattleEffect, registerUse } from '@/core/battleeffect/battleEffects'
import { Faction, Place } from '@/core/enums'
import { createUnitAndApplyEffects, defaultRoll, UnitInstance, UnitType } from '@/core/unit'
import { logWrapper } from '@/util/util-log'

export const ralNelConsortium: BattleEffect[] = [
  {
    type: 'faction',
    name: 'Ral Nel Consortium flagship',
    description: 'Last Dispatch: Combat 8x2, sustain damage.',
    place: Place.space,
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
    type: 'faction-ability',
    name: 'Alarum reinforcements',
    description:
      'Mech ability: At the end of a round of ground combat, spawn infantry (up to 2 per round, requires a mech to be alive).',
    place: Place.ground,
    faction: Faction.ral_nel_consortium,
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
]
