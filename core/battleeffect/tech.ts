import { ParticipantInstance, BattleInstance } from '../battle-types'
import { UnitInstance } from '../unit'
import { BattleEffect, registerUse } from './battleEffects'

export function getTechBattleEffects() {
  return [duraniumArmor]
}

// TODO add techs

export const duraniumArmor: BattleEffect = {
  name: 'Duranium Armor',
  type: 'tech',
  place: 'both',
  onRepair: (
    unit: UnitInstance,
    participant: ParticipantInstance,
    battle: BattleInstance,
    effectName: string,
  ) => {
    if (unit.takenDamage && unit.takenDamageRound !== battle.roundNumber) {
      unit.takenDamage = false
      registerUse(effectName, participant)
      // console.log(`${participant.side} used duranium armor in round ${battle.roundNumber}`)
    }
  },
  timesPerRound: 1,
}
