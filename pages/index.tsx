import Head from 'next/head'
import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { BattleReport } from '../core'
import { Battle, Participant } from '../core/battle-types'
import {
  BattleEffect,
  getOtherBattleEffects,
  isBattleEffectRelevant,
} from '../core/battleeffect/battleEffects'
import { createParticipant } from '../core/battleSetup'
import { Place } from '../core/enums'
import { UnitType } from '../core/unit'
import SwitchButton from '../component/switchButton'
import {
  getAgent,
  getCommanders,
  getGeneralEffectFromRaces,
  getPromissary,
  getRaceStuffNonUnit,
} from '../core/races/race'
import { getTechBattleEffects } from '../core/battleeffect/tech'
import { getActioncards } from '../core/battleeffect/actioncard'
import NumberInput from '../component/numberInput'
import { getAgendas } from '../core/battleeffect/agenda'
import RaceImage from '../component/raceImage'
import { BattleReportView } from '../component/battleReportView'
import getServerUrl from '../server/serverUrl'
import { ErrorReportUnsaved } from '../server/errorReportController'
import Popover from '../component/popover'
import RacePicker from '../component/racePicker'
import UnitRow from '../component/unitRow'

const StyledHolder = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  flex: 1 0 auto;
  margin: 0 auto;
  max-width: 100%;
`

const StyledMain = styled.main`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex: 1 0 0;

  max-width: 500px;
  min-width: 370px;

  > * {
    width: 100%;
  }
`

const StyledMainController = styled.div`
  border-image-source: url('/background.webp');
  border-image-slice: 40 fill;
  border-image-width: 20px;
  border-image-outset: 0px;
  border-image-repeat: round;

  padding: 20px;
  padding-bottom: 40px;
  width: 100%;
`

// TODO add "units damaged before the battle"?

export default function Home() {
  const [attacker, setAttackerRaw] = useState<Participant>(createParticipant('attacker'))
  const [defender, setDefenderRaw] = useState<Participant>(createParticipant('defender'))
  const [battleReport, setBattleReport] = useState<BattleReport>()
  const [spaceCombat, setSpaceCombat] = useState(true)
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
          place: spaceCombat ? Place.space : Place.ground,
        }
        worker.postMessage(battle)
      })()
    }
  }, [touched, attacker, defender, spaceCombat, error])

  if (error) {
    const battle: Battle = {
      attacker,
      defender,
      place: spaceCombat ? Place.space : Place.ground,
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
          <a href="mailto:ti4calc@persandstrom.com">ti4calc@persandstrom.com</a>
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
        <title>TI4 calculator</title>
        <meta name="description" content="Twilight Imperium 4 battle calculator" />
      </Head>

      <StyledHolder>
        <RaceImage race={attacker.race} side="left" />
        <StyledMain>
          <StyledMainController>
            <h1 style={{ textAlign: 'center' }}>TI4 calculator</h1>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
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
                  flexDirection: 'column',
                  padding: '20px',
                }}
              >
                <div>
                  <SwitchButton
                    isLeftSelected={spaceCombat}
                    onLeftClick={() => setSpaceCombat(true)}
                    onRightClick={() => setSpaceCombat(false)}
                  />
                </div>
              </div>
            </div>
            <BattleReportView report={battleReport} />
          </StyledMainController>
          <OptionsView
            attacker={attacker}
            attackerOnChange={setAttacker}
            defender={defender}
            defenderOnChange={setDefender}
          />
        </StyledMain>
        <RaceImage race={defender.race} side="right" />
      </StyledHolder>
    </div>
  )
}

interface OptionsProps {
  attacker: Participant
  attackerOnChange: (participant: Participant) => void
  defender: Participant
  defenderOnChange: (participant: Participant) => void
}

const OptionsDiv = styled.div`
  display: flex;
  > * {
    flex: 1 0 0;
  }
