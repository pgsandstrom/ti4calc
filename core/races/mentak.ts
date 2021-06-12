import { ParticipantInstance, BattleInstance } from '../battle-types'
import { BattleEffect } from '../battleeffect/battleEffects'
import { Place, Race } from '../enums'
import { getHits } from '../roll'
import { defaultRoll, UnitInstance, UnitType } from '../unit'
import { createUnitAndApplyEffects } from '../battleSetup'

export const mentak: BattleEffect[] = [
  {
    // TODO test all auras that affects enemies
    // TODO test this ship with assault cannon for enemy. It should snipe the ship and retain sustain damage
    // test this ship with with assault cannon for us. It should snipe an enemy war sun
    type: 'race',
    name: 'Mentak flagship',
    place: Place.space,
    transformUnit: (unit: UnitInstance) => {
      if (unit.type === UnitType.flagship) {
        return {
          ...unit,
          combat: {
            ...defaultRoll,
            hit: 7,
            count: 2,
          },
          preventEnemySustain: true,
        }
      } else {
        return unit
      }
    },
  },
  {
    name: 'Mentak mech',
    type: 'race',
    place: Place.ground,
    transformUnit: (u: UnitInstance) => {
      if (u.type === UnitType.mech) {
        console.log('fuck')
        return {
          ...u,
          preventEnemySustain: true,
        }
      } else {
        return u
      }
    },
  },
  {
    name: 'Ambush',
    type: 'race',
    place: Place.space,
    onStart: (
      participant: ParticipantInstance,
      _battle: BattleInstance,
      otherParticipant: ParticipantInstance,
    ) => {
      const cruisers = participant.units.filter((u) => u.type === UnitType.cruiser).slice(0, 2)
      const destroyers = participant.units
        .filter((u) => u.type === UnitType.destroyer)
        .slice(0, 2 - cruisers.length)

      const ambushShips = [...cruisers, ...destroyers]

      let hits = 0
      for (const ambushShip of ambushShips) {
        const hit = getHits({
          ...defaultRoll,
          hit: ambushShip.combat!.hit,
        })
        hits += hit.hits
      }
      otherParticipant.hitsToAssign.hits += hits
    },
  },
  {
    name: 'Mentak hero',
    description:
      "At the start of space combat that you are participating in: You may purge this card; if you do, for each other player's ship that is destroyed during this combat, place 1 ship of that type from your reinforcements in the active system.",
    type: 'race-ability',
    place: Place.space,
    race: Race.mentak,
    onDeath: (
      deadUnits: UnitInstance[],
      participant: ParticipantInstance,
      _otherParticipant: ParticipantInstance,
      battle: BattleInstance,
      isOwnUnit: boolean,
    ) => {
      if (isOwnUnit) {
        return
      }

      for (const rawUnit of deadUnits) {
        const unit = createUnitAndApplyEffects(rawUnit.type, participant, battle.place)
        participant.newUnits.push(unit)
      }
    },
  },
]
