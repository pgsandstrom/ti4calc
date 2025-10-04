import { Participant } from '../core/battle-types'
import { UnitType } from '../core/unit'
import _times from 'lodash/times'
import { Faction } from '../core/enums'
import { OptionsRowView } from './optionsRowView'

interface Props {
  attacker: Participant
  defender: Participant
  attackerOnChange: (participant: Participant) => void
  defenderOnChange: (participant: Participant) => void
}

// TODO right now it is hardcoded which units have sustain damage.
// We could calculate it, but it would be kind of tricky.
// I think we would need to create a battle with one unit of each type and check them

export default function DamagedUnitsView(props: Props) {
  const showFlagships = showUnitRow(props.attacker, props.defender, UnitType.flagship)
  const showWarsuns = showUnitRow(props.attacker, props.defender, UnitType.warsun)
  const showDreadnoughts = showUnitRow(props.attacker, props.defender, UnitType.dreadnought)
  const showCarriers = showUnitRow(props.attacker, props.defender, UnitType.carrier)
  const showCruisers = showUnitRow(props.attacker, props.defender, UnitType.cruiser)
  const showMechs = showUnitRow(props.attacker, props.defender, UnitType.mech)
  const showPds = showUnitRow(props.attacker, props.defender, UnitType.pds)

  const anyRowsShown = showFlagships || showWarsuns || showDreadnoughts || showCruisers || showMechs

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ textAlign: 'center' }}>Damaged units</h2>
      {!anyRowsShown && <div style={{ textAlign: 'center' }}>No sustain units in battle</div>}
      {showFlagships && <DamagedUnitsRow unitType={UnitType.flagship} {...props} />}
      {showWarsuns && <DamagedUnitsRow unitType={UnitType.warsun} {...props} />}
      {showDreadnoughts && <DamagedUnitsRow unitType={UnitType.dreadnought} {...props} />}
      {showCarriers && <DamagedUnitsRow unitType={UnitType.carrier} {...props} />}
      {showCruisers && <DamagedUnitsRow unitType={UnitType.cruiser} {...props} />}
      {showMechs && <DamagedUnitsRow unitType={UnitType.mech} {...props} />}
      {showPds && <DamagedUnitsRow unitType={UnitType.pds} {...props} />}
    </div>
  )
}

interface DamagedUnitsRowProps {
  unitType: UnitType
  attacker: Participant
  defender: Participant
  attackerOnChange: (participant: Participant) => void
  defenderOnChange: (participant: Participant) => void
}

function DamagedUnitsRow({
  unitType,
  attacker,
  defender,
  attackerOnChange,
  defenderOnChange,
}: DamagedUnitsRowProps) {
  const left = (
    <DamagedUnitSelector unitType={unitType} participant={attacker} onUpdate={attackerOnChange} />
  )
  const right = (
    <DamagedUnitSelector unitType={unitType} participant={defender} onUpdate={defenderOnChange} />
  )

  return <OptionsRowView left={left} right={right} name={unitType} namePadding={8} />
}

interface DamagedUnitSelectorProps {
  unitType: UnitType
  participant: Participant
  onUpdate: (participant: Participant) => void
  'aria-labelledby'?: string
}

function DamagedUnitSelector(props: DamagedUnitSelectorProps) {
  const { unitType, participant, onUpdate } = props

  const visible = showParticipantUnit(participant, unitType)

  return (
    <select
      autoComplete="off"
      onChange={(e) => {
        const newVal = parseInt(e.target.value, 10)
        const newParticipant: Participant = {
          ...participant,
          damagedUnits: {
            ...participant.damagedUnits,
            [unitType]: newVal,
          },
        }
        onUpdate(newParticipant)
      }}
      value={participant.damagedUnits[unitType]}
      aria-labelledby={props['aria-labelledby']}
      style={{
        width: '100%',
        height: '32px',
        marginTop: '8px',
        fontSize: '1.2rem',
        visibility: visible ? undefined : 'hidden',
        textAlign: 'center',
      }}
    >
      {_times(
        Math.max(participant.units[unitType], participant.damagedUnits[unitType] ?? 0) + 1,
        (i) => {
          return (
            <option key={i} value={i}>
              {i}
            </option>
          )
        },
      )}
    </select>
  )
}

function showUnitRow(p1: Participant, p2: Participant, unitType: UnitType) {
  return showParticipantUnit(p1, unitType) || showParticipantUnit(p2, unitType)
}

function showParticipantUnit(participant: Participant, unitType: UnitType) {
  if (unitType === UnitType.cruiser) {
    return showParticipantCruiser(participant)
  }
  if (unitType === UnitType.carrier) {
    return showParticipantCarrier(participant)
  }
  if (unitType === UnitType.pds) {
    return showParticipantPds(participant)
  }
  return participant.units[unitType] > 0 || (participant.damagedUnits[unitType] ?? 0) > 0
}

function showParticipantCruiser(participant: Participant) {
  return (
    participant.faction === Faction.titans_of_ul &&
    participant.unitUpgrades[UnitType.cruiser] &&
    participant.units[UnitType.cruiser] > 0
  )
}

function showParticipantCarrier(participant: Participant) {
  return (
    participant.faction === Faction.sol &&
    participant.unitUpgrades[UnitType.carrier] &&
    participant.units[UnitType.carrier] > 0
  )
}

function showParticipantPds(participant: Participant) {
  return participant.faction === Faction.titans_of_ul && participant.units[UnitType.pds] > 0
}
