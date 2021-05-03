import _ from 'lodash'
import { getHits } from './battle'
import { Roll } from './unit'

describe('battle', () => {
  it('should calculate hits correctly', () => {
    const roll: Roll = {
      count: 1,
      hit: 8,
      reroll: 0,
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
})

export {}
