import { checkResult, getTestParticipant } from '../../util/util.test'
import getBattleReport from '..'
import { Faction, Place } from '../enums'
import { DO_BATTLE_X_TIMES } from '../index.test'

describe('Sardakk', () => {
  it('Sardakk vs arborec flagship', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        flagship: 1,
      },
      Faction.sardakk_norr,
    )

    const defender = getTestParticipant(
      'defender',
      {
        flagship: 1,
      },
      Faction.arborec,
    )

    const result = getBattleReport(attacker, defender, Place.space, DO_BATTLE_X_TIMES)

    checkResult(result.attacker, DO_BATTLE_X_TIMES * 0.56)
    checkResult(result.draw, DO_BATTLE_X_TIMES * 0.26)
    checkResult(result.defender, DO_BATTLE_X_TIMES * 0.18)
  })

  it('Sardakk mech ability should not trigger during space cannon phase', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        mech: 1,
      },
      Faction.sardakk_norr,
    )

    const defender = getTestParticipant(
      'defender',
      {
        infantry: 1,
        pds: 1,
      },
      Faction.arborec,
    )

    const result = getBattleReport(attacker, defender, Place.ground, DO_BATTLE_X_TIMES)

    checkResult(result.attacker, DO_BATTLE_X_TIMES * 0.8)
    checkResult(result.draw, DO_BATTLE_X_TIMES * 0.12)
    checkResult(result.defender, DO_BATTLE_X_TIMES * 0.08)
  })

  // TODO add test to ensure that sardakk flagship does not affect ground combat
})
