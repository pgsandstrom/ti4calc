import { Race } from '../core/enums'

interface Props {
  race: Race
  side: 'left' | 'right'
}

export default function RaceImage2(props: Props) {
  return (
    <img
      src={`/races/small/${props.race.replaceAll(' ', '_').replaceAll("'", '').toLowerCase()}.webp`}
      alt=""
      width={640}
      height={828}
      style={{ float: props.side === 'left' ? 'right' : 'left' }}
    />
  )
}
