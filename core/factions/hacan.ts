import { BattleInstance, OnHitEffect, ParticipantInstance } from '../battle-types'
import { BattleEffect } from '../battleeffect/battleEffects'
import { Faction, Place } from '../enums'
import { HitInfo } from '../roll'
import { defaultRoll, UnitInstance, UnitType } from '../unit'

const hacanTradeGoods = 'Hacan flagship trade goods'

export const hacan: BattleEffect[] = [
  {
    type: 'faction',
    name: 'Hacan flagship',
    place: Place.space,
    transformUnit: (unit: UnitInstance) => {
      if (unit.type === UnitType.flagship) {
        const getNewOnHit = (oldOnHit?: OnHitEffect) => {
          const onHit: OnHitEffect = (
            participant: ParticipantInstance,
            battle: BattleInstance,
            otherParticipant: ParticipantInstance,
            hitInfo: HitInfo,
          ) => {
            if (oldOnHit) {
              oldOnHit(participant, battle, otherParticipant, hitInfo)
            }
            for (const rollInfo of hitInfo.rollInfoList) {
              if (
                rollInfo.roll + 1 === rollInfo.hitOn &&
                participant.effects[hacanTradeGoods] > 0
              ) {
                rollInfo.roll += 1
                hitInfo.hits += 1
                participant.effects[hacanTradeGoods] -= 1
              }
            }
          }
          return onHit
        }

        return {
          ...unit,
          combat: {
            ...defaultRoll,
            hit: 7,
            count: 2,
          },
          aura: [
            {
              name: 'Hacan flagship aura',
              place: Place.space,
              transformUnit: (auraUnit: UnitInstance, _participant: ParticipantInstance) => {
                // our aura gives all friendly units an onHit-listener. Neat solution, right?
                const newOnHit = getNewOnHit(auraUnit.onHit)
                return { ...auraUnit, onHit: newOnHit }
              },
            },
          ],
        }
      } else {
        return unit
      }
    },
  },
  {
    name: hacanTradeGoods,
    description:
      'Trade goods to be used by flagship. Hacan flagship text: After you roll a die during a space combat in this system, you may spend 1 trade good to apply +1 to the result.',
    type: 'faction-ability',
    place: Place.space,
    faction: Faction.hacan,
    count: true,
  },
]
