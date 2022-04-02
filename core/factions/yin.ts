import { destroyUnit } from '../battle'
import { BattleInstance, ParticipantInstance } from '../battle-types'
import { BattleEffect, registerUse } from '../battleeffect/battleEffects'
import { LOG } from '../constant'
import { Faction, Place } from '../enums'
import { UnitInstance, UnitType, createUnitAndApplyEffects, defaultRoll } from '../unit'

export const yin: BattleEffect[] = [
  {
    type: 'faction',
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
  {
    name: 'Devotion',
    description:
      "After each space battle round, you may destroy 1 of your cruisers or destroyers in the active system to produce 1 hit and assign it to 1 of your opponent's ships in that system.",
    type: 'faction-ability',
    place: Place.space,
    faction: Faction.yin,
    onCombatRoundEnd: (
      participant: ParticipantInstance,
      battle: BattleInstance,
      otherParticipant: ParticipantInstance,
    ) => {
      let suicideUnit = participant.units.find((u) => u.type === UnitType.destroyer)
      if (!suicideUnit) {
        suicideUnit = participant.units.find((u) => u.type === UnitType.cruiser)
      }
      if (suicideUnit) {
        destroyUnit(battle, suicideUnit)
        otherParticipant.hitsToAssign.hitsAssignedByEnemy += 1
        if (LOG) {
          console.log(`${participant.side} uses devotion to destroy their own ${suicideUnit.type}`)
        }
      }
    },
  },
  {
    name: 'Impulse Core',
    description:
      "At the start of a space combat, you may destroy 1 of your cruisers or destroyers in the active system to produce 1 hit against your opponent's ships; that hit must be assigned by your opponent to 1 of their non-fighters ships if able.",
    type: 'faction-tech',
    place: Place.space,
    faction: Faction.yin,
    onStart: (
      participant: ParticipantInstance,
      battle: BattleInstance,
      otherParticipant: ParticipantInstance,
    ) => {
      let suicideUnit = participant.units.find((u) => u.type === UnitType.destroyer)
      if (!suicideUnit) {
        suicideUnit = participant.units.find((u) => u.type === UnitType.cruiser)
      }
      if (suicideUnit) {
        destroyUnit(battle, suicideUnit)
        otherParticipant.hitsToAssign.hitsToNonFighters += 1
      }
    },
  },
  {
    name: 'Yin agent',
    description:
      "After a player's destroyer or cruiser is destroyed: You may exhaust this card; if you do, that player may place up to 2 fighters from their reinforcements in that unit's system.",
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
      if (LOG) {
        console.log(
          `${participant.side} uses Yin agent to summon two fighters when a ${deadUnit.type} was destroyed`,
        )
      }
    },
    timesPerFight: 1,
  },
]
