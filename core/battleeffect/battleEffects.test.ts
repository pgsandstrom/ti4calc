import { getAllBattleEffects } from './battleEffects'

describe('Battle effects', () => {
  it('all battle effects should have unique names', () => {
    const battleEffects = getAllBattleEffects()
    const map: Record<string, boolean> = {}
    for (const effect of battleEffects) {
      expect(map[effect.name]).toBeUndefined()
      map[effect.name] = true
    }
  })
})
