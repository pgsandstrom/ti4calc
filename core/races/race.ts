import { Participant } from '../battle-types'
import { BattleEffect } from '../battleeffect/battleEffects'
import { Race } from '../enums'
import { arborec } from './arborec'
import { argentFlight } from './argentFlight'
import { baronyOfLetnev } from './baronyOfLetnev'
import { l1z1x } from './l1z1x'
import { nomad } from './nomad'
import { sardarkkNorr } from './sardakkNorr'
import { titansOfUl } from './titansOfUl'
import { winnu } from './winnu'

const RACE_MAP: Record<Race, BattleEffect[]> = {
  Arborec: arborec,
  'Argent flight': argentFlight,
  'Barony of Letnev': baronyOfLetnev,
  L1z1x: l1z1x,
  Nomad: nomad,
  'Sardakk Norr': sardarkkNorr,
  'Titans of Ul': titansOfUl,
  Winnu: winnu,
}

export function getRaceBattleEffects(p: Participant | Race) {
  if (isParticipant(p)) {
    return RACE_MAP[p.race]
  } else {
    return RACE_MAP[p]
  }
}

function isParticipant(p: Participant | Race): p is Participant {
  // eslint-disable-next-line
  if ((p as Participant).battleEffects !== undefined) {
    return true
  } else {
    return false
  }
}

export function getRaceTechsNonUnit() {
  return Object.values(Race)
    .map((raceName) => {
      const race = RACE_MAP[raceName]
      return race.filter((effect) => effect.type === 'race-tech' && effect.unit === undefined)
    })
    .flat()
}
