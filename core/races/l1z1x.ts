import { doBombardment } from '../battle'
import { ParticipantInstance, BattleInstance } from '../battle-types'
import { BattleEffect } from '../battleeffect/battleEffects'
import { defaultRoll, UnitInstance, UnitType } from '../unit'

export const l1z1x: BattleEffect[] = [
  {
    type: 'race',
    name: 'L1z1x flagship',
    transformUnit: (unit: UnitInstance) => {
      if (unit.type === UnitType.flagship) {
        // TODO  add aura so it and dreadnaughts shots need to be applied to non-fighters
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
    name: 'L1z1x Harrow',
    onCombatRoundEnd: (
      participant: ParticipantInstance,
      battle: BattleInstance,
      _otherParticipant: ParticipantInstance,
    ) => {
      if (participant.side === 'attacker') {
        doBombardment(battle)
      }
    },
  },
  {
    type: 'race-tech',
    name: 'L1z1x dreadnaught upgrade',
    unit: UnitType.dreadnought,
    transformUnit: (unit: UnitInstance) => {
      // TODO test this
      if (unit.type === UnitType.dreadnought) {
        unit.combat!.hit = 4
      }
      return unit
    },
  },
]
