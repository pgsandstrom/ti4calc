import Head from 'next/head'
import { ChangeEvent, useState } from 'react'
import styled from 'styled-components'
import getBattleReport, { BattleReport } from '../core'
import {
  BattleEffect,
  getAllBattleEffects,
  isBattleEffectRelevant,
  isBattleEffectRelevantForSome,
} from '../core/battleEffects'
import { createParticipant, Participant } from '../core/battleSetup'
import { Race } from '../core/races/race'
import { UnitType } from '../core/unit'
import { objectKeys } from '../util/util-object'

const StyledMain = styled.main`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  > * {
    width: 400px;
  }
`

const StyledDiv = styled.div`
  display: flex;
  flex-direction: column;

  > * {
  }
`

const BattleReportDiv = styled.div`
  display: flex;

  > * {
    flex: 1 0 0;
  }
`

export default function Home() {
  const [attacker, setAttacker] = useState<Participant>(createParticipant())
  const [defender, setDefender] = useState<Participant>(createParticipant())
  const [battleReport, setBattleReport] = useState<BattleReport>()

  const launch = () => {
    const br = getBattleReport(attacker, defender)
    setBattleReport(br)
  }

  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <StyledMain>
        <h1>ti4 calc</h1>
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
          <OptionsView
            attacker={attacker}
            attackerOnChange={setAttacker}
            defender={defender}
            defenderOnChange={setDefender}
          />
        </div>
        <button onClick={launch}>roll</button>
        {battleReport && (
          <BattleReportDiv>
            <div>{battleReport.attacker}</div>
            <div>{battleReport.draw}</div>
            <div>{battleReport.defender}</div>
          </BattleReportDiv>
        )}
      </StyledMain>
    </div>
  )
}

interface ParticipantProps {
  participant: Participant
  onChange: (participant: Participant) => void
}

function ParticipantView({ participant, onChange }: ParticipantProps) {
  const updateUnitCount = (unitType: UnitType, e: ChangeEvent<HTMLInputElement>) => {
    const newParticipant: Participant = {
      ...participant,
      units: {
        ...participant.units,
        [unitType]: parseInt(e.target.value, 10),
      },
    }
    onChange(newParticipant)
  }

  return (
    <StyledDiv>
      <select
        onChange={(e) => {
          const race = e.target.value as 'arborec' //  TODO ugly enum type hack
          const newParticipant: Participant = {
            ...participant,
            race: Race[race],
          }
          onChange(newParticipant)
        }}
      >
        {objectKeys(Race).map((race) => {
          return (
            <option key={race} value={race}>
              {Race[race]}
            </option>
          )
        })}
      </select>
      <input
        type="number"
        min="0"
        max="100"
        value={participant.units.flagship}
        onChange={(e) => {
          updateUnitCount(UnitType.flagship, e)
        }}
      />
      <input
        type="number"
        min="0"
        max="100"
        value={participant.units.warsun}
        onChange={(e) => {
          updateUnitCount(UnitType.warsun, e)
        }}
      />
      <input
        type="number"
        min="0"
        max="100"
        value={participant.units.dreadnought}
        onChange={(e) => {
          updateUnitCount(UnitType.dreadnought, e)
        }}
      />
      <input
        type="number"
        min="0"
        max="100"
        value={participant.units.carrier}
        onChange={(e) => {
          updateUnitCount(UnitType.carrier, e)
        }}
      />
      <input
        type="number"
        min="0"
        max="100"
        value={participant.units.cruiser}
        onChange={(e) => {
          updateUnitCount(UnitType.cruiser, e)
        }}
      />
      <input
        type="number"
        min="0"
        max="100"
        value={participant.units.destroyer}
        onChange={(e) => {
          updateUnitCount(UnitType.destroyer, e)
        }}
      />
      <input
        type="number"
        min="0"
        max="100"
        value={participant.units.fighter}
        onChange={(e) => {
          updateUnitCount(UnitType.fighter, e)
        }}
      />
      <input
        type="number"
        min="0"
        max="100"
        value={participant.units.mech}
        onChange={(e) => {
          updateUnitCount(UnitType.mech, e)
        }}
      />
      <input
        type="number"
        min="0"
        max="100"
        value={participant.units.infantry}
        onChange={(e) => {
          updateUnitCount(UnitType.infantry, e)
        }}
      />
      <input
        type="number"
        min="0"
        max="100"
        value={participant.units.pds}
        onChange={(e) => {
          updateUnitCount(UnitType.pds, e)
        }}
      />
    </StyledDiv>
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

function OptionsView({ attacker, attackerOnChange, defender, defenderOnChange }: OptionsProps) {
  const battleEffects = getAllBattleEffects()
  const relevantBattleEffects = battleEffects.filter((effect) => {
    return isBattleEffectRelevantForSome(effect, [attacker, defender])
  })

  return (
    <div>
      <OptionsDiv>
        {getDirectHitCheckbox(attacker, attackerOnChange)}
        <span>Risk direct hit</span>
        {getDirectHitCheckbox(defender, defenderOnChange)}
      </OptionsDiv>
      {relevantBattleEffects.map((effect) => {
        const attackerView = getBattleEffectCheckbox(effect, attacker, attackerOnChange)
        const defenderView = getBattleEffectCheckbox(effect, defender, defenderOnChange)

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
      name="scales"
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

const getBattleEffectCheckbox = (
  effect: BattleEffect,
  participant: Participant,
  onChange: (participant: Participant) => void,
) => {
  if (!isBattleEffectRelevant(effect, participant)) {
    return <span />
  }

  return (
    <input
      type="checkbox"
      name="scales"
      checked={participant.battleEffects.some((e) => e.name === effect.name)}
      onChange={(e) => {
        if (e.target.checked) {
          const newParticipant: Participant = {
            ...participant,
            battleEffects: [...participant.battleEffects, effect],
          }
          onChange(newParticipant)
        } else {
          const newParticipant: Participant = {
            ...participant,
            battleEffects: participant.battleEffects.filter((e) => e.name !== effect.name),
          }
          onChange(newParticipant)
        }
      }}
    />
  )
}
