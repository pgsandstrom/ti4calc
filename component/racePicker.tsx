import { Participant } from '../core/battle-types'
import { Race } from '../core/enums'

interface Props {
  participant: Participant
  onChange: (participant: Participant) => void
  'aria-labelledby'?: string
  style?: React.CSSProperties
}

export default function RacePicker(props: Props) {
  const { participant, onChange, style } = props
  return (
    <div style={{ ...style, display: 'flex' }}>
      <select
        autoComplete="off"
        onChange={(e) => {
          const race = e.target.value as Race
          const newParticipant: Participant = {
            ...participant,
            race,
          }
          onChange(newParticipant)
        }}
        value={participant.race}
        aria-labelledby={props['aria-labelledby']}
        style={{
          flex: '1 0 auto',
          width: '0px',
        }}
      >
        {Object.values(Race).map((race) => {
          return (
            <option key={race} value={race}>
              {race}
            </option>
          )
        })}
      </select>
    </div>
  )
}
