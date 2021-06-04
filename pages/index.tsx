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
import { getUnitUpgrade } from '../core/battleeffect/unitUpgrades'
import { createParticipant } from '../core/battleSetup'
import { Place, Race } from '../core/enums'
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

const StyledHolder = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
`

const StyledMain = styled.main`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  > * {
    width: 500px;
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
`

const StyledDiv = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 0 0;

  text-align: center;
`

// TODO add "units damaged before the battle"?

export default function Home() {
  const [attacker, setAttackerRaw] = useState<Participant>(createParticipant('attacker'))
  const [defender, setDefenderRaw] = useState<Participant>(createParticipant('defender'))
  const [battleReport, setBattleReport] = useState<BattleReport>()
  const [spaceCombat, setSpaceCombat] = useState(true)

  const [touched, setTouched] = useState(false)
  const workerRef = useRef<Worker>()

  const registerUsage = () => {
    void fetch(`${getServerUrl()}/api/usage`, {
      method: 'POST',
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

  // TODO pre-load worker so it is cached

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
          setBattleReport(event.data)
        })

        const battle: Battle = {
          attacker,
          defender,
          place: spaceCombat ? Place.space : Place.ground,
        }
        worker.postMessage(battle)
      })()
    }
  }, [touched, attacker, defender, spaceCombat])

  return (
    <div
      style={{
        background: '#110F0B',
        // background: `url(/space4.png)`,
        // backgroundSize: 'fit',
        // backgroundRepeat: 'no-repeat',
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
              <div style={{ display: 'flex' }}>
                <ParticipantView participant={attacker} onChange={setAttacker} />
                <StyledDiv>
                  <div>race</div>
                  <div>flagship</div>
                  <div>warsun</div>
                  <div>dreadnought</div>
                  <div>carrier</div>
                  <div>cruiser</div>
                  <div>destroyer</div>
                  <div>fighter</div>
                  <div>mech</div>
                  <div>infantry</div>
                  <div>pds</div>
                </StyledDiv>
                <ParticipantView participant={defender} onChange={setDefender} />
              </div>
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

interface ParticipantProps {
  participant: Participant
  onChange: (participant: Participant) => void
}

function ParticipantView({ participant, onChange }: ParticipantProps) {
  return (
    <StyledDiv>
      <select
        onChange={(e) => {
          const race = e.target.value as Race
          const newParticipant: Participant = {
            ...participant,
            race,
          }
          onChange(newParticipant)
        }}
        value={participant.race}
      >
        {Object.values(Race).map((race) => {
          return (
            <option key={race} value={race}>
              {race}
            </option>
          )
        })}
      </select>
      <UnitInput participant={participant} unitType={UnitType.flagship} onUpdate={onChange} />
      <UnitInput participant={participant} unitType={UnitType.warsun} onUpdate={onChange} />
      <UnitInput participant={participant} unitType={UnitType.dreadnought} onUpdate={onChange} />
      <UnitInput participant={participant} unitType={UnitType.carrier} onUpdate={onChange} />
      <UnitInput participant={participant} unitType={UnitType.cruiser} onUpdate={onChange} />
      <UnitInput participant={participant} unitType={UnitType.destroyer} onUpdate={onChange} />
      <UnitInput participant={participant} unitType={UnitType.fighter} onUpdate={onChange} />
      <UnitInput participant={participant} unitType={UnitType.mech} onUpdate={onChange} />
      <UnitInput participant={participant} unitType={UnitType.infantry} onUpdate={onChange} />
      <UnitInput participant={participant} unitType={UnitType.pds} onUpdate={onChange} />
    </StyledDiv>
  )
}

interface UnitInputProps {
  participant: Participant
  unitType: UnitType
  onUpdate: (participant: Participant) => void
}

function UnitInput({ participant, unitType, onUpdate }: UnitInputProps) {
  const unitUpgrade = getUnitUpgrade(participant.race, unitType)

  const updateUnitCount = (newVal: number) => {
    const newParticipant: Participant = {
      ...participant,
      units: {
        ...participant.units,
        [unitType]: newVal,
      },
    }
    onUpdate(newParticipant)
  }

  const hasUpgrade = participant.unitUpgrades[unitType] ?? false

  return (
    <div style={{ display: 'flex' }}>
      <input
        type="checkbox"
        disabled={!unitUpgrade}
        checked={hasUpgrade}
        onChange={() => {
          const newParticipant: Participant = {
            ...participant,
            unitUpgrades: {
              ...participant.unitUpgrades,
              [unitType]: !hasUpgrade,
            },
          }
          onUpdate(newParticipant)
        }}
      />
      <NumberInput currentValue={participant.units[unitType]} onUpdate={updateUnitCount} />
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
        const attackerView = getBattleEffectInput(effect, attacker, attackerOnChange)
        const defenderView = getBattleEffectInput(effect, defender, defenderOnChange)

        return (
          <OptionsDiv key={effect.name}>
            {attackerView}
            <span>{effect.name}</span>
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
) => {
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

  if (effect.count !== undefined) {
    return (
      <NumberInput
        currentValue={participant.battleEffects[effect.name] ?? 0}
        onUpdate={updateEffectCount}
      />
    )
  }
  const battleEffectCount = participant.battleEffects[effect.name]
  return (
    <input
      type="checkbox"
      checked={battleEffectCount !== undefined && battleEffectCount > 0}
      onChange={(e) => {
        if (e.target.checked) {
          const newParticipant: Participant = {
            ...participant,
            battleEffects: {
              ...participant.battleEffects,
              [effect.name]: 1,
            },
          }
          onUpdate(newParticipant)
        } else {
          const newParticipant: Participant = {
            ...participant,
            battleEffects: {
              ...participant.battleEffects,
              [effect.name]: 0,
            },
          }
          onUpdate(newParticipant)
        }
      }}
      disabled={!isBattleEffectRelevant(effect, participant)}
    />
  )
}
