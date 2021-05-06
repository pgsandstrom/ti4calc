import { Participant } from '../battle-types'
import { BattleEffect } from '../battleeffect/battleEffects'
import { arborec } from './arborec'
import { argentFlight } from './argentFlight'
import { baronyOfLetnev } from './baronyOfLetnev'
import { nomad } from './nomad'
import { sardarkkNorr } from './sardakkNorr'

export enum Race {
  arborec = 'Arborec',
  argent_flight = 'Argent flight',
  barony_of_letnev = 'Barony of Letnev',
  nomad = 'Nomad',
  sardakk_norr = 'Sardakk Norr',
}

const RACE_MAP: Record<Race, BattleEffect[]> = {
  Arborec: arborec,
  'Argent flight': argentFlight,
  'Barony of Letnev': baronyOfLetnev,
  Nomad: nomad,
  'Sardakk Norr': sardarkkNorr,
}

export function getRaceBattleEffects(p: Participant) {
  return RACE_MAP[p.race]
}
