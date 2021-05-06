import _ from 'lodash'
import { checkResult } from '../util/util-test'
import { getHits } from './roll'
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
    checkResult(hits, 3000)
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
    checkResult(hits, 5000)
  })

  it('should calculate count correctly', () => {
    const roll: Roll = {
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
      hits += result
    })
    checkResult(hits, 10000)
  })

  it('should calculate count bonus correctly', () => {
    const roll: Roll = {
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
      hits += result
    })
    checkResult(hits, 15000)
  })

  it('should calculate reroll correctly', () => {
    const roll: Roll = {
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
      hits += result
    })
    checkResult(hits, 7500)
  })

  it('should calculate reroll bonus correctly', () => {
    const roll: Roll = {
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
      hits += result
    })
    checkResult(hits, 8750)
  })
})
