import { BattleInstance, ParticipantInstance } from '../battle-types'
import { BattleEffect } from '../battleeffect/battleEffects'
import { createUnitAndApplyEffects } from '../battleSetup'
import { Place, Race } from '../enums'
import { defaultRoll, UnitInstance, UnitType } from '../unit'

export const titansOfUl: BattleEffect[] = [
  {
    type: 'race',
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
    type: 'race',
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
    type: 'race-tech',
    name: 'Titans of Ul pds upgrade',
    place: 'both',
    race: Race.titans_of_ul,
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
    type: 'race-tech',
    name: 'Titans of Ul cruiser upgrade',
    place: Place.space,
    race: Race.titans_of_ul,
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
    onStart: (p: ParticipantInstance) => {
      p.soakHits += 1
    },
  },
  {
    type: 'general',
    description:
      'The Titans hero gives their home system planet SPACE CANNON 5 (x3) ability as if it were a unit.',
    name: 'Titans hero',
    place: 'both',
    onStart: (p: ParticipantInstance, battle: BattleInstance) => {
      // TODO maybe this will be disabled by certain effects? It should have a unique unit type
      const planetUnit = createUnitAndApplyEffects(UnitType.pds, p, battle.place)
      planetUnit.spaceCannon!.hit = 5
      planetUnit.spaceCannon!.count = 3
      planetUnit.combat = undefined
      planetUnit.planetaryShield = false
      planetUnit.sustainDamage = false
      planetUnit.isGroundForce = false
      p.units.push(planetUnit)
    },
  },
]
