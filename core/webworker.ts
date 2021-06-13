import _times from 'lodash/times'
import _cloneDeep from 'lodash/cloneDeep'
import { Battle, BattleInstance, BattleResult } from './battle-types'
import { setupBattle, startBattle } from './battleSetup'
import { BattleReport } from '.'
import { NUMBER_OF_ROLLS, ROLLS_BETWEEN_UI_UPDATE, ROLLS_WHEN_BUILDING_TEST_DATA } from './constant'
import { ErrorReportUnsaved } from '../server/errorReportController'

//! To avoid isolatedModules error
export default {}

const MIN_TIME_BETWEEN_SENDING_UPDATES = 250

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

  const parts = Math.ceil(NUMBER_OF_ROLLS / ROLLS_BETWEEN_UI_UPDATE)
  const partRolls = Math.ceil(NUMBER_OF_ROLLS / parts)

  let lastMessageTime = 0
  _times(parts, (index) => {
    const partialData = getPartialReport(battleInstance, partRolls)
    finalData.attacker += partialData.attacker
    finalData.draw += partialData.draw
    finalData.defender += partialData.defender
    const currentTime = new Date().getTime()
    const lastIteration = parts === index
    if (lastIteration || currentTime > lastMessageTime + MIN_TIME_BETWEEN_SENDING_UPDATES) {
      lastMessageTime = currentTime
      self.postMessage(finalData)
    }
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
