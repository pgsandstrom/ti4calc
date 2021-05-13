import { Roll } from './unit'
import _times from 'lodash/times'

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
  const result = _times(count, () => {
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

  if (roll.hitBonusTmp > 0) {
    roll.hitBonusTmp -= 1
  }
  if (roll.countBonusTmp > 0) {
    roll.countBonusTmp -= 1
  }
  if (roll.rerollBonusTmp > 0) {
    roll.rerollBonusTmp -= 1
  }

  return { hits: result, rollInfoList: rollInfo }
}
