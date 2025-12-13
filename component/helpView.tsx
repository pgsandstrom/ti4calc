import React, { useState } from 'react'

import { NUMBER_OF_ROLLS, ROLLS_BETWEEN_UI_UPDATE } from '../core/constant'
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
          <span>Help</span>
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
            This is a tool to help calculate odds for the board game Twilight Imperium 4. All
            current expansions and codex are included, up and until codex 4 (june 2025). Right below
            this accordion you can track the progress in implementing Thunders Edge.
          </div>
          <div>Upgrade units by selecting the checkbox next to them.</div>
          <div>
            The result is calculated by running {NUMBER_OF_ROLLS} simulations but the first result
            is shown after only {ROLLS_BETWEEN_UI_UPDATE} simulations. That is why the result can
            change slightly from the initial value.
          </div>
          <div>
            Source code is available at{' '}
            <a
              href="https://github.com/pgsandstrom/ti4calc"
              target="_blank"
              rel="noopener noreferrer"
            >
              Github
            </a>
            . I welcome suggestions and bug reports! I can also be reached on{' '}
            <a href="https://twitter.com/pgsandstrom" target="_blank" rel="noopener noreferrer">
              Twitter
            </a>{' '}
            or via mail at{' '}
            <a href="mailto:ti4battle@persandstrom.com">ti4battle@persandstrom.com</a>.
          </div>
          <div>
            <span>Known missing features:</span>
            <ul>
              <li>Nekro can&apos;t use other factions unit upgrades.</li>
              <li>Nekro can&apos;t steal techs mid battle.</li>
              <li>Action card &quot;Maneuvering Jets&quot; is missing.</li>
              <li>Action card &quot;Scramble Frequency&quot; is missing.</li>
              <li>Action card &quot;Waylay&quot; is missing.</li>
              <li>Agenda &quot;Articles of War&quot; is missing.</li>
              <li>Nomad agent is missing.</li>
              <li>Relic &quot;The Crown of Thalnos&quot; is missing</li>
              <li>L1z1x mech can&apos;t be used to bombard during a ground invasion.</li>
              <li>
                If a carrier is killed by a PDS then fighters without capacity should die. Currently
                capacity is ignored.
              </li>
              <li>
                If the Mentak hero kills a war sun, Mentak must have the war sun technology to steal
                it. In the simulation we always steal it.
              </li>
              <li>
                Barony&apos;s &quot;War Funding&quot; only rerolls their own dice, never their
                opponents
              </li>
              <li>
                Naaz-Rokha Breakthrough: Supposed to be immune to unit abilities, that is currently
                not implemented.
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
