import React, { useState } from 'react'

import ArrowSvg from './arrowSvg'
import CoolButton from './coolButton'
import styles from './helpView.module.scss'

interface Props {
  style?: React.CSSProperties
}

export default function HelpView({ style }: Props) {
  const [show, setShow] = useState(false)
  return (
    <div
      style={{
        ...style,
        background: 'white',
        borderRadius: '5px',
        padding: '5px',
      }}
    >
      <CoolButton onClick={() => setShow(!show)} style={{ padding: '10px' }}>
        <div style={{ display: 'flex' }}>
          <span>Thunders Edge status</span>
          <ArrowSvg
            style={{
              width: '16px',
              height: '16px',
              marginLeft: '5px',
              transform: show ? 'scaleY(-1)' : undefined,
            }}
          />
        </div>
      </CoolButton>
      {show && (
        <div className={styles.helpView}>
          <div>
            Thunders Edge will eventually be supported, but it will take time. Personally I dont own
            Thunders Edge yet so I will rely on support from you to inform me if I missed something
            or implemented something wrong.
          </div>
          <div>
            <span>Implemented features:</span>
            <ul>
              <li>Faction: The Deepwrought Scholarate</li>
              <li>Faction: The Crimson Rebellion</li>
              <li>Neutral faction</li>
            </ul>
          </div>
          <div>
            <span>Planned features:</span>
            <ul>
              <li>Faction: Last Bastion</li>
              <li>Faction: The Ral Nel Consortium</li>
              <li>Faction: The Firmament / The Obsidian</li>
              <li>Relic: Heart of Ixth</li>
              <li>Relic: Metali Void Shielding</li>
              <li>Relic: Lightrail Ordnance</li>
              <li>Relic: Metal Void Armaments</li>
              <li>Breakthrough: The Barony of Letnev</li>
              <li>Breakthrough: The Naaz-Rokha Alliance</li>
              <li>Breakthrough: The Winnu</li>
            </ul>
          </div>
          <div>
            <span>Will never be supported (unless you spend 100 hours making a pull request):</span>
            <ul>
              <li>Breakthrough: The Nekro Virus</li>
              <li>Variant: Twilight&apos;s Fall</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
