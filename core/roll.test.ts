import _, { cloneDeep } from 'lodash'

import { checkResult } from '../util/util.test'
import { getHits } from './roll'
import { defaultRoll, Roll } from './unit'

describe('battle', () => {
  it('should calculate hits correctly', () => {
    const roll: Roll = {
      ...defaultRoll,
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
      hits += result.hits
    })
    checkResult(hits, 3000)
  })

  it('should calculate hit bonus correctly', () => {
    const roll: Roll = {
      ...defaultRoll,
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
      hits += result.hits
    })
    checkResult(hits, 5000)
  })

  it('should calculate temporary hit bonus correctly', () => {
    const originalRoll: Roll = {
      ...defaultRoll,
      hit: 6,
      hitBonusTmp: 1,
    }
    let hits = 0
    const rollUsingUpTemporary = cloneDeep(originalRoll)
    _.times(10000, () => {
      const result = getHits(rollUsingUpTemporary)
      hits += result.hits
    })
    checkResult(hits, 5000)

    hits = 0
    _.times(10000, () => {
      const rollKeepingTemporary = cloneDeep(originalRoll)
      const result = getHits(rollKeepingTemporary)
      hits += result.hits
    })
    checkResult(hits, 6000)
  })

  it('should calculate count correctly', () => {
    const roll: Roll = {
      ...defaultRoll,
      count: 2,
      countBonus: 0,
      hit: 6,
      hitBonus: 0,
      reroll: 0,
      rerollBonus: 0,
    }
    let hits = 0
    _.times(10000, () => {
      const result = getHits(roll)
      hits += result.hits
    })
    checkResult(hits, 10000)
  })

  it('should calculate count bonus correctly', () => {
    const roll: Roll = {
      ...defaultRoll,
      count: 2,
      countBonus: 1,
      hit: 6,
      hitBonus: 0,
      reroll: 0,
      rerollBonus: 0,
    }
    let hits = 0
    _.times(10000, () => {
      const result = getHits(roll)
      hits += result.hits
    })
    checkResult(hits, 15000)
  })

  it('should calculate reroll correctly', () => {
    const roll: Roll = {
      ...defaultRoll,
      count: 1,
      countBonus: 0,
      hit: 6,
      hitBonus: 0,
      reroll: 1,
      rerollBonus: 0,
    }
    let hits = 0
    _.times(10000, () => {
      const result = getHits(roll)
      hits += result.hits
    })
    checkResult(hits, 7500)
  })

  it('should calculate reroll bonus correctly', () => {
    const roll: Roll = {
      ...defaultRoll,
      count: 1,
      countBonus: 0,
      hit: 6,
      hitBonus: 0,
      reroll: 1,
      rerollBonus: 1,
    }
    let hits = 0
    _.times(10000, () => {
      const result = getHits(roll)
      hits += result.hits
    })
    checkResult(hits, 8750)
  })
})
