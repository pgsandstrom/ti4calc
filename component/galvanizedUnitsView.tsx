import _times from 'lodash/times'

import { Participant } from '../core/battle-types'
import { UnitType } from '../core/unit'
import { OptionsRowView } from './optionsRowView'

interface Props {
  attacker: Participant
  defender: Participant
  attackerOnChange: (participant: Participant) => void
  defenderOnChange: (participant: Participant) => void
}

// Units that can participate in combat and thus can be galvanized
const GALVANIZABLE_UNITS: UnitType[] = [
  UnitType.flagship,
  UnitType.warsun,
  UnitType.dreadnought,
  UnitType.carrier,
  UnitType.cruiser,
  UnitType.destroyer,
  UnitType.fighter,
  UnitType.mech,
  UnitType.infantry,
  UnitType.pds,
]

export default function GalvanizedUnitsView(props: Props) {
  const visibleUnits = GALVANIZABLE_UNITS.filter((unitType) =>
    showUnitRow(props.attacker, props.defender, unitType),
  )

  const anyRowsShown = visibleUnits.length > 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ textAlign: 'center' }}>Galvanized units</h2>
      {!anyRowsShown && <div style={{ textAlign: 'center' }}>No units in battle</div>}
      {visibleUnits.map((unitType) => (
        <GalvanizedUnitsRow key={unitType} unitType={unitType} {...props} />
      ))}
    </div>
  )
}

interface GalvanizedUnitsRowProps {
  unitType: UnitType
  attacker: Participant
  defender: Participant
  attackerOnChange: (participant: Participant) => void
  defenderOnChange: (participant: Participant) => void
}

function GalvanizedUnitsRow({
  unitType,
  attacker,
  defender,
  attackerOnChange,
  defenderOnChange,
}: GalvanizedUnitsRowProps) {
  const left = (
    <GalvanizedUnitSelector
      unitType={unitType}
      participant={attacker}
      onUpdate={attackerOnChange}
    />
  )
  const right = (
    <GalvanizedUnitSelector
      unitType={unitType}
      participant={defender}
      onUpdate={defenderOnChange}
    />
  )

  return <OptionsRowView left={left} right={right} name={unitType} namePadding={8} />
}

interface GalvanizedUnitSelectorProps {
  unitType: UnitType
  participant: Participant
  onUpdate: (participant: Participant) => void
  'aria-labelledby'?: string
}

function GalvanizedUnitSelector(props: GalvanizedUnitSelectorProps) {
  const { unitType, participant, onUpdate } = props

  const visible = participant.units[unitType] > 0

  return (
    <select
      autoComplete="off"
      onChange={(e) => {
        const newVal = parseInt(e.target.value, 10)
        const newParticipant: Participant = {
          ...participant,
          galvanizedUnits: {
            ...participant.galvanizedUnits,
            [unitType]: newVal,
          },
        }
        onUpdate(newParticipant)
      }}
      value={participant.galvanizedUnits[unitType] ?? 0}
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
        Math.max(participant.units[unitType], participant.galvanizedUnits[unitType] ?? 0) + 1,
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

function showUnitRow(p1: Participant, p2: Participant, unitType: UnitType): boolean {
  return p1.units[unitType] > 0 || p2.units[unitType] > 0
}
