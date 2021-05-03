import { UnitInstance, UnitType } from '../unit'
import { RaceProp } from './race'

export const argentFlight: RaceProp = {
  buff: (unit: UnitInstance) => {
    if (unit.type === UnitType.destroyer) {
      unit.combat!.hit -= 1
    }
  },
}
