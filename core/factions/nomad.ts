import { BattleInstance, EFFECT_HIGH_PRIORITY, ParticipantInstance } from '@/core/battle-types'
import { BattleEffect } from '@/core/battleeffect/battleEffects'
import { defaultRoll, UnitInstance, UnitType } from '@/core/unit'
import { getWeakestCombatUnit } from '@/core/unitGet'
import { logWrapper } from '@/util/util-log'

export const nomad: BattleEffect[] = [
  {
    type: 'faction',
    name: 'Nomad flagship',
    place: 'space',
    priority: EFFECT_HIGH_PRIORITY,
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
    place: 'space',
    faction: 'Nomad',
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
    place: 'space',
    onStart: (
      participant: ParticipantInstance,
      _battle: BattleInstance,
      otherParticipant: ParticipantInstance,
    ) => {
      if (otherParticipant.faction === 'Nomad') {
        return
      }
      const worstNonFighterShip = getWeakestCombatUnit(participant, 'space', false)
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
    place: 'space',
    onStart: (
      participant: ParticipantInstance,
      _battle: BattleInstance,
      otherParticipant: ParticipantInstance,
    ) => {
      if (otherParticipant.faction === 'Nomad') {
        return
      }
      const worstNonFighterShip = getWeakestCombatUnit(participant, 'space', false)
      if (!worstNonFighterShip) {
        return
      }
      logWrapper(
        `${participant.side} used nomad promissary to transform ${worstNonFighterShip.type} into the Memoria II!`,
      )
      worstNonFighterShip.combat = {
        ...defaultRoll,
        hit: 5,
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
    name: 'Nomad mech sustain in space battle ability',
    type: 'faction',
    place: 'space',
    onStart: (participant: ParticipantInstance) => {
      const mechCount = participant.units.filter((u) => u.type === UnitType.mech).length
      participant.soakHits += mechCount
    },
  },
  // TODO add agent? Would require "determine when round is worse than average" function and "redo round" function.
]
