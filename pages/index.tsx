import Head from 'next/head'
import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { BattleReport } from '../core'
import { Battle, Participant } from '../core/battle-types'
import { createParticipant } from '../core/battleSetup'
import { Place } from '../core/enums'
import { UnitType } from '../core/unit'
import SwitchButton from '../component/switchButton'
import RaceImage from '../component/raceImage'
import { BattleReportView } from '../component/battleReportView'
import getServerUrl from '../server/serverUrl'
import { ErrorReportUnsaved } from '../server/errorReportController'
import RacePicker from '../component/racePicker'
import UnitRow from '../component/unitRow'
import CoolButton from '../component/coolButton'
import OptionsView from '../component/optionsView'
import HelpView from '../component/helpView'

const StyledHolder = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  flex: 1 0 auto;
  margin: 0 auto;
  max-width: 100%;
  min-height: 100vh;
`

const StyledMain = styled.main`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1 0 0;

  max-width: 500px;
  min-width: 360px;

  > * {
    width: 100%;
  }
`

const StyledMainController = styled.div`
  @media (max-height: 799px) {
    .main-title {
      visibility: hidden;
      height: 10px;
    }
  }

  border-image-source: url('/background.webp');
  border-image-slice: 40 fill;
  border-image-width: 20px;
  border-image-outset: 0px;
  border-image-repeat: round;

  padding: 10px 20px 40px;
  width: 100%;
`

const StyledClearButton = styled(CoolButton)`
  @media (max-width: 410px) {
    width: 60px;

    .long-text {
      display: none;
    }
  }

  @media (min-width: 411px) {
    width: 110px;

    .short-text {
      display: none;
    }
  }
