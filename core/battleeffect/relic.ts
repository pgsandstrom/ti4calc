import _times from 'lodash/times'

import { logWrapper } from '../../util/util-log'
import { BattleInstance, ParticipantInstance } from '../battle-types'
import { Place } from '../enums'
import { createUnitAndApplyEffects, defaultRoll, UnitInstance, UnitType } from '../unit'
import { getLowestWorthNonSustainUndamagedUnit } from '../unitGet'
import { BattleEffect } from './battleEffects'

export function getRelics() {
  return [lightrailOrdnance, metaliVoidShielding, metaliVoidArmaments]
}

//Does effectively the same thing as Experimental Battlestation, just with a count.
export const lightrailOrdnance: BattleEffect = {
  name: 'Lightrail Ordnance',
  description:
    "Your space docks gain SPACE CANNON 5 (x2). You may use your space dock's SPACE CANNON against ships that are adjacent to their system.",
  type: 'relic',
  place: 'both',
  count: true,
  onStart: (
    p: ParticipantInstance,
    battle: BattleInstance,
    _op: ParticipantInstance,
    effectName: string,
  ) => {
    // Make sure only one Space Dock rolls for Space Cannon in ground combat
    let spaceCannonCount = 0
    if (battle.place === Place.ground) {
      spaceCannonCount = 2
    } else {
      spaceCannonCount = p.effects[effectName] * 2
    }
    const modify = (instance: UnitInstance) => {
      instance.spaceCannon = {
        ...defaultRoll,
        hit: 5,
        count: spaceCannonCount,
      }
    }
    const planetUnit = createUnitAndApplyEffects(UnitType.other, p, battle.place, modify)
    p.units.push(planetUnit)
  },
}

//forces the highest worth, non-fighter, undamaged ship without sustain to become damaged and reduce incoming hits by 1 (once per round)
export const metaliVoidShielding: BattleEffect = {
  name: 'Metali Void Shielding',
  description:
    'Each time hits are produced against 1 of your non-fighter ships, 1 of those ships may use SUSTAIN DAMAGE as if it had that ability.',
  type: 'relic',
  place: Place.space,
  onCombatRoundEndBeforeAssign: (
    p: ParticipantInstance,
    battle: BattleInstance,
    op: ParticipantInstance,
  ) => {
    const bestShieldingTarget = getLowestWorthNonSustainUndamagedUnit(p, battle.place, false)
    if (bestShieldingTarget && p.hitsToAssign.hits > 0) {
      bestShieldingTarget.useSustainDamagePriority = 500
      logWrapper(`${p.side} uses Metali Void Shielding to sustain ${bestShieldingTarget.type}!`)
    }
  },
  timesPerRound: 1,
}

//Does an AFB 6x3 by analogy to Experimental Battlestation (i.e., giving the planet AFB 6x3).
export const metaliVoidArmaments: BattleEffect = {
  name: 'Metali Void Armaments',
  description:
    'During the "Anti Fighter Barrage" step of space combat, you may resolve ANTI-FIGHTER BARRAGE 6 (x3) against your opponent\'s units.',
  type: 'relic',
  place: Place.space,
  onAfb: (p: ParticipantInstance, battle: BattleInstance) => {
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
