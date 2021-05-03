import { ParticipantInstance } from '../battleSetup'
import { UnitInstance } from '../unit'
import { arborec } from './arborec'
import { argentFlight } from './argentFlight'

export enum Race {
  arborec = 'arborec',
  argent_flight = 'argent flight',
}

export interface RaceProp {
  debuffEnemy?: (unit: UnitInstance) => void
  buff?: (unit: UnitInstance) => void
}

export const RACE_MAP: Record<Race, RaceProp> = {
  arborec: arborec,
  'argent flight': argentFlight,
}

export function doRaceBuff(p: ParticipantInstance) {
  const race = RACE_MAP[p.race]
  if (race.buff) {
    p.units.forEach(race.buff)
  }
}
