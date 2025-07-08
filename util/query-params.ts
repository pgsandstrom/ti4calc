import { isSide, Participant, Side } from '../core/battle-types'
import { getAllBattleEffects } from '../core/battleeffect/battleEffects'
import { Faction, Place } from '../core/enums'
import { UnitType } from '../core/unit'
import { objectEntries } from './util-object'

const allBattleEffects = getAllBattleEffects()

export function createQueryParams(attacker: Participant, defender: Participant, place: Place) {
  const params = new URLSearchParams()

  addParticipant(params, attacker, 'attacker')
  addParticipant(params, defender, 'defender')

  if (place !== Place.space) {
    params.set('place', place)
  }

  if (hasUnits(attacker) || hasUnits(defender)) {
    const paramsNonEmpty = params.toString().length > 0
    window.history.replaceState({}, '', `${location.pathname}${paramsNonEmpty ? '?' : ''}${params}`)
  } else {
    window.history.replaceState({}, '', location.pathname)
  }
}

function addParticipant(params: URLSearchParams, p: Omit<Participant, 'side'>, side: Side) {
  params.set(side + '-faction', p.faction)

  for (const unit of objectEntries(p.units)) {
    if (unit[1] > 0) {
      params.set(`${side}-unit-${unit[0]}`, `${unit[1]}`)
    }
  }

  for (const unit of objectEntries(p.damagedUnits)) {
    const ownedUnits = p.units[unit[0]]
    const actualNumber = Math.min(unit[1], ownedUnits)
    if (actualNumber) {
      params.set(`${side}-damaged-${unit[0]}`, `${actualNumber}`)
    }
  }

  if (!p.riskDirectHit) {
    params.set(`${side}-risk-direct-hit`, 'false')
  }

  for (const unitUpgrades of objectEntries(p.unitUpgrades)) {
    if (unitUpgrades[1]) {
      params.set(`${side}-upgrade-${unitUpgrades[0]}`, 'true')
    }
  }

  for (const battleEffects of objectEntries(p.battleEffects)) {
    if (battleEffects[1] > 0) {
      const symmetrical = allBattleEffects.some(
        (e) => e.name === battleEffects[0] && !!e.symmetrical,
      )
      if (symmetrical) {
        params.set(`effect-${battleEffects[0]}`, `${battleEffects[1]}`)
      } else {
        params.set(`${side}-effect-${battleEffects[0]}`, `${battleEffects[1]}`)
      }
    }
  }
}

export function applyQueryParams(
  participant: Participant,
  query: Record<string, string | string[] | undefined>,
) {
  objectEntries(query).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      console.warn(`value of ${key} was unexpected array: ${JSON.stringify(value)}`)
      return
    }

    const factionMatch = key.match(/(attacker|defender)-faction/)
    if (factionMatch) {
      const side = factionMatch[1]
      if (!isSide(side)) {
        console.warn(`failed to identify Side: ${side}`)
        return
      }

      const faction = value as Faction

      if (!Object.values(Faction).includes(faction)) {
        console.warn(`Unknown faction found: ${faction}`)
        return
      } else if (side === participant.side) {
        participant.faction = faction
      }
    }

    const unitMatch = key.match(/(attacker|defender)-unit-(.*)/)
    if (unitMatch) {
      const side = unitMatch[1]
      const unit = unitMatch[2] as UnitType
      if (!isSide(side)) {
        console.warn(`failed to identify Side: ${side}`)
        return
      }

      if (!Object.values(UnitType).includes(unit)) {
        console.warn(`Unknown unit found: ${unit}`)
        return
      }

      const num = parseInt(value)
      if (isNaN(num)) {
        console.warn(`Unit number was not number for ${unit}: ${value}`)
        return
      } else if (side === participant.side) {
        participant.units[unit] = num
      }
    }

    const unitDamagedMatch = key.match(/(attacker|defender)-damaged-(.*)/)
    if (unitDamagedMatch) {
      const side = unitDamagedMatch[1]
      const unit = unitDamagedMatch[2] as UnitType
      if (!isSide(side)) {
        console.warn(`failed to identify Side: ${side}`)
        return
      }

      if (!Object.values(UnitType).includes(unit)) {
        console.warn(`Unknown unit found: ${unit}`)
        return
      }

      const num = parseInt(value)
      if (isNaN(num)) {
        console.warn(`Unit damaged number was not number for ${unit}: ${value}`)
        return
      } else if (side === participant.side) {
        participant.damagedUnits[unit] = num
      }
    }

    const riskDirectHitMatch = key.match(/(attacker|defender)-risk-direct-hit/)
    if (riskDirectHitMatch) {
      const side = riskDirectHitMatch[1]
      if (!isSide(side)) {
        console.warn(`failed to identify Side: ${side}`)
        return
      }

      const bool = value === 'true'
      if (side === participant.side) {
        participant.riskDirectHit = bool
      }
    }

    const upgradeMatch = key.match(/(attacker|defender)-upgrade-(.*)/)
    if (upgradeMatch) {
      const side = upgradeMatch[1]
      const unit = upgradeMatch[2] as UnitType
      if (!isSide(side)) {
        console.warn(`failed to identify Side: ${side}`)
        return
      }

      if (!Object.values(UnitType).includes(unit)) {
        console.warn(`Unknown unit upgrade found: ${unit}`)
        return
      }

      const bool = value === 'true'
      if (side === participant.side) {
        participant.unitUpgrades[unit] = bool
      }
    }

    const effectMatch = key.match(/(attacker|defender|)-?effect-(.*)/)
    if (effectMatch) {
      const side = effectMatch[1]
      const effect = effectMatch[2]
      if (!isSide(side) && side !== '') {
        console.warn(`failed to identify Side: ${side}`)
        return
      }

      const num = parseInt(value)
      if (isNaN(num)) {
        console.warn(`Effect number was not number for ${effect}: ${value}`)
        return
      } else if (side === participant.side || side === '') {
        participant.battleEffects[effect] = num
      }
    }
  })
}

function hasUnits(p: Participant) {
  return Object.values(p.units).some((val) => val > 0)
}

export function hasSomeQueryParams(query: Record<string, string | string[] | undefined>) {
  return Object.entries(query).length > 0
}

export function hasQueryParamForFaction(
  query: Record<string, string | string[] | undefined>,
  side: Side,
) {
  return Object.keys(query).some((key) => key === `${side}-faction`)
}
