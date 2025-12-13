import { logWrapper } from '../../util/util-log'
import { BattleInstance, ParticipantInstance } from '../battle-types'
import { BattleEffect } from '../battleeffect/battleEffects'
import { Faction, Place } from '../enums'
import { defaultRoll, UnitInstance, UnitType } from '../unit'
import { getWeakestCombatUnit } from '../unitGet'

export const nomad: BattleEffect[] = [
  {
    type: 'faction',
    name: 'Nomad flagship',
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
          afb: {
            ...defaultRoll,
            hit: 8,
            count: 3,
          },
        }
      } else {
        return unit
      }
    },
  },
  {
    type: 'faction-tech',
    name: 'Nomad flagship upgrade',
    place: Place.space,
    faction: Faction.nomad,
    unit: UnitType.flagship,
    transformUnit: (unit: UnitInstance) => {
      if (unit.type === UnitType.flagship) {
        return {
          ...unit,
          combat: {
            ...defaultRoll,
            hit: 5,
            count: 2,
          },
          afb: {
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
    name: 'Memoria I',
    description:
      "At the start of a space combat against a player other than the Nomad: During this combat, treat 1 of your non-fighter ships as if it has the SUSTAIN DAMAGE ability, combat value, and ANTI-FIGHTER BARRAGE value of the Nomad's flagship",
    type: 'promissary',
    place: Place.space,
    onStart: (
      participant: ParticipantInstance,
      _battle: BattleInstance,
      otherParticipant: ParticipantInstance,
    ) => {
      if (otherParticipant.faction === Faction.nomad) {
        return
      }
      const worstNonFighterShip = getWeakestCombatUnit(participant, Place.space, false)
      if (!worstNonFighterShip) {
        return
      }
      logWrapper(
        `${participant.side} used nomad promissary to transform ${worstNonFighterShip.type} into the Memoria I!`,
      )
      worstNonFighterShip.combat = {
        ...defaultRoll,
        hit: 7,
        count: 2,
      }
      worstNonFighterShip.afb = {
        ...defaultRoll,
        hit: 5,
        count: 3,
      }
      worstNonFighterShip.sustainDamage = true
    },
  },
  {
    name: 'Memoria II',
    description:
      "At the start of a space combat against a player other than the Nomad: During this combat, treat 1 of your non-fighter ships as if it has the SUSTAIN DAMAGE ability, combat value, and ANTI-FIGHTER BARRAGE value of the Nomad's flagship",
    type: 'promissary',
    place: Place.space,
    onStart: (
      participant: ParticipantInstance,
      _battle: BattleInstance,
      otherParticipant: ParticipantInstance,
    ) => {
      if (otherParticipant.faction === Faction.nomad) {
        return
      }
      const worstNonFighterShip = getWeakestCombatUnit(participant, Place.space, false)
      if (!worstNonFighterShip) {
        return
      }
      logWrapper(
        `${participant.side} used nomad promissary to transform ${worstNonFighterShip.type} into the Memoria II!`,
      )
      worstNonFighterShip.combat = {
        ...defaultRoll,
        hit: 5,
        countBonus: 2,
      }
      worstNonFighterShip.afb = {
        ...defaultRoll,
        hit: 5,
        countBonus: 3,
      }
      worstNonFighterShip.sustainDamage = true
    },
  },
  {
    name: 'Nomad mech sustain in space battle ability',
    type: 'faction',
    place: Place.space,
    onStart: (participant: ParticipantInstance) => {
      const mechCount = participant.units.filter((u) => u.type === UnitType.mech).length
      participant.soakHits += mechCount
    },
  },
  // TODO add agent? Would require "determine when round is worse than average" function and "redo round" function.
]
