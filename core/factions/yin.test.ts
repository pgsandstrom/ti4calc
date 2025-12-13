import { getTestParticipant } from '../../util/util.test'
import { getBattleReport } from '..'
import { Faction, Place } from '../enums'

describe('Yin', () => {
  it('suicided units should be cleaned up before they get to fire', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        destroyer: 1,
      },
      Faction.yin,
      {
        'Impulse Core': 1,
      },
    )

    const defender = getTestParticipant('defender', {
      destroyer: 2,
    })

    const result = getBattleReport(attacker, defender, Place.space, 100)

    expect(result.defender).toEqual(100)
  })
})
