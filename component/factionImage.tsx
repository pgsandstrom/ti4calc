// import Image from 'next/image'
import { useLayoutEffect, useState } from 'react'

import { Faction } from '../core/enums'
import styles from './factionImage.module.scss'

interface Props {
  faction: Faction
  side: 'left' | 'right'
  style?: React.CSSProperties
}

export default function FactionImage(props: Props) {
  // Do not use next/image before they cache it properly
  // In the meantime I just use it to generate optimized images in the correct size, then use that image in a normal <img />

  const [url, setUrl] = useState<string>()

  // the faction is retrieved from localstorage. Showing the faction before that would result in an ugly flash.
  // So here we make sure no image is set in ssr.
  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUrl(
      `/factions/small/${props.faction
        .replaceAll(' ', '_')
        .replaceAll("'", '')
        .toLowerCase()}.webp`,
    )
  }, [props.faction])

  return (
    <div {...props} className={styles.container}>
      {/* <Image
        src={`/factions/${props.faction.replaceAll(' ', '_').replaceAll("'", '').toLowerCase()}.png`}
        alt=""
        width={640}
        height={828}
      /> */}
      {/* this row should require this rule when we re-add next eslint plugin: @next/next/no-img-element */}
      <img
        src={url}
        alt=""
        width={640}
        height={828}
        className={props.side === 'left' ? styles.left : styles.right}
        style={{ float: props.side === 'left' ? 'right' : 'left' }}
      />
    </div>
  )
}
