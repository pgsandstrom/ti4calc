import _times from 'lodash/times'

import { Roll } from './unit'

export interface HitInfo {
  hits: number
  rollInfoList: RollInfo[]
}

export interface RollInfo {
  hitOn: number
  roll: number
}

export function getHits(roll: Roll): HitInfo {
  const count = roll.count + roll.countBonus + roll.countBonusTmp
  const hit = roll.hit - roll.hitBonus - roll.hitBonusTmp

  const rollInfo: RollInfo[] = []
  const allResults = _times(count, () => {
    let reroll = roll.reroll + roll.rerollBonus + roll.rerollBonusTmp
    let result = false
    while (!result && reroll >= 0) {
      const roll = Math.floor(Math.random() * 10 + 1)
      result = roll >= hit
      reroll -= 1
      rollInfo.push({
        roll,
        hitOn: hit,
      })
    }
    return result
  }).filter((r) => r).length

  roll.hitBonusTmp = 0
  roll.countBonusTmp = 0
  roll.rerollBonusTmp = 0

  return { hits: allResults, rollInfoList: rollInfo }
}
