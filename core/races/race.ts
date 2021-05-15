import { Participant } from '../battle-types'
import { BattleEffect } from '../battleeffect/battleEffects'
import { Race } from '../enums'
import { arborec } from './arborec'
import { argentFlight } from './argentFlight'
import { baronyOfLetnev } from './baronyOfLetnev'
import { clanOfSaar } from './clanOfSaar'
import { creuss } from './creuss'
import { empyrean } from './empyrean'
import { hacan } from './hacan'
import { jolNar } from './jolNar'
import { l1z1x } from './l1z1x'
import { mahact } from './mahact'
import { mentak } from './mentak'
import { muaat } from './muaat'
import { naazRokha } from './naazRokha'
import { naluu } from './naluu'
import { nekro } from './nekro'
import { nomad } from './nomad'
import { sardarkkNorr } from './sardakkNorr'
import { sol } from './sol'
import { titansOfUl } from './titansOfUl'
import { vuilRaith } from './vuilRaith'
import { winnu } from './winnu'
import { xxcha } from './xxcha'
import { yin } from './yin'
import { yssaril } from './yssaril'

const RACE_MAP: Record<Race, BattleEffect[]> = {
  Arborec: arborec,
  'Argent flight': argentFlight,
  'Barony of Letnev': baronyOfLetnev,
  'Clan of Saar': clanOfSaar,
  Creuss: creuss,
  Empyrean: empyrean,
  Hacan: hacan,
  'Jol-Nar': jolNar,
  L1z1x: l1z1x,
  Mahact: mahact,
  Mentak: mentak,
  Muaat: muaat,
  'Naaz-Rokha': naazRokha,
  Naluu: naluu,
  Nekro: nekro,
  Nomad: nomad,
  'Sardakk Norr': sardarkkNorr,
  Sol: sol,
  'Titans of Ul': titansOfUl,
  "Vuil'Raith": vuilRaith,
  Winnu: winnu,
  Xxcha: xxcha,
  Yin: yin,
  Yssaril: yssaril,
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

export function getPromissary() {
  return Object.values(Race)
    .map((raceName) => {
      const race = RACE_MAP[raceName]
      return race.filter((effect) => effect.type === 'promissary')
    })
    .flat()
}

export function getAgent() {
  return Object.values(Race)
    .map((raceName) => {
      const race = RACE_MAP[raceName]
      return race.filter((effect) => effect.type === 'agent')
    })
    .flat()
}

export function getCommanders() {
  return Object.values(Race)
    .map((raceName) => {
      const race = RACE_MAP[raceName]
      return race.filter((effect) => effect.type === 'commander')
    })
    .flat()
}

export function getGeneralEffectFromRaces() {
  return Object.values(Race)
    .map((raceName) => {
      const race = RACE_MAP[raceName]
      return race.filter((effect) => effect.type === 'general')
    })
    .flat()
}
