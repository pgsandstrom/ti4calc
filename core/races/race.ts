import { BattleEffect } from '../battleeffect/battleEffects'
import { Participant } from '../battleSetup'
import { arborec } from './arborec'
import { argentFlight } from './argentFlight'
import { baronyOfLetnev } from './baronyOfLetnev'
import { sardarkkNorr } from './sardakkNorr'

export enum Race {
  arborec = 'arborec',
  argent_flight = 'argent flight',
  barony_of_letnev = 'Barony of Letnev',
  sardakk_norr = 'Sardakk Norr',
}

const RACE_MAP: Record<Race, BattleEffect[]> = {
  arborec: arborec,
  'argent flight': argentFlight,
  'Barony of Letnev': baronyOfLetnev,
  'Sardakk Norr': sardarkkNorr,
}

export function getRaceBattleEffects(p: Participant) {
  return RACE_MAP[p.race]
}
