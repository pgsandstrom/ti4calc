import { BattleReport, getBattleReport } from '../core'
import { Participant, Side } from '../core/battle-types'
import { getUnitMap } from '../core/battleSetup'
import { Faction, Place } from '../core/enums'
import { DO_BATTLE_X_TIMES } from '../core/index.test'
import { UnitType } from '../core/unit'
import { PartialRecord } from './util-types'

type BattleReportSide = Extract<keyof BattleReport, 'attacker' | 'defender' | 'draw'>
type BattleReportCheck = {
  side: BattleReportSide
  percentage: number
}

const RETRIES_UNTIL_FAIL = 10

export function getTestParticipant(
  side: Side,
  units: PartialRecord<UnitType, number> = {},
  faction = Faction.barony_of_letnev,
  battleEffects: Record<string, number | undefined> = {},
  unitUpgrades: PartialRecord<UnitType, boolean> = {},
  damagedUnits: PartialRecord<UnitType, number> = {},
) {
  const p: Participant = {
    faction,
    units: getUnitMap(units),
    unitUpgrades,
    damagedUnits,
    // TODO change default to true
    riskDirectHit: false,
    side,
    battleEffects,
  }
  return p
}

/**
 * If the test doesn't pass, it will incrementally increase number of simulations several times before failing
 */
export function testBattleReport(
  attacker: Participant,
  defender: Participant,
  place: Place,
  times: number,
  checks: Array<BattleReportCheck>,
) {
  let fails = 0
  let battleReport = getBattleReport(attacker, defender, place, times, undefined)

  checks.forEach((check) => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    while (true) {
      try {
        const actualNumber = battleReport[check.side]
        const expectedNumber = battleReport.numberOfRolls * check.percentage
        const failOnInvalid = fails === RETRIES_UNTIL_FAIL
        const valid = checkResult(actualNumber, expectedNumber, failOnInvalid)
        if (valid) {
          break // success!
        } else {
          fails++
          battleReport = getBattleReport(attacker, defender, place, times, battleReport)
        }
      } catch (e) {
        if (e instanceof Error) {
          throw new Error(`Failed checking ${check.side}: ${e.message}`)
        } else {
          throw e
        }
      }
    }
  })
  return battleReport
}

export function checkResult(result: number, expected: number, failOnInvalid = true): boolean {
  // the allowed diff percentage from the expected value is dependant on how small the value is
  // a very small value, like 1% win rate, must be allowed to differ with a greater percentage from the expected value
  let allowedErrorPercentage: number
  if (expected === 0) {
    allowedErrorPercentage = 0
  } else if (expected <= DO_BATTLE_X_TIMES * 0.01) {
    // for example here, if the expected outcome is 10 out of 1000, we accept numbers between 6 and 14
    allowedErrorPercentage = 0.4
  } else if (expected <= DO_BATTLE_X_TIMES * 0.02) {
    allowedErrorPercentage = 0.35
  } else if (expected <= DO_BATTLE_X_TIMES * 0.045) {
    allowedErrorPercentage = 0.25
  } else if (expected <= DO_BATTLE_X_TIMES * 0.065) {
    allowedErrorPercentage = 0.15
  } else if (expected <= DO_BATTLE_X_TIMES * 0.08) {
    allowedErrorPercentage = 0.15
  } else if (expected <= DO_BATTLE_X_TIMES * 0.132) {
    allowedErrorPercentage = 0.08
  } else {
    allowedErrorPercentage = 0.05
  }
  const uppenBound = expected + expected * allowedErrorPercentage
  const lowerBound = expected - expected * allowedErrorPercentage
  const uppenBoundValid = result <= uppenBound
  const lowerBoundValid = result >= lowerBound

  const valid = uppenBoundValid && lowerBoundValid

  if (!valid) {
    if (failOnInvalid) {
      throw new Error(
        `test failed. Expected ${result} to be between ${lowerBound} and ${uppenBound}`,
      )
    } else {
      // console.warn(`check failed, increasing number of attempts...`)
    }
  }

  return valid
}

// workaround for the "Your test suite must contain at least one test" error
test.skip('Workaround', () => undefined)
