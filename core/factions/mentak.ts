import { BattleInstance, ParticipantInstance } from '../battle-types'
import { BattleEffect } from '../battleeffect/battleEffects'
import { Faction, Place } from '../enums'
import { getHits } from '../roll'
import { createUnitAndApplyEffects, defaultRoll, UnitInstance, UnitType } from '../unit'

export const mentak: BattleEffect[] = [
  {
    // TODO test all auras that affects enemies
    // TODO test this ship with assault cannon for enemy. It should snipe the ship and retain sustain damage
    // test this ship with with assault cannon for us. It should snipe an enemy war sun
    type: 'faction',
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
    type: 'faction',
    place: Place.ground,
    transformUnit: (u: UnitInstance) => {
      if (u.type === UnitType.mech) {
        return {
          ...u,
          preventEnemySustainOnPlanet: true,
        }
      } else {
        return u
      }
    },
  },
  {
    name: 'Ambush',
    type: 'faction',
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
    type: 'faction-ability',
    place: Place.space,
    faction: Faction.mentak,
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
        // We should only be able to steal a warsun if we have the warsun upgrade. But we don't track that.
        // And I dont want to clutter the interface more for such an extreme edge case. So lets ignore it.
        const unit = createUnitAndApplyEffects(rawUnit.type, participant, battle.place, () => {})
        participant.newUnits.push(unit)
      }
    },
  },
]
