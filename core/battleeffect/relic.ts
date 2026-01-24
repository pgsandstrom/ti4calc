import _times from 'lodash/times'

import {
  BattleInstance,
  EFFECT_HIGH_PRIORITY,
  ParticipantInstance,
  Place,
} from '@/core/battle-types'
import { BattleEffect } from '@/core/battleeffect/battleEffects'
import { createUnitAndApplyEffects, defaultRoll, UnitInstance, UnitType } from '@/core/unit'
import { getLowestWorthNonSustainUndamagedUnit } from '@/core/unitGet'
import { logWrapper } from '@/util/util-log'

export function getRelics() {
  return [lightrailOrdnance, metaliVoidShielding, metaliVoidArmaments, heartOfIxth]
}

// Does effectively the same thing as Experimental Battlestation, just with a count.
export const lightrailOrdnance: BattleEffect = {
  name: 'Lightrail Ordnance',
  description:
    "Your space docks gain SPACE CANNON 5 (x2). You may use your space dock's SPACE CANNON against ships that are adjacent to their system.",
  type: 'relic',
  place: 'both',
  count: true,
  beforeStart: (
    p: ParticipantInstance,
    battle: BattleInstance,
    _op: ParticipantInstance,
    effectName: string,
  ) => {
    // Make sure only one Space Dock rolls for Space Cannon in ground combat
    let spacedockCount = 0
    if (battle.place === 'ground') {
      spacedockCount = 1
    } else {
      spacedockCount = p.effects[effectName]
    }
    const modify = (instance: UnitInstance) => {
      instance.spaceCannon = {
        ...defaultRoll,
        hit: 5,
        count: 2,
      }
    }
    _times(spacedockCount, () => {
      const planetUnit = createUnitAndApplyEffects(UnitType.other, p, battle.place, modify)
      p.units.push(planetUnit)
    })
  },
}

// Generously grants the lowest worth, non-fighter, undamaged ship without sustain a very high Sustain Damage priority to force the battle code to sustain it.
export const metaliVoidShielding: BattleEffect = {
  name: 'Metali Void Shielding',
  description:
    'Each time hits are produced against 1 of your non-fighter ships, 1 of those ships may use SUSTAIN DAMAGE as if it had that ability.',
  type: 'relic',
  place: 'space',
  onCombatRoundEndBeforeAssign: (
    p: ParticipantInstance,
    battle: BattleInstance,
    _op: ParticipantInstance,
  ) => {
    const bestShieldingTarget = getLowestWorthNonSustainUndamagedUnit(p, battle.place, false)
    if (bestShieldingTarget && p.hitsToAssign.hits > 0) {
      bestShieldingTarget.useSustainDamagePriority = 500
      bestShieldingTarget.sustainDamage = true
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
  place: 'space',
  onAfb: (p: ParticipantInstance, battle: BattleInstance) => {
    const modify = (instance: UnitInstance) => {
      instance.afb = {
        ...defaultRoll,
        hit: 6,
        count: 3,
      }
    }

    const planetUnit = createUnitAndApplyEffects(UnitType.nonunit, p, battle.place, modify)
    p.units.push(planetUnit)
  },
  priority: EFFECT_HIGH_PRIORITY,
}

// Modifies dice rolls by +1 for the owner and -1 for the opponent
export const heartOfIxth: BattleEffect = {
  name: 'Heart of Ixth',
  description:
    'After any die is rolled, you may exhaust this card to add or subtract 1 from its results.',
  type: 'relic',
  place: 'both',
  transformUnit: (unit: UnitInstance, _p: ParticipantInstance, _place: Place) => {
    // Add +1 to hit bonus for friendly units' combat, bombardment, space cannon, and AFB rolls
    const newUnit = { ...unit }
    if (unit.combat) {
      newUnit.combat = {
        ...unit.combat,
        hitBonusTmp: unit.combat.hitBonusTmp + 1,
      }
    }
    if (unit.bombardment) {
      newUnit.bombardment = {
        ...unit.bombardment,
        hitBonusTmp: unit.bombardment.hitBonusTmp + 1,
      }
    }
    if (unit.spaceCannon) {
      newUnit.spaceCannon = {
        ...unit.spaceCannon,
        hitBonusTmp: unit.spaceCannon.hitBonusTmp + 1,
      }
    }
    if (unit.afb) {
      newUnit.afb = {
        ...unit.afb,
        hitBonusTmp: unit.afb.hitBonusTmp + 1,
      }
    }
    return newUnit
  },
  transformEnemyUnit: (unit: UnitInstance, _p: ParticipantInstance, _place: Place) => {
    // Modify enemy combat, bombardment, space cannon, and AFB rolls by -1 (making them worse)
    const newUnit = { ...unit }
    if (unit.combat) {
      newUnit.combat = {
        ...unit.combat,
        hitBonusTmp: unit.combat.hitBonusTmp - 1, // Subtracting bonus makes it harder to hit
      }
    }
    if (unit.bombardment) {
      newUnit.bombardment = {
        ...unit.bombardment,
        hitBonusTmp: unit.bombardment.hitBonusTmp - 1,
      }
    }
    if (unit.spaceCannon) {
      newUnit.spaceCannon = {
        ...unit.spaceCannon,
        hitBonusTmp: unit.spaceCannon.hitBonusTmp - 1,
      }
    }
    if (unit.afb) {
      newUnit.afb = {
        ...unit.afb,
        hitBonusTmp: unit.afb.hitBonusTmp - 1,
      }
    }
    return newUnit
  },
}
