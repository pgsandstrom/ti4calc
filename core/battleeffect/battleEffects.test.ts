import assert from 'node:assert'
import { describe, it } from 'node:test'

import { getAllBattleEffects } from './battleEffects'

describe('Battle effects', () => {
  it('all battle effects should have unique names', () => {
    const battleEffects = getAllBattleEffects()
    const map: Record<string, boolean> = {}
    for (const effect of battleEffects) {
      assert.strictEqual(map[effect.name], undefined, `Duplicate effect name: ${effect.name}`)
      map[effect.name] = true
    }
  })
})
