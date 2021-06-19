// import Image from 'next/image'
import { useLayoutEffect, useState } from 'react'
import styled from 'styled-components'
import { Race } from '../core/enums'

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

export default function RaceImage(props: Props) {
  // Do not use next/image before they cache it properly
  // In the meantime I just use it to generate optimized images in the correct size, then use that image in a normal <img />

  const [url, setUrl] = useState<string>()

  // the race is retrieved from localstorage. Showing the race before that would result in an ugly flash.
  // So here we make sure no image is set in ssr.
  useLayoutEffect(() => {
    setUrl(`/races/small/${props.race.replaceAll(' ', '_').replaceAll("'", '').toLowerCase()}.webp`)
  }, [props.race])

  return (
    <StyledDiv {...props}>
      {/* <Image
        src={`/races/${props.race.replaceAll(' ', '_').replaceAll("'", '').toLowerCase()}.png`}
        alt=""
        width={640}
        height={828}
      /> */}
      <img
        src={url}
        alt=""
        width={640}
        height={828}
        style={{ float: props.side === 'left' ? 'right' : 'left' }}
      />
    </StyledDiv>
  )
}
