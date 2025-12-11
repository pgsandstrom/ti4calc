import { Participant } from '../battle-types'
import { BattleEffect } from '../battleeffect/battleEffects'
import { Faction } from '../enums'
import { arborec } from './arborec'
import { argentFlight } from './argentFlight'
import { baronyOfLetnev } from './baronyOfLetnev'
import { clanOfSaar } from './clanOfSaar'
import { creuss } from './creuss'
import { crimsonRebellion } from './crimsonRebellion'
import { deepwrought } from './deepwrought'
import { empyrean } from './empyrean'
import { hacan } from './hacan'
import { jolNar } from './jolNar'
import { keleres } from './keleres'
import { l1z1x } from './l1z1x'
import { mahact } from './mahact'
import { mentak } from './mentak'
import { muaat } from './muaat'
import { naalu } from './naalu'
import { naazRokha } from './naazRokha'
import { nekro } from './nekro'
import { neutral } from './neutral'
import { nomad } from './nomad'
import { sardarkkNorr } from './sardakkNorr'
import { sol } from './sol'
import { titansOfUl } from './titansOfUl'
import { vuilRaith } from './vuilRaith'
import { winnu } from './winnu'
import { xxcha } from './xxcha'
import { yin } from './yin'
import { yssaril } from './yssaril'

const FACTION_MAP: Record<Faction, BattleEffect[]> = {
  Arborec: arborec,
  'Argent flight': argentFlight,
  'Barony of Letnev': baronyOfLetnev,
  'Clan of Saar': clanOfSaar,
  Creuss: creuss,
  'Crimson Rebellion': crimsonRebellion,
  Deepwrought: deepwrought,
  Empyrean: empyrean,
  Hacan: hacan,
  'Jol-Nar': jolNar,
  Keleres: keleres,
  L1z1x: l1z1x,
  Mahact: mahact,
  Mentak: mentak,
  Muaat: muaat,
  'Naaz-Rokha': naazRokha,
  Naalu: naalu,
  Nekro: nekro,
  Neutral: neutral,
  Nomad: nomad,
  "Sardakk N'orr": sardarkkNorr,
  Sol: sol,
  'Titans of Ul': titansOfUl,
  "Vuil'Raith": vuilRaith,
  Winnu: winnu,
  Xxcha: xxcha,
  Yin: yin,
  Yssaril: yssaril,
}

export function getFactionBattleEffects(p: Participant | Faction): BattleEffect[] {
  if (isParticipant(p)) {
    return FACTION_MAP[p.faction]
  } else {
    return FACTION_MAP[p]
  }
}

function isParticipant(p: Participant | Faction): p is Participant {
  // eslint-disable-next-line
  if ((p as Participant).battleEffects !== undefined) {
    return true
  } else {
    return false
  }
}

export function getFactionStuffNonUnit() {
  return Object.values(Faction)
    .map((factionName) => {
      const faction = FACTION_MAP[factionName]
      return faction.filter(
        (effect) =>
          (effect.type === 'faction-tech' || effect.type === 'faction-ability') &&
          effect.unit === undefined,
      )
    })
    .flat()
}

export function getPromissary() {
  return Object.values(Faction)
    .map((factionName) => {
      const faction = FACTION_MAP[factionName]
      return faction.filter((effect) => effect.type === 'promissary')
    })
    .flat()
}

export function getAgent() {
  return Object.values(Faction)
    .map((factionName) => {
      const faction = FACTION_MAP[factionName]
      return faction.filter((effect) => effect.type === 'agent')
    })
    .flat()
}

export function getCommanders() {
  return Object.values(Faction)
    .map((factionName) => {
      const faction = FACTION_MAP[factionName]
      return faction.filter((effect) => effect.type === 'commander')
    })
    .flat()
}

export function getGeneralEffectFromFactions() {
  return Object.values(Faction)
    .map((factionName) => {
      const faction = FACTION_MAP[factionName]
      return faction.filter((effect) => effect.type === 'general')
    })
    .flat()
}
