// import Image from 'next/image'
import styled from 'styled-components'
import { Race } from '../core/enums'

const StyledDiv = styled.div<Props>`
  img {
    transform: ${(p) => (p.side === 'left' ? 'scaleX(-1)' : undefined)};
  }
`

// style={{
//   transform: side === 'left' ? 'scaleX(-1)' : undefined,
// }}

interface Props {
  race: Race
  side: 'left' | 'right'
}

export default function RaceImage(props: Props) {
  // Do not use next/image before they cache it properly
  // In the meantime I just use it to generate optimized images in the correct size, then use that image in a normal <img />
  return (
    <StyledDiv {...props}>
      {/* <Image
        src={`/races/${props.race.replaceAll(' ', '_').replaceAll("'", '').toLowerCase()}.png`}
        alt=""
        width={640}
        height={848}
      /> */}
      <img
        src={`/races/small/${props.race
          .replaceAll(' ', '_')
          .replaceAll("'", '')
          .toLowerCase()}.webp`}
        alt=""
        width={640}
        height={848}
      />
      {/* <Image src={`/background.png`} alt="" width={1204} height={1541} /> */}
    </StyledDiv>
  )
}
