import { destroyUnit } from '@/core/battle'
import { BattleInstance, ParticipantInstance } from '@/core/battle-types'
import { BattleEffect, registerUse } from '@/core/battleeffect/battleEffects'
import { defaultRoll, galvanizeUnit, UnitInstance, UnitType } from '@/core/unit'
import { getHighestWorthUnit } from '@/core/unitGet'
import { logWrapper } from '@/util/util-log'

// Roll a d10 (1-10)
function rollD10(): number {
  return Math.floor(Math.random() * 10 + 1)
}

// TODO There are certain abilities that trigger when a galvanized unit triggers. Realistically we would want the galvanized unit to die first when they are present, but currently they will die last.
export const lastBastion: BattleEffect[] = [
  {
    type: 'faction',
    name: 'Last Bastion flagship',
    description: 'The Egeiro: Combat 9x2, sustain damage.',
    place: 'space',
    transformUnit: (unit: UnitInstance) => {
      if (unit.type === UnitType.flagship) {
        return {
          ...unit,
          combat: {
            ...defaultRoll,
            hit: 9,
            count: 2,
          },
        }
      } else {
        return unit
      }
    },
  },
  {
    type: 'faction-ability',
    name: 'The Egeiro planet bonus',
    description:
      'Flagship ability: +1 to each combat roll for each non-home system planet you control. Set count to number of planets.',
    place: 'space',
    faction: 'Last Bastion',
    count: true,
    onStart: (
      p: ParticipantInstance,
      _battle: BattleInstance,
      _op: ParticipantInstance,
      effectName: string,
    ) => {
      const bonus = p.effects[effectName]
      if (!bonus || bonus <= 0) {
        return
      }

      p.units.forEach((u) => {
        if (u.type === UnitType.flagship && u.combat) {
          u.combat.hitBonus += bonus
          logWrapper(`${p.side}'s The Egeiro flagship gets +${bonus} to combat from planet bonus`)
        }
      })
    },
  },
  {
    type: 'faction-ability',
    name: 'A3 Valiance galvanize',
    description:
      'Mech ability: When this unit is destroyed while galvanized, galvanize up to 3 friendly infantry in its system.',
    place: 'both',
    faction: 'Last Bastion',
    onDeath: (
      deadUnits: UnitInstance[],
      participant: ParticipantInstance,
      _otherParticipant: ParticipantInstance,
      _battle: BattleInstance,
      isOwnUnit: boolean,
      _effectName: string,
    ) => {
      if (!isOwnUnit) {
        return
      }

      // Check if any dead mech was galvanized
      const galvanizedMechDied = deadUnits.some((u) => u.type === UnitType.mech && u.galvanized)
      if (!galvanizedMechDied) {
        return
      }

      // Find up to 3 non-galvanized infantry to galvanize
      let galvanizeCount = 0
      for (const unit of participant.units) {
        if (galvanizeCount >= 3) {
          break
        }
        if (unit.type === UnitType.infantry && !unit.galvanized && !unit.isDestroyed) {
          galvanizeUnit(unit)
          galvanizeCount++
        }
      }

      if (galvanizeCount > 0) {
        logWrapper(
          `${participant.side}'s galvanized mech died, galvanizing ${galvanizeCount} infantry`,
        )
      }
    },
  },
  {
    type: 'agent',
    name: 'Last Bastion agent',
    description:
      "Dame Briar: When a player's unit is destroyed, exhaust to galvanize another of that player's units in the destroyed unit's system.",
    place: 'both',
    timesPerFight: 1,
    onDeath: (
      _deadUnits: UnitInstance[],
      participant: ParticipantInstance,
      _otherParticipant: ParticipantInstance,
      battle: BattleInstance,
      isOwnUnit: boolean,
      effectName: string,
    ) => {
      // Only trigger when own units die
      if (!isOwnUnit) {
        return
      }

      // Find the highest worth non-galvanized unit to galvanize
      const unitToGalvanize = getHighestWorthUnit(participant, battle.place, true, true)
      if (!unitToGalvanize) {
        return
      }

      galvanizeUnit(unitToGalvanize)
      logWrapper(
        `${participant.side} uses Last Bastion agent to galvanize a ${unitToGalvanize.type}`,
      )
      registerUse(effectName, participant)
    },
  },
  // TODO I guess the most intelligent thing would be to sacrifice a galvanized unit first. That is currently not implemented.
  {
    type: 'faction-ability',
    faction: 'Last Bastion',
    name: 'Last Bastion hero',
    description:
      "Lyra Keen: When a galvanized unit you control is destroyed, you may purge this card. If you do, roll 1 die for each unit your opponent has in the active system; for each result that is equal to or greater than the destroyed galvanized unit's combat value, destroy that unit.\n\nPLEASE NOTE: Currently this hero is not used in an intelligent way. Galvanized units death priority is not affected, but in reality it most likely would be.",
    place: 'both',
    timesPerFight: 1,
    onDeath: (
      deadUnits: UnitInstance[],
      participant: ParticipantInstance,
      otherParticipant: ParticipantInstance,
      battle: BattleInstance,
      isOwnUnit: boolean,
      effectName: string,
    ) => {
      if (!isOwnUnit) {
        return
      }

      // Find the dead galvanized unit with the lowest combat hit value
      const deadGalvanizedUnits = deadUnits.filter((u) => u.galvanized && u.combat !== undefined)
      if (deadGalvanizedUnits.length === 0) {
        return
      }
      const hitValue = deadGalvanizedUnits.reduce(
        (lowest, u) => (u.combat!.hit < lowest ? u.combat!.hit : lowest),
        deadGalvanizedUnits[0].combat!.hit,
      )

      // Roll for each enemy unit
      let destroyedCount = 0
      for (const enemyUnit of otherParticipant.units) {
        if (enemyUnit.isDestroyed) {
          continue
        }

        // Roll 1 d10 (values 1-10)
        const roll = rollD10()

        if (roll >= hitValue) {
          destroyUnit(battle, enemyUnit)
          destroyedCount++
          logWrapper(
            `${participant.side}'s Last Bastion hero rolled ${roll} >= ${hitValue}, destroying enemy ${enemyUnit.type}`,
          )
        } else {
          logWrapper(
            `${participant.side}'s Last Bastion hero rolled ${roll} < ${hitValue}, ${enemyUnit.type} survives`,
          )
        }
      }

      if (destroyedCount > 0) {
        logWrapper(
          `${participant.side}'s Last Bastion hero destroyed ${destroyedCount} enemy units`,
        )
      }
      registerUse(effectName, participant)
    },
  },
  {
    type: 'faction-tech',
    name: 'Proxima Targeting VI',
    description:
      'Faction tech: Cancel 1 bombardment hit per galvanized ground force present. You may also use Bombardment 8 (x3) against opponent ground forces, but must also roll against your own ground forces.',
    place: 'ground',
    faction: 'Last Bastion',
    // Cancel bombardment hits based on galvanized ground forces (for defender)
    beforeStart: (
      participant: ParticipantInstance,
      battle: BattleInstance,
      _otherParticipant: ParticipantInstance,
      effectName: string,
    ) => {
      if (battle.place !== 'ground') {
        return
      }
      // Only defender can cancel bombardment
      if (participant.side !== 'defender') {
        return
      }

      // Count galvanized ground forces
      const galvanizedGroundForces = participant.units.filter(
        (u) => u.galvanized && u.isGroundForce && !u.isDestroyed,
      ).length

      if (galvanizedGroundForces > 0) {
        participant.soakHits += galvanizedGroundForces
        logWrapper(
          `${participant.side}'s Proxima Targeting VI can cancel ${galvanizedGroundForces} bombardment hits`,
        )
        registerUse(effectName, participant)
      }
    },
    // Give bombardment to all ground forces for the attacker (against both sides)
    onBombardment: (
      participant: ParticipantInstance,
      battle: BattleInstance,
      otherParticipant: ParticipantInstance,
      effectName: string,
    ) => {
      if (battle.place !== 'ground') {
        return
      }
      // Only attacker can bombard
      if (participant.side !== 'attacker') {
        return
      }

      // Roll bombardment 8 (x3)
      const bombardmentRolls: number[] = []
      for (let i = 0; i < 3; i++) {
        bombardmentRolls.push(rollD10())
      }

      const hits = bombardmentRolls.filter((roll) => roll >= 8).length

      if (hits > 0) {
        // Apply hits to opponent
        otherParticipant.hitsToAssign.hits += hits
        logWrapper(
          `${participant.side}'s Proxima Targeting VI bombardment rolled ${bombardmentRolls.join(', ')}, ${hits} hits to enemy`,
        )

        // Also apply hits to own ground forces
        const selfHits = hits
        participant.hitsToAssign.hits += selfHits
        logWrapper(
          `${participant.side}'s Proxima Targeting VI also applies ${selfHits} hits to own ground forces`,
        )

        registerUse(effectName, participant)
      } else {
        logWrapper(
          `${participant.side}'s Proxima Targeting VI bombardment rolled ${bombardmentRolls.join(', ')}, no hits`,
        )
      }
    },
  },
]
