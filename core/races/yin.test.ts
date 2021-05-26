import getBattleReport from '..'
import { Participant } from '../battle-types'
import { getUnitMap } from '../battleSetup'
import { Race, Place } from '../enums'

describe('Yin', () => {
  it('suicided units should be cleaned up before they get to fire', () => {
    const attacker: Participant = {
      race: Race.yin,
      units: getUnitMap(),
      unitUpgrades: {},
      riskDirectHit: false,
      side: 'attacker',
      battleEffects: { 'Impulse Core': 1 },
    }
    const defender: Participant = {
      race: Race.barony_of_letnev,
      units: getUnitMap(),
      unitUpgrades: {},
      riskDirectHit: false,
      side: 'defender',
      battleEffects: {},
    }
    attacker.units.destroyer = 1
    defender.units.destroyer = 2

    const result = getBattleReport(attacker, defender, Place.space)

    expect(result.attacker).toEqual(0)
    expect(result.draw).toEqual(0)
  })
})
