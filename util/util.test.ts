import { Participant, Side } from '../core/battle-types'
import { getUnitMap } from '../core/battleSetup'
import { Race } from '../core/enums'
import { DO_BATTLE_X_TIMES } from '../core/index.test'
import { UnitType } from '../core/unit'
import { PartialRecord } from './util-types'

export function getTestParticipant(
  side: Side,
  units: PartialRecord<UnitType, number> = {},
  race = Race.barony_of_letnev,
  battleEffects: Record<string, number | undefined> = {},
  unitUpgrades: PartialRecord<UnitType, boolean> = {},
) {
  const p: Participant = {
    race,
    units: getUnitMap(units),
    unitUpgrades,
    riskDirectHit: false,
    side,
    battleEffects,
  }
  return p
}

export function checkResult(result: number, expected: number) {
  // the allowed diff percentage from the expected value is dependant on how small the value is
  // a very small value, like 1% win rate, must be allowed to differ with a greater percentage from the expected value
  let allowedErrorPercentage: number
  if (expected === 0) {
    allowedErrorPercentage = 0
  } else if (expected <= DO_BATTLE_X_TIMES * 0.01) {
    allowedErrorPercentage = 1
  } else if (expected <= DO_BATTLE_X_TIMES * 0.02) {
    allowedErrorPercentage = 0.5
  } else if (expected <= DO_BATTLE_X_TIMES * 0.045) {
    allowedErrorPercentage = 0.25
  } else if (expected <= DO_BATTLE_X_TIMES * 0.065) {
    allowedErrorPercentage = 0.2
  } else if (expected <= DO_BATTLE_X_TIMES * 0.08) {
    allowedErrorPercentage = 0.15
  } else if (expected <= DO_BATTLE_X_TIMES * 0.132) {
    allowedErrorPercentage = 0.1
  } else {
    allowedErrorPercentage = 0.06
  }
  expect(result).toBeLessThanOrEqual(expected + expected * allowedErrorPercentage)
  expect(result).toBeGreaterThanOrEqual(expected - expected * allowedErrorPercentage)
}

// workaround for the "Your test suite must contain at least one test" error
test.skip('Workaround', () => 1)
