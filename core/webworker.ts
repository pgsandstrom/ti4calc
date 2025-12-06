import _cloneDeep from 'lodash/cloneDeep'
import _times from 'lodash/times'

import { ErrorReportUnsaved } from '../server/errorReportController'
import { objectEntries } from '../util/util-object'
import { BattleReport } from '.'
import { Battle, BattleInstance, BattleWinner } from './battle-types'
import { setupBattle, startBattle } from './battleSetup'
import { NUMBER_OF_ROLLS, ROLLS_BETWEEN_UI_UPDATE, ROLLS_WHEN_BUILDING_TEST_DATA } from './constant'

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
    attackerSurvivers: {},
    draw: 0,
    defender: 0,
    defenderSurvivers: {},
    numberOfRolls: 0,
  }

  const parts = Math.ceil(NUMBER_OF_ROLLS / ROLLS_BETWEEN_UI_UPDATE)
  const partRolls = Math.ceil(NUMBER_OF_ROLLS / parts)

  let lastMessageTime = 0
  _times(parts, (index) => {
    const partialData = getPartialReport(battleInstance, partRolls)
    finalData.attacker += partialData.attacker
    for (const [units, count] of objectEntries(partialData.attackerSurvivers)) {
      finalData.attackerSurvivers[units] = (finalData.attackerSurvivers[units] ?? 0) + count
    }
    finalData.draw += partialData.draw
    finalData.defender += partialData.defender
    for (const [units, count] of objectEntries(partialData.defenderSurvivers)) {
      finalData.defenderSurvivers[units] = (finalData.defenderSurvivers[units] ?? 0) + count
    }
    const currentTime = new Date().getTime()
    const lastIteration = parts === index
    if (lastIteration || currentTime > lastMessageTime + MIN_TIME_BETWEEN_SENDING_UPDATES) {
      lastMessageTime = currentTime
      self.postMessage(finalData)
    }
  })

  if (NUMBER_OF_ROLLS === ROLLS_WHEN_BUILDING_TEST_DATA) {
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(finalData))
  }
}

function getPartialReport(battleInstance: BattleInstance, times: number) {
  const data: BattleReport = {
    attacker: 0,
    attackerSurvivers: {},
    draw: 0,
    defender: 0,
    defenderSurvivers: {},
    numberOfRolls: 0,
  }
  _times(times, () => {
    const tmp = _cloneDeep(battleInstance)
    const result = startBattle(tmp)
    switch (result.winner) {
      case BattleWinner.attacker:
        data.attacker += 1
        if (data.attackerSurvivers[result.units] === undefined) {
          data.attackerSurvivers[result.units] = 1
        } else {
          data.attackerSurvivers[result.units]! += 1
        }
        break
      case BattleWinner.draw:
        data.draw += 1
        break
      case BattleWinner.defender:
        data.defender += 1
        if (data.defenderSurvivers[result.units] === undefined) {
          data.defenderSurvivers[result.units] = 1
        } else {
          data.defenderSurvivers[result.units]! += 1
        }
        break
    }
  })
  data.numberOfRolls += times
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
