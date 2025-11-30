import _times from 'lodash/times'

import { logWrapper } from '../../util/util-log'
import { destroyUnit, getOtherParticipant } from '../battle'
import { BattleInstance, EFFECT_LOW_PRIORITY, ParticipantInstance } from '../battle-types'
import { Place } from '../enums'
import { getHits } from '../roll'
import {
  createUnitAndApplyEffects,
  defaultRoll,
  getUnitWithImproved,
  Roll,
  UnitInstance,
  UnitType,
} from '../unit'
import { doesUnitFitPlace, getLowestWorthUnit } from '../unitGet'
import { BattleEffect, registerUse } from './battleEffects'

export function getRelics() {
  return [
    lightrailOrdnance,
    metaliVoidArmaments
  ]
}

//Does effectively the same thing as Experimental Battlestation, but has a count. Hopefully it works?
export const lightrailOrdnance: BattleEffect = {
  name: 'Lightrail Ordnance',
  description:
    'Your space docks gain SPSACE CANNON 5 (x2). You may use your space dock\'s SPACE CANNON against ships that are adjacent to their system.',
  type: 'relic',
  place: Place.space,
  count: true,
  onStart: (p: ParticipantInstance, battle: BattleInstance) => {
    const modify = (instance: UnitInstance) => {
      instance.spaceCannon = {
        ...defaultRoll,
        hit: 5,
        count: 2,
      }
    }

    const planetUnit = createUnitAndApplyEffects(UnitType.other, p, battle.place, modify)
    p.units.push(planetUnit)
  },
}

//Does an AFB 6x3 by analogy to Experimental Battlestation (i.e., giving the planet AFB 6x3).
export const metaliVoidArmaments: BattleEffect = {
  name: 'Metali Void Armaments',
  description:
    'During the "Anti Fighter Barrage" step of space combat, you may resolve ANTI-FIGHTER BARRAGE 6 (x3) against your opponent\'s units.',
  type: 'relic',
  place: Place.space,
  onStart: (p: ParticipantInstance, battle: BattleInstance) => {
    const modify = (instance: UnitInstance) => {
      instance.afb = {
        ...defaultRoll,
        hit: 6,
        count: 3,
      }
    }

    const planetUnit = createUnitAndApplyEffects(UnitType.other, p, battle.place, modify)
    p.units.push(planetUnit)
  },
}
