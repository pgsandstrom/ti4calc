import React, { useState } from 'react'
import styled from 'styled-components'
import { Participant } from '../core/battle-types'
import { getActioncards } from '../core/battleeffect/actioncard'
import { getAgendas } from '../core/battleeffect/agenda'
import {
  BattleEffect,
  getOtherBattleEffects,
  isBattleEffectRelevant,
} from '../core/battleeffect/battleEffects'
import { getTechBattleEffects } from '../core/battleeffect/tech'
import {
  getGeneralEffectFromRaces,
  getRaceStuffNonUnit,
  getPromissary,
  getAgent,
  getCommanders,
} from '../core/races/race'
import ArrowSvg from './arrowSvg'
import CoolButton from './coolButton'
import NumberInput from './numberInput'
import Popover from './popover'

interface OptionsProps {
  attacker: Participant
  attackerOnChange: (participant: Participant) => void
  defender: Participant
  defenderOnChange: (participant: Participant) => void
}

const OptionsDiv = styled.div`
  display: flex;

  .control-container {
    min-width: 48px;
    max-width: 72px;
    height: 48px;
  }

  .description-container {
    display: flex;
    flex: 0 0 auto;
    width: 200px;

    > span {
      flex: 1 0 0;
      text-align: center;
    }
  }

  .space-taker-outer {
    flex: 1 0 0;
  }

  .space-taker {
    flex: 1 0 0;
    max-width: 50px;
  }
`

const StyledCheckbox = styled.input`
  height: 24px;
  width: 24px;
`

export default function OptionsView(props: OptionsProps) {
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

  const [show, setShow] = useState(false)

  return (
    <div
      style={{
        background: 'white',
        borderRadius: '5px',
        padding: '5px',
      }}
    >
      <CoolButton onClick={() => setShow(!show)} style={{ padding: '10px' }}>
        <div style={{ display: 'flex' }}>
          <span>Options</span>
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
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <OptionsRow
            left={getDirectHitCheckbox(props.attacker, props.attackerOnChange)}
            right={getDirectHitCheckbox(props.defender, props.defenderOnChange)}
            name="Risk direct hit"
            description="If units with SUSTAIN DAMAGE should be assigned the first hits."
          />
          <OptionsPartView title="Tech" battleEffects={techs} {...props} />
          <OptionsPartView title="Race specific" battleEffects={raceTechs} {...props} />
          <OptionsPartView title="Promissary note" battleEffects={promissary} {...props} />
          <OptionsPartView title="Agent" battleEffects={agents} {...props} />
          <OptionsPartView title="Commander" battleEffects={commanders} {...props} />
          <OptionsPartView title="Action card" battleEffects={actioncards} {...props} />
          <OptionsPartView title="Agenda" battleEffects={agendas} {...props} />
          <OptionsPartView title="Other" battleEffects={otherBattleEffects} {...props} />
        </div>
      )}
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
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {title !== undefined && <h2 style={{ textAlign: 'center' }}>{title}</h2>}
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
          <OptionsRow
            key={effect.name}
            left={attackerView}
            right={defenderView}
            name={effect.name}
            description={effect.description}
          />
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
    <StyledCheckbox
      autoComplete="off"
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

// TODO why get-function and not react component?
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
        style={{ width: '100%' }}
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
    <StyledCheckbox
      autoComplete="off"
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

interface OptionsRowProps {
  left: React.ReactNode
  right: React.ReactNode
  name: string
  description?: string
}

function OptionsRow({ left, right, name, description }: OptionsRowProps) {
  return (
    <OptionsDiv style={{ marginTop: '20px' }}>
      <div className="space-taker-outer" />
      <div className="control-container">{left}</div>
      <div className="space-taker" />
      <div className="description-container">
        <span style={{ flex: '1 0 0' }}>{name}</span>
        <div style={{ flex: '0 0 auto' }}>
          <Popover text={description} />
        </div>
      </div>
      <div className="space-taker" />
      <div className="control-container">{right}</div>
      <div className="space-taker-outer" />
    </OptionsDiv>
  )
}
