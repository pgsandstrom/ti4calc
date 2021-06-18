// import Image from 'next/image'
import styled from 'styled-components'
import { Race } from '../core/enums'
import dynamic from 'next/dynamic'

const StyledDiv = styled.div<Props>`
  @media (max-width: 1023px) {
    display: none;
  }

  img {
    transform: ${(p) => (p.side === 'left' ? 'scaleX(-1)' : undefined)};
    max-width: 100%;
    height: auto;
  }
`

interface Props {
  race: Race
  side: 'left' | 'right'
  style?: React.CSSProperties
}

// We avoid ssr for this image since it might change as soon as we find a saved race in localStorage.
// Having a big image flash quickly before it is replaced is a big ugly. Better to have the images be slower to load.
const DynamicComponentWithNoSSR = dynamic(() => import('./raceImage2'), { ssr: false })

export default function RaceImage(props: Props) {
  // Do not use next/image before they cache it properly
  // In the meantime I just use it to generate optimized images in the correct size, then use that image in a normal <img />
  return (
    <StyledDiv {...props}>
      {/* <Image
        src={`/races/${props.race.replaceAll(' ', '_').replaceAll("'", '').toLowerCase()}.png`}
        alt=""
        width={640}
        height={828}
      /> */}
      <DynamicComponentWithNoSSR {...props} />
    </StyledDiv>
  )
}