`

// TODO add "units damaged before the battle"?
// TODO add resource value
// TODO remember faction

export default function Home() {
  const [attacker, setAttackerRaw] = useState<Participant>(createParticipant('attacker'))
  const [defender, setDefenderRaw] = useState<Participant>(createParticipant('defender'))
  const [battleReport, setBattleReport] = useState<BattleReport>()
  const [place, setPlace] = useState<Place>(Place.space)
  const [error, setError] = useState(false)

  const [touched, setTouched] = useState(false)
  const workerRef = useRef<Worker>()

  const registerUsage = () => {
    void fetch(`${getServerUrl()}/api/usage`, {
      method: 'POST',
      credentials: 'same-origin',
    })
  }

  const sendErrorReport = (workerError: ErrorReportUnsaved) => {
    void fetch(`${getServerUrl()}/api/report-error`, {
      method: 'POST',
      body: JSON.stringify(workerError),
      credentials: 'same-origin',
    })
  }

  const setAttacker = (p: Participant) => {
    if (!touched) {
      registerUsage()
      setTouched(true)
    }
    setAttackerRaw(p)
  }
  const setDefender = (p: Participant) => {
    if (!touched) {
      registerUsage()
      setTouched(true)
    }
    setDefenderRaw(p)
  }

  // Load the worker only to cache it
  useEffect(() => {
    void (async () => {
      const { default: Worker } = await import(
        'worker-loader?filename=static/[hash].worker.js!../core/webworker'
      )
      new Worker()
    })()
  }, [])

  useEffect(() => {
    if (touched) {
      void (async () => {
        const { default: Worker } = await import(
          'worker-loader?filename=static/[hash].worker.js!../core/webworker'
        )
        if (workerRef.current) {
          workerRef.current.terminate()
        }

        const worker = new Worker()
        workerRef.current = worker

        worker.addEventListener('message', (event) => {
          // eslint-disable-next-line
          if (event.data.error === true) {
            if (!error) {
              const workerError = event.data as ErrorReportUnsaved
              setError(true)
              sendErrorReport(workerError)
            }
          } else {
            setBattleReport(event.data)
          }
        })

        const battle: Battle = {
          attacker,
          defender,
          place,
        }
        worker.postMessage(battle)
      })()
    }
  }, [touched, attacker, defender, place, error])

  if (error) {
    const battle: Battle = {
      attacker,
      defender,
      place,
    }
    return (
      <div style={{ padding: '20px' }}>
        <div>A critical error has occurred!</div>
        <div style={{ marginTop: '10px' }}>
          I apologize for the inconvenience. The crash has been logged and hopefully I will soon fix
          it. If you have a github account, please submit a bug report{' '}
          <a
            href="https://github.com/pgsandstrom/ti4calc/issues/new"
            target="_blank"
            rel="noreferrer"
          >
            here
          </a>
          , otherwise send me a mail at{' '}
          <a href="mailto:ti4battle@persandstrom.com">ti4battle@persandstrom.com</a>
        </div>
        <div style={{ marginTop: '10px' }}>Please include the data below.</div>
        <div style={{ marginTop: '10px', border: '1px solid black', padding: '10px' }}>
          {JSON.stringify(battle)}
        </div>
      </div>
    )
  }

  const participantsObject = {
    attacker,
    onChangeAttacker: setAttacker,
    defender,
    onChangeDefender: setDefender,
  }

  return (
    <div
      style={{
        display: 'flex',
        width: '100vw',
        maxWidth: '100%',
        height: '100%',
        background: '#110F0B',
      }}
    >
      <Head>
        <title>TI4 PoK battle calculator</title>
        <meta name="description" content="Twilight Imperium 4 PoK battle calculator" />
      </Head>

      <StyledHolder>
        <RaceImage race={attacker.race} side="left" style={{ flex: '1 0 0' }} />
        <StyledMain>
          <StyledMainController>
            <h1 className="main-title" style={{ textAlign: 'center', margin: '10px 0' }}>
              TI4 calculator
            </h1>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                // this is a fallback background since our border-image-source does not seem to load on old iphones
                background: '#e6edf8',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  height: '48px',
                }}
              >
                <RacePicker
                  participant={attacker}
                  onChange={setAttacker}
                  aria-labelledby="race"
                  style={{ flex: '1 0 0' }}
                />
                <div
                  id="race"
                  style={{
                    flex: '1 0 0',
                    textAlign: 'center',
                    paddingTop: '10px',
                  }}
                >
                  race
                </div>
                <RacePicker
                  participant={defender}
                  onChange={setDefender}
                  style={{ flex: '1 0 0' }}
                />
              </div>
              <UnitRow unitType={UnitType.flagship} {...participantsObject} />
              <UnitRow unitType={UnitType.warsun} {...participantsObject} />
              <UnitRow unitType={UnitType.dreadnought} {...participantsObject} />
              <UnitRow unitType={UnitType.carrier} {...participantsObject} />
              <UnitRow unitType={UnitType.cruiser} {...participantsObject} />
              <UnitRow unitType={UnitType.destroyer} {...participantsObject} />
              <UnitRow unitType={UnitType.fighter} {...participantsObject} />
              <UnitRow unitType={UnitType.mech} {...participantsObject} />
              <UnitRow unitType={UnitType.infantry} {...participantsObject} />
              <UnitRow unitType={UnitType.pds} {...participantsObject} />
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '20px',
                }}
              >
                <div style={{ flex: '1 0 0' }} />
                <StyledClearButton
                  onClick={() => {
                    const newAttacker = createParticipant('attacker', attacker.race)
                    setAttacker(newAttacker)
                  }}
                >
                  <span className="short-text">Clear</span>
                  <span className="long-text">Clear attacker</span>
                </StyledClearButton>
                <div style={{ flex: '1 0 0' }} />
                <SwitchButton
                  isLeftSelected={place === Place.space}
                  leftLabel={Place.space}
                  rightLabel={Place.ground}
                  onLeftClick={() => setPlace(Place.space)}
                  onRightClick={() => setPlace(Place.ground)}
                />
                <div style={{ flex: '1 0 0' }} />
                <StyledClearButton
                  onClick={() => {
                    const newDefender = createParticipant('defender', defender.race)
                    setDefender(newDefender)
                  }}
                >
                  <span className="short-text">Clear</span>
                  <span className="long-text">Clear defender</span>
                </StyledClearButton>
                <div style={{ flex: '1 0 0' }} />
              </div>
            </div>
            <BattleReportView report={battleReport} />
          </StyledMainController>
          <OptionsView
            attacker={attacker}
            attackerOnChange={setAttacker}
            defender={defender}
            defenderOnChange={setDefender}
            style={{ marginTop: '10px' }}
          />
          <HelpView style={{ marginTop: '10px', marginBottom: '10px' }} />
        </StyledMain>
        <RaceImage race={defender.race} side="right" style={{ flex: '1 0 0' }} />
      </StyledHolder>
    </div>
  )
}
