import { UnitInstance } from './unit'

export interface Tech {
  name: string
  debuffEnemy?: (unit: UnitInstance) => void
  buff?: (unit: UnitInstance) => void
}
