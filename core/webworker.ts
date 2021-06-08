import _times from 'lodash/times'
import _cloneDeep from 'lodash/cloneDeep'
import { Battle, BattleInstance, BattleResult } from './battle-types'
import { setupBattle, startBattle } from './battleSetup'
import { BattleReport } from '.'
import { NUMBER_OF_ROLLS, ROLLS_WHEN_BUILDING_TEST_DATA } from './constant'
import { ErrorReportUnsaved } from '../server/errorReportController'

//! To avoid isolatedModules error
export default {}

const DEFAULT_ROLL_NUMBER = 20000
const ROLLS_BETWEEN_UI_UPDATE = 1000

self.addEventListener('message', (e) => {
  const battle = e.data as Battle

  try {
    doWork(battle)
  } catch (e) {
    reportError(battle, e)
  }
})

function doWork(battle: Battle) {
  const battleInstance = setupBattle(battle)

  const finalData: BattleReport = {
    attacker: 0,
    draw: 0,
    defender: 0,
  }

  const numberOfRolls = NUMBER_OF_ROLLS ?? DEFAULT_ROLL_NUMBER
  const parts = Math.ceil(numberOfRolls / ROLLS_BETWEEN_UI_UPDATE)
  const partRolls = Math.ceil(numberOfRolls / parts)

  _times(parts, () => {
    const partialData = getPartialReport(battleInstance, partRolls)
    finalData.attacker += partialData.attacker
    finalData.draw += partialData.draw
    finalData.defender += partialData.defender
    self.postMessage(finalData)
  })

  if (NUMBER_OF_ROLLS === ROLLS_WHEN_BUILDING_TEST_DATA) {
    console.log(JSON.stringify(finalData))
  }
}

function getPartialReport(battleInstance: BattleInstance, times: number) {
  const data: BattleReport = {
    attacker: 0,
    draw: 0,
    defender: 0,
  }
  _times(times, () => {
    const tmp = _cloneDeep(battleInstance)
    const result = startBattle(tmp)
    switch (result) {
      case BattleResult.attacker:
        data.attacker += 1
        break
      case BattleResult.draw:
        data.draw += 1
        break
      case BattleResult.defender:
        data.defender += 1
        break
    }
  })
  return data
}

function reportError(battle: Battle, e: any) {
  let workerError: ErrorReportUnsaved
  if (e instanceof Error) {
    workerError = {
      error: true,
      message: e.message,
      stack: e.stack ?? '',
      battle,
    }
  } else {
    workerError = {
      error: true,
      message: 'unknown error',
      stack: '',
      battle,
    }
  }

  self.postMessage(workerError)
}
