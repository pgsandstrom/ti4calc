import { Battle, Participant } from './battle-types'
import { getUnitMap, setupBattle } from './battleSetup'
import { Race, Place } from './enums'
import { UnitType } from './unit'
import { getBestShip } from './unitGet'

describe('unitGet', () => {
  it('getBestShip', () => {
    const attacker: Participant = {
      race: Race.mahact,
      units: getUnitMap(),
      unitUpgrades: {},
      riskDirectHit: false,
      side: 'attacker',
      battleEffects: { 'Mahact flagship bonus': 1 },
    }
    const defender: Participant = {
      race: Race.barony_of_letnev,
      units: getUnitMap(),
      unitUpgrades: {},
      riskDirectHit: false,
      side: 'defender',
      battleEffects: {},
    }
    attacker.units.warsun = 1
    attacker.units.flagship = 1
    attacker.units.dreadnought = 2
    attacker.units.mech = 1
    attacker.units.pds = 1

    const battle: Battle = {
      attacker,
      defender,
      place: Place.space,
    }
    const battleInstance = setupBattle(battle)

    const participantInstance = battleInstance.attacker

    const bestShip = getBestShip(participantInstance)

    expect(bestShip!.type).toEqual(UnitType.warsun)
  })
})