`

function OptionsView(props: OptionsProps) {
  const otherBattleEffects = [...getOtherBattleEffects(), ...getGeneralEffectFromRaces()]
  const techs = getTechBattleEffects()
  const raceTechs = getRaceStuffNonUnit()
  const promissary = getPromissary()
  const agents = getAgent()
  const commanders = getCommanders()
  const actioncards = getActioncards()
  const agendas = getAgendas()
  // const relevantBattleEffects = battleEffects.filter((effect) => effect.type !== 'unit-upgrade')
  // .filter((effect) => {
  //   return isBattleEffectRelevantForSome(effect, [attacker, defender])
  // })

  return (
    <div
      style={{
        background: 'white',
      }}
    >
      <OptionsDiv>
        {getDirectHitCheckbox(props.attacker, props.attackerOnChange)}
        <span>Risk direct hit</span>
        {getDirectHitCheckbox(props.defender, props.defenderOnChange)}
      </OptionsDiv>
      <OptionsPartView battleEffects={otherBattleEffects} {...props} />
      <OptionsPartView title="Techs" battleEffects={techs} {...props} />
      <OptionsPartView title="Race specific" battleEffects={raceTechs} {...props} />
      <OptionsPartView title="Promissary notes" battleEffects={promissary} {...props} />
      <OptionsPartView title="Agents" battleEffects={agents} {...props} />
      <OptionsPartView title="Commanders" battleEffects={commanders} {...props} />
      <OptionsPartView title="Action cards" battleEffects={actioncards} {...props} />
      <OptionsPartView title="Agendas" battleEffects={agendas} {...props} />
    </div>
  )
}

interface OptionsPartProps {
  title?: string
  battleEffects: BattleEffect[]
  attacker: Participant
  attackerOnChange: (participant: Participant) => void
  defender: Participant
  defenderOnChange: (participant: Participant) => void
}

function OptionsPartView({
  title,
  battleEffects,
  attacker,
  attackerOnChange,
  defender,
  defenderOnChange,
}: OptionsPartProps) {
  return (
    <div>
      {title !== undefined && <h3>{title}</h3>}
      {battleEffects.map((effect) => {
        const attackerView = getBattleEffectInput(
          effect,
          attacker,
          attackerOnChange,
          defender,
          defenderOnChange,
        )
        const defenderView = getBattleEffectInput(
          effect,
          defender,
          defenderOnChange,
          attacker,
          attackerOnChange,
        )

        return (
          <OptionsDiv key={effect.name} style={{ marginBottom: '20px' }}>
            {attackerView}
            <div style={{ display: 'flex' }}>
              <span style={{ flex: '1 0 0' }}>{effect.name}</span>
              <div style={{ flex: '0 0 auto' }}>
                <Popover text={effect.description} />
              </div>
            </div>
            {defenderView}
          </OptionsDiv>
        )
      })}
    </div>
  )
}

const getDirectHitCheckbox = (
  participant: Participant,
  onChange: (participant: Participant) => void,
) => {
  return (
    <input
      type="checkbox"
      checked={participant.riskDirectHit}
      onChange={() => {
        const newParticipant: Participant = {
          ...participant,
          riskDirectHit: !participant.riskDirectHit,
        }
        onChange(newParticipant)
      }}
    />
  )
}

const getBattleEffectInput = (
  effect: BattleEffect,
  participant: Participant,
  onUpdate: (participant: Participant) => void,
  otherParticipant: Participant,
  onOtherUpdate: (participant: Participant) => void,
) => {
  if (effect.count !== undefined) {
    const updateEffectCount = (newVal: number) => {
      const newParticipant: Participant = {
        ...participant,
        ...participant.units,
        battleEffects: {
          ...participant.battleEffects,
          [effect.name]: newVal,
        },
      }
      onUpdate(newParticipant)
    }
    return (
      <NumberInput
        currentValue={participant.battleEffects[effect.name] ?? 0}
        onUpdate={updateEffectCount}
        disabled={!isBattleEffectRelevant(effect, participant)}
        style={{ flex: '1 0 auto', width: '0px' }}
      />
    )
  }
  const battleEffectCount = participant.battleEffects[effect.name]

  const updateParticipant = (
    p: Participant,
    checked: boolean,
    onUpdate: (p: Participant) => void,
  ) => {
    const newParticipant: Participant = {
      ...p,
      battleEffects: {
        ...p.battleEffects,
        [effect.name]: checked ? 1 : 0,
      },
    }
    onUpdate(newParticipant)
  }

  return (
    <input
      type="checkbox"
      checked={battleEffectCount !== undefined && battleEffectCount > 0}
      onChange={(e) => {
        updateParticipant(participant, e.target.checked, onUpdate)
        if (effect.symmetrical === true) {
          updateParticipant(otherParticipant, e.target.checked, onOtherUpdate)
        }
      }}
      disabled={!isBattleEffectRelevant(effect, participant)}
    />
  )
}
