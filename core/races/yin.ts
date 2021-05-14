import { LOG } from '../battle'
import { ParticipantInstance, BattleInstance } from '../battle-types'
import { BattleEffect } from '../battleeffect/battleEffects'
import { Race } from '../enums'
import { defaultRoll, UnitInstance, UnitType } from '../unit'

export const yin: BattleEffect[] = [
  {
    type: 'race',
    name: 'Yin flagship',
    transformUnit: (unit: UnitInstance) => {
      if (unit.type === UnitType.flagship) {
        return {
          ...unit,
          combat: {
            ...defaultRoll,
            hit: 9,
            count: 2,
          },
          battleEffects: [
            {
              name: 'Yin flagship "kill everything" effect',
              type: 'other',
              onDeath: (
                deadUnits: UnitInstance[],
                participant: ParticipantInstance,
                otherParticipant: ParticipantInstance,
                _battle: BattleInstance,
                isOwnUnit: boolean,
              ) => {
                if (isOwnUnit && deadUnits.some((u) => u.type === UnitType.flagship)) {
                  participant.units.forEach((u) => (u.isDestroyed = true))
                  otherParticipant.units.forEach((u) => (u.isDestroyed = true))
                }
              },
            },
          ],
        }
      } else {
        return unit
      }
    },
  },
  // TODO add test that checks so all race-techs has a race... or maybe fix it with type?
  {
    name: 'Devotion',
    type: 'race-tech',
    race: Race.yin,
    onCombatRoundEnd: (
      participant: ParticipantInstance,
      _battle: BattleInstance,
      otherParticipant: ParticipantInstance,
    ) => {
      let suicideUnit = participant.units.find((u) => u.type === UnitType.destroyer)
      if (!suicideUnit) {
        suicideUnit = participant.units.find((u) => u.type === UnitType.cruiser)
      }
      if (suicideUnit) {
        suicideUnit.isDestroyed = true
        otherParticipant.hitsToAssign.hitsAssignedByEnemy += 1
        if (LOG) {
          console.log(`${participant.side} uses devotion to destroy their own ${suicideUnit.type}`)
        }
      }
    },
  },
  // TODO add impulse core
  // TODO add agent
]
