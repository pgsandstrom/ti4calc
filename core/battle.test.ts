import _ from 'lodash'
import { getHits } from './battle'
import { Roll } from './unit'

describe('battle', () => {
  it('should calculate hits correctly', () => {
    const roll: Roll = {
      count: 1,
      countBonus: 0,
      hit: 8,
      hitBonus: 0,
      reroll: 0,
      rerollBonus: 0,
    }
    let hits = 0
    _.times(10000, () => {
      const result = getHits(roll)
      hits += result
    })
    expect(hits).toBeLessThanOrEqual(3100)
    expect(hits).toBeGreaterThanOrEqual(2900)
    console.log(`expected 3000, got ${hits}`)
  })

  it('should calculate hit bonus correctly', () => {
    const roll: Roll = {
      count: 1,
      countBonus: 0,
      hit: 8,
      hitBonus: 2,
      reroll: 0,
      rerollBonus: 0,
    }
    let hits = 0
    _.times(10000, () => {
      const result = getHits(roll)
      hits += result
    })
    expect(hits).toBeLessThanOrEqual(5100)
    expect(hits).toBeGreaterThanOrEqual(4900)
    console.log(`expected 5000, got ${hits}`)
  })

  // TODO add test for reroll, rerollBonus, count, countBonus
})
