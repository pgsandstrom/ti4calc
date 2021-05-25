import { LOG } from '../battle'
import { ParticipantInstance, BattleInstance } from '../battle-types'
import { BattleEffect, registerUse } from '../battleeffect/battleEffects'
import { createUnitAndApplyEffects } from '../battleSetup'
import { Place, Race } from '../enums'
import { defaultRoll, UnitInstance, UnitType } from '../unit'

export const yin: BattleEffect[] = [
  {
    type: 'race',
    name: 'Yin flagship',
    place: Place.space,
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
              place: Place.space,
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
    place: Place.space,
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
  {
    name: 'Impulse Core',
    type: 'race-tech',
    place: Place.space,
    onStart: (
      participant: ParticipantInstance,
      _battle: BattleInstance,
      otherParticipant: ParticipantInstance,
    ) => {
      let suicideUnit = participant.units.find((u) => u.type === UnitType.destroyer)
      if (!suicideUnit) {
        suicideUnit = participant.units.find((u) => u.type === UnitType.cruiser)
      }
      if (suicideUnit) {
        otherParticipant.hitsToAssign.hitsToNonFighters += 1
      }
    },
  },
  {
    name: 'Yin agent',
    type: 'agent',
    place: Place.space,
    onDeath: (
      deadUnits: UnitInstance[],
      participant: ParticipantInstance,
      _otherParticipant: ParticipantInstance,
      battle: BattleInstance,
      isOwnUnit: boolean,
      effectName: string,
    ) => {
      if (!isOwnUnit) {
        return
      }
      const deadUnit = deadUnits.find(
        (u) => u.type === UnitType.destroyer || u.type === UnitType.cruiser,
      )
      if (!deadUnit) {
        return
      }
      const newFigher1 = createUnitAndApplyEffects(UnitType.fighter, participant, battle.place)
      const newFigher2 = createUnitAndApplyEffects(UnitType.fighter, participant, battle.place)
      participant.newUnits.push(newFigher1)
      participant.newUnits.push(newFigher2)
      registerUse(effectName, participant)
    },
    timesPerFight: 1,
  },
]
