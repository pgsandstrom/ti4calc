import { Participant } from '@/core/battle-types'
import { BattleEffect } from '@/core/battleeffect/battleEffects'

export type Faction =
  | 'Arborec'
  | 'Argent flight'
  | 'Barony of Letnev'
  | 'Clan of Saar'
  | 'Creuss'
  | 'Crimson Rebellion'
  | 'Deepwrought'
  | 'Empyrean'
  | 'Firmament'
  | 'Hacan'
  | 'Jol-Nar'
  | 'Keleres'
  | 'L1z1x'
  | 'Last Bastion'
  | 'Mahact'
  | 'Mentak'
  | 'Muaat'
  | 'Naalu'
  | 'Naaz-Rokha'
  | 'Nekro'
  | 'Neutral'
  | 'Nomad'
  | 'Obsidian'
  | 'Ral Nel Consortium'
  | "Sardakk N'orr"
  | 'Sol'
  | 'Titans of Ul'
  | "Vuil'Raith"
  | 'Winnu'
  | 'Xxcha'
  | 'Yin'
  | 'Yssaril'
import { arborec } from '@/core/factions/arborec'
import { argentFlight } from '@/core/factions/argentFlight'
import { baronyOfLetnev } from '@/core/factions/baronyOfLetnev'
import { clanOfSaar } from '@/core/factions/clanOfSaar'
import { creuss } from '@/core/factions/creuss'
import { crimsonRebellion } from '@/core/factions/crimsonRebellion'
import { deepwrought } from '@/core/factions/deepwrought'
import { empyrean } from '@/core/factions/empyrean'
import { firmament } from '@/core/factions/firmament'
import { hacan } from '@/core/factions/hacan'
import { jolNar } from '@/core/factions/jolNar'
import { keleres } from '@/core/factions/keleres'
import { l1z1x } from '@/core/factions/l1z1x'
import { lastBastion } from '@/core/factions/lastBastion'
import { mahact } from '@/core/factions/mahact'
import { mentak } from '@/core/factions/mentak'
import { muaat } from '@/core/factions/muaat'
import { naalu } from '@/core/factions/naalu'
import { naazRokha } from '@/core/factions/naazRokha'
import { nekro } from '@/core/factions/nekro'
import { neutral } from '@/core/factions/neutral'
import { nomad } from '@/core/factions/nomad'
import { obsidian } from '@/core/factions/obsidian'
import { ralNelConsortium } from '@/core/factions/ralNelConsortium'
import { sardarkkNorr } from '@/core/factions/sardakkNorr'
import { sol } from '@/core/factions/sol'
import { titansOfUl } from '@/core/factions/titansOfUl'
import { vuilRaith } from '@/core/factions/vuilRaith'
import { winnu } from '@/core/factions/winnu'
import { xxcha } from '@/core/factions/xxcha'
import { yin } from '@/core/factions/yin'
import { yssaril } from '@/core/factions/yssaril'

const FACTION_MAP: Record<Faction, BattleEffect[]> = {
  Arborec: arborec,
  'Argent flight': argentFlight,
  'Barony of Letnev': baronyOfLetnev,
  'Clan of Saar': clanOfSaar,
  Creuss: creuss,
  'Crimson Rebellion': crimsonRebellion,
  Deepwrought: deepwrought,
  Empyrean: empyrean,
  Firmament: firmament,
  Hacan: hacan,
  'Jol-Nar': jolNar,
  Keleres: keleres,
  L1z1x: l1z1x,
  'Last Bastion': lastBastion,
  Mahact: mahact,
  Mentak: mentak,
  Muaat: muaat,
  'Naaz-Rokha': naazRokha,
  Naalu: naalu,
  Nekro: nekro,
  Neutral: neutral,
  Nomad: nomad,
  Obsidian: obsidian,
  'Ral Nel Consortium': ralNelConsortium,
  "Sardakk N'orr": sardarkkNorr,
  Sol: sol,
  'Titans of Ul': titansOfUl,
  "Vuil'Raith": vuilRaith,
  Winnu: winnu,
  Xxcha: xxcha,
  Yin: yin,
  Yssaril: yssaril,
}

export const ALL_FACTIONS = Object.keys(FACTION_MAP) as Faction[]

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
  return ALL_FACTIONS.map((factionName) => {
    const faction = FACTION_MAP[factionName]
    return faction.filter(
      (effect) =>
        (effect.type === 'faction-tech' || effect.type === 'faction-ability') &&
        effect.unit === undefined,
    )
  }).flat()
}

export function getPromissary() {
  return ALL_FACTIONS.map((factionName) => {
    const faction = FACTION_MAP[factionName]
    return faction.filter((effect) => effect.type === 'promissary')
  }).flat()
}

export function getAgent() {
  return ALL_FACTIONS.map((factionName) => {
    const faction = FACTION_MAP[factionName]
    return faction.filter((effect) => effect.type === 'agent')
  }).flat()
}

export function getCommanders() {
  return ALL_FACTIONS.map((factionName) => {
    const faction = FACTION_MAP[factionName]
    return faction.filter((effect) => effect.type === 'commander')
  }).flat()
}

export function getGeneralEffectFromFactions() {
  return ALL_FACTIONS.map((factionName) => {
    const faction = FACTION_MAP[factionName]
    return faction.filter((effect) => effect.type === 'general')
  }).flat()
}
