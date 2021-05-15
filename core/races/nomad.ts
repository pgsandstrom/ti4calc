import { ParticipantInstance } from '../battle-types'
import { BattleEffect } from '../battleeffect/battleEffects'
import { Place } from '../enums'
import { defaultRoll, UnitInstance, UnitType } from '../unit'
import { getWorstNonFighterShip } from '../unitGet'

export const nomad: BattleEffect[] = [
  {
    type: 'race',
    name: 'Nomad flagship',
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
    type: 'race-tech',
    name: 'Nomad flagship upgrade',
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
    type: 'promissary',
    place: Place.space,
    onStart: (participant: ParticipantInstance) => {
      const worstNonFighterShip = getWorstNonFighterShip(participant)
      if (!worstNonFighterShip) {
        return
      }
      worstNonFighterShip.combat = {
        ...defaultRoll,
        hit: 7,
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
    name: 'Memoria II',
    type: 'promissary',
    place: Place.space,
    onStart: (participant: ParticipantInstance) => {
      const worstNonFighterShip = getWorstNonFighterShip(participant)
      if (!worstNonFighterShip) {
        return
      }
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
    type: 'race',
    onStart: (participant: ParticipantInstance) => {
      const mechCount = participant.units.filter((u) => u.type === UnitType.mech).length
      participant.soakHits += mechCount
    },
  },
  // TODO add agent? Would require "determine when round is worse than average" function and "redo round" function.
]
