import { BattleEffect } from '../battleEffects'
import { UnitInstance, UnitType } from '../unit'

export const argentFlight: BattleEffect[] = [
  {
    type: 'race',
    onlyFirstRound: false,
    transformUnit: (unit: UnitInstance) => {
      console.log('transform unit')
      if (unit.type === UnitType.destroyer) {
        unit.combat!.hit -= 1
      }
      return unit
    },
  },
]
