import { BattleEffect } from '../battleEffects'
import { Participant } from '../battleSetup'
import { arborec } from './arborec'
import { argentFlight } from './argentFlight'

export enum Race {
  arborec = 'arborec',
  argent_flight = 'argent flight',
}

export const RACE_MAP: Record<Race, BattleEffect[]> = {
  arborec: arborec,
  'argent flight': argentFlight,
}

export function getRaceBattleEffects(p: Participant) {
  return RACE_MAP[p.race]
}
