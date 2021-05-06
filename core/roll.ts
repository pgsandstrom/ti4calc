import { Roll } from './unit'
import _times from 'lodash/times'

export function getHits(roll: Roll): number {
  const count = roll.count + roll.countBonus
  const hit = roll.hit - roll.hitBonus

  return _times(count, () => {
    let reroll = roll.reroll + roll.rerollBonus
    let result = false
    while (!result && reroll >= 0) {
      result = Math.random() * 10 + 1 > hit
      reroll -= 1
    }
    return result
  }).filter((r) => r).length
}
