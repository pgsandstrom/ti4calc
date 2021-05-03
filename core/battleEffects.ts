import { Race } from './races/race'
import { UnitInstance } from './unit'

export interface BattleEffect {
  type: 'promissary' | 'tech' | 'race' | 'race-tech'
  race?: Race
  transformUnit?: (u: UnitInstance) => UnitInstance
  transformEnemyUnit?: (u: UnitInstance) => UnitInstance
  onlyFirstRound: boolean
}

export interface PromissaryNotes {
  warfunding: boolean
}

export const warfunding: BattleEffect = {
  type: 'promissary',
  race: undefined,
  transformUnit: (unit: UnitInstance) => {
    if (unit.combat) {
      return {
        ...unit,
        combat: {
          ...unit.combat,
          reroll: unit.combat.reroll + 1,
        },
      }
    } else {
      return unit
    }
  },
  onlyFirstRound: true,
}

export function getAllBattleEffects(): BattleEffect[] {
  return [warfunding]
}
