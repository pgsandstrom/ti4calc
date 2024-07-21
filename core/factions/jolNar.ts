import { BattleInstance, EFFECT_HIGH_PRIORITY, ParticipantInstance } from '../battle-types'
import { BattleEffect, registerUse } from '../battleeffect/battleEffects'
import { Place } from '../enums'
import { HitInfo } from '../roll'
import { defaultRoll, getUnitWithImproved, UnitInstance, UnitType } from '../unit'

export const jolNar: BattleEffect[] = [
  {
    type: 'faction',
    name: 'Jol-Nar flagship',
    place: Place.space,
    priority: EFFECT_HIGH_PRIORITY,
    transformUnit: (unit: UnitInstance) => {
      if (unit.type === UnitType.flagship) {
        return {
          ...unit,
          combat: {
            ...defaultRoll,
            hit: 6,
            count: 2,
          },
          onHit: (
            _participant: ParticipantInstance,
            _battle: BattleInstance,
            _otherParticipant: ParticipantInstance,
            hitInfo: HitInfo,
          ) => {
            hitInfo.rollInfoList.forEach((rollInfo) => {
              if (rollInfo.roll > 9) {
                hitInfo.hits += 2
              }
            })
          },
        }
      } else {
        return unit
      }
    },
  },
  {
    name: 'Jol-Nar Fragile ability',
    type: 'faction',
    place: 'both',
    transformUnit: (u: UnitInstance) => {
      return getUnitWithImproved(u, 'combat', 'hit', 'permanent', -1)
    },
  },
  {
    type: 'faction',
    name: 'Jol-Nar mech',
    place: Place.ground,
    priority: EFFECT_HIGH_PRIORITY,
    transformUnit: (unit: UnitInstance) => {
      if (unit.type === UnitType.mech) {
        return {
          ...unit,
          aura: [
            {
              name: 'Jol-Nar mech aura',
              place: Place.ground,
              onCombatRoundStart: (
                auraUnits: UnitInstance[],
                p: ParticipantInstance,
                _battle: BattleInstance,
                effectName: string,
              ) => {
                for (const unit of auraUnits) {
                  if (unit.type === UnitType.infantry) {
                    unit.combat!.hitBonusTmp += 1
                  }
                }
                registerUse(effectName, p)
              },
              timesPerRound: 1,
            },
          ],
        }
      } else {
        return unit
      }
    },
  },
  {
    name: 'Jol-Nar commander',
    description: 'After you roll dice for a unit ability: You may reroll any of those dice.',
    type: 'commander',
    place: 'both',
    transformUnit: (unit) => {
      if (unit.spaceCannon) {
        unit = getUnitWithImproved(unit, 'spaceCannon', 'reroll', 'permanent')
      }
      if (unit.afb) {
        unit = getUnitWithImproved(unit, 'afb', 'reroll', 'permanent')
      }
      if (unit.bombardment) {
        unit = getUnitWithImproved(unit, 'bombardment', 'reroll', 'permanent')
      }
      return unit
    },
  },
]
