import { BattleInstance, ParticipantInstance } from '../battle-types'
import { BattleEffect } from '../battleeffect/battleEffects'
import { Faction, Place } from '../enums'
import { createUnitAndApplyEffects, defaultRoll, UnitInstance, UnitType } from '../unit'

export const titansOfUl: BattleEffect[] = [
  {
    type: 'faction',
    name: 'Titans of Ul flagship',
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
        }
      } else {
        return unit
      }
    },
  },
  // TODO add some tests...
  {
    type: 'faction',
    name: 'Titans of Ul pds',
    place: 'both',
    transformUnit: (unit: UnitInstance) => {
      if (unit.type === UnitType.pds) {
        return {
          ...unit,
          combat: {
            ...defaultRoll,
            hit: 7,
          },
          isGroundForce: true,
          sustainDamage: true,
          useSustainDamagePriority: 20,
          diePriority: 20,
        }
      } else {
        return unit
      }
    },
  },
  {
    type: 'faction-tech',
    name: 'Titans of Ul pds upgrade',
    place: 'both',
    faction: Faction.titans_of_ul,
    unit: UnitType.pds,
    transformUnit: (unit: UnitInstance) => {
      if (unit.type === UnitType.pds) {
        return {
          ...unit,
          combat: {
            ...unit.combat!,
            hit: 6,
          },
          spaceCannon: {
            ...unit.spaceCannon!,
            hit: 5,
          },
          isGroundForce: true,
          sustainDamage: true,
          useSustainDamagePriority: 20,
          diePriority: 20,
        }
      } else {
        return unit
      }
    },
  },
  {
    type: 'faction-tech',
    name: 'Titans of Ul cruiser upgrade',
    place: Place.space,
    faction: Faction.titans_of_ul,
    unit: UnitType.cruiser,
    transformUnit: (unit: UnitInstance) => {
      if (unit.type === UnitType.cruiser) {
        return {
          ...unit,
          combat: {
            ...unit.combat!,
            hit: 6,
          },
          useSustainDamagePriority: 200,
          sustainDamage: true,
        }
      } else {
        return unit
      }
    },
  },
  {
    type: 'agent',
    description:
      'When a hit is produced against a unit: You may exhaust this card to cancel that hit.',
    name: 'Titans agent',
    place: 'both',
    beforeStart: (p: ParticipantInstance) => {
      p.soakHits += 1
    },
  },
  {
    type: 'general',
    description:
      'The Titans hero gives their home system planet SPACE CANNON 5 (x3) ability as if it were a unit.',
    name: 'Titans hero',
    place: 'both',
    beforeStart: (p: ParticipantInstance, battle: BattleInstance) => {
      const modify = (instance: UnitInstance) => {
        instance.spaceCannon = {
          ...defaultRoll,
          hit: 5,
          count: 3,
        }
      }
      const planetUnit = createUnitAndApplyEffects(UnitType.other, p, battle.place, modify)
      p.units.push(planetUnit)
    },
  },
]
