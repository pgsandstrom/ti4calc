import getBattleReport from '..'
import { checkResult, getTestParticipant } from '../../util/util.test'
import { solarFlare } from '../battleeffect/actioncard'
import { Faction, Place } from '../enums'
import { DO_BATTLE_X_TIMES } from '../index.test'

describe('keleres', () => {
  it('mecatol space cannon to work', () => {
    const attacker = getTestParticipant('attacker', {
      fighter: 1,
    })

    const defender = getTestParticipant('defender', {}, Faction.keleres, {
      'I.I.H.Q. MODERNIZATION space cannon': 1,
    })

    const result = getBattleReport(attacker, defender, Place.space, DO_BATTLE_X_TIMES)

    checkResult(result.attacker, DO_BATTLE_X_TIMES * 0.4)
    checkResult(result.draw, DO_BATTLE_X_TIMES * 0.6)
    expect(result.defender).toEqual(0)
  })

  it('mecatol space cannon to NOT work with solar flare', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        fighter: 1,
      },
      undefined,
      {
        [solarFlare.name]: 1,
      },
    )

    const defender = getTestParticipant('defender', {}, Faction.keleres, {
      'I.I.H.Q. MODERNIZATION space cannon': 1,
    })

    const result = getBattleReport(attacker, defender, Place.space, DO_BATTLE_X_TIMES)

    expect(result.attacker).toEqual(DO_BATTLE_X_TIMES)
    expect(result.draw).toEqual(0)
    expect(result.defender).toEqual(0)
  })
})
