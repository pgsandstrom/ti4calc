import { Roll } from './unit'
import _times from 'lodash/times'

// TODO fix test for tmp stuff
export function getHits(roll: Roll): number {
  const count = roll.count + roll.countBonus + roll.countBonusTmp
  const hit = roll.hit - roll.hitBonus - roll.hitBonusTmp

  const result = _times(count, () => {
    let reroll = roll.reroll + roll.rerollBonus + roll.rerollBonusTmp
    let result = false
    while (!result && reroll >= 0) {
      result = Math.random() * 10 + 1 > hit
      reroll -= 1
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

  return result
}
