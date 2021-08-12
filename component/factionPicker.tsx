import { Participant } from '../core/battle-types'
import { Faction } from '../core/enums'

interface Props {
  participant: Participant
  onChange: (participant: Participant) => void
  'aria-labelledby'?: string
  style?: React.CSSProperties
}

export default function FactionPicker(props: Props) {
  const { participant, onChange, style } = props
  return (
    <div style={{ ...style, display: 'flex' }}>
      <select
        autoComplete="off"
        onChange={(e) => {
          const faction = e.target.value as Faction
          const newParticipant: Participant = {
            ...participant,
            faction,
          }
          onChange(newParticipant)
        }}
        value={participant.faction}
        aria-labelledby={props['aria-labelledby']}
        style={{
          flex: '1 0 auto',
          width: '0px',
        }}
      >
        {Object.values(Faction).map((faction) => {
          return (
            <option key={faction} value={faction}>
              {faction}
            </option>
          )
        })}
      </select>
    </div>
  )
}
