import _times from 'lodash/times'
import { Battle, BattleResult, setupBattle } from './battleSetup'
import { Race } from './races/race'

export default function core() {
  const battle: Battle = {
    left: {
      race: Race.arborec,
      units: {
        cruiser: 0,
        destroyer: 5,
        // pds: 1,
      },
    },
    right: {
      race: Race.argent_flight,
      units: {
        cruiser: 0,
        destroyer: 5,
        // pds: 1,
      },
    },
  }

  const data = {
    left: 0,
    draw: 0,
    right: 0,
  }

  _times(100, () => {
    const result = setupBattle(battle)
    switch (result) {
      case BattleResult.left:
        data.left += 1
        break
      case BattleResult.draw:
        data.draw += 1
        break
      case BattleResult.right:
        data.right += 1
        break
    }
  })
  return data
}
